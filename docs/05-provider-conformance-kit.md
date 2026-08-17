# Provider conformance kit

The provider conformance kit turns the minimum portable Screenplay semantics
into reusable executable cases. A TypeScript provider supplies a small test
adapter; the kit drives it without requiring the provider to expose this
library's native `Actor`, `Activity`, event, or reporter classes.

The kit is test-framework-neutral and has no runtime dependencies. Consumers
can register its individual cases with Vitest, Jest, Node's test runner, or
another framework, or call the aggregate runner directly.

## What the kit checks

The four exported `providerConformanceCases` cover:

- actor ability isolation, clear missing-ability failure, and fresh memory
  across both actors and scenarios;
- synchronous and asynchronous Question resolution;
- ordered activity execution, description preservation, and one start/finish
  lifecycle pair; and
- stop-on-failure, exactly one failure event, original-error propagation, and
  survival of an opaque provider-native outcome extension.

These are minimum observable semantics, not shared runtime mechanics. A
provider can use Promises, framework-managed scheduling, or another native
model behind its adapter as long as the adapter reports the required
observations truthfully.

## The adapter contract

Implement `ConformanceProvider`, returning a fresh `ConformanceScenario` for
each case:

```ts
import type {
  ConformanceProvider,
  ConformanceScenario,
} from 'hand-baked-screenplay-pattern';

export class MyProviderAdapter implements ConformanceProvider {
  readonly name = 'my TypeScript provider';

  createScenario(description: string): ConformanceScenario {
    return new MyScenarioAdapter(description);
  }
}
```

The scenario adapter has four responsibilities:

1. return stable actors by name, each with a fresh mutable `memory` ability;
2. adapt provider-neutral activities and Questions to the provider's native
   execution model;
3. start and finish one scenario lifecycle; and
4. expose those lifecycle observations as `ConformanceEvent[]`.

`abilityTo<T>('missing-capability')` must throw a clear error containing the
requested name. The adapter should translate its native event vocabulary into
the small conformance event union; timestamps and provider-specific report
features are deliberately outside that union.

Provider-native outcome data belongs in the optional `ExecutionExtension` on
the scene result. The kit checks that the same envelope survives, but does not
interpret it as a portable status. This retains distinctions such as
environment-blocked versus product-failed without requiring every provider to
share those categories.

## Register individual cases

Registering each case separately gives the clearest test-runner output:

```ts
import { describe, it } from 'vitest';
import { providerConformanceCases } from 'hand-baked-screenplay-pattern';
import { MyProviderAdapter } from './MyProviderAdapter.js';

const provider = new MyProviderAdapter();

describe(`${provider.name} conformance`, () => {
  for (const conformanceCase of providerConformanceCases) {
    it(conformanceCase.name, () => conformanceCase.run(provider));
  }
});
```

No Vitest code is imported by the package—the test framework appears only in
the consumer's test file.

## Run an aggregate report

For a script, build step, or a single test, use the dependency-free runner:

```ts
import { runProviderConformance } from 'hand-baked-screenplay-pattern';

const report = await runProviderConformance(new MyProviderAdapter());

if (!report.passed) {
  const failures = report.cases
    .filter(result => result.status === 'failed')
    .map(result => result.error);
  throw new AggregateError(failures, `${report.provider} is not conformant`);
}
```

The runner executes all cases and returns every failure rather than stopping at
the first drift.

## Evidence in this repository

`spec/provider-conformance.spec.ts` runs the same exported cases against:

- the real hand-baked Promise-native implementation, through a thin adapter;
- an independent minimal implementation that uses none of the hand-baked
  runtime classes; and
- a deliberately non-conforming variant that continues after an activity
  failure.

The first two pass every case. The broken variant fails only the
stop-on-failure case, demonstrating that the kit detects a meaningful semantic
drift.

## Lifecycle ownership

The conformance adapter observes or translates the lifecycle emitted by its
selected provider. It must not wrap a scenario with a second competing
lifecycle. [ADR 0001](./adr/0001-provider-selection-boundary.md) still applies:
one provider and one lifecycle owner per execution lane, with native runtime
objects kept inside that provider's adapter boundary.
