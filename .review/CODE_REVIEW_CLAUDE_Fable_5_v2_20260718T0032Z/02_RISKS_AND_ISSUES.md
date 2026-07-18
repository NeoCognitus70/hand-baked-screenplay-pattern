# Risks and Issues

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0032Z.md) | [Next: Project Reviews ->](03_PROJECT_REVIEWS/PROJECT_001_hand-baked-screenplay-pattern.md)

**Reviewer:** AI assistant (CLAUDE Fable 5)
**Date:** 2026-07-18T00:32Z

Findings are numbered high to low. There are **no High or Medium findings**.
Severities: Risk 1 is Low-Medium, Risks 2-5 are Low, Risk 6 is informational.
All evidence was gathered at commit `77e6df6` (`main`, in sync with
`origin/main`, clean tree apart from this review directory).

---

## Risk 1 (Low-Medium): The pedagogical guides describe the shipped 0.2.0 reporting feature as unbuilt

**Risk Description/Explanation**
The repo's flagship 0.2.0 feature - scene/run events, stamped timestamps, and
the static HTML reporter - shipped on 2026-07-07 and is documented as current in
the README and CHANGELOG. But the `docs/` guides, which the docs index bills as
the deeper learning material, still teach the **pre-0.2.0 model** and tell the
reader the feature does not exist yet. The planning document likewise still
declares itself ready to be implemented.

**Evidence Outline**
- [docs/03-event-notification-layer.md](../../docs/03-event-notification-layer.md)
  (lines 42-53) presents the `DomainEvent` union as three `activity:*` variants
  with **no `timestamp` field and no scene/run events** - the 0.1.0 shape. The
  real union ([src/screenplay/StageEvents.ts](../../src/screenplay/StageEvents.ts)
  (lines 8-28)) has six variants split into `DomainEventInput` plus a stamped
  `DomainEvent`.
- Same guide (lines 61-64): "**Currently activity-level only.** There are no
  scene/run events yet. Adding `scene:starts` / `scene:finishes` /
  `test-run:finishes` ... is exactly what the static HTML reporting plan
  specifies." All three events exist in shipped code.
- Same guide (lines 243-245): "**Static HTML reports** - the *planned*
  `HtmlReporter` will buffer events ...". `HtmlReporter` shipped
  ([src/crew/HtmlReporter.ts](../../src/crew/HtmlReporter.ts)).
- [docs/01-screenplay-flow.md](../../docs/01-screenplay-flow.md) (lines 344-346):
  "the foundation the planned static HTML reporter builds on".
