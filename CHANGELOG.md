# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Security

- **Upgraded the dev test toolchain** to clear transitive `esbuild` advisories
  (GHSA-67mh-4wv8-2f99, and the RCE GHSA-gv7w-rqvm-qjhr / CVSS 8.1) pulled in via
  `vite` / `@vitest/mocker` under `vitest@^2`. Bumped `vitest` to `^4.1.9` (a
  major, **dev-only** — no runtime dependency changed). `npm audit` now reports
  0 vulnerabilities (was 1 critical + 2 high + 2 moderate). The Vitest config
  needed no migration; `npm run verify` stays green at 47 tests.

### Changed

- **Reconciled the supported Node.js floor to 20.** The README claimed "Node.js
  18+" while CI only ever built/tested Node 20 and 22, and `package.json`
  declared no `engines` field. Node 18 reached end-of-life on 2025-04-30, so the
  floor is now Node 20 across all three: README reads "Node.js 20+",
  `package.json` declares `"engines": { "node": ">=20" }`, and the CI matrix
  (already `[20, 22]`) is unchanged.

### Added

- **`Outcome` model** (`src/screenplay/Outcome.ts`): a discriminated union of
  success / assertion-failure / error-failure, with `Outcome.successful()`,
  `Outcome.from(error?)`, and `Outcome.isSuccessful(...)` — groundwork for
  static HTML reporting.
- **Scene and test-run lifecycle events**: the `DomainEvent` union gains
  `scene:starts`, `scene:finishes` (carrying an `Outcome`), and
  `test-run:finishes` variants, and every event is now stamped with a
  `timestamp` (epoch ms) by the `Stage` on announce. Call sites build the new
  un-stamped `DomainEventInput` shape; crew members keep receiving the full
  `DomainEvent`. The `Stage` constructor accepts an injectable `now()` clock
  (defaulting to `Date.now`) and gains `sceneStarts` / `sceneFinishes` /
  `testRunFinishes` facade methods with matching default-stage functions.
- **Report model and pure builder** (`src/reporting/ReportModel.ts`):
  `ActivityReport` / `SceneReport` / `RunReport` types and `buildReport(events)`,
  which folds a stamped event stream into a run report using a per-actor
  activity stack (correct nesting under concurrent actors). No I/O and no
  clock — timing comes exclusively from event timestamps; orphan events are
  ignored rather than thrown. Barrel exports follow with the reporting feature.
- **Pure HTML renderer** (`src/reporting/renderHtml.ts`): `renderHtml(report)`
  turns a `RunReport` into a complete, standalone HTML document — summary band
  with pass/fail counts and total duration, per-scene status pills, an indented
  activity tree with ✓/✗ markers and durations, and error messages (with the
  stack for unexpected errors). Inline CSS/JS only, no external assets or
  network requests, and no filesystem access. Every piece of dynamic text is
  HTML-escaped against injection.
- **`HtmlReporter` crew member** (`src/crew/HtmlReporter.ts`): a passive
  `StageCrewMember` that buffers every event and, on `test-run:finishes`,
  builds and renders a single static HTML report. `HtmlReporter.storingReportsAt(dir)`
  (default `./report`) chooses the output directory; `withWriter(writer)` injects
  a custom `ReportWriter` so tests capture output without touching disk. `node:fs`
  use is confined to the default filesystem writer.
- **`scene(name, fn)` helper** (`src/scene/scene.ts`): the primary,
  runner-agnostic way to delimit a reportable scene. It announces
  `scene:starts` on the default stage, runs the body, records the resulting
  `Outcome` via `scene:finishes`, and **re-throws** on failure so a failing
  scene still fails the surrounding test.
- **Reporting feature wired into the public API**: new `src/reporting/index.ts`
  and `src/scene/index.ts` barrels, and additive exports from the existing
  barrels — `src/screenplay/index.ts` now exports `Outcome`, the
  `sceneStarts` / `sceneFinishes` / `testRunFinishes` facade functions, and the
  `DomainEventInput` type; `src/crew/index.ts` exports `HtmlReporter` and
  `ReportWriter`; and `src/index.ts` re-exports the `reporting` and `scene`
  modules. All additions are strictly additive — no existing export changed or
  removed. An end-to-end spec runs one passing and one failing scene through the
  public API with an `HtmlReporter` whose writer is injected, then asserts the
  captured HTML reports 1 pass / 1 fail.

## [0.1.0] - 2026-06-11

The first release: a dependency-free TypeScript implementation of the Screenplay
Pattern, following the design model and naming conventions of Serenity/JS without
depending on it.

### Added

- **Core screenplay primitives** (`src/screenplay/`):
  - `Actor` implementing `PerformsActivities`, `UsesAbilities`, `AnswersQuestions`,
    and `CanHaveAbilities` — `whoCan(...)`, `attemptsTo(...)`, `abilityTo(...)`,
    `answer(...)`.
  - `Ability` / `AbilityType`, `Activity`, `Task.where(...)`,
    `Interaction.where(...)`.
  - `Question.about(...)` with `Answerable<T>` resolution of plain values,
    promises, and nested questions.
  - `Cast` (`whereEveryoneCan`, `where`) and `Stage`, plus default-stage helpers
    `engage`, `actorCalled`, `actorInTheSpotlight`, `assign`, `resetDefaultStage`.
- **Lightweight notification layer**: the `Stage` announces `DomainEvent`s
  (`activity:starts` / `activity:finishes` / `activity:fails`) to
  `StageCrewMember`s, with a built-in `ConsoleReporter`.
- **Assertions** (`src/expectations/`): the `Ensure` interaction plus an
  expectation library — `equals`, `isNot`, `isGreaterThan`, `isLessThan`,
  `isPresent`, `includes` — throwing `AssertionError` on failure.
- **Demo abilities** (`src/abilities/`):
  - `MakeRequests` — HTTP over a pluggable `HttpClient`, with the `Send`
    interaction and `LastResponse` questions.
  - `ManageData` — an in-memory key/value store, with the `Remember` interaction
    and `Recall` question.
- **Errors**: `ConfigurationError`, `LogicError`, `AssertionError`.
- **Tooling**: strict TypeScript (ESM, `NodeNext`), a Vitest suite of 19 tests
  including an end-to-end worked example, and `build` / `typecheck` / `test` /
  `verify` scripts.
- **Documentation** (`docs/`): pedagogical guides covering the flow of the
  pattern against an example SUT, writing your own building blocks, and the
  event/notification layer.
- **Planning** (`planning/`): a tooling-agnostic implementation plan for a
  forthcoming static HTML reporter.

[Unreleased]: https://github.com/NeoCognitus70/hand-baked-screenplay-pattern/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/NeoCognitus70/hand-baked-screenplay-pattern/releases/tag/v0.1.0
