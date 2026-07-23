# Risks and Issues

[<- Back to Index](00_CODE_REVIEW_CODEX_GPT5_v1_20260723T2337Z.md) | [Next: Project Review ->](03_PROJECT_REVIEWS/PROJECT_001_hand-baked-screenplay-pattern.md)

**Reviewer:** AI assistant (CODEX GPT-5)
**Date:** 2026-07-23T23:37Z

Findings are ordered high to low. There are no High findings. Risks 1-2 are
Medium, Risk 3 is Low-Medium, Risks 4-6 are Low, and Risk 7 is informational.

## Risk 1 (Medium): The source of truth says release 0.2.0 was cut, but no 0.2.0 release exists remotely

**Risk Description/Explanation**

The authoritative backlog declares 0.2.0 cut and current. The manifest and
changelog were updated, but the repository has no local or remote `v0.2.0` tag,
GitHub exposes only release `v0.1.0`, and the package name is absent from npm.
The repo therefore has 0.2.0 source metadata, not a verifiable 0.2.0 release.

**Evidence Outline**

- [docs/backlog.md](../../docs/backlog.md) (line 185) states "Release 0.2.0 was
  cut"; lines 249-255 mark the release-overdue item resolved; line 375 calls the
  release current.
- [package.json](../../package.json) (line 3) declares version 0.2.0, and
  [CHANGELOG.md](../../CHANGELOG.md) (lines 10-13) has a dated 0.2.0 section.
- [CHANGELOG.md](../../CHANGELOG.md) (lines 156-157) links comparisons through
  `v0.2.0`, but the remote does not contain that tag.
- `git ls-remote --tags origin` returned only `refs/tags/v0.1.0`.
- `gh release list --limit 10` returned only `v0.1.0` as Latest.
- `npm view hand-baked-screenplay-pattern version --json` returned `E404`.
- `npm pack --dry-run --json --ignore-scripts` did prove that a coherent 0.2.0
  tarball can be built locally; packaging readiness is not the same as release.

**Impact Analysis**

- Portfolio reviewers cannot reconcile the canonical backlog with the public
  release surface.
- The changelog comparison link for 0.2.0 is unresolved until the tag exists.
- Consumers cannot select a verifiable 0.2.0 release by Git tag or npm version.
- A later 0.2.0 tag could accidentally point at a different commit than the
  source state the changelog describes.

**Refactor Recommendation and Strategy**

1. Decide the intended distribution contract: GitHub tag/release only, npm
   publication, or both.
2. If 0.2.0 should be public, tag the reviewed release commit, push the tag, and
   create a GitHub release; publish to npm only if that is an explicit goal.
3. If no release was intended, move the changelog changes back to Unreleased or
   correct backlog Item #14 to say "version metadata prepared", not "release
   cut".
4. Add a release checklist or workflow that verifies manifest version,
   changelog heading, tag, release record, and optional registry publication.
5. Reconcile the backlog and handover after the owner selects the contract.

## Risk 2 (Medium): `whereEveryoneCan` shares mutable abilities across actors

**Risk Description/Explanation**

`Cast.whereEveryoneCan(...abilities)` closes over concrete ability objects and
passes those same instances to every actor. Both built-in examples are mutable:
`ManageData` owns a key/value store and `MakeRequests` owns the most recent
response. Two actors on one stage therefore share remembered IDs, tokens, and
HTTP response state despite the actor-centric API implying separate capability
state.

**Evidence Outline**

- [src/screenplay/Cast.ts](../../src/screenplay/Cast.ts) (lines 17-20) captures
  an `Ability[]` once and grants that array to every prepared actor.
- [src/screenplay/Actor.ts](../../src/screenplay/Actor.ts) (lines 33, 40-43)
  stores the passed objects directly in each actor's ability map.
- [src/abilities/data/ManageData.ts](../../src/abilities/data/ManageData.ts)
  (lines 19-28) owns and mutates one `Map`; its documentation explicitly names
  IDs and tokens at line 6.
- [src/abilities/http/MakeRequests.ts](../../src/abilities/http/MakeRequests.ts)
  (lines 18, 24-26) owns one mutable `lastResponse`.
- [docs/01-screenplay-flow.md](../../docs/01-screenplay-flow.md) (lines 150-156)
  says the cast gives every actor these abilities and then describes the
  abilities as Ada's state; it does not disclose object sharing.
- Runtime probe: after Ada stored `token = "ada-secret"` through her
  `ManageData`, Bob read `"ada-secret"` from his `ManageData` on the same stage.

**Impact Analysis**

- Multi-actor tests can pass against another actor's response or remembered
  data, creating order-dependent false positives.
