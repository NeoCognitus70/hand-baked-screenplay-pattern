# Recommendations

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1543Z.md) | [Next: Architecture Assessment ->](06_ARCHITECTURE_ASSESSMENT.md)

**Reviewer:** AI assistant (CLAUDE_Opus_4_8)

## Recommended Refactors (priority order)

- **Reconcile the Node version story (Risk 1).** Pick a real floor, add `"engines"` to
  [package.json](package.json), align the CI matrix in [ci.yml](.github/workflows/ci.yml), and update the
  README line. Highest value-for-effort because it is visible to every reader of the repo.
- **Floor durations and fix run-start selection (Risk 2).** Apply `Math.max(0, ...)` to the four
  duration subtractions in [ReportModel.ts](src/reporting/ReportModel.ts) and prefer the first
  `scene:starts` for `startedAt`. Small change, removes a class of confusing report output.
- **Cover the real filesystem writer (Risk 3).** One tmpdir integration spec for `HtmlReporter`'s default
  `node:fs` writer closes the last untested branch of the reporting feature.
- **Comment `ConsoleReporter`'s intentional scope.** Note that it deliberately handles only `activity:*`
  events so a reader does not expect scene boundaries in the console output
  ([ConsoleReporter.ts](src/crew/ConsoleReporter.ts)).

## Next Steps (immediate action items)

- Add a public-API surface canary test (Risk 4): import the documented exports from `../src/index.js` and
  assert they are defined, so an accidental removal/rename fails fast in *this* repo rather than in the
  sibling's build.
- Wire `vitest run --coverage` behind a `coverage` script and surface the number in CI (no gate needed
  initially - just visibility).
- Touch up the stale "awaiting user review" line in [docs/backlog.md](docs/backlog.md) (line 49) to
  reflect that PR #13 merged; the RESOLVED status is already correct.

## Future Project Ideas (longer-term)

- **Contract test between the two packages.** A committed `.d.ts` snapshot or an `api-extractor` report
  would turn the additivity contract into an enforced, reviewable artefact and would itself be a strong
  portfolio teaching piece on package contracts.
- **A second crew member that emits JSON** (explicitly out of scope for the current feature, plan
  section 1) would demonstrate that the event stream is a genuine single source of truth - the HTML and
  JSON reporters would share `buildReport` and diverge only at the render step.
- **A tiny "writing a custom StageCrewMember" guide** in [docs/](docs/), mirroring the existing
  "writing your own building blocks" doc, to round out the pedagogical set now that reporting exists.

---

[<- Previous: Cross-Cutting Analysis](04_CROSS_PROJECT_ANALYSIS.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1543Z.md) | [Next: Architecture Assessment ->](06_ARCHITECTURE_ASSESSMENT.md)
