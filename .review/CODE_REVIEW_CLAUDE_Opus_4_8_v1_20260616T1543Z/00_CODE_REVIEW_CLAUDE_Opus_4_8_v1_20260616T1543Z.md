# Code Review: hand-baked-screenplay-pattern

**Reviewer:** AI assistant (CLAUDE_Opus_4_8)
**Date:** 2026-06-16T15:43Z
**Scope:** Full single-repository review of the `hand-baked-screenplay-pattern` teaching library, with
special attention to the recently-shipped Static HTML reporting feature and the public-API additivity
contract that the sibling `calculator-screenplay-bdd` depends on.

---

## Table of Contents

1. [Executive Summary](01_EXECUTIVE_SUMMARY.md)
2. [Risks and Issues](02_RISKS_AND_ISSUES.md)
3. [Project Review](03_PROJECT_REVIEWS/PROJECT_001_hand-baked-screenplay-pattern.md)
4. [Cross-Cutting Analysis](04_CROSS_PROJECT_ANALYSIS.md)
5. [Recommendations](05_RECOMMENDATIONS.md)
6. [Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md)
7. [Migration Plans](07_MIGRATION_PLANS.md)
8. Annex
   - [Test Strategy](ANNEX/TEST_STRATEGY.md)
   - [Screenplay Parity](ANNEX/SCREENPLAY_PARITY.md)
   - [Metrics](ANNEX/METRICS.md)

## Structure Summary

This is a **single-project repository**, so the review follows the template's single-repository
customisation: `03_PROJECT_REVIEWS/` holds one project file, and `04_CROSS_PROJECT_ANALYSIS.md`
analyses the cross-cutting seams *within* the repo (suite vs CI vs docs vs the public API the sibling
consumes). The annex carries deeper dives that would otherwise bloat the main sections.

- **01 Executive Summary** - design and code quality bullets, highlights, and pedagogical value.
- **02 Risks and Issues** - findings numbered high to low, each with evidence, impact, and remediation.
- **03 Project Review** - the 5-7 bullet structured assessment of the library.
- **04 Cross-Cutting Analysis** - the within-repo seams (public-API additivity, escaping, single
  source of truth, CI vs local, docs alignment, parity with Serenity/JS).
- **05 Recommendations** - prioritised refactors, next steps, and future ideas.
- **06 Architecture Assessment** - Test Pyramid, SOLID, KISS, YAGNI, REST/OpenAPI, ISTQB, pedagogy.
- **07 Migration Plans** - single source of truth, containerisation, and CI/CD evolution.

## Key Findings

The library is in genuinely good shape: the gate is green locally, the Screenplay model is faithful,
and the reporting feature was delivered cleanly. The highest-value findings are mostly polish and
consistency rather than correctness defects.

1. **(Low/Medium) Node version claim is inconsistent across README, `package.json`, and CI.** The
   README states "Node.js 18+", `package.json` declares no `engines` field, and CI tests only Node 20
   and 22. The 18+ claim is therefore unverified and the floor is unenforced. See
   [Risk 1](02_RISKS_AND_ISSUES.md).
2. **(Low) `buildReport` / `formatDuration` can surface negative or misleading durations** when event
   timestamps are non-monotonic or when the first buffered event is not a scene start. This is a
   robustness/teaching-clarity gap, not a crash. See [Risk 2](02_RISKS_AND_ISSUES.md).
3. **(Low) No automated coverage gate, and the worked HTML report is never asserted end to end as a
   written file.** The reporter's filesystem writer (`node:fs`) is exercised only via injected fakes;
   the real default writer has no test. See [Risk 3](02_RISKS_AND_ISSUES.md).
4. **(Low) The public-API additivity contract is real but unguarded by automation.** Additivity was
   verified by inspection (the sibling's imports all resolve, and the barrels only added exports), but
   nothing in CI would catch a future breaking change before the sibling does. See
   [Risk 4](02_RISKS_AND_ISSUES.md) and [Cross-Cutting Analysis](04_CROSS_PROJECT_ANALYSIS.md).
5. **(Informational) HTML escaping is correct and well-tested** - flagged as a verified *strength*, not
   a defect: every dynamic value is element-content only and HTML-escaped, with dedicated specs.

## Navigation Guide

Start with the [Executive Summary](01_EXECUTIVE_SUMMARY.md) for the shape of the assessment, then read
[Risks and Issues](02_RISKS_AND_ISSUES.md) for the actionable list. The
[Project Review](03_PROJECT_REVIEWS/PROJECT_001_hand-baked-screenplay-pattern.md) and
[Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md) give the depth; the annex backs specific
claims with evidence. Every file links back here and to its neighbours.

---

[Back to Index](00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1543Z.md) | [Next: Executive Summary ->](01_EXECUTIVE_SUMMARY.md)
