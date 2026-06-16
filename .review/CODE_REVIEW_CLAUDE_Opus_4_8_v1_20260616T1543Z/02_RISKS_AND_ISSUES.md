# Risks and Issues

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1543Z.md) | [Next: Project Review ->](03_PROJECT_REVIEWS/PROJECT_001_hand-baked-screenplay-pattern.md)

**Reviewer:** AI assistant (CLAUDE_Opus_4_8)

Findings are numbered high to low by severity. This library is in good health: there are **no
correctness-critical (High) defects**. The list below is dominated by Low/Medium polish and
consistency items. Each item gives a description, evidence (file + line), impact, and a remediation
strategy.

---

## Risk 1 (Low-Medium): Node version claim is inconsistent and unenforced

**Description.** Three sources disagree about which Node versions the package supports, and none
enforces the stated floor.

**Evidence.**
- [README.md](README.md) (line 40): "This package targets Node.js 18+ and is shipped as native ES
  modules." The Installation section (line 40 region) repeats this.
- [package.json](package.json): there is **no `engines` field**; the only Node reference is
  `"@types/node": "^22.10.0"` (line 44).
- [.github/workflows/ci.yml](.github/workflows/ci.yml) (lines 22-23): the CI matrix is `node: [20, 22]`
  - Node 18 is never built or tested.

**Impact.** The 18+ promise is unverified: a consumer on Node 18 could hit a syntax or API
incompatibility that CI would never catch. Because the sibling `calculator-screenplay-bdd` builds this
package from source (`prepare:screenplay` runs `npm install && npm run build` in this repo), an
undeclared engine floor also propagates downstream. The mismatch is a small but visible credibility dent
in a portfolio repo whose audience includes hiring managers.

**Remediation.**
- Decide the real floor and make all three agree. If 18 is genuinely supported, add `node: [18, 20, 22]`
  to the CI matrix and add `"engines": { "node": ">=18" }` to `package.json`. If 20 is the real floor
  (the more honest reading, since `node:fs`/ESM behaviour and `@types/node` target newer releases),
  change the README to "Node.js 20+" and set `engines` to `>=20`.
- Note that Node 18 reached end-of-life (2025-04-30); 20+ is the defensible modern floor. Prefer raising
  the README to match CI over lowering CI to chase an EOL release.

---

## Risk 2 (Low): Duration arithmetic trusts a monotonic clock and an ordered event stream

**Description.** Durations are computed as raw timestamp subtractions with no floor at zero, and the run
`startedAt` is taken from `events[0]` rather than the first scene start. Non-monotonic clocks (e.g.
`Date.now()` across an NTP step) or a buffered stream whose first event is not a scene start can yield
negative or misleading durations that `formatDuration` will render verbatim.

**Evidence.**
- [ReportModel.ts](src/reporting/ReportModel.ts) (line 97): `activity.durationMs = event.timestamp -
  activity.startedAt;` (also lines 104, 112, 131) - no `Math.max(0, ...)`.
- [ReportModel.ts](src/reporting/ReportModel.ts) (line 123): `const startedAt = events.length > 0 ?
  events[0].timestamp : 0;` - if the buffer opens with a stray `activity:*` before the first
  `scene:starts` (the builder ignores it for nesting but still uses its timestamp as the run start),
  the run `startedAt` can predate any real scene. The orphan-events test confirms this:
  [report-model.spec.ts](spec/report-model.spec.ts) (line 148) asserts `report.startedAt` is `10` from
  the stray pre-scene activity.
- [renderHtml.ts](src/reporting/renderHtml.ts) (lines 19-22): `formatDuration` formats whatever number
  it is given, including a negative one (e.g. `-5ms`).

**Impact.** Low. In normal single-process runs with a default `Date.now()` clock the stream is ordered
and monotonic, so this is latent. But a teaching library is read closely, and a negative `ms` in a
report (or a run "starting" before its first scene) undermines trust in the artefact and is an easy thing
for a reviewer to spot.

**Remediation.**
- Floor durations: `durationMs = Math.max(0, event.timestamp - startedAt)` in the four subtraction
  sites, and likewise for the run `durationMs`.
- Prefer the first `scene:starts` timestamp (falling back to `events[0]`) for the run `startedAt`, so a
  stray pre-scene event cannot move the run start earlier than the first scene.
- Add a focused spec feeding a non-monotonic stream and asserting durations never render negative.

---

## Risk 3 (Low): No coverage gate, and the real filesystem writer is untested

**Description.** The suite is strong but has two specific gaps: there is no coverage threshold enforced
anywhere, and the only code path that actually writes a file - the default `fileSystemWriter` using
`node:fs` - is never executed by a test (every reporter spec injects a fake writer).

**Evidence.**
- [package.json](package.json) (lines 27-33): scripts are `typecheck`, `build`, `test` (`vitest run`),
  `verify`; there is no `coverage` script and no threshold config in
  [vitest.config.ts](vitest.config.ts).
