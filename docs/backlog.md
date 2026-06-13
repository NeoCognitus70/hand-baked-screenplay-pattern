<!--
  AUDIENCE: Engineers, AI agents, and project leads maintaining work-in-progress tracking.
  PURPOSE:  Single source of truth for outstanding work, risks, and planning for this project.
  LOCATION: docs/backlog.md
  TEMPLATE: test-automation-portfolio/templates/backlog.template.md
-->

# Hand-Baked Screenplay Pattern — Backlog

**Version:** 3 — resolved Item #1 "Static HTML reporting" (delivered via worklist HBSP-01..08)
**Last Updated:** 2026-06-13
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

None outstanding — **Static HTML reporting** (formerly Item #1) was delivered and moved to
Resolved Risks below.

---

### Resolved Risks

Resolved risks are kept here as a record that the gap existed — do not delete them.

#### Item #1: No post-run test report artifact — implement Static HTML reporting — Score: 20 — ✅ RESOLVED

**Priority Score:** Security Impact (4) + Breakage Probability (7) + Maintenance Burden (9) = **20 points**
**Impact:** The library surfaced results via `ConsoleReporter` only — no persistent, shareable
artifact existed after a run, and the `StageCrewMember` concept the library teaches was
under-demonstrated.
**Effort:** 6–10 hours estimated (plan tasks 1–7); delivered across worklist items HBSP-01..08.
**Status:** ✅ RESOLVED 2026-06-13 — delivered via worklist branches `worklist/static-html-reporting`
(PR #9), `-2` (PR #10), `-3` (PR #11), `-4` (PR #12), and `-5` (HBSP-07/08). All merged except the
final `-5` PR awaiting user review.
**Affected Stacks:** TypeScript library (`src/screenplay/`, `src/crew/`, new `src/reporting/`,
new `src/scene/`)

**Problem (now closed):**
Test results vanished with the console. A complete, self-contained implementation plan existed at
[`planning/static-html-reporting.md`](../planning/static-html-reporting.md): extend the event
model with scene/test-run events and `Stage`-stamped timestamps, add an `Outcome` model, a pure
report builder and HTML renderer, an `HtmlReporter` crew member, and a runner-agnostic
`scene(name, fn)` helper. All of this has shipped.

**Impact Analysis:**
- **Security (4/10):** the report renders user-controlled text (scene names, activity
  descriptions, error messages/stacks); `renderHtml` escapes every dynamic value (plan §6.5/§10),
  avoiding an ad-hoc, injection-prone implementation.
- **Breakage (7/10):** the work touched the library's most depended-on seam
  (`StageEvents.ts`, `Stage.ts`); the sibling project `calculator-screenplay-bdd` consumes the
  public API via a `file:` dependency, so all barrel additions were kept strictly additive (no
  existing export changed or removed — see HBSP-07).
- **Maintenance (9/10):** the report artifact removes per-consumer result hand-rolling and
  unblocks the portfolio's living-documentation convention for this project.

**Outcome — Success Criteria** (from plan §9), all met:
- [x] `npm run verify` green (typecheck over `src` + `spec`, build emits `dist/`, all tests pass —
  47 tests, up from the original 19).
- [x] The plan §7 worked example produces a single, self-contained `index.html` — verified end to
  end by `spec/reporting-e2e.spec.ts`, which runs one passing and one failing scene through the
  public API and asserts the captured HTML reports 1 pass / 1 fail.
- [x] No new runtime dependencies (Node's built-in `node:fs` only, inside the default writer);
  dev dependencies unchanged.
- [x] `buildReport`, `renderHtml`, and `Outcome.from` are pure and unit-tested in isolation;
  filesystem access is confined to `HtmlReporter`'s default writer and is injectable for tests.
- [x] Naming follows plan §3; reporting is a `StageCrewMember`, not an actor `Ability`.

---

## Risk Summary

| Priority | Count | Total Effort | Status Distribution |
|---|---|---|---|
| HIGH (20–30) | 0 | — | — |
| MEDIUM (10–19) | 0 | — | — |
| LOW (0–9) | 0 | — | — |
| **Total Outstanding** | **0** | **—** | |
| Resolved | 1 | 6–10 hrs | 1 RESOLVED (2026-06-13) |

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
