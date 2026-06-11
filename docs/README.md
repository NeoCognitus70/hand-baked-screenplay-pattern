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

More guides will be added here over time.
