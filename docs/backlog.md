<!--
  AUDIENCE: Engineers, AI agents, and project leads maintaining work-in-progress tracking.
  PURPOSE:  Single source of truth for outstanding work, risks, and planning for this project.
  LOCATION: docs/backlog.md
  TEMPLATE: test-automation-portfolio/templates/backlog.template.md
-->

# Hand-Baked Screenplay Pattern — Backlog

**Version:** 1 — initial backlog, created when the project was onboarded to the portfolio prompt conventions
**Last Updated:** 2026-06-11
**Based on:** survey of the repo at commit `a138aa8` (README, `planning/`, CI workflow, package scripts)

This backlog tracks outstanding work and risks for the hand-baked Screenplay pattern teaching
library, ordered by priority score (highest first). It is the project's **source of truth** for
item status — session handovers narrate; this file records.

**Priority Scoring System:**
- **Score = Security Impact (0–10) + Breakage Probability (0–10) + Maintenance Burden (0–10)**
- **HIGH (20–30):** Critical — immediate action required
- **MEDIUM (10–19):** Important — schedule within current sprint cycle
- **LOW (0–9):** Desirable — schedule when capacity allows

---

## Outstanding Risks

None recorded yet. The suite is gated by `npm run verify` (typecheck + build + vitest) on PRs and
pushes to `main` via the CI workflow. Risks discovered in future sessions are added here with a
full score breakdown.

---

### Resolved Risks

None yet. Resolved risks are kept here as a record that the gap existed — do not delete them.

---

## Risk Summary

| Priority | Count | Total Effort | Status Distribution |
|---|---|---|---|
| HIGH (20–30) | 0 | — | — |
| MEDIUM (10–19) | 0 | — | — |
| LOW (0–9) | 0 | — | — |
| **Total Outstanding** | **0** | — | |
| Resolved | 0 | — | |

---

## Potential Next Steps

### HIGH Priority

1. **Static HTML reporting** — effort per plan, READY TO START. A complete, self-contained
   implementation plan exists at [`planning/static-html-reporting.md`](../planning/static-html-reporting.md)
   (its own status: "Ready to implement"). Implement it top to bottom; each task in the plan ends
   in a verifiable state. When started, promote this to a tracked item with acceptance criteria
   taken from the plan.

### MEDIUM Priority

None yet.

### LOW Priority

None yet.

---

## Maintenance Notes

- Include links/paths to affected files when adding new items.
- Update the version number at the top when items change status.
- Cross-reference code review findings in `.review/` once a review exists.
- Mark completion dates when items move to ✅ Resolved.
- Update effort estimates with actuals after completion.
