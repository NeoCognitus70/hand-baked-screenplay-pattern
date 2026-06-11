# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

_Nothing yet._

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