- Auth tokens and scenario data can leak across actor identities.
- Parallel actor activity can race on `lastResponse`, making
  `LastResponse.*` nondeterministic.
- The teaching model demonstrates the opposite of test isolation unless the
  reader notices the object-identity detail.

**Refactor Recommendation and Strategy**

1. Record whether ability sharing is intentional public behaviour.
2. Add a cast factory API that creates abilities per actor, for example
   `Cast.whereEachActorCan(() => [MakeRequests.using(client),
   ManageData.usingAnEmptyStore()])`.
3. Preserve the existing method for stateless/shared abilities if compatibility
   requires it, but rename or document its sharing semantics explicitly.
4. Update README and Guide 01/02 examples to use per-actor instances for mutable
   abilities.
5. Add a two-actor isolation spec covering both `ManageData` and
   `MakeRequests.lastResponse`.
6. Check the calculator consumer before changing any existing signature.

## Risk 3 (Low-Medium): Falsy thrown values produce a passed scene

**Risk Description/Explanation**

JavaScript permits throwing any value. `Outcome.from` treats every falsy value
as absence of an error, while `scene` passes caught values directly to it.
Consequently `throw false`, `throw 0`, `throw ''`, and `throw undefined` all
become successful scene outcomes even though `scene` rethrows them.

**Evidence Outline**

- [src/screenplay/Outcome.ts](../../src/screenplay/Outcome.ts) (lines 22-28)
  accepts `unknown` but returns success on `if (!error)`.
- [src/scene/scene.ts](../../src/scene/scene.ts) (lines 33-38) catches any thrown
  value, emits `Outcome.from(error)`, and rethrows it.
- [spec/outcome.spec.ts](../../spec/outcome.spec.ts) (lines 24-36) tests
  `undefined` as success and only a truthy string as the non-Error failure case.
- Focused probe: all four values `[false, 0, '', undefined]` returned outcome
  status `success`.
- Public-API probe: a scene body that executed `throw false`, followed by
  `testRunFinishes()`, rendered one scene, one passed, zero failed, and the
  headline "All scenes passed".

**Impact Analysis**

- The test runner still receives the rejection, but the durable HTML evidence
  contradicts the runner.
- CI or reviewers relying on the artifact can see a false green.
- The API contract says non-Error thrown values are wrapped; it only fulfils
  that contract for truthy values.

**Refactor Recommendation and Strategy**

1. Separate success creation from error conversion. `Outcome.successful()`
   already exists, so an error conversion function should always create a
   failure for every supplied value, including `undefined`.
2. If backward compatibility requires `Outcome.from()` to mean success, add an
   explicit `Outcome.fromError(error: unknown)` and use it in catch paths.
3. Add table-driven tests for `false`, `0`, empty string, `null`, and
   `undefined`, plus an end-to-end report assertion.

## Risk 4 (Low): A scene-level failure can lose its error details

**Risk Description/Explanation**

The report renderer prints error details only for failing activities. A scene
can fail before or outside `actor.attemptsTo`, and its outcome still carries an
Error, but `renderScene` renders only a pill and duration. The README promises
"error details for failures" without this qualification.

**Evidence Outline**

- [src/reporting/renderHtml.ts](../../src/reporting/renderHtml.ts) (lines 41-51)
  defines `renderError` for activity outcomes.
- The same file (lines 54-68) invokes it for each activity, while
  `renderScene` (lines 71-85) never renders `scene.outcome.error`.
- [README.md](../../README.md) (lines 188-191) promises error details for
  failures.
- [spec/render-html.spec.ts](../../spec/render-html.spec.ts) (lines 89-109)
  includes the same Error in both scene and activity, so it cannot prove that
  scene-only details render.
- Focused probe built a failing scene with no activities; the HTML did not
  contain the scene error message.

**Impact Analysis**

- Setup, fixture, hook, and orchestration failures can produce a red scene with
  no actionable cause.
- The main purpose of a post-run artifact - diagnosing a failure later - is
  weakened exactly where no activity log exists.

**Refactor Recommendation and Strategy**

Generalise `renderError` to accept an `Outcome`, render the scene's error block
when the scene failed, and avoid duplicate noise when an identical nested
activity error is already visible. Add a scene-only failure test including
escaping and unexpected-error stack output.

## Risk 5 (Low): A zero-scene run is labelled "All scenes passed"

**Risk Description/Explanation**

The renderer defines a passed run solely as `failed === 0`. Therefore an empty
event stream or a terminal-only event produces a green summary even though no
test evidence exists.

**Evidence Outline**

- [src/reporting/ReportModel.ts](../../src/reporting/ReportModel.ts) (lines
  196-209) reports zero total, zero succeeded, and zero failed for no scenes.
