# Project Review: hand-baked-screenplay-pattern

[<- Back to Index](../00_CODE_REVIEW_CODEX_GPT5_v1_20260723T2337Z.md) | [Next: Cross-Project Analysis ->](../04_CROSS_PROJECT_ANALYSIS.md)

**Reviewer:** AI assistant (CODEX GPT-5)
**Date:** 2026-07-23T23:37Z

## Project Snapshot

| Area | Assessment |
|---|---|
| Purpose | Dependency-free TypeScript Screenplay teaching library |
| Runtime | Native ESM, Node 20+, zero runtime dependencies |
| Test stack | Vitest 4.1.10, strict TypeScript |
| Gate | `npm run verify` |
| Gate result | PASS - 13 files, 88 tests |
| Coverage | 93.15% statements, 85.49% branches |
| Licence | Apache-2.0 |
| Backlog | v7, claims zero outstanding; new review findings require triage |

## Review

- **Architecture and pattern fidelity:** Tasks delegate to activities,
  interactions use abilities, questions read state, actors emit events, and
  reporters remain crew members. The one material fidelity issue is
  `Cast.whereEveryoneCan`, which shares stateful ability instances between
  actors and weakens the actor boundary.
- **Code quality and maintainability:** The code is compact, strictly typed,
  well named, and separated into focused modules. Pure report building and
  rendering are especially easy to test. `Outcome.from` is a small but
  consequential truthiness defect.
- **Test coverage and approach:** The suite covers unit, component/integration,
  public-API, filesystem, and public-API end-to-end paths. It exercises
  concurrency in event nesting, crash truth, time reversal, and write
  lifecycle. It misses multi-actor ability isolation, falsy exceptions,
  scene-only diagnostics, and empty-run semantics.
- **Runtime lifecycle and stability:** Sequential activity execution is awaited
  correctly; failures announce and rethrow; default-stage tests use teardown;
  successful report writes clear buffers while failed writes retain evidence.
  Module-level stage state still requires disciplined reset/hook use, which the
  README documents.
- **Data, API, token, and auth assumptions:** The `HttpClient` abstraction keeps
  network mechanics outside Screenplay code and tests use deterministic canned
  responses. No live API, secrets, or auth environment is required. However,
  `ManageData` explicitly stores IDs/tokens and `MakeRequests` stores the latest
  response, so shared ability objects are a concrete cross-actor leakage risk.
- **CI and release:** CI is minimal and reproducible across Node 20/22/24 using
  `npm ci`; latest default-branch CI is green. Coverage is informational and no
  build/report artifact is uploaded. Local packaging is coherent, but public
  release metadata stops at `v0.1.0` despite source/backlog claims for 0.2.0.
- **Documentation and pedagogical value:** README plus three guides form a
  strong learning path with useful diagrams and examples. The release claim,
  ability-sharing omission, and concurrency-unsafe TimingReporter example are
  credibility gaps precisely because the rest of the material is so concrete.

## Strengths Worth Preserving

- Public API canary protects the names consumed by the calculator project.
- Injectable clock, HTTP client, log sink, and report writer create clean test
  seams without dependency-heavy abstraction.
- Defensive report folding handles malformed and interrupted streams without
  throwing away all evidence.
- Dynamic HTML text is escaped before rendering; no external assets or network
  requests are introduced.
- Changelog, backlog, and implementation history retain useful rationale, even
  where release status now needs correction.

## Test Isolation and Synchronisation

- `Actor.attemptsTo` awaits activities serially and nested tasks await children.
- Event nesting is correlated by actor, so concurrent actor streams do not
  mis-nest in the report builder.
- Tests do not use arbitrary waits or timers; the clock is injectable.
- Filesystem integration writes under `os.tmpdir()` and cleans up.
- The unresolved isolation defect is state ownership, not timing: concrete
  abilities are shared by the cast across actors.

## Executable Specifications

N/A - this library uses descriptive Vitest specifications rather than Gherkin.
There are no skipped, quarantined, or tagged scenarios. The spec names remain
behaviour-oriented and the public-API end-to-end example is readable as a
worked acceptance path.

---

[<- Previous: Risks and Issues](../02_RISKS_AND_ISSUES.md) | [Back to Index](../00_CODE_REVIEW_CODEX_GPT5_v1_20260723T2337Z.md) | [Next: Cross-Project Analysis ->](../04_CROSS_PROJECT_ANALYSIS.md)
