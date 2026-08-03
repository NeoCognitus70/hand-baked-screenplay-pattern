<!--
  AUDIENCE: Engineers, AI agents, and project leads maintaining work-in-progress tracking.
  PURPOSE:  Single source of truth for outstanding work, risks, and planning for this project.
  LOCATION: docs/backlog.md
  TEMPLATE: test-automation-portfolio/templates/backlog.template.md
-->

# Hand-Baked Screenplay Pattern — Backlog

**Version:** 10 — opens **HBSP-27** (planning-only): publish a deterministic, self-contained sample
of the existing static HTML reporter to GitHub Pages, to be linked from the portfolio landing page
as its public evidence slice **LAND-09B**. This is the one currently-open item; the fourth
review-derived cycle below remains closed.

**Version:** 9 — closes out the **fourth** review-derived cycle (Codex GPT-5 v1,
`.review/CODE_REVIEW_CODEX_GPT5_v1_20260723T2337Z/`): Items #21–#26 record CGX-01..06, all Resolved
2026-07-27 (v8 had recorded only CGX-01). This review is the first to raise **MEDIUM** findings
against the project (CGX-01 release-truth, CGX-02 shared abilities) — the "no HIGH/MEDIUM ever" and
"no outstanding items" notes below are updated accordingly. v8 recorded the CGX-01 release-truth
reconciliation (`v0.2.0` tag + GitHub release created 2026-07-27, resolving Risk 1); v7 closed out
review v2 (Items #17–#20 record TRIAGE-01/02/03/05; Item #16 / TRIAGE-04 landed in v6).
**Last Updated:** 2026-07-27
**Based on:** repo at commit `2a5e93f` (`main`, PRs #35–#40 merged: CGX-01..06; `npm run verify`
green at 104 tests, `npm audit` clean, release `v0.2.0` live); fourth review-derived worklist
CGX-01..06 in `WORKLIST_hand-baked-screenplay-pattern.md`, derived from code review
`.review/CODE_REVIEW_CODEX_GPT5_v1_20260723T2337Z/`.
Prior: v5 folded in HBSP-15..22 (PRs #19–#25) from review `…Fable_5_v1_20260706T1044Z/`; v4 folded
in HBSP-09..14 (PRs #15–#17) from review `…Opus_4_8_v1_20260616T1543Z`; Item #1 traces to the
earlier survey at commit `a138aa8` (README, `planning/`, CI workflow, package scripts).

This backlog tracks outstanding work and risks for the hand-baked Screenplay pattern teaching
library, ordered by priority score (highest first). It is the project's **source of truth** for
item status — session handovers narrate; this file records.

**Priority Scoring System:**
- **Score = Security Impact (0–10) + Breakage Probability (0–10) + Maintenance Burden (0–10)**
- **HIGH (20–30):** Critical — immediate action required
- **MEDIUM (10–19):** Important — schedule within current sprint cycle
- **LOW (0–9):** Desirable — schedule when capacity allows

---

## Outstanding Risks

Items are ordered by priority score (highest first). The suite is gated by `npm run verify`
(typecheck + build + vitest) on PRs and pushes to `main` via the CI workflow.

#### HBSP-27: Publish a deterministic sample of the static HTML reporter to GitHub Pages — Score: 9 — IMPLEMENTED (awaiting merge + Pages deploy)

**Priority Score:** Security Impact (1) + Breakage Probability (3) + Maintenance Burden (5) = **9 points**
**Origin:** Portfolio landing **LAND-09B** (second public-evidence slice, promoted by owner decision
2026-08-02 and made READY once LAND-09A closed 2026-08-03). Per the LAND-09 cross-repository delivery
contract, this landing item does **not** by itself authorise implementation here — this backlog entry
is that authorisation. The landing repository owns only the eventual link; this repository owns the
artefact, its generation, tests, workflow and Pages configuration.

**Objective:** Publish one maintained, illustrative, self-contained HTML page produced by the
project's existing dependency-free `HtmlReporter` / `renderHtml` so a visitor can see the reporter's
output without cloning or running anything. It demonstrates the reporter capability; it is **not** a
current CI result and **not** Serenity/JS output.

**Approved scope / decisions (do not re-litigate):**
- **Deterministic sample, in `src/`.** A pure `renderSampleReport(): string` builder drives a small
  fixed cast through a dedicated `Stage` with an **injected monotonic `now()`** (not the default
  stage's `Date.now()`), so timestamps, durations and therefore the whole document are **byte-stable**
  for unchanged input. It reuses the public `buildReport`/`renderHtml`; it does not fork the renderer.
- **Meaningful pass/fail content.** At least one passing scene with a nested task → child interactions
  and an assertion, and at least one deliberately failing scene (assertion failure), so the page shows
  a red summary, a failed scene and an error message — a genuine demonstration, not an empty run.
- **Truthful provenance banner.** The page prominently identifies itself as an *illustrative
  hand-baked reporter sample*, states it is **independent of Serenity/JS**, and does **not** imply
  current CI status. Added by the sample builder around the core report; the library's generic
  `renderHtml` output is unchanged for real users.
- **Self-contained.** One HTML document, inline CSS/JS only, **no external assets or network
  requests** (the reporter already guarantees this; the check re-asserts it).
- **Gated by `npm run verify`.** A `spec/` test proves byte-stability (render twice → identical),
  the required scene/activity content, the provenance wording and the absence of external asset
  references — so the sample is validated by the existing gate, not a bolt-on script.
- **Publish only after checks pass on `main`.** A separate `pages.yml` workflow runs on `push` to
  `main`, runs `npm ci` + `npm run verify` (library + reporter + sample checks) and then generates
  the report and deploys it. Praise-worthy least privilege: `pages: write` / `id-token: write` live
  on the deploy job only; pull-request runs stay read-only and deploy nothing. A failed run must not
  replace the last good public page.
- **No new runtime dependencies.** The generator script runs on plain Node against built `dist/`
  (no `tsx`/ts-node added); the sample module is typechecked, built and tested like the rest of `src/`.

**Acceptance criteria:**
- [x] Pure `renderSampleReport()` in `src/`, byte-stable, exercised by a `spec/` test that also
      asserts the provenance banner, the "independent of Serenity/JS" statement, the expected scene
      names, at least one pass and one fail, and no external `http(s)://`/`src=`/`href=` asset refs.
      **`src/sample/sampleReport.ts` (not in the public barrel) + `spec/sample-report.spec.ts`;
      `npm run verify` green at 109 tests. Locally byte-identical across regenerations.**
- [x] A generator script writes the self-contained document to `report/index.html` from built `dist/`.
      **`scripts/generate-sample-report.mjs` (plain Node, no new dep) + `npm run report:sample`;
      wrote 6504 bytes, 0 external refs. `report/` is gitignored (produced in CI).**
- [x] `pages.yml` deploys that page on `push` to `main` after `npm run verify` passes, with deploy-only
      Pages permissions and no deployment on pull requests. **`.github/workflows/pages.yml`: `build`
      runs verify + generate + upload; `deploy` job alone holds `pages: write`/`id-token: write`;
      triggers are `push`/`workflow_dispatch` only.**
- [~] Repository Pages configured for GitHub Actions publication; the canonical public URL documented
      in README with the snapshot/illustrative wording and the Serenity/JS independence statement.
      **README documents <https://neocognitus70.github.io/hand-baked-screenplay-pattern/> with the
      illustrative/independent wording; repository Pages "GitHub Actions" source is enabled at
      merge/first deploy.**
- [ ] The public URL returns HTTP 200, is self-contained and renders with no console errors at desktop
      and 390px; a separate landing PR then adds the truthful `report` action and records the evidence.
      **Pending merge + Pages deploy. Rendered locally: banner + 3 scenes (2 pass / 1 fail, assertion
      error shown), self-contained, no console errors.**

**Type:** code + CI + docs. **Implemented on branch `hbsp-27-impl-sample-report`.**

---

None outstanding besides HBSP-27 above — **Static HTML reporting** (formerly Item #1) was delivered
and moved to Resolved Risks below.

---

### Resolved Risks

Resolved risks are kept here as a record that the gap existed — do not delete them.

#### Item #1: No post-run test report artifact — implement Static HTML reporting — Score: 20 — ✅ RESOLVED

**Priority Score:** Security Impact (4) + Breakage Probability (7) + Maintenance Burden (9) = **20 points**
**Impact:** The library surfaced results via `ConsoleReporter` only — no persistent, shareable
artifact existed after a run, and the `StageCrewMember` concept the library teaches was
under-demonstrated.
**Effort:** 6–10 hours estimated (plan tasks 1–7); delivered across worklist items HBSP-01..08.
**Status:** ✅ RESOLVED 2026-06-13 — delivered via worklist branches `worklist/static-html-reporting`
(PR #9), `-2` (PR #10), `-3` (PR #11), `-4` (PR #12), and `-5` (HBSP-07/08, PR #13). All merged.
**Affected Stacks:** TypeScript library (`src/screenplay/`, `src/crew/`, new `src/reporting/`,
new `src/scene/`)

**Problem (now closed):**
Test results vanished with the console. A complete, self-contained implementation plan existed at
[`planning/static-html-reporting.md`](../planning/static-html-reporting.md): extend the event
model with scene/test-run events and `Stage`-stamped timestamps, add an `Outcome` model, a pure
report builder and HTML renderer, an `HtmlReporter` crew member, and a runner-agnostic
`scene(name, fn)` helper. All of this has shipped.

**Impact Analysis:**
- **Security (4/10):** the report renders user-controlled text (scene names, activity
  descriptions, error messages/stacks); `renderHtml` escapes every dynamic value (plan §6.5/§10),
  avoiding an ad-hoc, injection-prone implementation.
- **Breakage (7/10):** the work touched the library's most depended-on seam
  (`StageEvents.ts`, `Stage.ts`); the sibling project `calculator-screenplay-bdd` consumes the
  public API via a `file:` dependency, so all barrel additions were kept strictly additive (no
  existing export changed or removed — see HBSP-07).
- **Maintenance (9/10):** the report artifact removes per-consumer result hand-rolling and
  unblocks the portfolio's living-documentation convention for this project.

**Outcome — Success Criteria** (from plan §9), all met:
- [x] `npm run verify` green (typecheck over `src` + `spec`, build emits `dist/`, all tests pass —
  47 tests, up from the original 19).
- [x] The plan §7 worked example produces a single, self-contained `index.html` — verified end to
  end by `spec/reporting-e2e.spec.ts`, which runs one passing and one failing scene through the
  public API and asserts the captured HTML reports 1 pass / 1 fail.
- [x] No new runtime dependencies (Node's built-in `node:fs` only, inside the default writer);
  dev dependencies unchanged.
- [x] `buildReport`, `renderHtml`, and `Outcome.from` are pure and unit-tested in isolation;
  filesystem access is confined to `HtmlReporter`'s default writer and is injectable for tests.
- [x] Naming follows plan §3; reporting is a `StageCrewMember`, not an actor `Ability`.

---

### Review-derived cycle (HBSP-09..14) — Resolved 2026-06-17

A first code review (`.review/CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1543Z/`, identity
CLAUDE_Opus_4_8) on 2026-06-16 raised one security item plus four Low-severity correctness/hygiene
risks and a handful of next-step recommendations. These were derived into worklist items
HBSP-09..14 and all delivered across PRs #15–#17 (merged 2026-06-17). All gated green on
`npm run verify`. Recorded here as the durable record; statuses are authoritative.

#### Item #2: Dependabot "1 high" / npm-audit advisories in the dev test toolchain — Score: 18 — ✅ RESOLVED

**Priority Score:** Security Impact (8) + Breakage Probability (6) + Maintenance Burden (4) = **18 points**
**Impact:** `npm audit` on `main` reported 1 critical + 2 high + 2 moderate advisories, all from
`esbuild` (RCE GHSA-gv7w-rqvm-qjhr, CVSS 8.1) pulled transitively via `vite` / `@vitest/mocker`
under `vitest@^2`. Dev-only (no runtime dependency affected), but it lit up the default branch.
**Status:** ✅ RESOLVED 2026-06-17 (HBSP-09, commit `9f9bc21`, PR #15). Bumped `vitest@^2.1.0`→
`^4.1.9` (a **major, dev-only** bump — user-approved default); the Vitest config needed no
migration. `npm audit` now reports **0 vulnerabilities** (verified again 2026-06-22 on `main`
`120a631`). CHANGELOG Security entry added.
**Affected Stacks:** TypeScript dev toolchain (`package.json` devDependencies).
**Note:** any lingering Dependabot "1 high" alert on the default branch is re-scan lag — the local
`npm audit` is 0 since the bump; not a real vulnerability.

#### Item #3: Node version story inconsistent across README / package.json / CI — Score: 8 — ✅ RESOLVED

**Priority Score:** Security Impact (1) + Breakage Probability (4) + Maintenance Burden (3) = **8 points**
**Impact:** README claimed "Node.js 18+" while CI tested `[20, 22]` and `package.json` declared no
`engines` floor — three sources, no single agreed floor; Node 18 is EOL (2025-04-30).
**Status:** ✅ RESOLVED 2026-06-17 (HBSP-10, commit `7201f8e`, PR #15). README → "Node.js 20+",
added `"engines": { "node": ">=20" }`, CI matrix left at `[20, 22]` — all three now agree on floor
20 (user-approved default). Remaining "18+" strings live only in `.review/` historical artefacts
(they correctly describe the pre-fix state and were intentionally not edited).
**Affected Stacks:** docs + config (no source change).

#### Item #4: ReportModel could render negative durations / mis-pick run start — Score: 6 — ✅ RESOLVED

**Priority Score:** Security Impact (0) + Breakage Probability (4) + Maintenance Burden (2) = **6 points**
**Impact:** A non-monotonic clock could produce negative durations; a stray pre-scene event could
back-date the run start.
**Status:** ✅ RESOLVED 2026-06-17 (HBSP-11, commit `cf56332`, PR #16). Floored every activity /
scene / run duration at `Math.max(0, …)`; run `startedAt` now prefers the first `scene:starts`
timestamp, falling back to `events[0]` only when no scene started. Added a non-monotonic-clock spec
and updated the orphan-events test to match the corrected semantics. Test count 47 → 48.
**Affected Stacks:** `src/reporting/ReportModel.ts` + `spec/`.

#### Item #5: HtmlReporter's real node:fs writer branch was untested; no coverage script — Score: 6 — ✅ RESOLVED

**Priority Score:** Security Impact (0) + Breakage Probability (3) + Maintenance Burden (3) = **6 points**
**Impact:** Every reporting spec stubbed the writer, so the default `node:fs` writer branch — the
only filesystem path — was never exercised; there was also no way to see coverage.
**Status:** ✅ RESOLVED 2026-06-17 (HBSP-12, commit `2e993e7`, PR #16). Added
`spec/html-reporter-fs.spec.ts` driving the real `fileSystemWriter` to `os.tmpdir()` (asserts a
real `index.html` containing `<!DOCTYPE html>`, exercises nested-dir creation, cleans up); added a
`coverage` script (`vitest run --coverage` via `@vitest/coverage-v8@^4.1.9`, matching the Vitest 4
major) surfaced informationally in CI on Node 20 with **no hard gate** (per the review). Coverage
**as of 2026-06-17** = 90.16% stmts / 84.49% branch / 94.11% funcs / 90.32% lines. Test count
48 → 50. See Item #16 below for the current figures — coverage numbers are now restated
"as of `<date>`" rather than claimed evergreen, since the suite and the code it covers both grow.
**Affected Stacks:** `spec/` + `package.json` + CI.

#### Item #6: No public-API surface canary; an accidental export change would surface only in the sibling consumer — Score: 5 — ✅ RESOLVED

**Priority Score:** Security Impact (0) + Breakage Probability (3) + Maintenance Burden (2) = **5 points**
**Impact:** The sibling `calculator-screenplay-bdd` consumes this library via a `file:../`
dependency; an accidental rename/removal of a public export would fail in the *sibling's* build,
not here.
**Status:** ✅ RESOLVED 2026-06-17 (HBSP-13, commit `90a60d3`, PR #17). Added
`spec/public-api.spec.ts` importing the package root (`../src/index.js`) and asserting every
consumed symbol is defined (`Ability`, `Cast`, `Ensure`, `Interaction`, `LastResponse`,
`MakeRequests`, `ManageData`, `Question`, `Stage`, `Task`, `equals`, `includes`, plus the reporting
/ expectation additions `ConsoleReporter`, `HtmlReporter`, `buildReport`, `renderHtml`, `scene`,
…), with a count floor that catches accidental removals while staying additive-friendly. Test count
50 → 81 (31 new parametrised cases).
**Affected Stacks:** `spec/` (test only).

#### Item #7: Documentation/comment drift — ConsoleReporter scope + stale backlog narrative — Score: 4 — ✅ RESOLVED

**Priority Score:** Security Impact (0) + Breakage Probability (1) + Maintenance Burden (3) = **4 points**
**Impact:** `ConsoleReporter` silently handles only `activity:*` events (no scene boundaries),
which a reader could mistake for a bug; and the Item #1 narrative above still said the `-5` PR was
"awaiting user review" after it had merged.
**Status:** ✅ RESOLVED 2026-06-17 (HBSP-14, commit `6a463cd`, PR #17). Added a JSDoc note to
`src/crew/ConsoleReporter.ts` documenting that it intentionally ignores `scene:*` /
`test-run:finishes` (run framing is the `HtmlReporter`'s job); corrected the stale Item #1 line (the
RESOLVED status was already right — only the narrative predated the merge). No behaviour change.
**Affected Stacks:** docs / comment only.

---

### Second review-derived cycle (HBSP-15..22) — Resolved 2026-07-07

A second code review (`.review/CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1044Z/`, identity
CLAUDE_Fable_5) on 2026-07-06 raised one MEDIUM process risk, two low-medium/low correctness fixes,
three low hygiene items, and one informational item — **no HIGH findings**. Derived into worklist
items HBSP-15..22 and delivered across PRs #19–#25 (merged 2026-07-07), plus one ops action.
All gated green on `npm run verify`. Release **0.2.0** metadata was cut (HBSP-21); the actual
`v0.2.0` tag and GitHub release followed on 2026-07-27 under **CGX-01** (see Item #14). Statuses
authoritative.

#### Item #8: Backlog v4 reconciliation was uncommitted — committed `main` was a full cycle stale — Score: 12 — ✅ RESOLVED

**Priority Score:** Security Impact (2) + Breakage Probability (4) + Maintenance Burden (6) = **12 points**
**Impact:** The v4 reconciliation (recording the whole HBSP-09..14 cycle) existed only as an
uncommitted working-tree edit; committed `main` still carried v3, so anyone cloning the repo saw a
source of truth a full cycle behind reality.
**Status:** ✅ RESOLVED 2026-07-07 (HBSP-15, commit `94a99e8`, PR #19). v4 content committed
unchanged via a separate docs-only PR (review PR #18 stayed artefacts-only). Review Risk 1 (MEDIUM).
**Affected Stacks:** docs (`docs/backlog.md`).

#### Item #9: buildReport rendered a never-finished scene as passed (false green) — Score: 9 — ✅ RESOLVED

**Priority Score:** Security Impact (0) + Breakage Probability (5) + Maintenance Burden (4) = **9 points**
**Impact:** A scene's outcome was initialised to `successful()` on `scene:starts` and only replaced
on `scene:finishes`, so a run that crashed mid-scene rendered the interrupted scene as **passed
(0ms)** — a false green in exactly the degraded case the builder documents surviving.
**Status:** ✅ RESOLVED 2026-07-07 (HBSP-16, commit `92efde3`, PR #20). A scene still open when the
fold ends is now reported as failed (interrupted error naming the scene), excluded from `succeeded`,
duration run to end-of-fold and floored ≥ 0. +2 specs. Review Risk 2 (LOW-MEDIUM).
**Affected Stacks:** `src/reporting/ReportModel.ts` + `spec/`.

#### Item #10: HtmlReporter double-counted scenes across runs — Score: 5 — ✅ RESOLVED

**Priority Score:** Security Impact (0) + Breakage Probability (3) + Maintenance Burden (2) = **5 points**
**Impact:** The event buffer was push-only, so a reporter observing two runs rendered the first
run's scenes again inside the second report (wrong output, no crash).
**Status:** ✅ RESOLVED 2026-07-07 (HBSP-17, commit `a30873b`, PR #21). Buffer cleared after a
successful write (kept on a failed write, so a transient I/O error loses nothing). +1 two-runs spec;
README per-run note added. Review Risk 3 (LOW).
**Affected Stacks:** `src/crew/HtmlReporter.ts` + `spec/` + README.

#### Item #11: npm publish path unguarded (could ship a missing/stale dist) — Score: 5 — ✅ RESOLVED

**Priority Score:** Security Impact (1) + Breakage Probability (2) + Maintenance Burden (2) = **5 points**
**Impact:** The manifest ships `dist/` (git-ignored) with no publish lifecycle hook — `npm publish`
from a clean clone could ship a missing or stale build.
**Status:** ✅ RESOLVED 2026-07-07 (HBSP-18, commit `b47c513`, PR #22). Added
`"prepublishOnly": "npm run verify"`; README Versioning note. Chose `prepublishOnly` over
`"private": true` since the manifest advertises publishability. Review Risk 4 (LOW).
**Affected Stacks:** `package.json` + README.

#### Item #12: CI actions behind the portfolio baseline; vitest patch drift — Score: 4 — ✅ RESOLVED

**Priority Score:** Security Impact (0) + Breakage Probability (2) + Maintenance Burden (2) = **4 points**
**Impact:** `ci.yml` pinned `checkout@v4` / `setup-node@v4` (portfolio baseline is v5, ahead of the
Actions Node-24 runtime cutover); `vitest` had drifted a patch behind.
**Status:** ✅ RESOLVED 2026-07-07 (HBSP-19, commit `bc43ccd`, PR #23). `checkout@v5`,
`setup-node@v5`, matrix `[20, 22, 24]`, `vitest` / `@vitest/coverage-v8` → `^4.1.10`; all three
matrix cells green; `npm audit` 0. Review Risk 5 (LOW) + Risk 7 patch-drift. Precedent: sudoku SUD-08.
**Affected Stacks:** `.github/workflows/ci.yml` + `package.json`.

#### Item #13: Code/test hygiene — redundant Actor.answer branch; leaky test teardowns — Score: 3 — ✅ RESOLVED

**Priority Score:** Security Impact (0) + Breakage Probability (1) + Maintenance Burden (2) = **3 points**
**Impact:** `Actor.answer` had two identical `return answerable` arms behind a no-op `isPromise`
check; `stage-and-cast.spec.ts` reset the default stage inline, so a failing assertion leaked
default-stage state into later tests.
**Status:** ✅ RESOLVED 2026-07-07 (HBSP-20, commit `fce5c0e`, PR #24). Branch + unused import
removed; teardowns moved to `afterEach`. No behaviour change (81 tests unchanged on that branch).
Review Recommendations (LOW).
**Affected Stacks:** `src/screenplay/Actor.ts` + `spec/`.

#### Item #14: CHANGELOG had duplicate Added headings; 0.2.0 release overdue — Score: 3 — ✅ RESOLVED

**Priority Score:** Security Impact (0) + Breakage Probability (0) + Maintenance Burden (3) = **3 points**
**Impact:** `[Unreleased]` carried two `### Added` headings (Keep-a-Changelog / MD024 break) and a
whole feature stream while 0.1.0 was the only release.
**Status:** ✅ RESOLVED 2026-07-07 (HBSP-21, commit `cdd7b90`, PR #25). Cut `## [0.2.0]` (one
heading per change type, Keep-a-Changelog order); compare links updated; `package.json` → `0.2.0`.
Review Risk 6 (LOW). **Release completed 2026-07-27 (CGX-01):** HBSP-21 prepared only the version
*metadata*; the fourth review (Codex GPT-5 v1) found no `v0.2.0` tag or GitHub release existed
(its Risk 1, MEDIUM). CGX-01 created the lightweight `v0.2.0` tag at `8ecd282` (the PR #25 merge —
the 0.2.0 state, dated 2026-07-07) and published the GitHub release from it; no npm publish (matches
the v0.1.0 precedent). See `docs/releasing.md` for the checklist that keeps release metadata and the
release record aligned.
**Affected Stacks:** `CHANGELOG.md` + `package.json`.

#### Item #15: Two stale Dependabot `vite` alerts on the default branch — Score: 2 — ✅ RESOLVED

**Priority Score:** Security Impact (1) + Breakage Probability (0) + Maintenance Burden (1) = **2 points**
**Impact:** The default branch showed 2 open Dependabot alerts (#2 high, #3 medium, both `vite`,
range `<= 6.4.2`) while the committed lockfile resolves `vite@8.0.16` and `npm audit` = 0 — re-scan
lag, not live vulnerabilities, but a red badge on a portfolio repo.
**Status:** ✅ RESOLVED 2026-07-07 (HBSP-22, ops — no repo change). Verified `vite@8.0.16` in the
committed lockfile and `npm audit` 0 **before** acting; dismissed both via `gh api PATCH`
(`dismissed_reason=inaccurate`) with an evidence comment. **0 open Dependabot alerts.** Review Risk 7
(informational).
**Affected Stacks:** none (GitHub security tab only).

### Third review-derived cycle (review v2, TRIAGE-01..05) — Resolved 2026-07-19

Code review v2 (`.review/CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0032Z/`) found no HIGH/MEDIUM
findings — five Low/Low-Medium items, triaged into `WORKLIST_hand-baked-screenplay-pattern.md`
TRIAGE-01..05 (portfolio root) and executed one item per `loop-worklist` iteration, each on its
own branch off fresh `main` with a green PR (#28–#32). TRIAGE-04 landed first in this backlog as
Item #16; Items #17–#20 below record TRIAGE-01, #02, #03, and #05, reconciled in the same pass
that closed out the cycle (this session, after all five PRs merged).

#### Item #16: `ConsoleReporter` had 0% test coverage; Item #5's coverage numbers had drifted — Score: n/a (review Low) — ✅ RESOLVED

**Impact:** `ConsoleReporter.ts` — the library's original, README-advertised crew member — had no
spec at all despite an injectable `log` sink built for exactly that; the three log formats and the
intentionally-ignored scene/run event types were unpinned. Separately, Item #5's coverage numbers
(90.16%/84.49%) no longer reproduced — later cycles (HBSP-16/17, TRIAGE-03) changed the
denominator without restating them.
**Status:** ✅ RESOLVED 2026-07-19 (TRIAGE-04). Added `spec/console-reporter.spec.ts`: asserts the
three formatted log lines (`begins:`/`done:`/`fails:`), that `scene:starts`/`scene:finishes`/
`test-run:finishes` produce no output (the documented scope boundary), and that the constructor
defaults its sink to `console.log`. Test count 85 → 88.
**Coverage as of 2026-07-19** = **92.85% stmts / 82.96% branch / 95.04% funcs / 93.15% lines**
(`npm run coverage`; `src/crew/` — `ConsoleReporter.ts` and `HtmlReporter.ts` — now both fully
covered, absent from the report's per-file detail rows). Branch % moved down from 84.49% despite
the new spec because a growing suite widens the denominator faster than any one file's coverage
narrows it — a normal effect of the overall codebase growing, not a regression in this file.
Re-run `npm run coverage` for the live numbers next time this note is touched, rather than trusting
this one indefinitely.
**Affected Stacks:** `spec/` + `docs/backlog.md`.

#### Item #17: Pedagogical guides still taught the pre-0.2.0 model, and called the shipped `HtmlReporter` "planned" — Score: 9 — ✅ RESOLVED

**Priority Score:** Security Impact (0) + Breakage Probability (4) + Maintenance Burden (5) = **9 points**
**Impact:** `docs/03-event-notification-layer.md` presented the `DomainEvent` union as three
activity-only variants with no `timestamp` and said "There are no scene/run events yet";
`docs/01-screenplay-flow.md` called the reporter "planned". Both had shipped 2026-07-07 (0.2.0). A
reader following the guides was told the library's headline feature did not exist, and the guide's
code snippet no longer compiled against the library it documented.
**Status:** ✅ RESOLVED 2026-07-19 (TRIAGE-01, commit `9b00eec`, PR #28). Both guides now show the
real six-variant `DomainEventInput`/`DomainEvent` split and the `Stage.announce` timestamp-stamping
step, and point at the shipped `HtmlReporter`. `planning/static-html-reporting.md`'s status header
flipped from "Ready to implement" to "Delivered 2026-06-13 (backlog Item #1) — retained as a
worked example"; the plan body itself is untouched. Review Risk 1 (LOW-MEDIUM).
**Affected Stacks:** docs (`docs/03-event-notification-layer.md`, `docs/01-screenplay-flow.md`,
`planning/static-html-reporting.md`).

#### Item #18: README hardcoded "the current version is 0.1.0" though HBSP-21 had cut 0.2.0 — Score: 4 — ✅ RESOLVED

**Priority Score:** Security Impact (0) + Breakage Probability (1) + Maintenance Burden (3) = **4 points**
**Impact:** The Versioning section's one sentence whose only job is to state the version was wrong
by a full minor release — a small but visible credibility nick, and the exact drift class the
portfolio's reviews keep flagging.
**Status:** ✅ RESOLVED 2026-07-19 (TRIAGE-02, commit `e6cfe27`, PR #29). Replaced the literal with
a pointer to `package.json`/`CHANGELOG.md`, so it cannot rot again. Review Risk 2 (LOW).
**Affected Stacks:** docs (`README.md`).

#### Item #19: `buildReport` crash truth stopped at scene level — an interrupted activity still rendered as passed — Score: 7 — ✅ RESOLVED

**Priority Score:** Security Impact (0) + Breakage Probability (4) + Maintenance Burden (3) = **7 points**
**Impact:** HBSP-16 fixed the false-green *scene*, but an activity still open when its scene closed
kept its optimistic `successful()`/`0ms` placeholder — a report could show a green tick for the very
step executing when a run died, nested under a scene the same report marked failed. Separately, the
crash-truth correction only ever considered a single `currentScene`: a second `scene:starts`
arriving while an earlier one was still open (the manual `sceneStarts`/`sceneFinishes` facade the
README documents for runner hooks) left the earlier scene abandoned at its placeholder, silently
counted as passed.
**Status:** ✅ RESOLVED 2026-07-19 (TRIAGE-03, commit `bc4ff2d`, PR #30). Added
`interruptOpenActivities`/`interruptScene` helpers, wired into all three places a scene can close
(`scene:finishes`, end-of-fold, a superseding `scene:starts`). Extended the crash-truth spec with
activity-level assertions and added a new spec pinning the overlapping-scenes semantics. Test count
84 → 85. Review Risk 3 (LOW).
**Affected Stacks:** `src/reporting/ReportModel.ts` + `spec/`.

#### Item #20: Dead code — `isPromise` in `src/util.ts` had no callers — Score: 3 — ✅ RESOLVED

**Priority Score:** Security Impact (0) + Breakage Probability (0) + Maintenance Burden (3) = **3 points**
**Impact:** HBSP-20 removed the redundant promise branch in `Actor.answer` (and its `isPromise`
import) but left the helper itself behind — pure maintenance noise, no behavioural risk.
**Status:** ✅ RESOLVED 2026-07-19 (TRIAGE-05, commit `fa18823`, PR #32). Deleted the helper and its
JSDoc; `grep -rn "isPromise" src spec` confirmed zero callers before removal, `util.ts` is internal
(not exported from `src/index.ts`), so removal cannot affect the public API or the sibling
`calculator-screenplay-bdd` consumer. Review Risk 5 (LOW).
**Affected Stacks:** `src/util.ts`.

### Fourth review-derived cycle (Codex GPT-5 v1, CGX-01..06) — Resolved 2026-07-27

The fourth code review (`.review/CODE_REVIEW_CODEX_GPT5_v1_20260723T2337Z/`, identity CODEX_GPT5)
on 2026-07-23 raised **two MEDIUM** findings (the first MEDIUMs ever against this project) plus one
LOW-MEDIUM and three LOW, and one informational item. Triaged into
`WORKLIST_hand-baked-screenplay-pattern.md` as CGX-01..06 and executed one item per `loop-worklist`
iteration, each on its own branch off `main` with a green PR (#35–#40, all merged 2026-07-27).
Risk 7 (informational — clean `npm audit`, licence intact) was dropped to routine maintenance per
the review's own steer; the recorded crew-isolation question was not promoted to a finding.

#### Item #21: Release truth — 0.2.0 was "cut" in metadata but no tag/release existed — Score: 14 — ✅ RESOLVED

**Priority Score:** Security Impact (2) + Breakage Probability (5) + Maintenance Burden (7) = **14 points**
**Impact:** The backlog declared 0.2.0 cut and current, and `package.json`/`CHANGELOG.md` carried
0.2.0, but no `v0.2.0` Git tag existed locally or on the remote and GitHub's latest release was
still `v0.1.0` — the repo had 0.2.0 *source metadata*, not a verifiable release, and the changelog
`compare/v0.1.0...v0.2.0` link was unresolved.
**Status:** ✅ RESOLVED 2026-07-27 (CGX-01, docs commit `1bb226b`, PR #35). Created the lightweight
`v0.2.0` tag at `8ecd282` (the PR #25 merge — the 0.2.0 state, dated 2026-07-07) and published the
GitHub release from it (now Latest); **no npm publish** (matches the v0.1.0 stance). Corrected the
Item #14 wording (metadata cut by HBSP-21 vs release made under CGX-01); added a
`CHANGELOG.md [Unreleased]` note for TRIAGE-03; added `docs/releasing.md` (a release-verification
checklist). Review Risk 1 (**MEDIUM**). Decision: GitHub tag + release only.
**Affected Stacks:** ops (Git tag + GitHub release) + docs (`docs/backlog.md`, `CHANGELOG.md`,
`docs/releasing.md`).

#### Item #22: `Cast.whereEveryoneCan` shares mutable ability instances across actors — Score: 13 — ✅ RESOLVED

**Priority Score:** Security Impact (3) + Breakage Probability (5) + Maintenance Burden (5) = **13 points**
**Impact:** `whereEveryoneCan(...abilities)` granted the *same* ability instances to every actor, so
two actors on one stage shared mutable state — `ManageData`'s store and `MakeRequests`'s last
response leaked across actor identities — despite the actor-centric API implying isolation.
**Status:** ✅ RESOLVED 2026-07-27 (CGX-02, commit `49010af`, PR #36). Added
`Cast.whereEachActorCan(() => Ability[])`, which builds fresh instances per prepared actor;
`whereEveryoneCan` unchanged (decision: keep the default, additive fix), its JSDoc now documents the
sharing. Two-actor isolation spec covers both `ManageData` and `MakeRequests.lastResponse`; README +
Guide 01 disclose the sharing. Additive-only — no export changed (public-api canary green), so the
`calculator-screenplay-bdd` consumer is unaffected. 88 → 91 tests. Review Risk 2 (**MEDIUM**).
**Affected Stacks:** `src/screenplay/Cast.ts` + `spec/` + README + `docs/01-screenplay-flow.md`.

#### Item #23: Falsy thrown values produced a passing scene — Score: 9 — ✅ RESOLVED

**Priority Score:** Security Impact (0) + Breakage Probability (5) + Maintenance Burden (4) = **9 points**
**Impact:** `Outcome.from` treated every falsy value as success (`if (!error)`), and `scene()` fed
caught values straight in, so `throw false/0/''/null/undefined` rendered as a **passing** scene even
though `scene()` re-threw them — a false green contradicting the runner.
**Status:** ✅ RESOLVED 2026-07-27 (CGX-03, commit `b829403`, PR #37). Added the total
`Outcome.fromError(error: unknown)` (every value → failure, non-`Error` wrapped, `AssertionError`
preserved); `scene()`'s catch uses it; `Outcome.from` unchanged for the absence-of-error=success
intent and now delegates to `fromError`. Table-driven `outcome.spec` + an end-to-end assertion that
`throw false` renders 1 failed / 0 passed. 91 → 99 tests (via this branch's base). Review Risk 3
(LOW-MEDIUM).
**Affected Stacks:** `src/screenplay/Outcome.ts` + `src/scene/scene.ts` + `spec/`.

#### Item #24: Scene-level failures rendered no error details — Score: 6 — ✅ RESOLVED

**Priority Score:** Security Impact (0) + Breakage Probability (3) + Maintenance Burden (3) = **6 points**
**Impact:** `renderScene` rendered only a status pill, so a scene that failed before/outside
`attemptsTo` (setup, a hook, orchestration) produced a red scene with no actionable cause — the
README promised "error details for failures" without that qualification.
**Status:** ✅ RESOLVED 2026-07-27 (CGX-04, commit `a01b666`, PR #38). Generalised `renderError` to a
scene/activity `Outcome`; `renderScene` renders the scene's own error block when it failed,
suppressed only when a nested activity already shows the identical error (no duplicate noise). New
specs: a no-activities failing scene renders its escaped message + stack; a matching scene/activity
error renders once. Review Risk 4 (LOW).
**Affected Stacks:** `src/reporting/renderHtml.ts` + `spec/`.

#### Item #25: A zero-scene run was labelled "All scenes passed" — Score: 5 — ✅ RESOLVED

**Priority Score:** Security Impact (0) + Breakage Probability (3) + Maintenance Burden (2) = **5 points**
**Impact:** The renderer defined a passed run solely as `failed === 0`, so an empty or terminal-only
event stream produced a green "All scenes passed" summary despite recording no test evidence — a
misconfigured runner that executed nothing looked successful.
**Status:** ✅ RESOLVED 2026-07-27 (CGX-05, commit `163c721`, PR #39). `RunReport` gains an explicit
`status: 'passed' | 'failed' | 'empty'` (new `RunStatus` type); `buildReport` sets `'empty'` for a
zero-scene run; `renderHtml` renders a neutral "No scenes recorded" band (amber, visibly not green).
Model + reporter + renderer specs cover the terminal-only and empty streams. `RunStatus`/`status`
are type-only additions (no runtime export change; canary green). → 104 tests. Decision: neutral
state. Review Risk 5 (LOW).
**Affected Stacks:** `src/reporting/ReportModel.ts` + `src/reporting/renderHtml.ts` + `spec/`.

#### Item #26: Guide 03 TimingReporter example was unsafe for concurrent actors — Score: 3 — ✅ RESOLVED

**Priority Score:** Security Impact (0) + Breakage Probability (0) + Maintenance Burden (3) = **3 points**
**Impact:** The teaching `TimingReporter` in `docs/03-event-notification-layer.md` used one global
LIFO stack popped for any actor and timed with fresh `Date.now()` calls, so interleaved actors
mispaired start/finish times — contradicting the same guide's §6, which explains a reporter needs a
stack per actor.
**Status:** ✅ RESOLVED 2026-07-27 (CGX-06, commit `5db3058`, PR #40). Keyed the start-time stack by
`event.actor` (`Map<string, number[]>`), timing from the stamped `event.timestamp` not `Date.now()`;
added an interleaved Ada/Bob trace cross-referencing §6. Docs-only. Review Risk 6 (LOW).
**Affected Stacks:** `docs/03-event-notification-layer.md`.

---

## Risk Summary

| Priority | Count | Total Effort | Status Distribution |
|---|---|---|---|
| HIGH (20–30) | 0 | — | — |
| MEDIUM (10–19) | 0 | — | — |
| LOW (0–9) | 1 | ~2–4 hrs | HBSP-27 (sample-report Pages publication) — PLANNING/approved |
| **Total Outstanding** | **1** | **~2–4 hrs** | |
| Resolved | 26 | — | Item #1 (2026-06-13); Items #2–#7 / HBSP-09..14 (2026-06-17); Items #8–#15 / HBSP-15..22 (2026-07-07); Items #16–#20 / TRIAGE-01..05 (2026-07-19); Items #21–#26 / CGX-01..06 (2026-07-27) |

---

## Potential Next Steps

### HIGH Priority

None. **Static HTML reporting** (Item #1) and all four review-derived cycles (Items #2–#7 /
HBSP-09..14, Items #8–#15 / HBSP-15..22, Items #16–#20 / TRIAGE-01..05, Items #21–#26 / CGX-01..06)
are Resolved. The fourth review (Codex GPT-5 v1) raised the project's first **MEDIUM** findings
(Items #21–#22), both now closed. `npm run verify` green at **104 tests** on `main` `2a5e93f`,
`npm audit` clean, release **`v0.2.0`** live on GitHub (tag + release, Item #21).

### MEDIUM Priority

None outstanding — Items #21 (release truth) and #22 (shared abilities), the first MEDIUMs raised
against the project, are Resolved.

### LOW Priority

None yet — the review v2 close-out (TRIAGE-01..05 / Items #16–#20) and the review v3/Codex close-out
(CGX-01..06 / Items #21–#26) are fully Resolved.

> A fifth code review or a fresh survey would be the natural source of the next items — there is
> no outstanding work to schedule from the current evidence.

---

## Maintenance Notes

- Include links/paths to affected files when adding new items.
- Update the version number at the top when items change status.
- Cross-reference code review findings in `.review/` once a review exists.
- Mark completion dates when items move to ✅ Resolved.
- Update effort estimates with actuals after completion.
