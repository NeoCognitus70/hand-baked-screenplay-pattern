# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2026-08-17

Provider-portability contracts, a reusable conformance kit, and an immutable
dual-module distribution baseline.

### Added

- **Immutable package release channel:** a tag-driven workflow verifies that
  the tag, manifest, and changelog versions agree, runs the complete gate,
  creates a versioned `npm pack` artifact, records its SHA-256 checksum, and
  attaches both files to the matching GitHub release. npm-registry publication
  remains outside the project contract.
- **Reusable provider conformance kit:** a small, test-framework-neutral
  `ConformanceProvider` adapter contract, four exported
  `providerConformanceCases`, and `runProviderConformance(...)`. The same cases
  prove the hand-baked async provider and an independent minimal fixture across
  isolation, sync/async Questions, activity order and stop-on-failure,
  descriptions, lifecycle cardinality, and provider-native outcome survival; a
  deliberately broken fixture proves drift detection. The kit adds no runtime
  dependency or framework coupling.
- **Extensible event envelope:** every existing domain event can carry an
  optional typed `ExecutionExtension<ProviderOutcome, ProviderMetadata>` that
  preserves a provider's native outcome and metadata without flattening it into
  the canonical `Outcome`. `sceneStarts`, `sceneFinishes`, and
  `testRunFinishes` accept the envelope additively; existing event names,
  required fields, ordering, reporters, and call sites remain unchanged.
- **Portable Question and ability contracts:** `QuestionLike<T>` lets adapters
  supply synchronous or asynchronous structural questions without extending
  `Question`, while `AbilityToken.named<T>(name)` and typed `.bind(object)`
  registrations let actors retrieve existing objects without `Ability`
  inheritance. Class-based Questions and abilities remain compatible; token
  lookup is identity-based, missing bindings report actionable
  `ConfigurationError`s, and both shared and per-actor cast lifetimes work with
  token bindings.
- **Provider-selection boundary ADR:** ADR 0001 establishes build/profile-time
  provider selection, one provider and lifecycle owner per execution lane, and
  the zero-runtime-dependency boundary for the Promise-native core before
  portable provider contracts are introduced.
- **Calculator compatibility baseline:** the exact package-root runtime names
  and type shapes consumed by the sibling Calculator are now documented and
  protected by runtime and compile-time canaries, with an additive-change and
  deprecation policy for the provider-first iteration.
