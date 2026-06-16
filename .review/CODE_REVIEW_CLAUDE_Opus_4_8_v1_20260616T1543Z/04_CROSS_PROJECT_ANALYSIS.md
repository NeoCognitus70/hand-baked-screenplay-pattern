# Cross-Cutting Analysis

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1543Z.md) | [Next: Recommendations ->](05_RECOMMENDATIONS.md)

**Reviewer:** AI assistant (CLAUDE_Opus_4_8)

This is a single-project repository, so per the template's single-repository customisation the nine
"cross-project" areas are reframed as cross-cutting seams *within* the repo: the public API the sibling
consumes, the suite vs CI vs docs, and the parity of this hand-baked library with the Serenity/JS model
it imitates. Where an area does not apply, it is marked `N/A` with a one-line justification rather than
padded.

## Tool-Agnostic Tests

- The suite is Vitest-only; there is no second runner to be agnostic across, so "tool-agnostic" applies
  weakly. What *is* tool-agnostic is the library's design: `scene` and the facade methods are
  runner-agnostic by intent (README "Reporting" notes; [scene.ts](src/scene/scene.ts)), so a consumer can
  wire them into Vitest, Jest, or Cucumber hooks.
- The reporting model is decoupled from any runner: `buildReport` consumes a plain `DomainEvent[]`, so a
  different runner that emits the same events would render identically.
- The sibling `calculator-screenplay-bdd` proves this: it drives the same library from a
  **playwright-bdd** runner, not Vitest, and still consumes the screenplay core successfully.

## Code-Agnostic Tests

- N/A within this repo - it is a single-language (TypeScript) library, so there is no cross-language
  test parity to assess here. (The portfolio-level cross-language story lives in the sudoku POC, not
  here.) The one relevant point: the library's API shape deliberately mirrors Serenity/JS so the
  *concepts* are language-portable even though the code is not.

## Single Source of Truth

- The event stream is the single source of truth for reporting: every consumer (`ConsoleReporter`,
  `HtmlReporter`, `buildReport`) derives its view from the same `DomainEvent[]`, so the console log and
  the HTML report cannot disagree about what happened.
- `docs/backlog.md` is the documented source of truth for project state and is consistent with the code
  (Item #1 resolved, criteria met). The only drift is a narrative timestamp (see Documentation Alignment).
- The `Outcome` type is the single definition of pass/fail, reused by scenes, activities, and the
  renderer ([Outcome.ts](src/screenplay/Outcome.ts)) - no duplicated status enums.

## API Contract Compliance (public-API additivity - the focus contract)

- **Verified additive.** The sibling imports a specific set of named exports and types; every one still
  resolves from [src/index.ts](src/index.ts) and its barrels. The reporting work *added* `Outcome`, the
  `sceneStarts`/`sceneFinishes`/`testRunFinishes` facades, `DomainEventInput`, the `reporting` and
  `scene` modules, and `HtmlReporter`/`ReportWriter` - and removed/renamed nothing
  ([CHANGELOG.md](CHANGELOG.md) lines 48-57; [src/screenplay/index.ts](src/screenplay/index.ts);
  [src/crew/index.ts](src/crew/index.ts)).
- The `MakeRequests`/`Send`/`LastResponse` HTTP abstraction is loosely RESTful (method + url + body +
  headers in [HttpClient.ts](src/abilities/http/HttpClient.ts)) but is not an OpenAPI-governed surface;
  full REST/OpenAPI assessment is `N/A` - this library ships a transport interface, not an API.
- **Gap:** the additivity contract is currently guarded only by inspection and by the sibling's own
  build. There is no canary test in this repo (Risk 4). This is the single most valuable cross-cutting
  hardening available.

## Screenplay Parity

- High fidelity to Serenity/JS naming and structure - see the dedicated
  [Screenplay Parity annex](ANNEX/SCREENPLAY_PARITY.md). Actor/Ability/Task/Interaction/Question/Cast/
  Stage/Ensure all match, and the deliberate deviations (reporting as a crew member not an ability; a
  minimal `Outcome` union; an injected `now()` clock instead of a full `Clock`) are documented design
  decisions, not accidents.

## Batch File Design

- N/A - this repo ships no PowerShell/batch parity scripts (that pattern belongs to the multi-stack
  sudoku POC). CI is a single GitHub Actions workflow; local reproduction is a plain `npm run verify`.

## Documentation Alignment

- README, CHANGELOG, backlog, and the planning doc are mutually consistent on the reporting feature: the
  README "Reporting" section matches the shipped API (`scene`, `assign(HtmlReporter.storingReportsAt)`,
  `testRunFinishes`), and the CHANGELOG and backlog agree it is delivered and additive.
- **One stale detail (cosmetic):** [docs/backlog.md](docs/backlog.md) (line 49) says the final `-5` PR is
  "awaiting user review", but `git log` shows `Merge pull request #13` is the tip of `main` and the work
  is complete. The backlog status (RESOLVED) is correct; only the parenthetical narrative predates the
  merge. Recommend a one-line touch-up on the next backlog edit.
- **Node version inconsistency (Risk 1):** README says 18+, CI tests 20/22, `package.json` declares no
  engine - the clearest documentation-vs-reality gap in the repo.

## Logging Alignment

- `ConsoleReporter` ([ConsoleReporter.ts](src/crew/ConsoleReporter.ts)) and `HtmlReporter` both consume
  the same events but format independently; there is no shared formatter, which is fine at this scale.
  `ConsoleReporter` handles only `activity:*` events and silently ignores scene/test-run events - a
  reasonable scope, but worth a comment so a reader does not expect scene boundaries in the console log.

## Test Coverage Metrics

- 47 tests / 10 files, all green; quantitative detail in the [Metrics annex](ANNEX/METRICS.md). The
  reporting feature is the most heavily tested area (report-model 6, render-html 7, html-reporter 5,
  e2e 1 = 19 of 47). Untested: the real `node:fs` writer, and there is no coverage percentage because no
  coverage tool is wired (Risk 3).

---

[<- Previous: Project Review](03_PROJECT_REVIEWS/PROJECT_001_hand-baked-screenplay-pattern.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1543Z.md) | [Next: Recommendations ->](05_RECOMMENDATIONS.md)
