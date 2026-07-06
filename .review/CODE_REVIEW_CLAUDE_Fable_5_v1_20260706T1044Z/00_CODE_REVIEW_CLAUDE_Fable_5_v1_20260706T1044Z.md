# Code Review: hand-baked-screenplay-pattern

**Reviewer:** AI assistant (CLAUDE Fable 5)
**Date:** 2026-07-06T10:44Z
**Scope:** Full single-repository review (source, specs, CI, docs, dependencies)
**Repository state:** `main` at `120a631` (PR #17 merged), working tree carries one
uncommitted edit to `docs/backlog.md` (see Risk 1)

## Table of Contents

1. [Executive Summary](01_EXECUTIVE_SUMMARY.md)
2. [Risks and Issues](02_RISKS_AND_ISSUES.md)
3. [Project Reviews](03_PROJECT_REVIEWS/PROJECT_001_hand-baked-screenplay-pattern.md)
4. [Cross-Project Analysis](04_CROSS_PROJECT_ANALYSIS.md)
5. [Recommendations](05_RECOMMENDATIONS.md)
6. [Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md)
7. [Migration Plans](07_MIGRATION_PLANS.md)
8. [Annex: Metrics](ANNEX/METRICS.md)

## Structure Summary

This is a second-cycle review of a single-project repository: a dependency-free
TypeScript teaching implementation of the Screenplay Pattern with a static HTML
reporting feature. The review follows `templates/code-review.template.md` with the
single-repository customisation: `03_PROJECT_REVIEWS/` holds one project file, and
`04_CROSS_PROJECT_ANALYSIS.md` is a cross-cutting analysis within the repo (source vs
specs vs CI vs docs). Sections that do not apply are marked `N/A` with a one-line
justification rather than padded.

The first review of this repo was
`.review/CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1543Z/` (identity CLAUDE_Opus_4_8);
its five findings were resolved through worklist items HBSP-09..14 (PRs #15-#17,
merged 2026-06-17). This review verifies those closures and looks for what is next.

## Key Findings

1. **All previous review findings are genuinely closed** and verified by evidence in
   this session: `npm run verify` green at 81 tests, `npm audit` reports 0
   vulnerabilities, the public-API canary spec exists, the real `node:fs` writer is
   tested, and coverage matches the documented 90.16% statements exactly.
2. **(Medium, process)** The backlog v4 reconciliation - the durable record of the
   entire HBSP-09..14 cycle - exists only as an **uncommitted working-tree edit** to
   `docs/backlog.md`. The committed source of truth on `main` is still Version 3
   (2026-06-13) and materially understates the project state. See Risk 1.
3. **(Low-Medium, correctness)** A scene that starts but never finishes (a crashed
   run - the exact degraded scenario `buildReport` is documented to survive) is
   rendered as **passed** with a zero duration. See Risk 2.
4. **(Low, correctness)** `HtmlReporter` never clears its event buffer after
   rendering, so a reporter reused across two runs (or a second
   `test-run:finishes`) double-counts every earlier scene. See Risk 3.
5. **(Low, hygiene)** The npm publish path is unguarded (`files` ships `dist/` but
   nothing builds it on publish), CI actions lag the portfolio's v5 baseline, and
   the CHANGELOG has a duplicate `### Added` heading in `[Unreleased]`. See Risks
   4-6.

## Navigation Guide

Read `01_EXECUTIVE_SUMMARY.md` for the overall verdict, then `02_RISKS_AND_ISSUES.md`
for the prioritised findings with evidence and remediation. The project deep-dive is
in `03_PROJECT_REVIEWS/`, cross-cutting consistency checks in `04_*`, forward-looking
actions in `05_*`, principle-by-principle assessment in `06_*`, and CI/publishing
plans in `07_*`. Quantitative evidence (test counts, coverage table, audit output) is
collected in `ANNEX/METRICS.md`. Every file carries breadcrumb and footer navigation.

---

[Next: Executive Summary ->](01_EXECUTIVE_SUMMARY.md)
