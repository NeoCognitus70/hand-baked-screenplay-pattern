# Cross-Cutting Analysis (within the repository)

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0032Z.md) | [Next: Recommendations ->](05_RECOMMENDATIONS.md)

**Reviewer:** AI assistant (CLAUDE Fable 5)
**Date:** 2026-07-18T00:32Z

Single-repository review: per the template customisation, the nine
cross-project areas are applied as cross-cutting concerns *within* this repo
(suite vs source vs CI vs docs), with `N/A` where an area genuinely does not
apply.

## Tool-Agnostic Tests

- The library itself is runner-agnostic by design: `scene(name, fn)`
  ([src/scene/scene.ts](../../src/scene/scene.ts)) works in any async test
  framework, and the raw `sceneStarts`/`sceneFinishes`/`testRunFinishes` facade
  supports manual wiring to a runner's hooks.
- The spec suite is Vitest-specific but thin on runner features (no snapshot,
  no fixtures beyond plain helpers), so porting cost would be low.
- The `HttpClient` seam keeps even the demo abilities transport-agnostic - the
  same screenplay code runs against `fetch`, a fake, or anything else.

## Code-Agnostic Tests

- N/A - single-language TypeScript repo; there is no second-stack parity to
  keep. (The multi-stack parity story lives in the sudoku project.)

## Single Source of Truth

- [docs/backlog.md](../../docs/backlog.md) v5 is the declared and actual source
  of truth, committed and current - the v1 review's headline finding (stale
  committed backlog) has stayed fixed through two cycles.
- The version story, fixed for the Node floor in HBSP-10, has regressed in a
  different spot: three version authorities exist (README prose, `package.json`,
  CHANGELOG) and the README disagrees (Risk 2).
- Feature truth now has *four* authorities - source, README, guides, planning
  doc - and the guides/planning pair is a release behind (Risk 1). The repo
  needs a "release ships with a docs sweep" rule more than any new tooling.

## API Contract Compliance

- The public API surface is contract-tested from the inside:
  [spec/public-api.spec.ts](../../spec/public-api.spec.ts) enumerates every
  export the sibling consumer uses, with a count floor against silent removals.
- The exports map in [package.json](../../package.json) (lines 8-13) exposes a
  single root entry with types - correct for the additive-only evolution policy.
- REST/OpenAPI: N/A - the HTTP layer is a demo ability against a pluggable
  client; there is no service contract to align to.

## Screenplay Parity

- Naming and semantics track Serenity/JS deliberately (`whoCan`, `attemptsTo`,
  `Question.about`, `Ensure.that`, crew members observing a stage) with the
  divergences documented (minimal `Outcome` union, no live streaming).
- One undocumented divergence worth stating: Serenity/JS isolates crew-member
  exceptions; here they propagate into the actor path (Risk 6.1).

## Batch File Design

- N/A - no batch/shell scripts exist; automation is npm scripts only
  ([package.json](../../package.json) (lines 27-35)), which is appropriate.

## Documentation Alignment

- README <-> source: aligned except the 0.1.0 sentence (Risk 2).
- Guides <-> source: guide 03 misaligned on the event model, guides 01/03 and
  the planning doc describe shipped work as planned (Risk 1).
- Backlog <-> repo: aligned on every claim validated this review except the
  recorded coverage numbers (Risk 4).
- CHANGELOG <-> repo: fully aligned, including compare links.

## Logging Alignment

- The event layer *is* the logging story: one shape (`DomainEvent`), one
  broadcast point (`Stage.announce`), consumers uniform (`ConsoleReporter`
  formats, `HtmlReporter` buffers). No drift found.
- `ConsoleReporter`'s three line formats are unpinned by tests (Risk 4) - the
  only alignment risk in this area.

## Test Coverage Metrics

- 84 tests / 12 files, all green; coverage 89.93% stmts / 79.69% branch /
  93.27% funcs / 90.07% lines (full per-file table in
  [ANNEX/METRICS.md](ANNEX/METRICS.md)).
- Reporting layer is the best covered (ReportModel 100% lines); the crew layer
  is the worst (ConsoleReporter 0%).
- Coverage remains visibility-only in CI (informational job step, no gate) -
  a deliberate, documented choice this review does not contest.

---

[<- Previous: Project Reviews](03_PROJECT_REVIEWS/PROJECT_001_hand-baked-screenplay-pattern.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0032Z.md) | [Next: Recommendations ->](05_RECOMMENDATIONS.md)
