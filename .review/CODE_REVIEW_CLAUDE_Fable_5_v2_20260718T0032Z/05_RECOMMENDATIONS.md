# Recommendations

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0032Z.md) | [Next: Architecture Assessment ->](06_ARCHITECTURE_ASSESSMENT.md)

**Reviewer:** AI assistant (CLAUDE Fable 5)
**Date:** 2026-07-18T00:32Z

## Recommended Refactors (priority order)

- **Refresh the pedagogical guides to the 0.2.0 event model** (Risk 1):
  rewrite the `DomainEvent` section of
  [docs/03-event-notification-layer.md](../../docs/03-event-notification-layer.md)
  around `DomainEventInput` + stamped `DomainEvent` and the six variants; flip
  "planned" to "shipped" there, in
  [docs/01-screenplay-flow.md](../../docs/01-screenplay-flow.md) (line 345), and
  in the [planning doc's](../../planning/static-html-reporting.md) status header.
- **Fix the README version sentence** (Risk 2): state 0.2.0 or, better, point at
  `package.json`/CHANGELOG so the sentence cannot rot again.
- **Extend crash truth to activities and non-current scenes** (Risk 3): mark
  still-open activities interrupted when their scene closes, and close a
  still-open previous scene as interrupted when a nested `scene:starts`
  arrives; pin both with specs.
- **Add a `ConsoleReporter` spec** (Risk 4): inject a capturing sink, assert the
  three line formats and the deliberate silence on `scene:*`/`test-run:*`.
- **Delete the dead `isPromise` helper** (Risk 5) from
  [src/util.ts](../../src/util.ts).

## Next Steps (immediate action items)

- Derive a third review-derived worklist (suggested HBSP-23..27 mapping to
  Risks 1-5; Risk 6 items only if the user wants decisions recorded) and run it
  through the standard loop - every item is small, docs-heavy, and decision-free
  except the crew-error-isolation note.
- When touching the backlog for the next cycle, re-record coverage as measured
  at the pinned commit (89.93/79.69/93.27/90.07 at `77e6df6`) rather than
  carrying forward the HBSP-12-era numbers.
- No security action required: `npm audit` is 0, no Dependabot alerts were
  claimed in the backlog, and none of the findings above have a security
  dimension.

## Future Project Ideas (long-term)

- **A tiny adapter guide showing the library under a real runner**: one page
  wiring `scene()`/`testRunFinishes()` into Vitest's `afterAll` and (in prose)
  Playwright fixtures, closing the loop the README opens with "wire scenes into
  your runner's hooks".
- **Crew error-isolation decision as a teaching moment**: a short "design
  decisions" doc (or ADR) contrasting this library's propagate-by-default with
  Serenity/JS's isolate-and-log, tying into the HtmlReporter's
  keep-buffer-on-failed-write semantics.
- **Report diffing/exit-code utility**: a minimal `reportSummary(report)` helper
  returning counts for programmatic assertion in consumers - only if a real
  consumer need appears (YAGNI otherwise).

---

[<- Previous: Cross-Project Analysis](04_CROSS_PROJECT_ANALYSIS.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0032Z.md) | [Next: Architecture Assessment ->](06_ARCHITECTURE_ASSESSMENT.md)
