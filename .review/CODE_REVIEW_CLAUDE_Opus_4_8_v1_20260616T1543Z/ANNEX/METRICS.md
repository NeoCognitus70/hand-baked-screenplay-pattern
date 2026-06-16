# Annex: Metrics

[<- Back to Index](../00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1543Z.md)

**Reviewer:** AI assistant (CLAUDE_Opus_4_8)

Quantitative snapshot. Counts are from `git ls-files` and the `npm run verify` run performed for this
review (Node v20.19.5). Line counts are approximate and indicative, not a precise SLOC measurement.

## Repository shape

| Metric | Value |
|---|---|
| Tracked files (total) | 69 |
| Source files under `src/` | 41 |
| Spec files under `spec/` | 12 (10 spec files + 2 support modules) |
| Docs (`docs/` + `planning/`) | 6 markdown files |
| Runtime dependencies | 0 |
| Dev dependencies | 3 (`@types/node`, `typescript`, `vitest`) |

## Test metrics

| Metric | Value |
|---|---|
| Test files | 10 |
| Tests | 47 (all passing) |
| Reporting-feature tests | 19 of 47 (report-model 6, render-html 7, html-reporter 5, e2e 1) |
| Screenplay-core tests | 27 of 47 |
| Coverage percentage | Not measured - no coverage tool wired (Risk 3) |
| Gate command | `npm run verify` (typecheck + build + test) |
| Gate result for this review | PASS |

## Public API surface (verified additive)

| Barrel | Notable exports | Reporting additions (additive) |
|---|---|---|
| [src/index.ts](../src/index.ts) | re-exports all sub-barrels | added `reporting`, `scene` modules |
| [src/screenplay/index.ts](../src/screenplay/index.ts) | Actor, Cast, Stage, Task, Interaction, Question, ... | added `Outcome`, `sceneStarts`/`sceneFinishes`/`testRunFinishes`, `DomainEventInput` |
| [src/crew/index.ts](../src/crew/index.ts) | ConsoleReporter | added `HtmlReporter`, `ReportWriter` |
| [src/reporting/index.ts](../src/reporting/index.ts) | (new) | `buildReport`, `renderHtml`, model types |
| [src/scene/index.ts](../src/scene/index.ts) | (new) | `scene` |

Sibling consumer (`calculator-screenplay-bdd`) imports - all still resolve: `Ability`, `Actor`, `Cast`,
`Ensure`, `Interaction`, `LastResponse`, `MakeRequests`, `ManageData`, `Question`, `Remember`, `Send`,
`Stage`, `Task`, `equals`, `includes`, plus types `Answerable`, `HttpClient`, `HttpRequest`,
`HttpResponse`.

## CI metrics

| Metric | Value |
|---|---|
| Workflow | [.github/workflows/ci.yml](../.github/workflows/ci.yml) (single `verify` job) |
| Node matrix | 20, 22 (README claims 18+ - mismatch, Risk 1) |
| Action versions | checkout@v4, setup-node@v4 |
| Permissions | `contents: read` (minimised) |
| Secrets used | none |

## Findings tally

| Severity | Count |
|---|---|
| High | 0 |
| Medium | 0 (Risk 1 spans Low-Medium) |
| Low | 4 (Risks 1-4) |
| Informational | 1 (Risk 5 - escaping verified correct) |

---

[<- Back to Index](../00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1543Z.md)
