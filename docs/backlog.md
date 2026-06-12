<!--
  AUDIENCE: Engineers, AI agents, and project leads maintaining work-in-progress tracking.
  PURPOSE:  Single source of truth for outstanding work, risks, and planning for this project.
  LOCATION: docs/backlog.md
  TEMPLATE: test-automation-portfolio/templates/backlog.template.md
-->

# Hand-Baked Screenplay Pattern — Backlog

**Version:** 2 — promoted "Static HTML reporting" from Potential Next Steps to tracked item #1
**Last Updated:** 2026-06-12
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

Items are ordered by priority score (highest first). The suite is gated by `npm run verify`
(typecheck + build + vitest) on PRs and pushes to `main` via the CI workflow.

### HIGH Priority (Score: 20–30)

#### Item #1: No post-run test report artifact — implement Static HTML reporting — Score: 20

**Priority Score:** Security Impact (4) + Breakage Probability (7) + Maintenance Burden (9) = **20 points**
**Impact:** The library surfaces results via `ConsoleReporter` only — no persistent, shareable
artifact exists after a run, and the `StageCrewMember` concept the library teaches is
under-demonstrated.
**Effort:** 6–10 hours (plan tasks 1–7)
**Status:** IN PROGRESS — worked via worklist branch `worklist/static-html-reporting`
**Affected Stacks:** TypeScript library (`src/screenplay/`, `src/crew/`, new `src/reporting/`,
new `src/scene/`)

**Problem:**
Test results vanish with the console. A complete, self-contained implementation plan exists at
[`planning/static-html-reporting.md`](../planning/static-html-reporting.md) (status: "Ready to
implement"): extend the event model with scene/test-run events and `Stage`-stamped timestamps,
add an `Outcome` model, a pure report builder and HTML renderer, an `HtmlReporter` crew member,
and a runner-agnostic `scene(name, fn)` helper.

**Impact Analysis:**
- **Security (4/10):** the report renders user-controlled text (scene names, activity
  descriptions, error messages/stacks); building it deliberately with the plan's mandated
  escaping (§6.5, §10) avoids an ad-hoc, injection-prone implementation later.
- **Breakage (7/10):** the work touches the library's most depended-on seam
  (`StageEvents.ts`, `Stage.ts`); a sibling project (`calculator-screenplay-bdd`) consumes the
  public API via a `file:` dependency, so the additions must stay strictly additive.
- **Maintenance (9/10):** without a report artifact, every consumer hand-rolls result
  surfacing and run outcomes must be reconstructed from scrollback; the gap also blocks the
  portfolio's living-documentation convention for this project.

**Refactor Strategy:**
Implement [`planning/static-html-reporting.md`](../planning/static-html-reporting.md) top to
bottom in its §8 task order (with the plan's own noted alternative of building `Outcome` before
the event changes), running `npm run verify` after each task.

**Success Criteria** (from plan §9):
- [ ] `npm run verify` green (typecheck over `src` + `spec`, build emits `dist/`, all tests pass —
  the existing 19 plus the new ones).
- [ ] Running the plan §7 worked example produces a single, self-contained `index.html` that opens
  in a browser with no network access and accurately shows scenes, nested activities, outcomes,
  durations, and a pass/fail summary.
- [ ] No new runtime dependencies (Node's built-in `node:fs` only, inside the default writer);
  dev dependencies unchanged.
- [ ] `buildReport`, `renderHtml`, and `Outcome.from` are pure and unit-tested in isolation;
  filesystem access is confined to `HtmlReporter`'s default writer and is injectable for tests.
- [ ] Naming follows plan §3; reporting is a `StageCrewMember`, not an actor `Ability`.

---

### Resolved Risks

None yet. Resolved risks are kept here as a record that the gap existed — do not delete them.

---

## Risk Summary

| Priority | Count | Total Effort | Status Distribution |
|---|---|---|---|
| HIGH (20–30) | 1 | 6–10 hrs | 1 IN PROGRESS |
| MEDIUM (10–19) | 0 | — | — |
| LOW (0–9) | 0 | — | — |
| **Total Outstanding** | **1** | **6–10 hrs** | |
| Resolved | 0 | — | |

---

## Potential Next Steps

### HIGH Priority

None — **Static HTML reporting** was promoted to tracked Item #1 (v2, 2026-06-12).

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
