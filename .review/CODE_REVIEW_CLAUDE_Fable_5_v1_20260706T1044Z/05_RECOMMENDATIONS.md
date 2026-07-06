# Recommendations

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1044Z.md) | [Next: Architecture Assessment ->](06_ARCHITECTURE_ASSESSMENT.md)

**Reviewer:** AI assistant (CLAUDE Fable 5)
**Date:** 2026-07-06T10:44Z

## Recommended Refactors

- **Mark never-finished scenes as not-passed** in `buildReport`
  ([ReportModel.ts](src/reporting/ReportModel.ts)) - close Risk 2 with an
  `interrupted`/error outcome for a scene still open when the fold ends, plus one
  spec. Small, high-value, and pedagogically on-message.
- **Clear (or document) the `HtmlReporter` buffer per run**
  ([HtmlReporter.ts](src/crew/HtmlReporter.ts) (lines 76-82)) - close Risk 3;
  decide single-run vs cumulative semantics and test the second
  `test-run:finishes`.
- **Guard the publish path** - add `"prepublishOnly": "npm run verify"` (or
  `"private": true` if publishing is out of scope) to
  [package.json](package.json) (Risk 4).
- **Simplify `Actor.answer`** ([Actor.ts](src/screenplay/Actor.ts) (lines 78-86)):
  collapse the two identical `return answerable` branches into one with a brief
  comment on why the union collapses - KISS in the repo that teaches it.
- **Tidy the CHANGELOG** - merge the duplicate `### Added` headings
  ([CHANGELOG.md](CHANGELOG.md) (lines 10, 49)) and cut 0.2.0 (Risk 6).

## Next Steps

- **Commit the backlog v4 reconciliation** (Risk 1) - the single most important
  action from this review; one docs PR restores the source of truth on `main`.
- **Bump CI actions to the portfolio baseline** (`checkout@v5`,
  `setup-node@v5`, [ci.yml](.github/workflows/ci.yml) (lines 26, 29)); consider
  adding Node 24 to the matrix in the same PR (Risk 5).
- **Move the inline `resetDefaultStage()` teardowns to `afterEach`** in
  [stage-and-cast.spec.ts](spec/stage-and-cast.spec.ts) (lines 123, 136) so a
  failing assertion cannot leak default-stage state.
- **Take the vitest 4.1.10 patch** with the next functional change; schedule
  TypeScript 6 as a deliberate gated upgrade (Risk 7).
- **Write the project's v2 session-notes handover** once the above land - the
  portfolio records that this project's handover (v1) predates the entire
  HBSP-09..14 cycle.

## Future Project Ideas

- **A JSON event-log feed** (newline-delimited stamped `DomainEvent`s) as a
  second, machine-readable crew member - it would let external tools rebuild
  reports and would make a natural companion teaching doc on event sourcing.
- **An `interrupted` outcome walkthrough** in `docs/` - use the Risk 2 fix as the
  worked example for "reporting under failure", completing the docs trilogy with
  a fourth guide.
- **A tiny browser ability demo** (e.g. wrapping Playwright behind an `Ability`
  in an examples folder, dev-only) to show the same pattern driving UI - kept out
  of the published package to preserve the zero-dependency claim.
- **Consumer contract test in CI** - a scheduled workflow that checks out the
  sibling `calculator-screenplay-bdd` and runs its build against this HEAD,
  turning the canary spec's promise into end-to-end proof (respecting the
  registry's coupling note: sibling checkout, not cross-tree in-place builds).

---

[<- Previous: Cross-Project Analysis](04_CROSS_PROJECT_ANALYSIS.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1044Z.md) | [Next: Architecture Assessment ->](06_ARCHITECTURE_ASSESSMENT.md)
