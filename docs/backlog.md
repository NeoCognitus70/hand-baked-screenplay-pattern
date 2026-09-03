<!--
  AUDIENCE: Engineers, AI agents, and project leads maintaining work-in-progress tracking.
  PURPOSE:  Single source of truth for outstanding work, risks, and planning for this project.
  LOCATION: docs/backlog.md
  TEMPLATE: test-automation-portfolio/templates/backlog.template.md
-->

# Hand-Baked Screenplay Pattern — Backlog

**Version:** 20 — **HBSP-34 COMPLETE** (2026-09-03): a mutation-testing lane (Stryker, Apache-2.0)
now measures test-suite *quality* rather than execution. The first baseline records a **69.57%
mutation score against 95.99% statement coverage** — a 26-point gap that quantifies how much of the
suite observes rather than asserts. 620 mutants killed, 235 survived, 38 uncovered, 0 errors. The
core Screenplay building blocks score well (`scene.ts`, `ConsoleReporter.ts`, `Cast`, `Interaction`,
`Task` at 100%; `Actor.ts` 97.14%); the weak areas are `Send.ts` (15.79%), `util.ts` (38.82%) and
`ProviderConformance.ts` (66.42%, 91 survivors). The **score** is visibility only —
`thresholds.break` is null, mirroring the coverage stance from HBSP-12 — but the **lane** gates: the
CI step is deliberately not `continue-on-error`, because with no break threshold any non-zero exit
means Stryker itself failed. The first CI run proved the point by going green while producing
nothing (job pinned to Node 20; Stryker requires ≥22), which is the failure mode the final
configuration prevents. Adding
Stryker introduced three transitive dev-only advisories; all are cleared and `npm audit` reports
**0 vulnerabilities**. Remediation of the 235 survivors is **not** promoted — see *Potential Next
Steps*. Outstanding items remain **0**. Details in [`docs/mutation-testing.md`](./mutation-testing.md).

