# Project Review: hand-baked-screenplay-pattern

[<- Back to Index](../00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1044Z.md) | [Next: Cross-Project Analysis ->](../04_CROSS_PROJECT_ANALYSIS.md)

**Reviewer:** AI assistant (CLAUDE Fable 5)
**Date:** 2026-07-06T10:44Z

This is a single-project repository; per the template's single-repository notes,
this is the only file in `03_PROJECT_REVIEWS/`.

## Stack and intent

A **zero-runtime-dependency** TypeScript (strict, ESM/`NodeNext`) library that
re-implements the Screenplay Pattern from first principles, following Serenity/JS
naming without depending on it ([README.md](README.md) (lines 3-16),
[package.json](package.json) - `devDependencies` only, lines 47-52). Tested with
Vitest 4; consumed as a library by the sibling `calculator-screenplay-bdd` project
via `file:../`. Intent: teaching + lightweight use, explicitly deferring
production-grade needs to Serenity/JS (README lines 240-247).

## Review bullets

- **Architecture and pattern fidelity.** The Screenplay implementation is
  faithful and complete for its scope: `Actor` implements the four capability
  interfaces ([Actor.ts](src/screenplay/Actor.ts) (lines 27-33)), `Task` and
  `Interaction` are both `Activity` so they compose freely
  ([Task.ts](src/screenplay/Task.ts), [Interaction.ts](src/screenplay/Interaction.ts)),
  `Question`/`Answerable` defer evaluation to perform time
  ([Answerable.ts](src/screenplay/Answerable.ts)), and abilities are the only
  layer touching integrations. Factory-with-private-implementation
  (`Task.where` -> `TaskStatement`) keeps the public surface abstract and small.

- **Reporting subsystem design.** Events -> pure fold (`buildReport`) -> pure
  renderer (`renderHtml`) -> one injectable writer is a textbook
  functional-core/imperative-shell split; timing comes exclusively from event
  timestamps with durations floored at zero
  ([ReportModel.ts](src/reporting/ReportModel.ts) (lines 98, 105, 113, 136)).
  Two residual gaps: an unfinished scene defaults to a false pass (Risk 2) and the
  `HtmlReporter` buffer is never cleared between runs (Risk 3).

- **Test coverage and approach.** 81 tests / 12 files, all green in this session.
  The pyramid inside the repo is right: many focused unit specs, one integration
  spec against the real filesystem
  ([html-reporter-fs.spec.ts](spec/html-reporter-fs.spec.ts) - `mkdtempSync` +
  cleanup, proper isolation), and two end-to-end worked examples through the
  public API only ([example.screenplay.spec.ts](spec/example.screenplay.spec.ts),
  [reporting-e2e.spec.ts](spec/reporting-e2e.spec.ts)). The public-API canary
  ([public-api.spec.ts](spec/public-api.spec.ts)) protects the sibling consumer's
  contract with 31 parametrised presence checks plus a count floor. Coverage
  90.16% statements (verified; per-file low spots are `util.ts` at 75.75% and the
  unused-in-specs `LastResponse.header` branch - see
  [ANNEX/METRICS.md](../ANNEX/METRICS.md)).

- **Test isolation and lifecycle.** Specs that touch the module-level default
  stage reset it (`beforeEach`/`afterEach` in
  [reporting-e2e.spec.ts](spec/reporting-e2e.spec.ts) (lines 27-28); inline
  resets in [stage-and-cast.spec.ts](spec/stage-and-cast.spec.ts)). One nit: the
  inline `resetDefaultStage()` calls at the *end* of test bodies
  (stage-and-cast.spec.ts (lines 123, 136)) would be skipped if an earlier
  assertion threw, leaking default-stage state into later tests - prefer
  `afterEach` there too. No async-wait or flakiness risks exist: the suite is
  fully deterministic (in-memory HTTP client, injectable clocks, no timers, no
  network).

- **Data setup and auth assumptions.** N/A in the usual sense - there is no SUT,
  no tokens, no environment variables. Test data is constructed inline via
  `InMemoryHttpClient.withRoutes` ([spec/support/InMemoryHttpClient.ts](spec/support/InMemoryHttpClient.ts))
  and `ManageData.using(...)`; nothing reads from disk or env, which is exactly
  right for a library repo.

- **Documentation quality.** Among the best in the portfolio: three pedagogical
  guides with a maintained index ([docs/README.md](docs/README.md)), a
  docs-first implementation plan the code demonstrably followed
  ([planning/static-html-reporting.md](planning/static-html-reporting.md)), a Keep
  a Changelog record, and a backlog with scored, evidenced items. The two
  documentation defects are process-level: the backlog v4 reconciliation is
  uncommitted (Risk 1) and the CHANGELOG has a duplicate `### Added` heading plus
  an overdue 0.2.0 cut (Risk 6).

- **Strengths summary.** Zero runtime dependencies verified in the lockfile;
  strict TypeScript with declaration maps; XSS-safe renderer with dedicated
  escaping specs; clean `npm audit`; disciplined additive-only export policy made
  executable by the canary spec; CI with least-privilege permissions and a
  non-gating coverage signal.

- **Weaknesses summary.** Degraded-run reporting semantics (Risks 2-3); publish
  path unguarded (Risk 4); CI action majors lag the portfolio baseline (Risk 5);
  no linter/formatter (acceptable at this size, worth an ADR-style note); the
  redundant `Actor.answer` branch ([Actor.ts](src/screenplay/Actor.ts)
  (lines 82-85)) is a small KISS blemish in a repo whose job is clarity.

## Deferred / planned-but-unimplemented coverage check

The backlog (working-tree v4) names **no open items** - Items #1-#7 are all
Resolved, and this review confirms each against the tree (reporting feature
shipped per plan; vitest 4 + audit 0; Node floor 20 in README line 40,
`package.json` lines 44-46, CI matrix line 23; duration floors + run-start
selection with specs; real-writer spec; canary spec; ConsoleReporter JSDoc). The
planning doc's out-of-scope list (no live streaming, screenshots, JSON feed,
multi-file dashboard) is honestly restated in the README (lines 193-196), so
nothing is promised-but-missing. The only "planned but not landed" artefact is the
backlog reconciliation commit itself (Risk 1).

---

[<- Previous: Risks and Issues](../02_RISKS_AND_ISSUES.md) | [Back to Index](../00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1044Z.md) | [Next: Cross-Project Analysis ->](../04_CROSS_PROJECT_ANALYSIS.md)
