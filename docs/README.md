# Documentation

Pedagogical guides that explain the **hand-baked Screenplay Pattern** in more
depth than the project `README`. These are learning-oriented: they favour
worked examples, diagrams, and "why", over exhaustive API reference.

> These documents describe *this* implementation. It follows the design model
> and naming conventions of [Serenity/JS](https://github.com/serenity-js/serenity-js)
> but is independent of it.

## Index

| # | Document | What it covers |
|---|----------|----------------|
| 01 | [The flow of the Screenplay Pattern](./01-screenplay-flow.md) | A step-by-step trace of a test exercising an example system under test (SUT), showing how every building block participates. |
| 02 | [Writing your own Ability, Interaction, and Question](./02-writing-your-own-building-blocks.md) | A hands-on guide to extending the library: build a new capability from scratch and see how the three core building blocks fit together. |
| 03 | [How the event / notification layer works](./03-event-notification-layer.md) | The domain-event model, how the `Stage` broadcasts to its crew, writing your own `StageCrewMember`, and rebuilding the activity tree from the event stream. |
| 04 | [Portable Questions and ability tokens](./04-portable-questions-and-abilities.md) | Structural `QuestionLike<T>` adapters, typed token bindings for existing objects, inference, lifetime, and the one-provider execution boundary. |
| 05 | [Provider conformance kit](./05-provider-conformance-kit.md) | Adapting a TypeScript provider to the reusable semantic cases, test-runner integration, native outcome preservation, and drift detection. |

More guides will be added here over time.

## Architecture decisions

| ADR | Decision | Status |
|---|---|---|
| 0001 | [Select Screenplay providers at build or profile time](./adr/0001-provider-selection-boundary.md) | Accepted |

## Test-suite quality

- [Mutation testing](./mutation-testing.md) — what Stryker measures, how to run
  it, the 2026-09-03 baseline (95.99% statement coverage against a 69.57%
  mutation score), and how to read a surviving mutant.

## Compatibility

- [Calculator compatibility baseline](./compatibility.md) — the package-root
  runtime and type surface protected during the provider-first iteration, plus
  its additive-change and deprecation policy.
