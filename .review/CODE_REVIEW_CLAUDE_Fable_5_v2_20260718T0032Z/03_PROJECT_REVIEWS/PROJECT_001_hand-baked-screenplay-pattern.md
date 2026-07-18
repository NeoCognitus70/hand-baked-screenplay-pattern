# Project Review: hand-baked-screenplay-pattern

[<- Back to Index](../00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0032Z.md) | [Next: Cross-Project Analysis ->](../04_CROSS_PROJECT_ANALYSIS.md)

**Reviewer:** AI assistant (CLAUDE Fable 5)
**Date:** 2026-07-18T00:32Z

This is a single-project repository; per the template's single-repository
customisation, this is the only file in `03_PROJECT_REVIEWS/`.

## Stack and intent (established from README and package.json)

A dependency-free TypeScript (ESM, NodeNext, ES2022) teaching library
implementing the Screenplay Pattern with Serenity/JS-shaped naming, plus a
static HTML reporting layer. Vitest 4 dev-only toolchain; no runtime
dependencies at all ([package.json](../../../package.json) has only four
devDependencies). Published-shape manifest (exports map, `files`, `engines`
`>=20`, `prepublishOnly` verify guard) at version 0.2.0, Apache-2.0.

## Architecture and design patterns

- The Screenplay core is faithful to the reference model: `Task` and
  `Interaction` are both `Activity`; actors expose segregated capability
  interfaces (`PerformsActivities`, `UsesAbilities`, `AnswersQuestions`,
  `CanHaveAbilities` in [src/screenplay/capabilities.ts](../../../src/screenplay/capabilities.ts)),
  and activities receive `ActivityActor`, not the concrete class.
- `Ability` lookup by class reference with a `protected`-constructor-friendly
  `AbilityType` ([src/screenplay/Ability.ts](../../../src/screenplay/Ability.ts)
  (line 6)) is a neat, honest simplification of Serenity/JS's mechanism.
- The event layer is the architectural centrepiece: call sites announce
  un-stamped `DomainEventInput`, the `Stage` stamps timestamps via an
  injectable `now()` clock ([src/screenplay/Stage.ts](../../../src/screenplay/Stage.ts)
  (lines 18-21, 71-76)), crew members observe the stamped stream. Reporting is
  a fold over that stream, not instrumentation in tasks.
- Separation of pure from impure is exemplary: `buildReport` and `renderHtml`
  are pure; `node:fs` lives only in `HtmlReporter`'s default writer, replaceable
  via `withWriter` ([src/crew/HtmlReporter.ts](../../../src/crew/HtmlReporter.ts)
  (lines 19-22, 73-77)).

## Code quality and maintainability

- Uniformly strict compiler flags; JSDoc on every public symbol explaining
  intent (the `ConsoleReporter` scope note at
  [src/crew/ConsoleReporter.ts](../../../src/crew/ConsoleReporter.ts)
  (lines 8-13) is a model of pre-empting reader confusion).
- Barrels are explicit named-export lists (no `export *` at the layer level
  except the top-level composition), which is what made the additive-only API
  guarantee for the sibling consumer checkable.
- Two blemishes: the dead `isPromise` helper
  ([src/util.ts](../../../src/util.ts) (lines 64-73), Risk 5) and the
  placeholder-outcome residue in `buildReport` (Risk 3).

## Test coverage and approach

- 84 tests across 12 spec files, all through the public API with injected
  fakes; no mocking framework, no network, no shared state (default-stage specs
  reset in `afterEach` since HBSP-20).
- Standout specs: [spec/report-model.spec.ts](../../../spec/report-model.spec.ts)
  (non-monotonic clocks, crash truth, orphan events, per-actor nesting under
  interleaving), [spec/public-api.spec.ts](../../../spec/public-api.spec.ts)
  (31 parametrised export canaries with a count floor), and
  [spec/html-reporter-fs.spec.ts](../../../spec/html-reporter-fs.spec.ts)
  (the one real-filesystem branch, exercised against `os.tmpdir()`).
- Coverage 89.93% stmts / 79.69% branch; the gaps are `ConsoleReporter` (0%,
  Risk 4), dead `util.ts` code, and minor untested accessors
  (`LastResponse.header`, `ManageData.get/has`, `Send.the`).
- No executable Gherkin here by design - business-readability lives in the
  activity descriptions (`#actor ...`), which the report renders; that is
  appropriate for a library repo (the BDD consumer is the sibling project).

## Documentation quality

- README is comprehensive and honest (explicit non-affiliation with
  Serenity/JS, explicit "deliberately minimal" reporting scope, per-run buffer
  semantics) - except the stale 0.1.0 version sentence (Risk 2).
- CHANGELOG 0.2.0 entry is one of the best in the portfolio: grouped by change
  type, explains *why*, records the security work with advisory IDs.
- The three `docs/` guides are excellent pedagogy but guide 03 (and one line of
  guide 01, and the planning doc's status header) now teach a pre-0.2.0 reality
  (Risk 1) - the only High-visibility drift in the repo.
- [docs/backlog.md](../../../docs/backlog.md) v5 is committed, current, and
  validated accurate on suite health, audit state, and CI baseline; only its
  recorded coverage percentages have drifted (Risk 4).

## Strengths

- Zero runtime dependencies, zero audit findings, verify gate green on a clean
  install, CI green on a Node 20/22/24 matrix with minimal permissions and
  concurrency cancellation.
- Two full review->worklist->delivery cycles completed with every finding
  closed and reconciled - visible, reviewable engineering process.
- Injection-safe HTML rendering with full escaping; publish path guarded.

## Weaknesses

- Teaching docs lag the shipped feature set by a full release (Risk 1).
- Crash-truth semantics stop one level short of the activity tree (Risk 3).
- The oldest feature (`ConsoleReporter`) is the only untested one (Risk 4).

---

[<- Previous: Risks and Issues](../02_RISKS_AND_ISSUES.md) | [Back to Index](../00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0032Z.md) | [Next: Cross-Project Analysis ->](../04_CROSS_PROJECT_ANALYSIS.md)