- [planning/static-html-reporting.md](../../planning/static-html-reporting.md)
  (line 3): `> **Status:** Ready to implement` - the plan was fully delivered
  in 2026-06 (backlog Item #1, Resolved).

**Impact Analysis**
- A portfolio reviewer or learner following the guides is told the library's
  headline feature does not exist - the docs contradict the README, the
  CHANGELOG, and the source. For a repo whose stated purpose is teaching, the
  deeper teaching layer is now the *least* accurate layer.
- The guide's code snippet of `DomainEvent` no longer compiles against the
  library it documents (missing `timestamp`, missing variants), so a reader
  building the guide's example `StageCrewMember` switch against the snippet gets
  a misleading picture of what their crew member will receive.
- This is the same "documentation/metadata drift" theme the portfolio has
  recorded across every project; here it re-emerged one cycle after two doc-drift
  items (HBSP-14, SUD-10-style fixes) were closed.

**Refactor Recommendation and Strategy**
1. Refresh `docs/03-event-notification-layer.md` to the 0.2.0 model: show
   `DomainEventInput` vs stamped `DomainEvent`, the six variants, and the
   `Stage.announce` stamping step; replace the "no scene/run events yet" call-out
   with a pointer to the shipped `HtmlReporter` and the README's Reporting
   section; update section 7 from "planned" to "shipped".
2. Make the matching one-line fix in `docs/01-screenplay-flow.md` (line 345).
3. Change the planning doc's status header to something like
   `Status: Delivered 2026-06-13 (backlog Item #1) - retained as a worked
   example of an implementation plan`, which preserves its pedagogical value
   honestly.
4. Process guard: when a release ships a feature, grep `docs/` and `planning/`
   for "planned"/"yet"/"forthcoming" references to it before cutting the
   CHANGELOG entry.

---

## Risk 2 (Low): The README's versioning section still claims the current version is 0.1.0

**Risk Description/Explanation**
HBSP-21 cut release 0.2.0 (CHANGELOG entry, compare links, `package.json`
version) but missed the README's prose: the Versioning section still tells
readers the current version is 0.1.0.

**Evidence Outline**
- [README.md](../../README.md) (lines 238-239): "The current version is
  **0.1.0**; while the major version is `0` ...".
- [package.json](../../package.json) (line 3): `"version": "0.2.0"`.
- [CHANGELOG.md](../../CHANGELOG.md) (line 10): `## [0.2.0] - 2026-07-07`.

**Impact Analysis**
- The repo's front page understates the release by a full minor version on the
  one line whose only job is to state the version - a small but visible
  credibility nick for a portfolio repo, and the exact class of drift the last
  two cycles fixed elsewhere (Node floor, scene-count claims in sibling repos).
- Anyone citing the README ("0.1.0") against npm or the CHANGELOG ("0.2.0")
  gets a contradiction.

**Refactor Recommendation and Strategy**
1. Either update the sentence to 0.2.0, or - better, so it cannot rot again -
   drop the hardcoded number: "The current version is recorded in
   [`package.json`](./package.json) and [`CHANGELOG.md`](./CHANGELOG.md)".
2. Add "grep README for the old version string" to the release checklist implied
   by the CHANGELOG workflow.

---

## Risk 3 (Low): Crash truth stops at scene level - interrupted activities still render as passed, and only the last open scene is corrected

**Risk Description/Explanation**
HBSP-16 fixed the false-green *scene*: a scene open when the fold ends is now
reported as failed (interrupted). But the same placeholder pattern remains one
level down. Activities are initialised to `Outcome.successful()` with
`durationMs: 0` on `activity:starts` and only corrected by a matching
`activity:finishes`/`activity:fails`. When a scene ends (normally or by crash)
with activities still open, those activities keep the placeholder - the report
shows a tick and `0ms` for the very activity that was interrupted, inside a
scene marked failed. Separately, the interrupted-scene correction applies only
to `currentScene`: if a second `scene:starts` arrives while an earlier scene is
still open (mis-wired manual `sceneStarts` calls), the earlier scene is
abandoned at its `successful()` placeholder and counts as passed.

**Evidence Outline**
- [src/reporting/ReportModel.ts](../../src/reporting/ReportModel.ts)
  (lines 78-93): `activity:starts` pushes `outcome: Outcome.successful(),
  durationMs: 0`; only lines 96-110 (`finishes`/`fails`) ever revise it.
- Lines 112-118: `scene:finishes` discards the open-activity stacks
  (`openActivities = new Map()`) without touching still-open activities'
  outcomes or durations; the crash-truth block (lines 129-139) likewise only
  corrects `currentScene`, never its open activities.
- Lines 66-76: `scene:starts` overwrites `currentScene` unconditionally - a
  still-open previous scene stays in `scenes` with the successful placeholder
  and is counted in `succeeded` (line 148).
- The crash-truth spec ([spec/report-model.spec.ts](../../spec/report-model.spec.ts)
  (lines 187-209)) starts an activity that never completes (line 192) but only
  asserts on the *scene* outcome - the activity's rendered state is untested.
- Rendering: [src/reporting/renderHtml.ts](../../src/reporting/renderHtml.ts)
  (lines 55-57) draws a pass marker for any `status: 'success'` activity, so the
  placeholder renders as a green tick.

**Impact Analysis**
- In exactly the degraded scenario the builder documents surviving, the report
  now tells a half-truth: the scene is honestly red, but the activity tree under
  it claims every step passed in 0ms - an engineer triaging a crashed CI run is
  pointed away from the step that was executing when the run died.
- The overlapping-scenes case is a misuse scenario (the `scene()` helper cannot
  produce it), but the manual `sceneStarts`/`sceneFinishes` facade the README
  explicitly offers for runner hooks can, and the result is a silently passing
  phantom scene.
- Severity stays Low because the run-level and scene-level verdicts are correct,
  which is what gates decisions; the lie is confined to the drill-down detail.

**Refactor Recommendation and Strategy**
1. In `buildReport`, when a scene closes (both paths: `scene:finishes` and the
   end-of-fold interruption), walk every stack in `openActivities` and mark
   still-open activities as interrupted (`Outcome.from(new Error(...))`), with
   duration run to the closing timestamp, floored - mirroring the scene fix.
2. Generalise the crash-truth block from `currentScene` to "any scene without a
   recorded finish", or explicitly close the previous scene as interrupted when
   a nested `scene:starts` arrives.
3. Extend the crash-truth spec to assert the interrupted activity's outcome and
   duration, plus one overlapping-scenes spec pinning the chosen semantics.

---

## Risk 4 (Low): ConsoleReporter has 0% test coverage, and the backlog's recorded coverage numbers have drifted

**Risk Description/Explanation**
The coverage run shows [src/crew/ConsoleReporter.ts](../../src/crew/ConsoleReporter.ts)
at **0% everywhere** (lines 15-27 uncovered) - the library's original,
README-advertised crew member, present since 0.1.0, has no spec at all despite
having an injectable log sink built for exactly that. Relatedly, the backlog
records coverage as "90.16% stmts / 84.49% branch" (HBSP-12, later cycles), but
the suite now measures **89.93% stmts / 79.69% branch** - the recorded numbers
were true when written but no longer describe the tree.

**Evidence Outline**
- `npm run coverage` at `77e6df6`: `ConsoleReporter.ts | 0 | 0 | 0 | 0 | 15-27`;
  summary `Statements: 89.93% (268/298), Branches: 79.69% (106/133), Functions:
  93.27% (111/119), Lines: 90.07% (254/282)` (full table in
  [ANNEX/METRICS.md](ANNEX/METRICS.md)).
- [docs/backlog.md](../../docs/backlog.md) (line 140-141): "Coverage =
  **90.16% stmts / 84.49% branch / 94.11% funcs / 90.32% lines**".
- [src/crew/ConsoleReporter.ts](../../src/crew/ConsoleReporter.ts) (line 15):
  the constructor takes `log: (line: string) => void = console.log` - a
  ready-made seam no spec uses.
- Other 0%/low files are trivial or covered indirectly (`LogicError.ts` 0%,
  `LastResponse.header` lines 32-34, `ManageData.get`/`has` partially), but
  `ConsoleReporter` is the only whole *feature* at zero.

**Impact Analysis**
- The three log formats (`begins:`/`done:`/`fails:`) and the
  intentionally-ignored event types (the subject of the HBSP-14 JSDoc note) are
  unpinned - a refactor could silently change or break console output and the
  84-test suite would stay green.
- The backlog is the project's declared source of truth; numbers in it that no
  longer reproduce weaken the "validate claims against the repo" contract the
  portfolio reviews rely on. (The drift is explainable - Vitest patch bumps and
  HBSP-16/17 code additions changed the denominator - but unrecorded.)

**Refactor Recommendation and Strategy**
1. Add a small `spec/console-reporter.spec.ts`: inject a capturing sink, drive
   one `starts`/`finishes`/`fails` sequence plus a `scene:starts` and
   `test-run:finishes`, and assert the three formatted lines appear and the
   ignored events produce nothing - directly pinning the documented scope.
2. When next touching the backlog, restate coverage as "as of <commit>" or round
   to whole percents to reduce churn; re-record the current numbers.

---

## Risk 5 (Low): Dead code - `isPromise` in `src/util.ts` has no callers

**Risk Description/Explanation**
HBSP-20 removed the redundant promise branch in `Actor.answer` (and its
`isPromise` import), but left the `isPromise` helper itself behind. Nothing in
`src/` or `spec/` references it any more.

**Evidence Outline**
- [src/util.ts](../../src/util.ts) (lines 64-73): `isPromise` definition.
- `grep -rn "isPromise" src spec` returns only the definition line (util.ts:67).
- `util.ts` is internal (not exported from
  [src/index.ts](../../src/index.ts)), so removal cannot affect the public API
  or the sibling consumer.
- Coverage corroborates: `util.ts` shows uncovered line 68 and 64.1% branch
  coverage, part of it attributable to the unreachable helper.

**Impact Analysis**
- Pure maintenance noise: a documented, exported-from-module helper that looks
  load-bearing but is not, plus a small drag on the coverage summary. No
  behavioural or security impact.

**Refactor Recommendation and Strategy**
1. Delete `isPromise` (and its JSDoc) from `src/util.ts`; run `npm run verify`.
2. Alternatively, if it is kept deliberately as teaching material, move the
   rationale into a comment - but YAGNI argues for deletion in a library that
   prides itself on being minimal.

---

## Risk 6 (Informational): Design and dependency observations - crew exceptions propagate into the actor path; `@types/node` trails the CI matrix; TypeScript 7 available

**Risk Description/Explanation**
Three observations worth recording, none warranting action this cycle:

1. **Crew error isolation.** `Stage.announce` calls every crew member
   synchronously with no try/catch, so a throwing `notifyOf` propagates into
   whatever triggered the announcement. For `HtmlReporter` this is a documented
   feature (a failed write keeps the buffer). But a throwing
   `ConsoleReporter` sink - or any user crew member - would fail the *activity*
   mid-flight from inside `Actor.attemptsTo`, and the failure would be
   attributed to the actor's activity (`activity:fails` would not even be
   announced for it). Serenity/JS isolates crew errors; this library has made
   no explicit decision.
