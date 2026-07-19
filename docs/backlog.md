<!--
  AUDIENCE: Engineers, AI agents, and project leads maintaining work-in-progress tracking.
  PURPOSE:  Single source of truth for outstanding work, risks, and planning for this project.
  LOCATION: docs/backlog.md
  TEMPLATE: test-automation-portfolio/templates/backlog.template.md
-->

# Hand-Baked Screenplay Pattern — Backlog

**Version:** 6 — records Item #16 (TRIAGE-04, `ConsoleReporter` coverage) from the in-progress
third review-derived cycle (review v2); TRIAGE-01..03 already merged but not yet backlog-recorded
individually (see `WORKLIST_hand-baked-screenplay-pattern.md`); TRIAGE-05 remains open.
**Last Updated:** 2026-07-19
**Based on:** repo on branch `worklist/triage-04-console-reporter-coverage`, off `main` at
`780916b` (PRs #28–#30 merged: TRIAGE-01..03); third review-derived worklist TRIAGE-01..05,
derived from code review `.review/CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0032Z/`.
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

None outstanding — **Static HTML reporting** (formerly Item #1) was delivered and moved to
Resolved Risks below.

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
All gated green on `npm run verify`. Release **0.2.0** was cut (HBSP-21). Statuses authoritative.

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
Review Risk 6 (LOW).
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

### Third review-derived cycle (review v2, TRIAGE-01..05) — in progress 2026-07-19

Code review v2 (`.review/CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0032Z/`) found no HIGH/MEDIUM
findings — five Low/Low-Medium items, triaged into `WORKLIST_hand-baked-screenplay-pattern.md`
TRIAGE-01..05 (portfolio root). Recorded here as each lands; the cycle is not yet complete (see
Potential Next Steps for what remains).

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

---

## Risk Summary

| Priority | Count | Total Effort | Status Distribution |
|---|---|---|---|
| HIGH (20–30) | 0 | — | — |
| MEDIUM (10–19) | 0 | — | — |
| LOW (0–9) | 0 | — | — |
| **Total Outstanding** | **0** | **—** | |
| Resolved | 16 | — | Item #1 (2026-06-13); Items #2–#7 / HBSP-09..14 (2026-06-17); Items #8–#15 / HBSP-15..22 (2026-07-07); Item #16 / TRIAGE-04 (2026-07-19) |

---

## Potential Next Steps

### HIGH Priority

None. **Static HTML reporting** (Item #1) and all three review-derived cycles' findings so far
(Items #2–#7 / HBSP-09..14, Items #8–#15 / HBSP-15..22, Item #16 / TRIAGE-04) are Resolved — no
HIGH or MEDIUM finding has ever been raised against this project. `npm run verify` green at
**88 tests** as of this item.

### MEDIUM Priority

None yet.

### LOW Priority

**In progress — review v2 close-out (TRIAGE-01..05):** TRIAGE-01 (pedagogical guide refresh),
TRIAGE-02 (README version pointer), and TRIAGE-03 (activity-level crash truth) are already
Resolved (see `WORKLIST_hand-baked-screenplay-pattern.md` at the portfolio root for commits/PRs);
TRIAGE-04 lands with this entry as Item #16. TRIAGE-05 (delete the unused `isPromise` helper)
remains open.

> A fourth code review or a fresh survey would be the natural source of further items once
> TRIAGE-05 lands and this cycle closes out.

---

## Maintenance Notes

- Include links/paths to affected files when adding new items.
- Update the version number at the top when items change status.
- Cross-reference code review findings in `.review/` once a review exists.
- Mark completion dates when items move to ✅ Resolved.
- Update effort estimates with actuals after completion.
