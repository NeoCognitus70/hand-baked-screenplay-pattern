# Section 2: Risks and Issues

[<- Back to Index](00_CODE_REVIEW_Gemini_2_5_Pro_v1_20260807T1409Z.md) | [Next: Project Reviews ->](03_PROJECT_REVIEWS/PROJECT_001_hand-baked-screenplay-pattern.md)

This section outlines technical risks identified during the code review, prioritized from highest to lowest severity.

## Identified Risks

### Risk 1: Module-Level `defaultStage` State Leak Risk across Async Tests (Priority: LOW)
- **Risk Description:** The module-level `defaultStage` instance created in `src/screenplay/Stage.ts` (line 101) retains registered crew members and active actors across imports. If test suites using `actorCalled()` or `engage()` fail to call `resetDefaultStage()`, state can leak between test cases.
- **Evidence Outline:** [src/screenplay/Stage.ts](src/screenplay/Stage.ts) (line 101, lines 158-160).
- **Impact Analysis:** Async or parallel test execution sharing the default stage can experience non-deterministic state pollution or unexpected crew notification duplication.
- **Refactor Recommendation:** Update documentation and test guidance to mandate calling `resetDefaultStage()` in test hooks (`beforeEach`/`afterEach`), or recommend explicit `new Stage(...)` instances for multi-actor suites.

### Risk 2: Default Stage Initialization Uses `Cast.whereEveryoneCan` (Priority: LOW)
- **Risk Description:** Default stage initialization (`let defaultStage = new Stage(Cast.whereEveryoneCan());`) shares ability instances across actors. If actors use mutable abilities (`ManageData`, `MakeRequests`) without calling `engage(Cast.whereEachActorCan(...))`, state will leak across actor identities.
- **Evidence Outline:** [src/screenplay/Stage.ts](src/screenplay/Stage.ts) (line 101, line 159), [src/screenplay/Cast.ts](src/screenplay/Cast.ts) (lines 17-29).
- **Impact Analysis:** Developers using `actorCalled('Name')` without re-engaging the stage with `Cast.whereEachActorCan(...)` may encounter subtle shared-state bugs between actors.
- **Refactor Recommendation:** Enhance JSDoc and `README.md` quick start guides to emphasize calling `engage(Cast.whereEachActorCan(...))` whenever mutable abilities are registered.

### Risk 3: `ConsoleReporter` Ignores Scene Boundaries by Design (Priority: LOW)
- **Risk Description:** `ConsoleReporter` handles only `activity:*` events and intentionally ignores `scene:starts`, `scene:finishes`, and `test-run:finishes`.
- **Evidence Outline:** [src/crew/ConsoleReporter.ts](src/crew/ConsoleReporter.ts) (lines 8-12, 18-28).
- **Impact Analysis:** Console output provides a flat trace without visual scene headers or summary statistics, which may confuse users expecting structured test runner output in the console stream.
- **Refactor Recommendation:** Retain current lightweight design as documented, but consider providing an optional `verbose` configuration for visual scene boundary logging in terminal streams.

---

[<- Back to Index](00_CODE_REVIEW_Gemini_2_5_Pro_v1_20260807T1409Z.md) | [Next: Project Reviews ->](03_PROJECT_REVIEWS/PROJECT_001_hand-baked-screenplay-pattern.md)
