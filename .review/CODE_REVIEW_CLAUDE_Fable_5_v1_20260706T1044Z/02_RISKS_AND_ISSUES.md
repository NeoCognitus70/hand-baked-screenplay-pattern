# Risks and Issues

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1044Z.md) | [Next: Project Reviews ->](03_PROJECT_REVIEWS/PROJECT_001_hand-baked-screenplay-pattern.md)

**Reviewer:** AI assistant (CLAUDE Fable 5)
**Date:** 2026-07-06T10:44Z

Findings are numbered high to low. There are **no High findings**. Severities:
Risk 1 is Medium (process/source-of-truth), Risk 2 is Low-Medium, Risks 3-6 are Low,
Risk 7 is informational.

---

## Risk 1 (Medium): The backlog v4 reconciliation is uncommitted - the committed source of truth is stale

**Risk Description/Explanation**
The project's declared source of truth, [docs/backlog.md](docs/backlog.md), was
reconciled to **Version 4** (recording the entire review-derived cycle HBSP-09..14
as Resolved Items #2-#7, dated 2026-06-22) - but that reconciliation exists **only
as an uncommitted edit in the local working tree**. The committed file on `main`
(`120a631`) is still **Version 3, Last Updated 2026-06-13**, which records a single
resolved item and predates the vitest security bump, the Node-floor fix, and the
whole second improvement cycle.

**Evidence Outline**
- `git status --short` at review time: ` M docs/backlog.md` (the only dirty file).
- `git diff docs/backlog.md` shows the header moving from
  `**Version:** 3 ... **Last Updated:** 2026-06-13` to
  `**Version:** 4 ... **Last Updated:** 2026-06-22` plus ~90 added lines
  documenting Items #2-#7.
- Working-tree [docs/backlog.md](docs/backlog.md) (lines 10-15) carries the v4
  header; `git show main:docs/backlog.md` carries v3.

**Impact Analysis**
- Anyone cloning the GitHub repository (the audience the portfolio exists for)
  reads a backlog that says the last resolved work was 2026-06-13 and that the
  Dependabot/npm-audit security item does not exist - the repo looks a full cycle
  behind its actual state.
- The uncommitted edit is one `git checkout -- docs/backlog.md` (or a lost
  worktree) away from disappearing; the durable record of six worklist items would
  have to be reconstructed.
- Downstream automation that treats the *committed* backlog as canonical (the
  portfolio's derive-worklist prompts do) would re-derive already-completed work.

**Refactor Recommendation and Strategy**
1. Review the pending diff (it is accurate against the tree as far as this review
   can verify - every claim in it was validated, including the exact coverage
   numbers) and commit it on a short docs branch, e.g.
   `docs: reconcile backlog to v4 (HBSP-09..14 resolved)`.
2. Open and merge a small PR so the default branch's source of truth matches
   reality.
3. Process guard: end every worklist cycle with a "backlog reconciliation
   committed and pushed" check - the same lesson the portfolio has already
   recorded for other projects' doc drift.

**Question recorded for the user (review ran unattended):** should this review's PR
include the pending backlog v4 commit, or should it stay review-artefacts-only?
This review follows its instructions and commits **only** review artefacts; the
backlog edit is left untouched in the working tree for the user to commit
separately.

---

## Risk 2 (Low-Medium): A scene that never finishes is reported as passed

**Risk Description/Explanation**
`buildReport` initialises every scene's outcome to `Outcome.successful()` when it
sees `scene:starts`, and only replaces it on `scene:finishes`. If a run crashes
between the two (the process dies, a runner hook aborts, or manually wired
`sceneStarts`/`sceneFinishes` misses the finish), the final report renders that
scene as **passed** with a 0ms duration. This contradicts the builder's own stated
design goal that "a crashed run still renders a partial report" - the partial
report is rendered, but it lies about the crashed scene.

**Evidence Outline**
- [src/reporting/ReportModel.ts](src/reporting/ReportModel.ts) (lines 64-74):
  `scene:starts` pushes a scene with `outcome: Outcome.successful()` and
  `durationMs: 0`.
- [src/reporting/ReportModel.ts](src/reporting/ReportModel.ts) (lines 110-116):
  only `scene:finishes` overwrites the outcome; (lines 118-120): `test-run:finishes`
  does not close or mark any still-open scene.
- [src/reporting/ReportModel.ts](src/reporting/ReportModel.ts) (lines 50-55): the
  JSDoc explicitly promises defensive handling of crashed runs.
- No spec covers a `scene:starts` followed by `test-run:finishes` without a
  `scene:finishes` ([spec/report-model.spec.ts](spec/report-model.spec.ts) covers
  orphan finishes, not orphan starts).
- Mitigating factor: the primary path, the `scene()` helper
  ([src/scene/scene.ts](src/scene/scene.ts) (lines 28-40)), always emits
  `scene:finishes` in try/catch, so the gap is reachable mainly via manual wiring
  or a hard crash mid-scene.

**Impact Analysis**
- A false green in exactly the degraded scenario the feature is designed to
  survive: a report generated after a crash shows the interrupted scene as passed,
  and the summary counts it in `succeeded`
  ([ReportModel.ts](src/reporting/ReportModel.ts) (line 131)).
- For a teaching library this is also a missed pedagogical beat: "never default an
  unknown outcome to success" is a core reporting lesson.

**Refactor Recommendation and Strategy**
1. In `buildReport`, when the fold ends (or on `test-run:finishes`) with
   `currentScene` still set, mark it
   `Outcome.from(new LogicError('scene never finished'))` (or a distinct
   `unknown`/`interrupted` outcome kind rendered as its own pill) and floor its
   duration from the last seen event.
2. Add a spec: scene starts, one activity finishes, run finishes - expect the
   scene to be reported as not-passed.
3. Keep the change additive: `Outcome`'s discriminated union can gain a variant
   without breaking the public surface (the canary spec is presence-based).

---

## Risk 3 (Low): HtmlReporter never resets its buffer - reuse across runs double-counts

**Risk Description/Explanation**
`HtmlReporter` buffers every event for its lifetime and renders on each
`test-run:finishes`, but never clears the buffer. A reporter instance that
observes two consecutive runs (a watch-mode loop, a runner that calls
`testRunFinishes()` per suite, or simply two `testRunFinishes()` calls) renders the
second report with **all scenes from both runs**, and the first run's scenes are
double-counted in every subsequent report.

**Evidence Outline**
- [src/crew/HtmlReporter.ts](src/crew/HtmlReporter.ts) (line 49): `private readonly
  events: DomainEvent[] = []` - push-only.
- [src/crew/HtmlReporter.ts](src/crew/HtmlReporter.ts) (lines 76-82): `notifyOf`
  pushes then renders on the terminal event; nothing empties `this.events`.
- No spec exercises two `test-run:finishes` events against one reporter
  ([spec/html-reporter.spec.ts](spec/html-reporter.spec.ts) covers single-run
  behaviour only).
- Related sharp edge: `resetDefaultStage()`
  ([src/screenplay/Stage.ts](src/screenplay/Stage.ts) (lines 158-160)) discards the
  crew entirely, so the "fresh run" escape hatch also silently drops the reporter -
  correct for test isolation, surprising for a user who expected the reporter to
  survive.

**Impact Analysis**
- Inflated totals and duplicated scenes in any multi-run lifetime; the report is
  wrong rather than crashing, which makes the defect easy to miss.
- Low severity because the documented usage (one run, one `testRunFinishes()`, as
  in the README's Reporting section (lines 167-186)) is unaffected.

**Refactor Recommendation and Strategy**
1. After a successful write in `notifyOf`, clear the buffer
   (`this.events.length = 0`) so each `test-run:finishes` closes an independent
   run - or, if cumulative reporting is intended, document that the reporter is
   single-run and should be re-`assign`ed per run.
2. Add a two-runs spec asserting the second report contains only the second run's
   scenes.
3. Note the chosen semantics in the README's Reporting notes list (README
   lines 198-207).

---

## Risk 4 (Low): The npm publish path is unguarded - `files` ships `dist/` that nothing builds

**Risk Description/Explanation**
[package.json](package.json) declares `"files": ["dist", ...]` with `main`/`types`
pointing into `dist/`, but there is no `prepublishOnly`/`prepack` script. An
`npm publish` from a clean clone would ship a missing or stale `dist/`; nothing
enforces that the published artefact matches the source.

**Evidence Outline**
- [package.json](package.json) (lines 6-18): `main`, `types`, `exports`, `files`
  all reference `dist/`.
- [package.json](package.json) (lines 27-34): scripts define `build` and `verify`
  but no publish lifecycle hook.
- [.gitignore] excludes `dist/` (untracked), so a fresh clone has no `dist/` at
  all.

**Impact Analysis**
- Today the only consumer is the sibling `calculator-screenplay-bdd` via a
  `file:../` dependency whose own `prepare:screenplay` step builds this repo, so
  the gap is masked - but the package manifest advertises publishability
  (repository/homepage/keywords/licence) that would break on first real publish.
- A stale `dist/` publish is worse than a missing one: it ships old behaviour under
  a new version.

**Refactor Recommendation and Strategy**
1. Add `"prepublishOnly": "npm run verify"` (gate) and rely on `build` having
   produced `dist/`; or `"prepack": "npm run build"` if only freshness matters.
2. If publishing is explicitly out of scope, say so in the README's Versioning
   section and add `"private": true` to make the stance executable.

---

## Risk 5 (Low): CI action majors lag the portfolio baseline (checkout@v4 / setup-node@v4)

**Risk Description/Explanation**
The workflow pins `actions/checkout@v4` and `actions/setup-node@v4`. The portfolio
already migrated another project (sudoku, item SUD-08, 2026-06-13) to
`checkout@v5` / `setup-node@v5` ahead of the GitHub Actions Node 24 runtime
cutover; this repo was not included and will accumulate runner deprecation warnings
and, eventually, forced-migration risk.

**Evidence Outline**
- [.github/workflows/ci.yml](.github/workflows/ci.yml) (line 26):
  `uses: actions/checkout@v4`; (line 29): `uses: actions/setup-node@v4`.
- The workflow is otherwise sound: PR+push triggers, `permissions: contents: read`,
  concurrency cancellation, fail-fast disabled across a `[20, 22]` matrix, `npm ci`
  with npm cache, and an informational non-gating coverage step (lines 40-45).

**Impact Analysis**
- No functional breakage today; the cost is future warning noise and a portfolio
  consistency gap (two conventions for the same concern).

**Refactor Recommendation and Strategy**
1. Bump to `actions/checkout@v5` and `actions/setup-node@v5` in one commit and let
   the matrix prove it (the sudoku migration is the in-portfolio precedent).
2. Optionally add Node 24 to the matrix at the same time, since `engines` only
   declares a floor.

---

## Risk 6 (Low): CHANGELOG `[Unreleased]` has a duplicate `### Added` heading and is overdue a release cut

**Risk Description/Explanation**
The `[Unreleased]` section contains **two** `### Added` headings (the HBSP-12
coverage entry and the earlier reporting-feature entry), which violates Keep a
Changelog structure (one heading per change type per release) and trips
markdown-lint MD024. Separately, `[Unreleased]` now holds the entire reporting
feature plus a security fix while the only release remains 0.1.0 - a 0.2.0 cut is
overdue for a repo that showcases SemVer discipline.

**Evidence Outline**
- [CHANGELOG.md](CHANGELOG.md) (line 10): first `### Added`; (line 49): second
  `### Added` in the same `[Unreleased]` block.
- [CHANGELOG.md](CHANGELOG.md) (line 98): `## [0.1.0] - 2026-06-11` is the only
  release; [package.json](package.json) (line 3) still `0.1.0`.
- [README.md](README.md) (lines 232-238) points readers at the changelog as the
  SemVer record.

**Impact Analysis**
- Cosmetic-to-low: tooling that parses Keep-a-Changelog sections merges or drops
  one of the duplicate blocks; readers get a slightly confusing history.

**Refactor Recommendation and Strategy**
1. Merge the two `### Added` blocks under one heading.
2. Cut `0.2.0` (reporting feature + security + Node floor), update the compare
   links at (lines 137-138), and bump `package.json` - or record why the project
   deliberately stays pre-release.

---

## Risk 7 (Informational): Dependency currency - clean audit, minor drift

**Risk Description/Explanation**
Not a defect; recorded for the next maintainer. `npm audit` reports **0
vulnerabilities** (verified this session). `npm outdated` shows only routine
drift: `vitest`/`@vitest/coverage-v8` 4.1.9 -> 4.1.10 (patch), `typescript` 5.9.3
with 6.0.3 available (major; the strict config may need review), `@types/node`
22.19.20 with 26.x available (majors track Node majors; 22 matches the CI matrix,
so staying is defensible). Lockfile is v3 and consistent with `package.json`
ranges. Licence: Apache-2.0 declared in [package.json](package.json) (line 43) with
the full text in [LICENSE](LICENSE) - clean. No secrets in the tree; the only
injection surface (report HTML) is escaped and tested.

**Stale Dependabot alerts (checked via the GitHub API during this review):** the
repository's default branch shows **2 open Dependabot alerts** - GHSA-fx2h-pf6j-xcff
(high, "vite `server.fs.deny` bypass on Windows alternate paths") and
GHSA-v6wh-96g9-6wx3 (medium, "launch-editor NTLMv2 hash disclosure"), both with
vulnerable range `<= 6.4.2`, first patched in `6.4.3`. The committed lockfile
resolves `vite@8.0.16` (dev-only, transitive under `vitest@4`), which is **outside
the vulnerable range** - consistent with the clean local `npm audit`. These alerts
are therefore stale scan results, not live vulnerabilities: the same Dependabot
re-scan lag this repo already saw after the HBSP-09 bump.

**Refactor Recommendation and Strategy**
- Take the vitest patch opportunistically with the next functional change; treat
  TypeScript 6 as a deliberate, gated upgrade; revisit `@types/node` only when the
  CI matrix moves.
- Dismiss the two stale Dependabot alerts in the repository's Security tab (or
  trigger a re-scan) so the default branch's security banner matches the actual
  lockfile state - a red "1 high" badge on a portfolio repo costs credibility the
  dependency work has already earned back.

---

[<- Previous: Executive Summary](01_EXECUTIVE_SUMMARY.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1044Z.md) | [Next: Project Reviews ->](03_PROJECT_REVIEWS/PROJECT_001_hand-baked-screenplay-pattern.md)