- [src/reporting/renderHtml.ts](../../src/reporting/renderHtml.ts) (lines
  154-157) treats `failed === 0` as passed and selects "All scenes passed".
- [spec/html-reporter.spec.ts](../../spec/html-reporter.spec.ts) (lines 47-62)
  sends only `test-run:finishes` in two path tests but never asserts the
  resulting status.
- Focused probe confirmed a terminal-only run contains "All scenes passed".

**Impact Analysis**

- Misconfigured runner hooks or filters that execute no scenes can produce a
  portfolio artifact that looks successful.
- The green summary obscures missing coverage rather than distinguishing it
  from a real clean run.

**Refactor Recommendation and Strategy**

Define an explicit empty-run policy. Prefer a neutral/incomplete state or a
failure labelled "No scenes recorded"; expose it in `RunReport` or derive it
from `total === 0`. Add renderer and reporter tests for the chosen state.

## Risk 6 (Low): The TimingReporter teaching example is unsafe for concurrent actors

**Risk Description/Explanation**

Guide 03 presents a timing reporter with one global LIFO stack. Interleaved
actors can finish in a different order, pairing the wrong start time with an
activity. The same guide later correctly explains why report reconstruction
needs a stack per actor.

**Evidence Outline**

- [docs/03-event-notification-layer.md](../../docs/03-event-notification-layer.md)
  (lines 180-207) defines `private readonly started: number[]` and pops it for
  any actor.
- The same guide (lines 246-248) explicitly says interleaved actors require
  keying stacks by `event.actor`.
- Lines 258 and 286 recommend the TimingReporter as a usable extension.

**Impact Analysis**

- Readers who copy the example get incorrect metrics under concurrency.
- The contradiction reduces trust in an otherwise strong explanation of event
  correlation.

**Refactor Recommendation and Strategy**

Change the example to `Map<string, number[]>`, push/pop by `event.actor`, use
the event's stamped timestamps rather than fresh `Date.now()` calls, and add a
short interleaved-Ada/Bob trace showing why correlation matters.

## Risk 7 (Informational): Dependency and supply-chain posture is clean, with minor freshness drift

**Risk Description/Explanation**

No vulnerability or licence defect was found. The lockfile is reproducible but
not at the newest patch allowed by its current `@types/node` range, and
TypeScript has a newer major that should be evaluated deliberately rather than
accepted automatically.

**Evidence Outline**

- `npm audit --json` reported zero vulnerabilities across 97 dependencies.
- `npm outdated --json` reported `@types/node` 22.19.20 installed, 22.20.1
  wanted, and 26.1.1 latest; TypeScript 5.9.3 is current within the declared
  range while 7.0.2 is the latest major.
- [package-lock.json](../../package-lock.json) (lines 479-486) locks
  `@types/node` 22.19.20.
- [package.json](../../package.json) (lines 44-52) declares Apache-2.0, Node 20+,
  and dev-only tooling.
- [LICENSE](../../LICENSE) contains the Apache License 2.0 text, and GitHub
  identifies the repository licence as Apache-2.0.
- A tracked-file secret pattern scan found no credentials; matches from a broad
  scan were documentation prose and the package name `js-tokens`.
- [ci.yml](../../.github/workflows/ci.yml) (lines 9-14, 23-38) uses read-only
  contents permission, npm cache, `npm ci`, and Node 20/22/24.

**Impact Analysis**

The patch drift is low risk and the major upgrade is not urgent. The important
point is to keep normal scheduled dependency maintenance without converting a
clean audit into speculative CVE claims.

**Refactor Recommendation and Strategy**

Refresh the lockfile patch in a dedicated dependency PR, evaluate TypeScript 7
against NodeNext declarations separately, and keep official Actions plus npm
dependencies under routine review. Consider immutable Action SHAs if the
portfolio adopts that policy globally.

## Recorded Questions (Unattended Review)

1. Does "release 0.2.0 was cut" mean a GitHub tag/release, npm publication, or
   only source metadata preparation?
2. Is sharing concrete ability instances between actors intentional public
   behaviour, or should mutable abilities be actor-scoped by default?
3. Should a zero-scene report be failed, incomplete/neutral, or suppressed?
4. Should one failing `StageCrewMember` stop notification and actor execution,
   or should crew failures be isolated? This remains a design decision noted by
   prior review evidence and is not promoted to a new finding here.

---

[<- Previous: Executive Summary](01_EXECUTIVE_SUMMARY.md) | [Back to Index](00_CODE_REVIEW_CODEX_GPT5_v1_20260723T2337Z.md) | [Next: Project Review ->](03_PROJECT_REVIEWS/PROJECT_001_hand-baked-screenplay-pattern.md)