- **`Cast.whereEachActorCan(() => [...])`**: a cast factory that builds fresh
  ability instances **per actor**, so mutable abilities (`ManageData`'s store,
  `MakeRequests`'s last response) are no longer shared between actors on the same
  stage. `Cast.whereEveryoneCan(...)` is unchanged — its JSDoc now documents that
  it shares one instance across all actors and is intended for stateless
  abilities. README and Guide 01 explain when to use each.
- **`RunReport.status`** (`'passed' | 'failed' | 'empty'`, the new `RunStatus`
  type): an explicit overall run status, so a zero-scene run is a distinct
  neutral state rather than being inferred from the counts.

### Changed

- **Dual ESM/CommonJS package entry points:** conditional package-root exports
  now provide matching runtime and declaration trees for native `import` and
  `require` consumers. `npm run verify` packs the real artifact, rejects
  unintended files or runtime dependencies, installs it into separate
  clean-room fixtures, and exercises representative runtime and type exports in
  both module systems. The HBSP-29 Calculator-consumed API remains additive and
  source-compatible.

### Fixed

- **Crash truth now extends to the activity level.** `buildReport`
  (`src/reporting/ReportModel.ts`) marks a still-open *activity* as interrupted
  when its scene closes (on `scene:finishes`, end-of-fold, or a superseding
  `scene:starts`), not just the enclosing scene, so a report can no longer show a
  green tick on the step that was executing when a run died.
- **A scene that throws a falsy value is now reported as failed.** `scene(...)`
  converts a caught throw with the new total `Outcome.fromError(...)`, so
  `throw 0`, `throw ''`, `throw false`, `throw null`, and `throw undefined` are
  failures in the HTML report instead of a false green. `Outcome.from(...)` is
  unchanged (a falsy/absent value still means success) and now delegates to
  `fromError` for the error case.
- **Scene-level failure details now render in the HTML report.** `renderHtml`
  shows a scene's own error block when the scene failed — e.g. a setup, hook, or
  orchestration failure with no activity to carry the error — instead of a red
  scene with only a pill. The scene error is suppressed when a nested activity
  already displays the identical error, so there is no duplicate noise.
- **A zero-scene run is no longer labelled "All scenes passed".** A terminal-only
  or empty event stream now renders a neutral "No scenes recorded" summary
  (`status: 'empty'`), so a misconfigured runner that executes nothing cannot
  produce a green report.

## [0.2.0] - 2026-07-07

Static HTML reporting, a crash-truth reporting fix, npm publish-safety, and a
dev-toolchain security upgrade.

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
- **Coverage reporting (visibility, not a gate).** A `coverage` script
  (`vitest run --coverage`, via `@vitest/coverage-v8` matching the Vitest 4
  major) prints a summary and writes a browsable `coverage/` report; CI runs it
  informationally on Node 20 with no threshold/hard gate (per the review). Also
  adds an integration spec (`spec/html-reporter-fs.spec.ts`) that drives the
  `HtmlReporter`'s **real** `node:fs` default writer against an `os.tmpdir()`
  path — the previously-untested branch every other reporter spec stubs out —
  asserting a real `index.html` containing `<!DOCTYPE html>` is written.

### Changed

- **Reconciled the supported Node.js floor to 20.** The README claimed "Node.js
  18+" while CI only ever built/tested Node 20 and 22, and `package.json`
  declared no `engines` field. Node 18 reached end-of-life on 2025-04-30, so the
  floor is now Node 20 across all three: README reads "Node.js 20+",
  `package.json` declares `"engines": { "node": ">=20" }`.
- **Guarded the npm publish path.** A `prepublishOnly` hook runs `npm run verify`
  (typecheck + build + tests) before any `npm publish`, so the published tarball
  — which ships the git-ignored `dist/` — can never be a missing or stale build.
- **Aligned CI to the portfolio baseline.** `actions/checkout` and
  `actions/setup-node` bumped to v5, the verify matrix extended to
  `[20, 22, 24]`, and the `vitest` / `@vitest/coverage-v8` dev pair taken to the
  `4.1.10` patch.
- **Internal tidy (no public behaviour change).** `Actor.answer` drops a
  redundant promise branch, and the default-stage tests reset via `afterEach` so
  a failing assertion cannot leak default-stage state into a later test.

### Fixed

- **Report timing is robust to a non-monotonic clock.** `buildReport`
  (`src/reporting/ReportModel.ts`) now floors every duration at zero
  (`Math.max(0, ...)`) for activities, scenes, and the run, so a clock that goes
  backwards can no longer render a negative duration. The run `startedAt` now
  prefers the first `scene:starts` timestamp, falling back to the first event
  only when no scene started — a stray pre-scene event can no longer back-date
  the run.
- **A crashed run no longer reads as green.** A scene that starts but never
  finishes — the run ended while it was still open — is reported as failed
  (interrupted) and excluded from the success count, instead of standing at its
  initial `successful()` placeholder. The partial-report path the builder
  documents surviving now tells the truth.
- **`HtmlReporter` no longer double-counts across runs.** The event buffer is
  cleared after each written report, so a reporter that observes a second run
  renders only that run's scenes rather than re-counting the first run's.

### Security

- **Upgraded the dev test toolchain** to clear transitive `esbuild` advisories
  (GHSA-67mh-4wv8-2f99, and the RCE GHSA-gv7w-rqvm-qjhr / CVSS 8.1) pulled in via
  `vite` / `@vitest/mocker` under `vitest@^2`. Bumped `vitest` to `^4.1.10` (a
  major from v2, **dev-only** — no runtime dependency changed). `npm audit` now
  reports 0 vulnerabilities (was 1 critical + 2 high + 2 moderate). The Vitest
  config needed no migration.

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

[Unreleased]: https://github.com/NeoCognitus70/hand-baked-screenplay-pattern/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/NeoCognitus70/hand-baked-screenplay-pattern/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/NeoCognitus70/hand-baked-screenplay-pattern/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/NeoCognitus70/hand-baked-screenplay-pattern/releases/tag/v0.1.0
