# Cross-Cutting Analysis (within the repository)

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1044Z.md) | [Next: Recommendations ->](05_RECOMMENDATIONS.md)

**Reviewer:** AI assistant (CLAUDE Fable 5)
**Date:** 2026-07-06T10:44Z

Single-repository review: per the template's customisation notes this section
analyses cross-cutting concerns *within* the repo (source vs specs vs CI vs docs
vs the sibling-consumer contract). Template areas that do not apply are kept as
headings with a one-line justification.

## Tool-Agnostic Tests

- The library itself is runner-agnostic by design: `scene(name, fn)` and
  `testRunFinishes()` bind to no test framework
  ([src/scene/scene.ts](src/scene/scene.ts)), and the README documents manual
  wiring for users who manage their own `Stage` (README lines 198-203).
- The spec suite is Vitest-specific but thin on framework features (no globals -
  [vitest.config.ts](vitest.config.ts) (line 5), plain `describe/it/expect`),
  so a port to another runner would be mechanical.
- The proof of tool-agnosticism lives outside this repo: the sibling
  `calculator-screenplay-bdd` drives the same library from playwright-bdd.

## Code-Agnostic Tests

- N/A - single-language TypeScript library; there is no cross-language parity
  requirement inside this repo.

## Single Source of Truth

- The backlog is declared the source of truth and is currently **bifurcated**:
  committed v3 vs uncommitted working-tree v4 (Risk 1). This is the one genuine
  single-source-of-truth failure found.
- Node floor is now genuinely single-sourced at 20 across README (line 40),
  `engines` ([package.json](package.json) (lines 44-46)) and the CI matrix
  ([ci.yml](.github/workflows/ci.yml) (line 23)) - HBSP-10 held.
- Test-count claims drift by design (CHANGELOG says "green at 47 tests" for the
  vitest bump entry, which was true at that commit; the suite is now 81) - the
  CHANGELOG records history, not current state, so this is correct behaviour.

## API Contract Compliance

- No REST API is served; the HTTP layer is a transport-agnostic interface
  ([HttpClient.ts](src/abilities/http/HttpClient.ts)) - OpenAPI is N/A.
- The **library's** API contract is actively enforced: the additive-only export
  policy is executable via [spec/public-api.spec.ts](spec/public-api.spec.ts),
  which separately pins the exact symbols the sibling consumes (lines 26-39) and
  the wider documented surface (lines 41-65), plus a count floor (lines 77-87).
- `package.json` `exports` (lines 8-13) exposes a single root entry point with
  types-first conditions - consistent with the docs and the canary.

## Screenplay Parity

- Naming parity with Serenity/JS is deliberate and consistent (`actorCalled`,
  `whoCan`, `attemptsTo`, `Question.about`, `Ensure.that`, `Cast`, `Stage`,
  crew members); deviations are minimal and documented (a merged type+const
  `Outcome` companion, [Outcome.ts](src/screenplay/Outcome.ts) (lines 13-17)).
- The event model is a simplified but honest analogue of Serenity's domain
  events; the `ConsoleReporter` scope note (HBSP-14) now prevents the most likely
  parity misreading (activity-only trace vs full run report).

## Batch File Design

- N/A - the repo ships no batch/shell scripts; all entry points are npm scripts
  ([package.json](package.json) (lines 27-34)), which is the right call here.

## Documentation Alignment

- README, docs guides, planning doc, and code agree with each other; the shipped
  reporting feature matches the plan's file-by-file spec section by section.
- Misalignments found: committed backlog v3 vs reality (Risk 1); duplicate
  `### Added` in CHANGELOG `[Unreleased]` (Risk 6); `.review/` historical
  artefacts intentionally retain stale "Node 18+" statements, correctly noted in
  the backlog v4 text rather than edited.
- The docs index ([docs/README.md](docs/README.md)) is current - all three guides
  exist and are linked.

## Logging Alignment

- The event/notification layer *is* the logging story and it is consistent:
  everything flows through `Stage.announce` with a single stamping point
  ([Stage.ts](src/screenplay/Stage.ts) (lines 71-76)); `ConsoleReporter` and
  `HtmlReporter` are both plain `StageCrewMember`s with documented, distinct
  scopes.
- No stray `console.log` calls exist outside the injectable `ConsoleReporter`
  sink ([ConsoleReporter.ts](src/crew/ConsoleReporter.ts) (line 15)).

## Test Coverage Metrics

- 81 tests / 12 files, 0 failures (this session). Coverage 90.16% stmts / 84.49%
  branch / 94.11% funcs / 90.32% lines - reproduced exactly, matching the backlog
  claim; per-file breakdown in [ANNEX/METRICS.md](ANNEX/METRICS.md).
- Coverage is deliberately informational (no thresholds) per the previous
  review's recommendation - documented in [vitest.config.ts](vitest.config.ts)
  (lines 8-11) and [ci.yml](.github/workflows/ci.yml) (lines 40-45).
- Known uncovered spots are benign accessors (`ManageData.get`/`has` variants,
  `LastResponse.header`, `util.format` branches) - candidates for cheap unit
  additions rather than risk.

---

[<- Previous: Project Reviews](03_PROJECT_REVIEWS/PROJECT_001_hand-baked-screenplay-pattern.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1044Z.md) | [Next: Recommendations ->](05_RECOMMENDATIONS.md)
