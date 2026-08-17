# ADR 0001: Select Screenplay providers at build or profile time

- **Status:** Accepted
- **Date:** 2026-08-17
- **Decision scope:** Provider selection and ownership of an execution lane

## Context

The portfolio uses several Screenplay implementations with materially different
execution models: Promise-native TypeScript, Serenity/JS-managed activities,
Cypress command chains, and synchronous Python and C# implementations. They
share Screenplay vocabulary, but their native Actors, Activities, Questions,
Abilities, lifecycle events, and reports are not interchangeable runtime
objects.

This project is the portfolio's small Promise-native provider. The provider-first
iteration needs a clear boundary before it adds portable contracts or packaging.
Without that boundary, "provider switching" could be misread as hot-swapping
individual objects inside a scenario or as a promise to reproduce every
framework's execution and reporting model.

## Decision

Provider selection happens at **build or profile time** in a consumer-owned
composition module. One selected provider owns an Actor and every Activity in
that Actor's execution lane for the lifetime of the scenario.

Native runtime objects from different providers must not be mixed in one Actor
or scenario. A consumer can contain multiple lanes backed by different
providers, but each lane must have an explicit boundary and its own lifecycle
owner. Scenario-level hot switching is not supported.

The hand-baked provider remains an opinionated, Promise-native implementation.
Its core retains **zero runtime dependencies**. Framework integrations belong
in companion adapters or consumer-owned composition modules; Serenity/JS,
Cypress, Cucumber, Playwright, and runner-specific packages do not become core
runtime dependencies.

Portable contracts and conformance tests may standardise observable Screenplay
semantics such as activity order, failure propagation, ability isolation,
question resolution, descriptions, and lifecycle outcomes. They must not erase
provider-specific execution effects or make one provider's runtime classes the
universal representation.

## Non-goals

This decision does not attempt to provide:

- identical Serenity-grade reporting or feature parity between providers;
- one universal execution effect for Promises, Cypress command chains, and
  synchronous implementations;
- conversion of `Cypress.Chainable` execution into Promises;
- JavaScript bridges that make the Python or C# implementations consume the
  npm runtime;
- scenario-level provider hot switching; or
- mixing native Activities, Questions, Abilities, Actors, or lifecycle objects
  from different providers inside one scenario.

## Consequences

- Consumers gain one explicit composition seam for selecting a provider while
  their domain vocabulary can remain stable.
- Provider-specific runner integration, reports, screenshots, and lifecycle
  mechanics remain outside the minimum portable contract.
- A scenario has exactly one lifecycle owner, avoiding duplicate start, finish,
  or failure events from competing provider stages.
- The current public API remains operational; later portability work is
  additive and must honour the Calculator compatibility baseline established by
  HBSP-29.
- Cross-provider confidence comes from the conformance kit planned by HBSP-32,
  not from sharing native runtime objects.
- Some consumer composition code and provider-specific adapters are an accepted
  cost of preserving truthful execution semantics.

## Revisit triggers

Revisit this decision through a superseding ADR only when evidence shows at
least one of the following:

- a real consumer needs a different selection boundary and can preserve one
  provider and one lifecycle owner per execution lane;
- two or more implemented adapters need a shared capability that cannot be
  expressed by the portable contracts without weakening provider semantics;
- the conformance kit demonstrates that an additional execution effect can be
  represented safely without disguising its scheduling or retry behaviour; or
- a completed consumer pilot shows that the build/profile-time boundary creates
  more coupling than it removes.

Feasibility alone is not a trigger to pursue the non-goals above. Any revision
must preserve the core's zero-runtime-dependency constraint or explicitly
supersede it with evidence and migration impact.

## Related records

- [Backlog HBSP-28](../backlog.md)
- [HBSP-29 compatibility baseline](../compatibility.md) freezes the
  Calculator-consumed surface against this boundary.
- HBSP-32 will provide the executable cross-provider conformance evidence.