2. **`@types/node` floor vs CI matrix.** Dev types are `@types/node@^22` while
   CI builds and tests on Node 24; typechecking therefore reflects the Node 22
   API surface, not the newest matrix cell.
3. **Toolchain majors available.** `npm outdated`: `@types/node` 22.19.20 ->
   26.1.1, `typescript` 5.9.3 -> 7.0.2. Vitest is current within `^4.1.10`.

**Evidence Outline**
- [src/screenplay/Stage.ts](../../src/screenplay/Stage.ts) (lines 71-76): the
  bare `for` loop over `this.crew`; [src/screenplay/Actor.ts](../../src/screenplay/Actor.ts)
  (lines 58-75): announcements inline in the perform path.
- [package.json](../../package.json) (line 49): `"@types/node": "^22.10.0"`;
  [.github/workflows/ci.yml](../../.github/workflows/ci.yml) (line 23):
  `node: [20, 22, 24]`.
- `npm outdated` output in [ANNEX/METRICS.md](ANNEX/METRICS.md).

**Impact Analysis**
- (1) is a deliberate-looking but undocumented trade-off; the failure mode is
  obscure (a reporter bug masquerading as a test failure). (2) is standard
  practice (type against the floor) but worth stating on purpose. (3) TS 7 is a
  major toolchain generation - not something to adopt in passing.

**Refactor Recommendation and Strategy**
1. Record a decision on crew error isolation: either document "crew members must
   not throw except deliberately (HtmlReporter write failures)" in the
   `StageCrewMember` JSDoc, or wrap non-terminal announcements in a
   try/catch that routes crew errors to `console.error`. A one-line ADR-style
   note in `docs/03` (once refreshed, Risk 1) would suffice.
2. Keep `@types/node` at the engine floor deliberately and say so in a comment,
   or bump types to track the highest matrix cell - either is fine; pick one.
3. Watch TypeScript 7 from a distance; adopt only as its ecosystem settles, as
   a dedicated worklist item with the sibling consumer in mind.

---

[<- Previous: Executive Summary](01_EXECUTIVE_SUMMARY.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0032Z.md) | [Next: Project Reviews ->](03_PROJECT_REVIEWS/PROJECT_001_hand-baked-screenplay-pattern.md)
