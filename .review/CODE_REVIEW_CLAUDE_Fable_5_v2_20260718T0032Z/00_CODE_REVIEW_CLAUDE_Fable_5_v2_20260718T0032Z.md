# Code Review: hand-baked-screenplay-pattern (v2)

**Reviewer:** AI assistant (CLAUDE Fable 5)
**Date:** 2026-07-18T00:32Z
**Scope:** Full single-repository review of `hand-baked-screenplay-pattern` at commit `77e6df6` (`main`, in sync with `origin/main`)
**Template:** `test-automation-portfolio/templates/code-review.template.md`
**Prior reviews:** `CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1543Z/` and `CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1044Z/` (same location); this is the third review overall and the second by this agent (hence v2)

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

This is a single-repository review, so the template's single-repository
customisation applies: `03_PROJECT_REVIEWS/` carries only `PROJECT_001_*`, and
`04_CROSS_PROJECT_ANALYSIS.md` is a cross-cutting analysis within the repo
(suite vs source vs CI vs documentation). Sections that genuinely do not apply
are kept as headings with an `N/A` justification rather than padded.

Everything asserted here was validated against the working tree at `77e6df6`,
against a full local run of the project's declared gate (`npm run verify` -
green, 84 tests), `npm audit` (0 vulnerabilities), `npm outdated`, and
`npm run coverage`. No implementation changes were made; this directory is the
only addition.

## Key Findings

1. **No High or Medium findings.** The library is healthy: verify gate green on
   a clean install (84 tests / 12 files), `npm audit` 0, CI green on `main`
   across Node 20/22/24, backlog v5 current and committed, 0 open worklist items.
2. **Risk 1 (Low-Medium):** the pedagogical guides still describe the 0.2.0
   reporting feature as *unbuilt*. `docs/03-event-notification-layer.md` shows a
   pre-0.2.0 `DomainEvent` union (no `timestamp`, no scene events) and states
   "There are no scene/run events yet"; `docs/01-screenplay-flow.md` calls the
   HTML reporter "planned"; `planning/static-html-reporting.md` still carries
   `Status: Ready to implement`. All of it shipped in 0.2.0.
3. **Risk 2 (Low):** `README.md` (line 239) says "The current version is
   **0.1.0**" while `package.json` and the CHANGELOG say 0.2.0 - the HBSP-21
   release cut missed this one sentence.
4. **Risk 3 (Low):** crash truth is implemented at scene level but not activity
   level - an activity still open when its scene ends (or the run crashes)
   renders as passed with 0ms; an overlapping second `scene:starts` leaves the
   earlier still-open scene at its `successful()` placeholder.
5. **Risk 4 (Low):** `ConsoleReporter` has **0% test coverage** - the only crew
   member shipped since 0.1.0 has no direct spec - and overall branch coverage
   (79.69%) has drifted below the backlog-recorded 84.49%.

## Navigation Guide

- Start with the [Executive Summary](01_EXECUTIVE_SUMMARY.md) for the overall
  verdict and quality bullets.
- [Risks and Issues](02_RISKS_AND_ISSUES.md) carries the numbered findings,
  high to low, each with evidence, impact, and a remediation strategy.
- [Project Reviews](03_PROJECT_REVIEWS/PROJECT_001_hand-baked-screenplay-pattern.md)
  is the detailed walkthrough of the suite, source layers, and docs.
- [Recommendations](05_RECOMMENDATIONS.md) turns the findings into a prioritised
  action list suitable for deriving a third worklist cycle.
- The [Annex metrics](ANNEX/METRICS.md) file records the exact commands run and
  their observed output, so every number in this review is reproducible.

---

[Next: Executive Summary ->](01_EXECUTIVE_SUMMARY.md)