- [HtmlReporter.ts](src/crew/HtmlReporter.ts) (lines 19-22): `fileSystemWriter` (`mkdirSync` +
  `writeFileSync`) is the production default, but [html-reporter.spec.ts](spec/html-reporter.spec.ts)
  and [reporting-e2e.spec.ts](spec/reporting-e2e.spec.ts) both inject a `vi.fn()` / closure writer via
  `withWriter(...)`, so the `node:fs` branch has zero coverage.

**Impact.** Low. The pure paths are well covered, so a regression in `buildReport`/`renderHtml` would be
caught. But a regression in the actual disk write (path joining edge cases, directory creation, encoding)
would not be. The plan's acceptance criteria (plan section 9, "Running the worked example produces a
single self-contained index.html that opens in a browser") is asserted only against a captured string,
never against a real file on disk.

**Remediation.**
- Add one integration spec that writes to a `node:os.tmpdir()` path, asserts the file exists and contains
  `<!DOCTYPE html>`, then cleans up (the plan itself suggested this option, section 8 task 6).
- Add `vitest run --coverage` behind a `coverage` script (Vitest ships `@vitest/coverage-v8`) and wire a
  modest threshold into CI so the metric is visible and defended over time.

---

## Risk 4 (Low): The public-API additivity contract is real but unguarded by automation

**Description.** The sibling `calculator-screenplay-bdd` consumes this library through a `file:`
dependency and imports named exports from the package root. The reporting work was kept strictly
additive, which I verified by inspection - but nothing in this repo's CI would catch a future breaking
change to the public surface before the sibling's build breaks.

**Evidence.**
- [package.json](../calculator-screenplay-bdd/package.json): `"hand-baked-screenplay-pattern":
  "file:../hand-baked-screenplay-pattern"`, and `prepare:screenplay` builds this repo from source.
- The sibling imports `Ability`, `Actor`, `Cast`, `Ensure`, `Interaction`, `LastResponse`,
  `MakeRequests`, `ManageData`, `Question`, `Remember`, `Send`, `Stage`, `Task`, `equals`, `includes`,
  and the `Answerable` / `HttpClient` / `HttpRequest` / `HttpResponse` types (see
  `tests/calculatorSteps.ts`, `tests/calculatorTasks.ts`, `tests/screenplayApiClient.ts` in that repo).
  Every one of those still resolves from [src/index.ts](src/index.ts) and the barrels it re-exports.
- The reporting additions ([src/index.ts](src/index.ts) lines 13-14, plus the `Outcome` / scene-facade /
  `DomainEventInput` additions to the screenplay barrel) only *added* exports; the CHANGELOG records
  this explicitly ([CHANGELOG.md](CHANGELOG.md) lines 48-57).

**Impact.** Low today (the contract holds), but the *guard* is manual. A future rename or signature
change to a consumed export would pass this repo's green gate and only fail when the sibling is built -
a slow, confusing feedback loop across two repos.

**Remediation.**
- Add a tiny "public API surface" test in this repo that imports the documented exports from
  `../src/index.js` and asserts they are defined (a cheap canary that fails fast on an accidental
  removal/rename).
- Consider an `api-extractor` or a committed `.d.ts` snapshot test for a stronger additivity guarantee,
  if the portfolio wants to teach contract testing between packages.

---

## Risk 5 (Informational, not a defect): HTML escaping is correct and well-tested

**Description.** Recorded as a deliberately checked item because the task called out renderHtml escaping
as a focus. The escaping is complete and correct; this entry documents the verification so a future
reader does not have to re-derive it.

**Evidence.**
- [renderHtml.ts](src/reporting/renderHtml.ts) (lines 9-16): `escapeHtml` replaces `&`, `<`, `>`, `"`,
  and `'`, in the correct order (`&` first).
- Every dynamic value is escaped and inserted as **element text content**, never into an HTML attribute:
  scene names (line 78), actor and description (lines 62-63), error message and stack (lines 46-49). The
  static `lang`, `charset`, and `aria-expanded` attributes carry no user data; the status pill label is a
  fixed token (lines 33-39).
- The collapse/expand `<script>` is static and reads no dynamic data; it is a constant string (lines
  130-142).
- Tests assert raw `<script>` payloads do not survive and the escaped forms do
  ([render-html.spec.ts](spec/render-html.spec.ts) lines 111-143).

**Impact.** None - no escaping gap was found. The one forward-looking note: if a future change ever
interpolates a dynamic value into an *attribute* (e.g. a per-scene `id` or `data-*`), the current
content-only escaping would be insufficient for an attribute context (an unquoted attribute break), so
that change must add attribute-aware escaping. No such case exists today.

---

[<- Previous: Executive Summary](01_EXECUTIVE_SUMMARY.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1543Z.md) | [Next: Project Review ->](03_PROJECT_REVIEWS/PROJECT_001_hand-baked-screenplay-pattern.md)