**Version:** 19 — **v0.3.0 RELEASED** (2026-08-17): lightweight tag `v0.3.0` points to the PR #54
merge commit `3560e76`; release workflow run
[`32057409492`](https://github.com/NeoCognitus70/hand-baked-screenplay-pattern/actions/runs/32057409492)
published the versioned tarball and SHA-256 checksum to the
[`v0.3.0` GitHub release](https://github.com/NeoCognitus70/hand-baked-screenplay-pattern/releases/tag/v0.3.0).
The downloaded artifact independently verified as
`ac5bd1f6d9bddf95c9a42f99f05f093c7875b1835ecd3ae0d5ca2385e810c36d`.

**Version:** 18 — **HBSP-33 COMPLETE** (2026-08-17): version 0.3.0 now exposes verified ESM and
CommonJS package-root entry points, and the real packed artifact passes clean-room runtime and type
smokes in both module systems. A tag-driven workflow publishes that immutable `.tgz` and its SHA-256
checksum to the matching GitHub release. The provider-first sequence is complete with **0 outstanding
items**; any Calculator consumer pilot requires a separate owner promotion.

**Version:** 17 — **HBSP-32 COMPLETE** (2026-08-17): a dependency-free provider harness, four
reusable semantic cases, and an aggregate runner now prove both the hand-baked async provider and an
independent minimal implementation. A deliberately broken fixture is detected. The full gate passes
at 18 files / 128 tests. There is now **1 outstanding MEDIUM item**, HBSP-33.

**Version:** 16 — **HBSP-31 COMPLETE** (2026-08-17): every canonical domain event can now carry a
typed, provider-owned `ExecutionExtension` that preserves native outcomes and metadata without
changing existing event names, required fields, order, or reporter behaviour. Lifecycle and reporter
coverage is green; the full gate passes at 17 files / 123 tests. There are now **2 outstanding MEDIUM
items**, HBSP-32..33, in dependency order.

**Version:** 15 — **HBSP-30 COMPLETE** (2026-08-17): exported structural `QuestionLike<T>`
resolution and identity-based typed ability tokens/bindings, preserving the class-based API frozen
under HBSP-29. Focused tests cover sync/async inference, class/token lookup, isolation and clear
missing-binding failure; the full gate is green at 16 files / 120 tests. There are now **3
outstanding MEDIUM items**, HBSP-31..33, in dependency order.

**Version:** 14 — **HBSP-29 COMPLETE** (2026-08-17): the package-root runtime names and type shapes
used by Calculator `main` at `2b10090` are frozen in the
[`Calculator compatibility baseline`](./compatibility.md) and enforced by runtime plus compile-time
canaries. The provider iteration follows an additive-change and explicit deprecation policy. There
are now **4 outstanding MEDIUM items**, HBSP-30..33, in dependency order.

**Version:** 13 — **HBSP-28 COMPLETE** (2026-08-17): accepted
[`ADR 0001`](./adr/0001-provider-selection-boundary.md), establishing build/profile-time provider
selection, one provider and lifecycle owner per execution lane, explicit non-goals, and the
zero-runtime-dependency core boundary. There are now **5 outstanding MEDIUM items**, HBSP-29..33,
which remain dependency-ordered. Calculator Phase 2 remains outside this backlog.

**Version:** 12 — **provider-first iteration promoted** (2026-08-16): Phase 0 (record the provider
boundary) and Phase 1 (harden the provider) from the portfolio provider-switching viability assessment
are authorised as **HBSP-28..33**. There are now **6 outstanding MEDIUM items**, executed in dependency
order. The Calculator pilot and later portfolio migrations remain outside this backlog until separately
promoted in their owning projects.

**Version:** 11 — **HBSP-27 COMPLETE** (2026-08-04): the deterministic static-reporter sample is live
at <https://neocognitus70.github.io/hand-baked-screenplay-pattern/> (PRs #42 `be03329` + #43
`ae33a66`, Pages run 30863382627) and linked from the portfolio landing page, closing landing
**LAND-09B**. Back to **0 outstanding** at that point; the fourth review-derived cycle below remains
closed.

**Version:** 10 — opened **HBSP-27** (planning-only): publish a deterministic, self-contained sample
of the existing static HTML reporter to GitHub Pages, to be linked from the portfolio landing page
as its public evidence slice **LAND-09B**.

**Version:** 9 — closes out the **fourth** review-derived cycle (Codex GPT-5 v1,
`.review/CODE_REVIEW_CODEX_GPT5_v1_20260723T2337Z/`): Items #21–#26 record CGX-01..06, all Resolved
2026-07-27 (v8 had recorded only CGX-01). This review is the first to raise **MEDIUM** findings
against the project (CGX-01 release-truth, CGX-02 shared abilities) — the "no HIGH/MEDIUM ever" and
"no outstanding items" notes below are updated accordingly. v8 recorded the CGX-01 release-truth
reconciliation (`v0.2.0` tag + GitHub release created 2026-07-27, resolving Risk 1); v7 closed out
review v2 (Items #17–#20 record TRIAGE-01/02/03/05; Item #16 / TRIAGE-04 landed in v6).
**Last Updated:** 2026-08-17
**Based on:** release baseline `3560e76` (`main`, clean and aligned with `origin/main`), the
owner-approved provider-first promotion, accepted ADR 0001, the HBSP-29 Calculator compatibility
baseline, and the portfolio assessment
`project-specs/potential-project-outlines/hand-baked-screenplay-pattern-provider-switching-viability.md`.
Prior implementation baseline: commit `2a5e93f` (PRs #35–#40 merged: CGX-01..06; `npm run verify`
green at 104 tests, `npm audit` clean, release `v0.2.0` live); fourth review-derived worklist
CGX-01..06 in `WORKLIST_hand-baked-screenplay-pattern.md`, derived from code review
`.review/CODE_REVIEW_CODEX_GPT5_v1_20260723T2337Z/`.
Prior: v5 folded in HBSP-15..22 (PRs #19–#25) from review `…Fable_5_v1_20260706T1044Z/`; v4 folded
in HBSP-09..14 (PRs #15–#17) from review `…Opus_4_8_v1_20260616T1543Z`; Item #1 traces to the
earlier survey at commit `a138aa8` (README, `planning/`, CI workflow, package scripts).

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

### Provider-first iteration (HBSP-28..33) — Promoted 2026-08-16

**Delivery rule:** execute **HBSP-28 → HBSP-29 → HBSP-30 → HBSP-31 → HBSP-32 → HBSP-33**. The
sequence is dependency-driven as well as score-ordered: first record the boundary and compatibility
baseline, then add portable seams, prove their semantics, and only then package the result. Keep each
item independently reviewable and leave the current API operational throughout.

**Scope boundary:** this cycle owns only provider Phases 0–1. It does not authorise Calculator changes,
consumer migrations, a Cypress runtime adapter, a Python/C# bridge, a Serenity replacement, scenario-
level runtime switching, or report feature parity. Those are separate project decisions after this
provider baseline is complete.

#### HBSP-28: Record the provider-selection boundary and non-goals in an ADR — Score: 18 — ✅ COMPLETE 2026-08-17

**Priority Score:** Security Impact (0) + Breakage Probability (9) + Maintenance Burden (9) = **18 points**

**Origin:** Provider-switching viability assessment, recommended delivery sequence Phase 0 steps 1–2;
owner promoted the provider-first sequence on 2026-08-16.

**Objective:** create an accepted architectural decision that defines switching at build/profile-time,
with one provider owning an Actor and all Activities in an execution lane. Preserve the dependency-free,
Promise-native core and make the iteration's exclusions explicit before any public contract changes.

**Acceptance criteria:**
- [x] Add a numbered ADR under `docs/adr/` with status, context, decision, consequences and revisit
      triggers; link it from the relevant documentation index.
- [x] State that native runtime objects from different providers must not be mixed in one Actor or
      scenario, and that scenario-level hot switching is not supported.
- [x] State that identical Serenity-grade reporting, universal execution effects, Cypress-to-Promise
      conversion, and JavaScript bridges for Python/C# are non-goals.
- [x] Preserve zero runtime dependencies in the core; framework integrations belong in companion
      adapters or consumer-owned composition modules.
- [x] `npm run verify` remains green. **Type:** architecture/docs.

**Status:** ✅ COMPLETE 2026-08-17. [`ADR 0001`](./adr/0001-provider-selection-boundary.md) records
the accepted boundary and is indexed from `docs/README.md`; the project gate remained green at 109
tests. HBSP-29 followed as the next dependency-ordered item.

#### HBSP-29: Freeze the Calculator-consumed API as the compatibility baseline — Score: 17 — ✅ COMPLETE 2026-08-17

**Priority Score:** Security Impact (0) + Breakage Probability (9) + Maintenance Burden (8) = **17 points**

**Origin:** Provider-switching viability assessment, recommended delivery sequence Phase 0 step 3.

**Objective:** turn the current sibling consumer's runtime and type imports into an explicit,
machine-verifiable compatibility contract before adding provider-neutral abstractions.

**Acceptance criteria:**
- [x] Record the Calculator-consumed runtime baseline: `Ability`, `Cast`, `Ensure`, `Interaction`,
      `LastResponse`, `MakeRequests`, `ManageData`, `Question`, `Recall`, `Remember`, `Send`, `Stage`,
      `Task`, `equals`, and `includes`.
- [x] Record and compile-check its type baseline: `Actor`, `Answerable`, `HttpClient`, `HttpRequest`,
      and `HttpResponse`, including the current Ability-subclass and HTTP-client adapter shapes.
- [x] Extend the public-API canary so removal, rename, or an incompatible type-shape change fails this
      repository's gate; additive exports remain allowed.
- [x] Document the compatibility and deprecation policy for the provider iteration and cross-reference
      the boundary ADR.
- [x] `npm run verify` remains green. **Type:** code + test + docs.

**Status:** ✅ COMPLETE 2026-08-17. [`docs/compatibility.md`](./compatibility.md) records the exact
runtime and type baseline plus policy; `spec/public-api.spec.ts` and
`spec/public-api.types.spec.ts` enforce it. `npm run verify` is green at 15 files / 111 tests.
HBSP-30 is now the first actionable item.

#### HBSP-30: Add additive portable Question and ability-token contracts — Score: 16 — ✅ COMPLETE 2026-08-17

**Priority Score:** Security Impact (0) + Breakage Probability (8) + Maintenance Burden (8) = **16 points**

**Origin:** Provider-switching viability assessment, recommended delivery sequence Phase 1 step 1.

**Objective:** allow adapters to resolve structurally compatible Questions and existing abilities
without requiring `instanceof Question` or inheritance from the concrete `Ability` base class, while
retaining both current classes and their behaviour.

**Acceptance criteria:**
- [x] Export a documented structural `QuestionLike<T>` protocol (or an explicitly portable equivalent)
      that supports synchronous and asynchronous answers without weakening existing `Question` use.
- [x] Export explicit, typed ability tokens/bindings that can register and retrieve an existing object;
      missing abilities continue to fail with a clear configuration error.
- [x] Existing `Question`, `Ability`, `Actor.answer`, and `Actor.abilityTo` call sites remain compatible
      with the HBSP-29 baseline; no consumer rewrite is required.
- [x] Focused tests prove class-based and structural Questions, class-based and token-bound abilities,
      type inference, isolation, and missing-ability failure.
- [x] The core retains zero runtime dependencies and `npm run verify` remains green.
      **Type:** code + test + docs.

**Status:** ✅ COMPLETE 2026-08-17. `QuestionLike<T>` and `isQuestionLike` provide the structural
question seam; `AbilityToken<T>` and `AbilityBinding<T>` add typed identity-based object lookup while
class-based `Question` and `Ability` calls remain compatible. `spec/portable-contracts.spec.ts`
proves synchronous/asynchronous inference, class/token paths, token identity, per-actor isolation and
missing-binding diagnostics. [`Guide 04`](./04-portable-questions-and-abilities.md) documents adapter
composition and the ADR boundary. `npm run verify` is green at 16 files / 120 tests. HBSP-31 is now
the first actionable item.

#### HBSP-31: Add an extensible outcome and event envelope without breaking existing events — Score: 15 — ✅ COMPLETE 2026-08-17

**Priority Score:** Security Impact (0) + Breakage Probability (8) + Maintenance Burden (7) = **15 points**

**Origin:** Provider-switching viability assessment, recommended delivery sequence Phase 1 step 2.

**Objective:** let providers preserve framework-specific outcomes and metadata while the current Stage,
crew and reporters continue to receive the existing lifecycle events unchanged.

**Acceptance criteria:**
- [x] Define an additive extension envelope for provider-specific outcome/event data; do not flatten
      distinctions such as environment-blocked versus product failure into a generic error.
- [x] Retain the existing `StageEvent` names, required fields, event ordering and current reporter
      behaviour as the compatibility path.
- [x] Tests prove scene start, finish and failure outcomes are emitted once, descriptions survive into
      observable events, extension data is preserved, and existing reporters ignore unknown extensions
      safely.
- [x] Document ownership: one runner/provider emits lifecycle events for a scenario; adapters must not
      create a competing Stage lifecycle.
- [x] The core retains zero runtime dependencies and `npm run verify` remains green.
      **Type:** code + test + docs.

**Status:** ✅ COMPLETE 2026-08-17. `ExecutionExtension<ProviderOutcome, ProviderMetadata>` is an
optional envelope on every `DomainEventInput` / `DomainEvent`; the Stage lifecycle facade accepts it
without changing existing call sites. `spec/event-extensions.spec.ts` proves native blocked/product
outcomes and metadata survive unchanged, descriptions and ordering remain intact, successful and
failed scenes emit exactly one start/finish pair, and existing console/HTML reporters safely ignore
the extension. Guide 03 documents single-owner lifecycle composition. `npm run verify` is green at
17 files / 123 tests. HBSP-32 is now the first actionable item.

#### HBSP-32: Add a reusable cross-provider conformance kit — Score: 14 — ✅ COMPLETE 2026-08-17

**Priority Score:** Security Impact (0) + Breakage Probability (7) + Maintenance Burden (7) = **14 points**

**Origin:** Provider-switching viability assessment, recommended delivery sequence Phase 1 step 3.

**Objective:** make provider semantics executable before adding consumers, without forcing every
provider to expose identical runtime classes or reporting features.

**Acceptance criteria:**
- [x] Define a small provider test-harness contract and reusable cases that can run against the
      hand-baked async provider and an independent minimal fixture implementation.
- [x] Prove ability isolation and clear missing-ability failure; ordered activity execution and stop-on-
      failure; synchronous and asynchronous question resolution; actor/scenario memory isolation;
      description preservation; and exactly-once lifecycle start/finish/failure semantics.
- [x] Include a provider-specific outcome case showing that extension information survives without
      becoming part of the minimum portable semantics.
- [x] Document how a TypeScript provider consumes the kit and keep framework/runner dependencies out of
      the core runtime package.
- [x] A deliberately non-conforming fixture demonstrates that the kit detects contract drift;
      `npm run verify` remains green. **Type:** code + test + docs.

**Status:** ✅ COMPLETE 2026-08-17. The public `ConformanceProvider` contract, four
`providerConformanceCases`, and `runProviderConformance(...)` are independent of any test framework.
`spec/provider-conformance.spec.ts` runs them unchanged against the real hand-baked adapter and an
independent minimal implementation; both pass. A minimal variant that continues after failure fails
exactly the stop-on-failure case, proving drift detection. Guide 05 documents TypeScript adoption,
opaque native outcomes and single-owner lifecycle composition. `npm run verify` is green at 18 files
/ 128 tests. HBSP-33 is now the first actionable item.

#### HBSP-33: Produce immutable versioned distribution with verified ESM and CommonJS entry points — Score: 13 — ✅ COMPLETE 2026-08-17

**Priority Score:** Security Impact (3) + Breakage Probability (5) + Maintenance Burden (5) = **13 points**

**Origin:** Provider-switching viability assessment, recommended delivery sequence Phase 1 step 4.

**Objective:** replace moving-branch/sibling-only consumption as the proof baseline with a reproducible,
versioned provider artefact that works in native ESM and CommonJS-hosted consumers.

**Acceptance criteria:**
- [x] Add conditional `exports` with verified `types`, `import`, and `require` entry points while
      preserving the package-root imports frozen by HBSP-29.
- [x] Add clean-room pack/install smoke fixtures that load the packed artefact through both ESM
      `import` and CommonJS `require`, and exercise representative runtime and type exports.
- [x] Document and automate one canonical immutable channel: a versioned `npm pack` artefact attached
      to the matching GitHub release with a SHA-256 checksum. npm-registry publication is not required
      for this iteration.
- [x] Cut the next appropriate version only after HBSP-28..32 pass; document compatibility and release
      steps in `CHANGELOG.md` and `docs/releasing.md`.
- [x] The published package contains only intended files, retains zero runtime dependencies, and passes
      `npm run verify` plus both pack-install smoke paths. **Type:** packaging + CI + test + docs.

**Status:** ✅ COMPLETE 2026-08-17. Version 0.3.0 adds conditional ESM/CommonJS runtime and declaration
entry points without changing the HBSP-29 package-root API. `npm run test:package` builds the real
tarball, rejects files outside `package.json`, `LICENSE`, `README.md`, `CHANGELOG.md`, and `dist/**`,
confirms zero runtime dependencies, and installs it into independent ESM and CommonJS fixtures for
runtime and strict TypeScript compilation. `npm run verify` is green at 18 files / 128 unit tests plus
both package smokes. The release workflow validates the tag against the manifest and changelog, repeats
that gate, and attaches the versioned tarball and checksum to the matching GitHub release. Lightweight
tag `v0.3.0` now points to merge commit `3560e76`; workflow run `32057409492` published the release,
and an independent download matched the attached SHA-256 checksum
`ac5bd1f6d9bddf95c9a42f99f05f093c7875b1835ecd3ae0d5ca2385e810c36d`.

---

### Test-suite quality (HBSP-34) — Delivered 2026-09-03

#### HBSP-34: Establish a mutation-testing lane and record the first baseline — Score: 9 — ✅ COMPLETE 2026-09-03

**Priority Score:** Security Impact (1) + Breakage Probability (3) + Maintenance Burden (5) = **9 points**

**Origin:** `PORTFOLIO_CANDIDATE_PROJECTS_RESEARCH_2026-09-02.md` §4.1 (portfolio-level research,
PR #130), which identified mutation testing as the portfolio's strongest Tier A gap — no new system
under test, no Docker, no RAM — and named this project as the substrate because its mature suite and
high coverage make it the place where the claim can be tested honestly.

**Objective:** measure whether this suite's high line coverage corresponds to real assertions, and
leave a repeatable lane behind. Explicitly a **measurement** exercise: raising the score is separate,
later, owner-promoted work.

**Acceptance criteria:**
- [x] Add Stryker (Apache-2.0) as a dev dependency with a `npm run mutate` script and a committed
      `stryker.config.json`.
- [x] Configure it as **visibility only** — `thresholds.break: null` — matching the coverage stance
      established by HBSP-12; a falling score must never fail a build.
- [x] Run a full baseline and record the score alongside the coverage figure it should be read
      against.
- [x] Add a CI job that runs the lane and uploads the report as an artefact, `continue-on-error` so
      it never gates.
- [x] Leave `npm audit` at **0 vulnerabilities** — adding tooling must not regress the clean record
      established by HBSP-09.
- [x] Document what mutation testing measures, how to run it, the baseline, and how to read a
      surviving mutant. **Type:** test tooling + CI + docs.

**Status:** ✅ COMPLETE 2026-09-03. Baseline: **69.57% mutation score** (72.64% over covered code)
against **95.99% statement coverage** — 620 killed, 235 survived, 38 no-coverage, 4 timeouts,
0 errors, 5m46s. The 26-point gap is the deliverable: it retires the reading that ~96% coverage means
~96% tested. Strongest areas are the core building blocks (`scene.ts`, `ConsoleReporter.ts`,
`Ability`, `Cast`, `Interaction`, `Task`, `Expectation` all 100%; `Actor.ts` 97.14%), which is where
the strength should be. Weakest is `src/abilities/http/Send.ts` at 15.79%: its four-clause validation
guard on line 34 has full statement coverage, yet **six mutants survive on that one line** — every
clause can be inverted or removed and no test notices. `util.ts` (38.82%), the error types
(33.33%) and `ProviderConformance.ts` (66.42%, the largest single concentration at 91 survivors)
follow. Adding Stryker pulled in three transitive dev-only advisories (`nanoid` high, `qs` moderate
×2 via `typed-rest-client`); `npm audit fix` cleared the high and a narrow `qs: ^6.16.0` override
cleared the rest, so `npm audit` reports **0 vulnerabilities** and `npm audit --omit=dev` confirms
nothing ships. `npm run verify` remains green at 18 files / 128 tests. Barrel files and `src/sample/`
are excluded from mutation and that exclusion is stated in the docs, because excluding files flatters
the score.

---

### Earlier completed promoted item

#### HBSP-27: Publish a deterministic sample of the static HTML reporter to GitHub Pages — Score: 9 — ✅ COMPLETE 2026-08-04

**Priority Score:** Security Impact (1) + Breakage Probability (3) + Maintenance Burden (5) = **9 points**
**Origin:** Portfolio landing **LAND-09B** (second public-evidence slice, promoted by owner decision
2026-08-02 and made READY once LAND-09A closed 2026-08-03). Per the LAND-09 cross-repository delivery
contract, this landing item does **not** by itself authorise implementation here — this backlog entry
is that authorisation. The landing repository owns only the eventual link; this repository owns the
artefact, its generation, tests, workflow and Pages configuration.

**Objective:** Publish one maintained, illustrative, self-contained HTML page produced by the
project's existing dependency-free `HtmlReporter` / `renderHtml` so a visitor can see the reporter's
output without cloning or running anything. It demonstrates the reporter capability; it is **not** a
current CI result and **not** Serenity/JS output.

**Approved scope / decisions (do not re-litigate):**
- **Deterministic sample, in `src/`.** A pure `renderSampleReport(): string` builder drives a small
  fixed cast through a dedicated `Stage` with an **injected monotonic `now()`** (not the default
  stage's `Date.now()`), so timestamps, durations and therefore the whole document are **byte-stable**
  for unchanged input. It reuses the public `buildReport`/`renderHtml`; it does not fork the renderer.
- **Meaningful pass/fail content.** At least one passing scene with a nested task → child interactions
  and an assertion, and at least one deliberately failing scene (assertion failure), so the page shows
  a red summary, a failed scene and an error message — a genuine demonstration, not an empty run.
- **Truthful provenance banner.** The page prominently identifies itself as an *illustrative
  hand-baked reporter sample*, states it is **independent of Serenity/JS**, and does **not** imply
  current CI status. Added by the sample builder around the core report; the library's generic
  `renderHtml` output is unchanged for real users.
- **Self-contained.** One HTML document, inline CSS/JS only, **no external assets or network
  requests** (the reporter already guarantees this; the check re-asserts it).
- **Gated by `npm run verify`.** A `spec/` test proves byte-stability (render twice → identical),
  the required scene/activity content, the provenance wording and the absence of external asset
  references — so the sample is validated by the existing gate, not a bolt-on script.
- **Publish only after checks pass on `main`.** A separate `pages.yml` workflow runs on `push` to
  `main`, runs `npm ci` + `npm run verify` (library + reporter + sample checks) and then generates
  the report and deploys it. Praise-worthy least privilege: `pages: write` / `id-token: write` live
  on the deploy job only; pull-request runs stay read-only and deploy nothing. A failed run must not
  replace the last good public page.
- **No new runtime dependencies.** The generator script runs on plain Node against built `dist/`
  (no `tsx`/ts-node added); the sample module is typechecked, built and tested like the rest of `src/`.

**Acceptance criteria:**
- [x] Pure `renderSampleReport()` in `src/`, byte-stable, exercised by a `spec/` test that also
      asserts the provenance banner, the "independent of Serenity/JS" statement, the expected scene
      names, at least one pass and one fail, and no external `http(s)://`/`src=`/`href=` asset refs.
      **`src/sample/sampleReport.ts` (not in the public barrel) + `spec/sample-report.spec.ts`;
      `npm run verify` green at 109 tests. Locally byte-identical across regenerations.**
- [x] A generator script writes the self-contained document to `report/index.html` from built `dist/`.
      **`scripts/generate-sample-report.mjs` (plain Node, no new dep) + `npm run report:sample`;
      wrote 6504 bytes, 0 external refs. `report/` is gitignored (produced in CI).**
- [x] `pages.yml` deploys that page on `push` to `main` after `npm run verify` passes, with deploy-only
      Pages permissions and no deployment on pull requests. **`.github/workflows/pages.yml`: `build`
      runs verify + generate + upload; `deploy` job alone holds `pages: write`/`id-token: write`;
      triggers are `push`/`workflow_dispatch` only.**
- [x] Repository Pages configured for GitHub Actions publication; the canonical public URL documented
      in README with the snapshot/illustrative wording and the Serenity/JS independence statement.
      **Pages enabled (source = GitHub Actions); README documents
      <https://neocognitus70.github.io/hand-baked-screenplay-pattern/> with the illustrative/independent
      wording.**
- [x] The public URL returns HTTP 200, is self-contained and renders with no console errors at desktop
      and 390px; a separate landing PR then adds the truthful `report` action and records the evidence.
      **Verified 2026-08-04:** PRs #42 (`be03329`) + #43 (`ae33a66`) merged; Pages
      [run 30863382627](https://github.com/NeoCognitus70/hand-baked-screenplay-pattern/actions/runs/30863382627)
      green; the public URL returns HTTP 200 serving the banner + three scenes (2 pass / 1 fail),
      self-contained with no console errors. The landing "Sample report" action was added and verified
      live via portfolio landing PR [#23](https://github.com/GBrooks1970/portfolio/pull/23) (`d94787b`),
      closing landing **LAND-09B**.

**Type:** code + CI + docs. **✅ COMPLETE 2026-08-04.**

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
(PR #9), `-2` (PR #10), `-3` (PR #11), `-4` (PR #12), and `-5` (HBSP-07/08, PR #13). All merged.
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

### Review-derived cycle (HBSP-09..14) — Resolved 2026-06-17

A first code review (`.review/CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1543Z/`, identity
CLAUDE_Opus_4_8) on 2026-06-16 raised one security item plus four Low-severity correctness/hygiene
risks and a handful of next-step recommendations. These were derived into worklist items
HBSP-09..14 and all delivered across PRs #15–#17 (merged 2026-06-17). All gated green on
`npm run verify`. Recorded here as the durable record; statuses are authoritative.

#### Item #2: Dependabot "1 high" / npm-audit advisories in the dev test toolchain — Score: 18 — ✅ RESOLVED

**Priority Score:** Security Impact (8) + Breakage Probability (6) + Maintenance Burden (4) = **18 points**
**Impact:** `npm audit` on `main` reported 1 critical + 2 high + 2 moderate advisories, all from
`esbuild` (RCE GHSA-gv7w-rqvm-qjhr, CVSS 8.1) pulled transitively via `vite` / `@vitest/mocker`
under `vitest@^2`. Dev-only (no runtime dependency affected), but it lit up the default branch.
**Status:** ✅ RESOLVED 2026-06-17 (HBSP-09, commit `9f9bc21`, PR #15). Bumped `vitest@^2.1.0`→
`^4.1.9` (a **major, dev-only** bump — user-approved default); the Vitest config needed no
migration. `npm audit` now reports **0 vulnerabilities** (verified again 2026-06-22 on `main`
`120a631`). CHANGELOG Security entry added.
**Affected Stacks:** TypeScript dev toolchain (`package.json` devDependencies).
**Note:** any lingering Dependabot "1 high" alert on the default branch is re-scan lag — the local
`npm audit` is 0 since the bump; not a real vulnerability.

#### Item #3: Node version story inconsistent across README / package.json / CI — Score: 8 — ✅ RESOLVED

**Priority Score:** Security Impact (1) + Breakage Probability (4) + Maintenance Burden (3) = **8 points**
**Impact:** README claimed "Node.js 18+" while CI tested `[20, 22]` and `package.json` declared no
`engines` floor — three sources, no single agreed floor; Node 18 is EOL (2025-04-30).
**Status:** ✅ RESOLVED 2026-06-17 (HBSP-10, commit `7201f8e`, PR #15). README → "Node.js 20+",
added `"engines": { "node": ">=20" }`, CI matrix left at `[20, 22]` — all three now agree on floor
20 (user-approved default). Remaining "18+" strings live only in `.review/` historical artefacts
(they correctly describe the pre-fix state and were intentionally not edited).
**Affected Stacks:** docs + config (no source change).

#### Item #4: ReportModel could render negative durations / mis-pick run start — Score: 6 — ✅ RESOLVED

**Priority Score:** Security Impact (0) + Breakage Probability (4) + Maintenance Burden (2) = **6 points**
**Impact:** A non-monotonic clock could produce negative durations; a stray pre-scene event could
back-date the run start.
**Status:** ✅ RESOLVED 2026-06-17 (HBSP-11, commit `cf56332`, PR #16). Floored every activity /
scene / run duration at `Math.max(0, …)`; run `startedAt` now prefers the first `scene:starts`
timestamp, falling back to `events[0]` only when no scene started. Added a non-monotonic-clock spec
and updated the orphan-events test to match the corrected semantics. Test count 47 → 48.
**Affected Stacks:** `src/reporting/ReportModel.ts` + `spec/`.

#### Item #5: HtmlReporter's real node:fs writer branch was untested; no coverage script — Score: 6 — ✅ RESOLVED

**Priority Score:** Security Impact (0) + Breakage Probability (3) + Maintenance Burden (3) = **6 points**
**Impact:** Every reporting spec stubbed the writer, so the default `node:fs` writer branch — the
only filesystem path — was never exercised; there was also no way to see coverage.
**Status:** ✅ RESOLVED 2026-06-17 (HBSP-12, commit `2e993e7`, PR #16). Added
`spec/html-reporter-fs.spec.ts` driving the real `fileSystemWriter` to `os.tmpdir()` (asserts a
real `index.html` containing `<!DOCTYPE html>`, exercises nested-dir creation, cleans up); added a
`coverage` script (`vitest run --coverage` via `@vitest/coverage-v8@^4.1.9`, matching the Vitest 4
major) surfaced informationally in CI on Node 20 with **no hard gate** (per the review). Coverage
**as of 2026-06-17** = 90.16% stmts / 84.49% branch / 94.11% funcs / 90.32% lines. Test count
48 → 50. See Item #16 below for the current figures — coverage numbers are now restated
"as of `<date>`" rather than claimed evergreen, since the suite and the code it covers both grow.
**Affected Stacks:** `spec/` + `package.json` + CI.

#### Item #6: No public-API surface canary; an accidental export change would surface only in the sibling consumer — Score: 5 — ✅ RESOLVED

**Priority Score:** Security Impact (0) + Breakage Probability (3) + Maintenance Burden (2) = **5 points**
**Impact:** The sibling `calculator-screenplay-bdd` consumes this library via a `file:../`
dependency; an accidental rename/removal of a public export would fail in the *sibling's* build,
not here.
**Status:** ✅ RESOLVED 2026-06-17 (HBSP-13, commit `90a60d3`, PR #17). Added
`spec/public-api.spec.ts` importing the package root (`../src/index.js`) and asserting every
consumed symbol is defined (`Ability`, `Cast`, `Ensure`, `Interaction`, `LastResponse`,
`MakeRequests`, `ManageData`, `Question`, `Stage`, `Task`, `equals`, `includes`, plus the reporting
/ expectation additions `ConsoleReporter`, `HtmlReporter`, `buildReport`, `renderHtml`, `scene`,
…), with a count floor that catches accidental removals while staying additive-friendly. Test count
50 → 81 (31 new parametrised cases).
**Affected Stacks:** `spec/` (test only).

#### Item #7: Documentation/comment drift — ConsoleReporter scope + stale backlog narrative — Score: 4 — ✅ RESOLVED

**Priority Score:** Security Impact (0) + Breakage Probability (1) + Maintenance Burden (3) = **4 points**
**Impact:** `ConsoleReporter` silently handles only `activity:*` events (no scene boundaries),
which a reader could mistake for a bug; and the Item #1 narrative above still said the `-5` PR was
"awaiting user review" after it had merged.
**Status:** ✅ RESOLVED 2026-06-17 (HBSP-14, commit `6a463cd`, PR #17). Added a JSDoc note to
`src/crew/ConsoleReporter.ts` documenting that it intentionally ignores `scene:*` /
`test-run:finishes` (run framing is the `HtmlReporter`'s job); corrected the stale Item #1 line (the
RESOLVED status was already right — only the narrative predated the merge). No behaviour change.
**Affected Stacks:** docs / comment only.

---

### Second review-derived cycle (HBSP-15..22) — Resolved 2026-07-07

A second code review (`.review/CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1044Z/`, identity
CLAUDE_Fable_5) on 2026-07-06 raised one MEDIUM process risk, two low-medium/low correctness fixes,
three low hygiene items, and one informational item — **no HIGH findings**. Derived into worklist
items HBSP-15..22 and delivered across PRs #19–#25 (merged 2026-07-07), plus one ops action.
All gated green on `npm run verify`. Release **0.2.0** metadata was cut (HBSP-21); the actual
`v0.2.0` tag and GitHub release followed on 2026-07-27 under **CGX-01** (see Item #14). Statuses
authoritative.

#### Item #8: Backlog v4 reconciliation was uncommitted — committed `main` was a full cycle stale — Score: 12 — ✅ RESOLVED

**Priority Score:** Security Impact (2) + Breakage Probability (4) + Maintenance Burden (6) = **12 points**
**Impact:** The v4 reconciliation (recording the whole HBSP-09..14 cycle) existed only as an
uncommitted working-tree edit; committed `main` still carried v3, so anyone cloning the repo saw a
source of truth a full cycle behind reality.
**Status:** ✅ RESOLVED 2026-07-07 (HBSP-15, commit `94a99e8`, PR #19). v4 content committed
unchanged via a separate docs-only PR (review PR #18 stayed artefacts-only). Review Risk 1 (MEDIUM).
**Affected Stacks:** docs (`docs/backlog.md`).

#### Item #9: buildReport rendered a never-finished scene as passed (false green) — Score: 9 — ✅ RESOLVED

**Priority Score:** Security Impact (0) + Breakage Probability (5) + Maintenance Burden (4) = **9 points**
**Impact:** A scene's outcome was initialised to `successful()` on `scene:starts` and only replaced
on `scene:finishes`, so a run that crashed mid-scene rendered the interrupted scene as **passed
(0ms)** — a false green in exactly the degraded case the builder documents surviving.
**Status:** ✅ RESOLVED 2026-07-07 (HBSP-16, commit `92efde3`, PR #20). A scene still open when the
fold ends is now reported as failed (interrupted error naming the scene), excluded from `succeeded`,
duration run to end-of-fold and floored ≥ 0. +2 specs. Review Risk 2 (LOW-MEDIUM).
**Affected Stacks:** `src/reporting/ReportModel.ts` + `spec/`.

#### Item #10: HtmlReporter double-counted scenes across runs — Score: 5 — ✅ RESOLVED

**Priority Score:** Security Impact (0) + Breakage Probability (3) + Maintenance Burden (2) = **5 points**
**Impact:** The event buffer was push-only, so a reporter observing two runs rendered the first
run's scenes again inside the second report (wrong output, no crash).
**Status:** ✅ RESOLVED 2026-07-07 (HBSP-17, commit `a30873b`, PR #21). Buffer cleared after a
successful write (kept on a failed write, so a transient I/O error loses nothing). +1 two-runs spec;
README per-run note added. Review Risk 3 (LOW).
**Affected Stacks:** `src/crew/HtmlReporter.ts` + `spec/` + README.

#### Item #11: npm publish path unguarded (could ship a missing/stale dist) — Score: 5 — ✅ RESOLVED

**Priority Score:** Security Impact (1) + Breakage Probability (2) + Maintenance Burden (2) = **5 points**
**Impact:** The manifest ships `dist/` (git-ignored) with no publish lifecycle hook — `npm publish`
from a clean clone could ship a missing or stale build.
**Status:** ✅ RESOLVED 2026-07-07 (HBSP-18, commit `b47c513`, PR #22). Added
`"prepublishOnly": "npm run verify"`; README Versioning note. Chose `prepublishOnly` over
`"private": true` since the manifest advertises publishability. Review Risk 4 (LOW).
**Affected Stacks:** `package.json` + README.

#### Item #12: CI actions behind the portfolio baseline; vitest patch drift — Score: 4 — ✅ RESOLVED

**Priority Score:** Security Impact (0) + Breakage Probability (2) + Maintenance Burden (2) = **4 points**
**Impact:** `ci.yml` pinned `checkout@v4` / `setup-node@v4` (portfolio baseline is v5, ahead of the
Actions Node-24 runtime cutover); `vitest` had drifted a patch behind.
**Status:** ✅ RESOLVED 2026-07-07 (HBSP-19, commit `bc43ccd`, PR #23). `checkout@v5`,
`setup-node@v5`, matrix `[20, 22, 24]`, `vitest` / `@vitest/coverage-v8` → `^4.1.10`; all three
matrix cells green; `npm audit` 0. Review Risk 5 (LOW) + Risk 7 patch-drift. Precedent: sudoku SUD-08.
**Affected Stacks:** `.github/workflows/ci.yml` + `package.json`.

#### Item #13: Code/test hygiene — redundant Actor.answer branch; leaky test teardowns — Score: 3 — ✅ RESOLVED

**Priority Score:** Security Impact (0) + Breakage Probability (1) + Maintenance Burden (2) = **3 points**
**Impact:** `Actor.answer` had two identical `return answerable` arms behind a no-op `isPromise`
check; `stage-and-cast.spec.ts` reset the default stage inline, so a failing assertion leaked
default-stage state into later tests.
**Status:** ✅ RESOLVED 2026-07-07 (HBSP-20, commit `fce5c0e`, PR #24). Branch + unused import
removed; teardowns moved to `afterEach`. No behaviour change (81 tests unchanged on that branch).
Review Recommendations (LOW).
**Affected Stacks:** `src/screenplay/Actor.ts` + `spec/`.

#### Item #14: CHANGELOG had duplicate Added headings; 0.2.0 release overdue — Score: 3 — ✅ RESOLVED

**Priority Score:** Security Impact (0) + Breakage Probability (0) + Maintenance Burden (3) = **3 points**
**Impact:** `[Unreleased]` carried two `### Added` headings (Keep-a-Changelog / MD024 break) and a
whole feature stream while 0.1.0 was the only release.
**Status:** ✅ RESOLVED 2026-07-07 (HBSP-21, commit `cdd7b90`, PR #25). Cut `## [0.2.0]` (one
heading per change type, Keep-a-Changelog order); compare links updated; `package.json` → `0.2.0`.
Review Risk 6 (LOW). **Release completed 2026-07-27 (CGX-01):** HBSP-21 prepared only the version
*metadata*; the fourth review (Codex GPT-5 v1) found no `v0.2.0` tag or GitHub release existed
(its Risk 1, MEDIUM). CGX-01 created the lightweight `v0.2.0` tag at `8ecd282` (the PR #25 merge —
the 0.2.0 state, dated 2026-07-07) and published the GitHub release from it; no npm publish (matches
the v0.1.0 precedent). See `docs/releasing.md` for the checklist that keeps release metadata and the
release record aligned.
**Affected Stacks:** `CHANGELOG.md` + `package.json`.

#### Item #15: Two stale Dependabot `vite` alerts on the default branch — Score: 2 — ✅ RESOLVED

**Priority Score:** Security Impact (1) + Breakage Probability (0) + Maintenance Burden (1) = **2 points**
**Impact:** The default branch showed 2 open Dependabot alerts (#2 high, #3 medium, both `vite`,
range `<= 6.4.2`) while the committed lockfile resolves `vite@8.0.16` and `npm audit` = 0 — re-scan
lag, not live vulnerabilities, but a red badge on a portfolio repo.
**Status:** ✅ RESOLVED 2026-07-07 (HBSP-22, ops — no repo change). Verified `vite@8.0.16` in the
committed lockfile and `npm audit` 0 **before** acting; dismissed both via `gh api PATCH`
(`dismissed_reason=inaccurate`) with an evidence comment. **0 open Dependabot alerts.** Review Risk 7
(informational).
**Affected Stacks:** none (GitHub security tab only).

### Third review-derived cycle (review v2, TRIAGE-01..05) — Resolved 2026-07-19

Code review v2 (`.review/CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0032Z/`) found no HIGH/MEDIUM
findings — five Low/Low-Medium items, triaged into `WORKLIST_hand-baked-screenplay-pattern.md`
TRIAGE-01..05 (portfolio root) and executed one item per `loop-worklist` iteration, each on its
own branch off fresh `main` with a green PR (#28–#32). TRIAGE-04 landed first in this backlog as
Item #16; Items #17–#20 below record TRIAGE-01, #02, #03, and #05, reconciled in the same pass
that closed out the cycle (this session, after all five PRs merged).

#### Item #16: `ConsoleReporter` had 0% test coverage; Item #5's coverage numbers had drifted — Score: n/a (review Low) — ✅ RESOLVED

**Impact:** `ConsoleReporter.ts` — the library's original, README-advertised crew member — had no
spec at all despite an injectable `log` sink built for exactly that; the three log formats and the
intentionally-ignored scene/run event types were unpinned. Separately, Item #5's coverage numbers
(90.16%/84.49%) no longer reproduced — later cycles (HBSP-16/17, TRIAGE-03) changed the
denominator without restating them.
**Status:** ✅ RESOLVED 2026-07-19 (TRIAGE-04). Added `spec/console-reporter.spec.ts`: asserts the
three formatted log lines (`begins:`/`done:`/`fails:`), that `scene:starts`/`scene:finishes`/
`test-run:finishes` produce no output (the documented scope boundary), and that the constructor
defaults its sink to `console.log`. Test count 85 → 88.
**Coverage as of 2026-07-19** = **92.85% stmts / 82.96% branch / 95.04% funcs / 93.15% lines**
(`npm run coverage`; `src/crew/` — `ConsoleReporter.ts` and `HtmlReporter.ts` — now both fully
covered, absent from the report's per-file detail rows). Branch % moved down from 84.49% despite
the new spec because a growing suite widens the denominator faster than any one file's coverage
narrows it — a normal effect of the overall codebase growing, not a regression in this file.
Re-run `npm run coverage` for the live numbers next time this note is touched, rather than trusting
this one indefinitely.
**Affected Stacks:** `spec/` + `docs/backlog.md`.

#### Item #17: Pedagogical guides still taught the pre-0.2.0 model, and called the shipped `HtmlReporter` "planned" — Score: 9 — ✅ RESOLVED

**Priority Score:** Security Impact (0) + Breakage Probability (4) + Maintenance Burden (5) = **9 points**
**Impact:** `docs/03-event-notification-layer.md` presented the `DomainEvent` union as three
activity-only variants with no `timestamp` and said "There are no scene/run events yet";
`docs/01-screenplay-flow.md` called the reporter "planned". Both had shipped 2026-07-07 (0.2.0). A
reader following the guides was told the library's headline feature did not exist, and the guide's
code snippet no longer compiled against the library it documented.
**Status:** ✅ RESOLVED 2026-07-19 (TRIAGE-01, commit `9b00eec`, PR #28). Both guides now show the
real six-variant `DomainEventInput`/`DomainEvent` split and the `Stage.announce` timestamp-stamping
step, and point at the shipped `HtmlReporter`. `planning/static-html-reporting.md`'s status header
flipped from "Ready to implement" to "Delivered 2026-06-13 (backlog Item #1) — retained as a
worked example"; the plan body itself is untouched. Review Risk 1 (LOW-MEDIUM).
**Affected Stacks:** docs (`docs/03-event-notification-layer.md`, `docs/01-screenplay-flow.md`,
`planning/static-html-reporting.md`).

#### Item #18: README hardcoded "the current version is 0.1.0" though HBSP-21 had cut 0.2.0 — Score: 4 — ✅ RESOLVED

**Priority Score:** Security Impact (0) + Breakage Probability (1) + Maintenance Burden (3) = **4 points**
**Impact:** The Versioning section's one sentence whose only job is to state the version was wrong
by a full minor release — a small but visible credibility nick, and the exact drift class the
portfolio's reviews keep flagging.
**Status:** ✅ RESOLVED 2026-07-19 (TRIAGE-02, commit `e6cfe27`, PR #29). Replaced the literal with
a pointer to `package.json`/`CHANGELOG.md`, so it cannot rot again. Review Risk 2 (LOW).
**Affected Stacks:** docs (`README.md`).

#### Item #19: `buildReport` crash truth stopped at scene level — an interrupted activity still rendered as passed — Score: 7 — ✅ RESOLVED

**Priority Score:** Security Impact (0) + Breakage Probability (4) + Maintenance Burden (3) = **7 points**
**Impact:** HBSP-16 fixed the false-green *scene*, but an activity still open when its scene closed
kept its optimistic `successful()`/`0ms` placeholder — a report could show a green tick for the very
step executing when a run died, nested under a scene the same report marked failed. Separately, the
crash-truth correction only ever considered a single `currentScene`: a second `scene:starts`
arriving while an earlier one was still open (the manual `sceneStarts`/`sceneFinishes` facade the
README documents for runner hooks) left the earlier scene abandoned at its placeholder, silently
counted as passed.
**Status:** ✅ RESOLVED 2026-07-19 (TRIAGE-03, commit `bc4ff2d`, PR #30). Added
`interruptOpenActivities`/`interruptScene` helpers, wired into all three places a scene can close
(`scene:finishes`, end-of-fold, a superseding `scene:starts`). Extended the crash-truth spec with
activity-level assertions and added a new spec pinning the overlapping-scenes semantics. Test count
84 → 85. Review Risk 3 (LOW).
**Affected Stacks:** `src/reporting/ReportModel.ts` + `spec/`.

#### Item #20: Dead code — `isPromise` in `src/util.ts` had no callers — Score: 3 — ✅ RESOLVED

**Priority Score:** Security Impact (0) + Breakage Probability (0) + Maintenance Burden (3) = **3 points**
**Impact:** HBSP-20 removed the redundant promise branch in `Actor.answer` (and its `isPromise`
import) but left the helper itself behind — pure maintenance noise, no behavioural risk.
**Status:** ✅ RESOLVED 2026-07-19 (TRIAGE-05, commit `fa18823`, PR #32). Deleted the helper and its
JSDoc; `grep -rn "isPromise" src spec` confirmed zero callers before removal, `util.ts` is internal
(not exported from `src/index.ts`), so removal cannot affect the public API or the sibling
`calculator-screenplay-bdd` consumer. Review Risk 5 (LOW).
**Affected Stacks:** `src/util.ts`.

### Fourth review-derived cycle (Codex GPT-5 v1, CGX-01..06) — Resolved 2026-07-27

The fourth code review (`.review/CODE_REVIEW_CODEX_GPT5_v1_20260723T2337Z/`, identity CODEX_GPT5)
on 2026-07-23 raised **two MEDIUM** findings (the first MEDIUMs ever against this project) plus one
LOW-MEDIUM and three LOW, and one informational item. Triaged into
`WORKLIST_hand-baked-screenplay-pattern.md` as CGX-01..06 and executed one item per `loop-worklist`
iteration, each on its own branch off `main` with a green PR (#35–#40, all merged 2026-07-27).
Risk 7 (informational — clean `npm audit`, licence intact) was dropped to routine maintenance per
the review's own steer; the recorded crew-isolation question was not promoted to a finding.

#### Item #21: Release truth — 0.2.0 was "cut" in metadata but no tag/release existed — Score: 14 — ✅ RESOLVED

**Priority Score:** Security Impact (2) + Breakage Probability (5) + Maintenance Burden (7) = **14 points**
**Impact:** The backlog declared 0.2.0 cut and current, and `package.json`/`CHANGELOG.md` carried
0.2.0, but no `v0.2.0` Git tag existed locally or on the remote and GitHub's latest release was
still `v0.1.0` — the repo had 0.2.0 *source metadata*, not a verifiable release, and the changelog
`compare/v0.1.0...v0.2.0` link was unresolved.
**Status:** ✅ RESOLVED 2026-07-27 (CGX-01, docs commit `1bb226b`, PR #35). Created the lightweight
`v0.2.0` tag at `8ecd282` (the PR #25 merge — the 0.2.0 state, dated 2026-07-07) and published the
GitHub release from it (now Latest); **no npm publish** (matches the v0.1.0 stance). Corrected the
Item #14 wording (metadata cut by HBSP-21 vs release made under CGX-01); added a
`CHANGELOG.md [Unreleased]` note for TRIAGE-03; added `docs/releasing.md` (a release-verification
checklist). Review Risk 1 (**MEDIUM**). Decision: GitHub tag + release only.
**Affected Stacks:** ops (Git tag + GitHub release) + docs (`docs/backlog.md`, `CHANGELOG.md`,
`docs/releasing.md`).

#### Item #22: `Cast.whereEveryoneCan` shares mutable ability instances across actors — Score: 13 — ✅ RESOLVED

**Priority Score:** Security Impact (3) + Breakage Probability (5) + Maintenance Burden (5) = **13 points**
**Impact:** `whereEveryoneCan(...abilities)` granted the *same* ability instances to every actor, so
two actors on one stage shared mutable state — `ManageData`'s store and `MakeRequests`'s last
response leaked across actor identities — despite the actor-centric API implying isolation.
**Status:** ✅ RESOLVED 2026-07-27 (CGX-02, commit `49010af`, PR #36). Added
`Cast.whereEachActorCan(() => Ability[])`, which builds fresh instances per prepared actor;
`whereEveryoneCan` unchanged (decision: keep the default, additive fix), its JSDoc now documents the
sharing. Two-actor isolation spec covers both `ManageData` and `MakeRequests.lastResponse`; README +
Guide 01 disclose the sharing. Additive-only — no export changed (public-api canary green), so the
`calculator-screenplay-bdd` consumer is unaffected. 88 → 91 tests. Review Risk 2 (**MEDIUM**).
**Affected Stacks:** `src/screenplay/Cast.ts` + `spec/` + README + `docs/01-screenplay-flow.md`.

#### Item #23: Falsy thrown values produced a passing scene — Score: 9 — ✅ RESOLVED

**Priority Score:** Security Impact (0) + Breakage Probability (5) + Maintenance Burden (4) = **9 points**
**Impact:** `Outcome.from` treated every falsy value as success (`if (!error)`), and `scene()` fed
caught values straight in, so `throw false/0/''/null/undefined` rendered as a **passing** scene even
though `scene()` re-threw them — a false green contradicting the runner.
**Status:** ✅ RESOLVED 2026-07-27 (CGX-03, commit `b829403`, PR #37). Added the total
`Outcome.fromError(error: unknown)` (every value → failure, non-`Error` wrapped, `AssertionError`
preserved); `scene()`'s catch uses it; `Outcome.from` unchanged for the absence-of-error=success
intent and now delegates to `fromError`. Table-driven `outcome.spec` + an end-to-end assertion that
`throw false` renders 1 failed / 0 passed. 91 → 99 tests (via this branch's base). Review Risk 3
(LOW-MEDIUM).
**Affected Stacks:** `src/screenplay/Outcome.ts` + `src/scene/scene.ts` + `spec/`.

#### Item #24: Scene-level failures rendered no error details — Score: 6 — ✅ RESOLVED

**Priority Score:** Security Impact (0) + Breakage Probability (3) + Maintenance Burden (3) = **6 points**
**Impact:** `renderScene` rendered only a status pill, so a scene that failed before/outside
`attemptsTo` (setup, a hook, orchestration) produced a red scene with no actionable cause — the
README promised "error details for failures" without that qualification.
**Status:** ✅ RESOLVED 2026-07-27 (CGX-04, commit `a01b666`, PR #38). Generalised `renderError` to a
scene/activity `Outcome`; `renderScene` renders the scene's own error block when it failed,
suppressed only when a nested activity already shows the identical error (no duplicate noise). New
specs: a no-activities failing scene renders its escaped message + stack; a matching scene/activity
error renders once. Review Risk 4 (LOW).
**Affected Stacks:** `src/reporting/renderHtml.ts` + `spec/`.

#### Item #25: A zero-scene run was labelled "All scenes passed" — Score: 5 — ✅ RESOLVED

**Priority Score:** Security Impact (0) + Breakage Probability (3) + Maintenance Burden (2) = **5 points**
**Impact:** The renderer defined a passed run solely as `failed === 0`, so an empty or terminal-only
event stream produced a green "All scenes passed" summary despite recording no test evidence — a
misconfigured runner that executed nothing looked successful.
**Status:** ✅ RESOLVED 2026-07-27 (CGX-05, commit `163c721`, PR #39). `RunReport` gains an explicit
`status: 'passed' | 'failed' | 'empty'` (new `RunStatus` type); `buildReport` sets `'empty'` for a
zero-scene run; `renderHtml` renders a neutral "No scenes recorded" band (amber, visibly not green).
Model + reporter + renderer specs cover the terminal-only and empty streams. `RunStatus`/`status`
are type-only additions (no runtime export change; canary green). → 104 tests. Decision: neutral
state. Review Risk 5 (LOW).
**Affected Stacks:** `src/reporting/ReportModel.ts` + `src/reporting/renderHtml.ts` + `spec/`.

#### Item #26: Guide 03 TimingReporter example was unsafe for concurrent actors — Score: 3 — ✅ RESOLVED

**Priority Score:** Security Impact (0) + Breakage Probability (0) + Maintenance Burden (3) = **3 points**
**Impact:** The teaching `TimingReporter` in `docs/03-event-notification-layer.md` used one global
LIFO stack popped for any actor and timed with fresh `Date.now()` calls, so interleaved actors
mispaired start/finish times — contradicting the same guide's §6, which explains a reporter needs a
stack per actor.
**Status:** ✅ RESOLVED 2026-07-27 (CGX-06, commit `5db3058`, PR #40). Keyed the start-time stack by
`event.actor` (`Map<string, number[]>`), timing from the stamped `event.timestamp` not `Date.now()`;
added an interleaved Ada/Bob trace cross-referencing §6. Docs-only. Review Risk 6 (LOW).
**Affected Stacks:** `docs/03-event-notification-layer.md`.

---

## Risk Summary

| Priority | Count | Total Effort | Status Distribution |
|---|---|---|---|
| HIGH (20–30) | 0 | — | — |
| MEDIUM (10–19) | 0 | — | — |
| LOW (0–9) | 0 | — | — |
| **Total Outstanding** | **0** | **—** | **Provider-first sequence complete** |
| Resolved | 34 | — | Item #1 (2026-06-13); Items #2–#7 / HBSP-09..14 (2026-06-17); Items #8–#15 / HBSP-15..22 (2026-07-07); Items #16–#20 / TRIAGE-01..05 (2026-07-19); Items #21–#26 / CGX-01..06 (2026-07-27); HBSP-27 (2026-08-04); HBSP-28..33 (2026-08-17); HBSP-34 (2026-09-03) |

---

## Potential Next Steps

### HIGH Priority

None. **Static HTML reporting** (Item #1) and all four review-derived cycles (Items #2–#7 /
HBSP-09..14, Items #8–#15 / HBSP-15..22, Items #16–#20 / TRIAGE-01..05, Items #21–#26 / CGX-01..06)
are Resolved. The fourth review (Codex GPT-5 v1) raised the project's first **MEDIUM** findings
(Items #21–#22), both now closed. No provider-first item scores HIGH; execute the promoted MEDIUM
sequence below before opening later portfolio phases.

### MEDIUM Priority

None. HBSP-28..33 are complete. Do not start Calculator Phase 2 from this backlog; promote the
consumer-side pilot in `calculator-screenplay-bdd` only by explicit owner decision.

### LOW Priority

None promoted. Optional Serenity parity, Cypress integration, cross-language vectors and consumer
migrations remain deliberately unpromoted; the portfolio viability assessment is evidence, not
authorisation outside HBSP-28..33.

**Available but unpromoted — mutation-score remediation.** HBSP-34 recorded 235 surviving mutants
(see [`docs/mutation-testing.md`](./mutation-testing.md)). Closing them is *not* scheduled and needs
an explicit owner decision, because chasing a mutation score produces tests that assert
implementation detail unless it is done selectively. If it is ever promoted, the defensible order is
by concentration and by value: `src/abilities/http/Send.ts` first (15.79%, the clearest genuine gap —
a validation guard with six survivors on one line), then `util.ts` (38.82%), then a judgement call on
`ProviderConformance.ts` (91 survivors, but much of that surface is deliberately permissive). Do not
raise `thresholds.break` until a score has held steady across several cycles.

---

## Maintenance Notes

- Include links/paths to affected files when adding new items.
- Update the version number at the top when items change status.
- Cross-reference code review findings in `.review/` once a review exists.
- Mark completion dates when items move to ✅ Resolved.
- Update effort estimates with actuals after completion.
