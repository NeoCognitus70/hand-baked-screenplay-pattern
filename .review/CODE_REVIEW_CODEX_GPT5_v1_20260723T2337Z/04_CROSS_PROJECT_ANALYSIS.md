# Cross-Project Analysis

[<- Back to Index](00_CODE_REVIEW_CODEX_GPT5_v1_20260723T2337Z.md) | [Next: Recommendations ->](05_RECOMMENDATIONS.md)

**Reviewer:** AI assistant (CODEX GPT-5)
**Date:** 2026-07-23T23:37Z

For this single-repository review, "cross-project" means cross-cutting analysis
between library source, suite, CI, documentation, packaging, and the coupled
calculator consumer.

## Tool-Agnostic Tests

- The library is runner-agnostic: `scene(name, body)` accepts any sync/async
  function, and `Stage` exposes manual lifecycle methods for runner hooks.
- Vitest is used only to verify the library; tasks, actors, and reporters do not
  import Vitest.
- The injected `HttpClient` permits fake, fetch, or other transports without
  changing screenplay code.
- The default-stage facade requires lifecycle discipline from an adapter; no
  first-party adapter currently guarantees `testRunFinishes()` on every exit.

## Code-Agnostic Tests

- N/A - the executable suite is TypeScript because the reviewed artefact is a
  TypeScript library with a TypeScript public API.
- The conceptual Screenplay vocabulary and event lifecycle are language
  portable, and the documentation explains them without binding every idea to
  Vitest.
- The static HTML output is language-neutral after generation.

## Single Source of Truth

- `docs/backlog.md` is clearly labelled authoritative and retains resolved
  history.
- Its gate and audit claims reproduce, but its 0.2.0 release claim conflicts
  with the remote tag/release surface.
- `package.json` and `CHANGELOG.md` agree on source version 0.2.0.
- A release checklist is needed to keep backlog, changelog, manifest, tag,
  GitHub release, and optional npm publication aligned.

## API Contract Compliance

- The HTTP model exposes method, URL, headers, body, status, and response
  headers/body through small transport-neutral interfaces.
- `MakeRequests` obeys dependency inversion by delegating all I/O to
  `HttpClient`.
- Header lookup is documented as case-sensitive; consumers using real HTTP
  should normalise keys in their client if case-insensitive access is needed.
- N/A - no REST server or OpenAPI specification is implemented in this
  repository, so endpoint-schema conformance cannot be assessed here.

## Screenplay Parity

- The names and roles broadly match the Serenity/JS teaching model while the
  README clearly disclaims dependency or affiliation.
- Tasks and interactions compose through the common `Activity` interface;
  questions resolve through `Answerable`; abilities are located by type.
- Reporting as a `StageCrewMember`, not an ability, is the correct separation.
- Shared stateful ability instances are the main parity/semantics concern:
  actors look isolated at the API boundary but can observe each other's state.
- The public-API canary guards all runtime names currently used by the coupled
  calculator consumer.

## Batch File Design

N/A - the repository contains no batch or PowerShell orchestration scripts.
The only lifecycle automation is npm scripts and GitHub Actions.

## Documentation Alignment

- README, source layout, package scripts, Node floor, and current 88-test gate
  agree.
- The delivered reporting plan is now correctly labelled historical/delivered.
- Backlog release status conflicts with public repository state.
- Guide 03's TimingReporter contradicts its own per-actor correlation advice.
- Mutable ability sharing is not explained in examples that use stateful
  abilities.

## Logging Alignment

- `ConsoleReporter` has focused tests for starts, finishes, failures, and its
  deliberate omission of scene/run events.
- `HtmlReporter` observes the full event lifecycle and isolates model/render/I/O
  responsibilities cleanly.
- Both reporters receive the same stamped domain-event source.
- Scene-only errors are retained in the model but omitted from HTML, so the log
  and artifact can expose different diagnostic depth.
- Crew failure isolation remains an explicit design question rather than a
  hidden assumption.

## Test Coverage Metrics

- 13 spec files and 88 tests passed.
- Current coverage: 93.15% statements, 85.49% branches, 95.83% functions, and
  93.47% lines.
- Coverage is informational in CI and `continue-on-error`; it is visibility,
  not a gate.
- Important uncovered contracts correlate with findings: `Outcome.from` falsy
  values, empty-run state, scene-only error rendering, and actor state
  separation.
- `LogicError` and `LastResponse.header` also have uncovered paths and are good
  low-cost candidates for the next focused test cycle.

## CI, Caching, Secrets, and Published Artefacts

- CI uses `npm ci`, setup-node npm caching, Node 20/22/24, read-only contents
  permission, and cancellation of superseded runs.
- The fetched default head has a successful completed CI run.
- No workflow secrets or runtime credentials are required.
- Coverage, dist, and HTML reports are not uploaded as CI artefacts.
- A dry-run tarball is coherent, but the only public GitHub release is v0.1.0
  and no npm package exists under the manifest name.

---

[<- Previous: Project Review](03_PROJECT_REVIEWS/PROJECT_001_hand-baked-screenplay-pattern.md) | [Back to Index](00_CODE_REVIEW_CODEX_GPT5_v1_20260723T2337Z.md) | [Next: Recommendations ->](05_RECOMMENDATIONS.md)
