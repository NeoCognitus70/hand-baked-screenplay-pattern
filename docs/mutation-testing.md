# Mutation testing

Coverage tells you a line **ran**. It does not tell you the line is **tested** — a line can execute
during a test that would pass whether or not the line behaved correctly. Mutation testing closes
that gap: it deliberately changes the source (a *mutant*), re-runs the suite, and asks whether any
test noticed. A mutant that no test catches is a **survivor**, and every survivor marks a behaviour
the suite does not actually pin down.

This project uses [Stryker](https://stryker-mutator.io/) (Apache-2.0), configured in
[`stryker.config.json`](../stryker.config.json).

```bash
npm run mutate
```

The run takes roughly six minutes on a normal laptop and writes a browsable report to
`reports/mutation/index.html` plus a machine-readable `reports/mutation/mutation.json`. Both are
gitignored; CI uploads them as a build artefact.

## The stance: visibility, not a gate

`thresholds.break` is `null`, and the CI step is `continue-on-error`. **A falling mutation score
reports but never fails the build.** This deliberately mirrors the stance the coverage config takes
(HBSP-12): the number is there to be looked at, not to be gamed or to block unrelated work.

Raising `thresholds.break` to a real value is a decision to take **later and on purpose**, once the
score has been stable across a few cycles. Setting a gate on the first measurement would only invite
tests written to kill mutants rather than to express behaviour.

## Baseline — 2026-09-03

Measured on `main` at the v0.3.0 line, 18 spec files / 128 tests.

| Metric | Value |
|---|---|
| Statement coverage | **95.99%** |
| Branch coverage | 88.57% |
| **Mutation score (total)** | **69.57%** |
| Mutation score (covered code only) | 72.64% |
| Mutants killed | 620 |
| Mutants survived | 235 |
| Mutants with no coverage | 38 |
| Errors / timeouts | 0 / 4 |

**The headline is the 26-point gap between 95.99% statement coverage and a 69.57% mutation score.**
That gap is the honest measure of how much of this suite is *observation* rather than *assertion*.
The number is not a failure — a first mutation score near 70% on a suite never written with mutation
testing in mind is unremarkable — but it does retire the idea that ~96% coverage means ~96% tested.

### Where the suite is strong

| Area | Score |
|---|---|
| `scene.ts` | 100.00% |
| `ConsoleReporter.ts` | 100.00% |
| `Ability.ts`, `Cast.ts`, `Interaction.ts`, `Task.ts`, `Expectation.ts` | 100.00% |
| `Actor.ts` | 97.14% |
| `Outcome.ts` | 93.75% |
| `screenplay/` overall | 90.00% |

The core Screenplay building blocks — the part of the library a user actually composes against — are
genuinely well tested. That is the right place for the strength to be.

### Where it is weak

| Area | Score | Reading |
|---|---|---|
| `Send.ts` | **15.79%** | Validation guards execute but are never asserted |
| `util.ts` | 38.82% | Deep-equality and helper edge cases under-specified |
| `abilities/http` | 38.89% | HTTP ability behaviour largely observed, not pinned |
| `ConfigurationError.ts`, `LogicError.ts` | 33.33% | Error types constructed but their shape unasserted |
| `renderHtml.ts` | 57.02% | Large surface; output asserted loosely |
| `ProviderConformance.ts` | 66.42% | 91 survivors — the largest single concentration |

### A worked example

`src/abilities/http/Send.ts:34` is a four-clause guard:

```ts
if (request && typeof request === 'object' && 'method' in request && /* … */) {
```

Stryker mutates each clause independently — inverting the conditional, swapping `&&` for `||`,
forcing the condition true or false. **Fourteen mutants survive on this file, six of them on this
single line.** Every clause of the guard can be broken and the suite still passes.

The line has full statement coverage. It runs in several tests. But nothing asserts what happens when
`request` is malformed, so the guard is, in testing terms, decoration. That is precisely the class of
defect coverage cannot see and mutation testing finds immediately.

## What is mutated

```jsonc
"mutate": [
  "src/**/*.ts",
  "!src/**/index.ts",   // barrel re-exports: no logic to mutate
  "!src/sample/**"      // fixture data for the sample report, not behaviour
]
```

Both exclusions are stated here rather than left implicit, because excluding files **flatters the
score**. They are narrow and defensible — barrels contain only re-exports, and `src/sample/` is
fixture data whose "correctness" is not a behavioural claim — but a reader should know the number is
not computed over literally every file under `src/`.

## Interpreting a survivor

A survivor is not automatically a bug, and "kill every mutant" is not the goal. Three outcomes are
all legitimate:

1. **The survivor exposes a missing assertion** — add the assertion. This is the common and valuable
   case, and the `Send.ts` guard above is a clear example.
2. **The survivor is equivalent** — the mutation produces behaviour indistinguishable from the
   original, so no test could ever catch it. Nothing to do.
3. **The behaviour is deliberately unspecified** — the code tolerates a case the library makes no
   promise about. Leave it, and prefer documenting the non-promise over inventing a test.

Chasing the score for its own sake produces tests that assert implementation detail and make
refactoring harder. The score is a diagnostic, not a target.
