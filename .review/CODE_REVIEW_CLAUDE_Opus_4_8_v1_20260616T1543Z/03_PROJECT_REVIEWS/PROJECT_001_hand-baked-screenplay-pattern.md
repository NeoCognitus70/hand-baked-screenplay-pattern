# Project Review: hand-baked-screenplay-pattern

[<- Back to Index](../00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1543Z.md) | [Next: Cross-Cutting Analysis ->](../04_CROSS_PROJECT_ANALYSIS.md)

**Reviewer:** AI assistant (CLAUDE_Opus_4_8)

A single-project repository: a dependency-free TypeScript implementation of the Screenplay Pattern,
written to teach the Serenity/JS design model from first principles, now with a Static HTML reporting
feature.

## Architecture and design patterns

- Textbook Screenplay layering. Actors hold abilities; tasks compose interactions; questions read state;
  expectations assert. The capability interfaces ([capabilities.ts](../src/screenplay/capabilities.ts))
  segregate `PerformsActivities`, `UsesAbilities`, `AnswersQuestions`, and `CanHaveAbilities`, so each
  building block depends only on the slice it needs (a clean ISP/DIP demonstration).
- The notification layer is an observer pattern: `Stage.announce` stamps a `DomainEventInput` into a
  `DomainEvent` and pushes it to every `StageCrewMember`
  ([Stage.ts](../src/screenplay/Stage.ts) lines 71-76). `ConsoleReporter` and the new `HtmlReporter` are
  both crew members - the reporting feature plugged in with zero changes to actors or tasks.
- The reporting pipeline is split into pure and impure halves: pure `buildReport`
  ([ReportModel.ts](../src/reporting/ReportModel.ts)) folds events into a model; pure `renderHtml`
  ([renderHtml.ts](../src/reporting/renderHtml.ts)) renders it; only `HtmlReporter`'s default writer
  touches `node:fs` ([HtmlReporter.ts](../src/crew/HtmlReporter.ts) line 19). This is the single most
  reusable teaching point in the repo.

## Code quality and maintainability

- Strict TypeScript throughout ([tsconfig.json](../tsconfig.json): `strict`, `noUnusedLocals`,
  `noUnusedParameters`, `noImplicitOverride`, `noFallthroughCasesInSwitch`). The spec project
  ([tsconfig.spec.json](../tsconfig.spec.json)) typechecks `src` + `spec` together so tests cannot drift
  from types.
- The builder's per-actor activity stack correctly reconstructs nesting even with interleaved actors,
  and is defensive about orphan events ([ReportModel.ts](../src/reporting/ReportModel.ts) lines 56-121)
  - a subtle correctness concern that is both handled and tested.
- Naming and comments target the mid-level audience well; comments justify decisions (per-actor stack,
  `node:fs` confinement, the deliberate `Outcome` type+const merge).
- Minor maintainability gaps: the README Node floor is unenforced (Risk 1) and duration math assumes a
  monotonic clock (Risk 2).

## Test coverage and approach

- 47 Vitest tests across 10 files, green locally under `npm run verify`. Coverage spans the screenplay
  core (actor, tasks/questions, stage/cast, expectations, outcome) and the full reporting feature
  (report-model, render-html, html-reporter, and a public-API end-to-end).
- The reporting feature is tested at the right altitudes: pure functions in isolation, the reporter with
  an injected writer, and a public-API e2e that runs a real pass and a real fail
  ([reporting-e2e.spec.ts](../spec/reporting-e2e.spec.ts)).
- Gaps: no coverage threshold, and the real `node:fs` writer is never exercised (Risk 3); no canary test
  guards the public-API surface the sibling consumes (Risk 4).

## Documentation quality

- Strong and layered: README (building blocks, quick start, the new Reporting section), three
  pedagogical guides in [docs/](../docs/), a backlog that is an honest source of truth, and a fully
  specified [planning/static-html-reporting.md](../planning/static-html-reporting.md) that documents the
  feature's design before implementation.
- The CHANGELOG ([CHANGELOG.md](../CHANGELOG.md)) accurately records the reporting additions under
  `[Unreleased]` and explicitly states they are strictly additive (lines 48-57) - matching what the code
  actually did.
- The backlog ([docs/backlog.md](../docs/backlog.md)) correctly shows Item #1 RESOLVED with all success
  criteria ticked; I validated each criterion against the repo and they hold (47 tests, no new runtime
  deps, pure functions unit-tested, reporting is a crew member). One stale detail: the backlog (line 49)
  says the final `-5` PR is "awaiting user review", but `git log` shows PR #13 merged - the work is done,
  the narrative just predates the merge. See [Documentation Alignment](../04_CROSS_PROJECT_ANALYSIS.md).

## Strengths

- Genuinely dependency-free yet produces a shareable artefact - a disciplined demonstration of building
  only what is needed.
- The pure/impure split and the injected `ReportWriter` make the hardest-to-test feature easy to test.
- Honest framing about not being Serenity/JS sets correct expectations and models good engineering
  humility.
- Public API expanded without a single breaking change, protecting the downstream sibling.

## Weaknesses

- Cross-source Node version inconsistency (README vs `package.json` vs CI) - the most visible polish
  issue (Risk 1).
- Duration arithmetic and run-start selection trust monotonic, well-ordered event streams (Risk 2).
- The real filesystem write path and the public-API surface are both unguarded by tests (Risks 3, 4).

---

[<- Previous: Risks and Issues](../02_RISKS_AND_ISSUES.md) | [Back to Index](../00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1543Z.md) | [Next: Cross-Cutting Analysis ->](../04_CROSS_PROJECT_ANALYSIS.md)
