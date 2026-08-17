import type { ExecutionExtension } from '../screenplay/StageEvents.js';

/** Mutable scenario memory exposed by a provider harness as an actor ability. */
export interface ConformanceMemory {
  set(key: string, value: unknown): void;
  get<T>(key: string): T | undefined;
}

/** A provider-neutral activity used by the reusable conformance cases. */
export interface ConformanceActivity {
  readonly description: string;
  performAs(actor: ConformanceActor): Promise<void> | void;
}

/** A provider-neutral synchronous or asynchronous Question. */
export interface ConformanceQuestion<T> {
  readonly description: string;
  answeredBy(actor: ConformanceActor): Promise<T> | T;
}

/** The minimum Actor operations exercised by the conformance kit. */
export interface ConformanceActor {
  readonly name: string;
  abilityTo<T extends object>(name: string): T;
  attemptsTo(...activities: ConformanceActivity[]): Promise<void>;
  answer<T>(question: ConformanceQuestion<T>): Promise<T>;
}

/** The canonical scene result plus optional provider-native outcome data. */
export type ConformanceSceneOutcome =
  | { readonly status: 'success'; readonly extension?: ExecutionExtension }
  | {
      readonly status: 'failure';
      readonly error: Error;
      readonly extension?: ExecutionExtension;
    };

/**
 * Provider-neutral observations used to compare lifecycle semantics without
 * requiring providers to share native event classes or timestamps.
 */
export type ConformanceEvent =
  | {
      readonly type: 'activity:starts';
      readonly actor: string;
      readonly description: string;
    }
  | {
      readonly type: 'activity:finishes';
      readonly actor: string;
      readonly description: string;
    }
  | {
      readonly type: 'activity:fails';
      readonly actor: string;
      readonly description: string;
      readonly error: Error;
    }
  | {
      readonly type: 'scene:starts';
      readonly description: string;
      readonly extension?: ExecutionExtension;
    }
  | {
      readonly type: 'scene:finishes';
      readonly description: string;
      readonly outcome: ConformanceSceneOutcome;
    };

/** A fresh scenario owned by one provider and one lifecycle emitter. */
export interface ConformanceScenario {
  actor(name: string): ConformanceActor;
  start(extension?: ExecutionExtension): void;
  finish(outcome: ConformanceSceneOutcome): void;
  events(): readonly ConformanceEvent[];
}

/** Adapter contract implemented by each provider that consumes the kit. */
export interface ConformanceProvider {
  readonly name: string;
  createScenario(description: string): ConformanceScenario;
}

/** One reusable semantic check. */
export interface ProviderConformanceCase {
  readonly name: string;
  run(provider: ConformanceProvider): Promise<void>;
}

/** The recorded result of one conformance case. */
export type ConformanceCaseResult =
  | { readonly name: string; readonly status: 'passed' }
  | { readonly name: string; readonly status: 'failed'; readonly error: Error };

/** Aggregate, test-framework-neutral conformance result for one provider. */
export interface ProviderConformanceReport {
  readonly provider: string;
  readonly passed: boolean;
  readonly cases: readonly ConformanceCaseResult[];
}

const MEMORY_ABILITY = 'memory';

const activity = (
  description: string,
  performAs: (actor: ConformanceActor) => Promise<void> | void,
): ConformanceActivity => ({ description, performAs });

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertSequence(actual: readonly string[], expected: readonly string[], context: string): void {
  const actualText = JSON.stringify(actual);
  const expectedText = JSON.stringify(expected);
  assert(actualText === expectedText, `${context}: expected ${expectedText}, received ${actualText}`);
}

function asError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

async function abilitiesAndMemoryAreIsolated(provider: ConformanceProvider): Promise<void> {
  const firstScenario = provider.createScenario('Ability and actor isolation');
  const ada = firstScenario.actor('Ada');
  const bob = firstScenario.actor('Bob');
  const adaMemory = ada.abilityTo<ConformanceMemory>(MEMORY_ABILITY);
  const bobMemory = bob.abilityTo<ConformanceMemory>(MEMORY_ABILITY);

  assert(adaMemory !== bobMemory, 'different actors must not share their mutable memory ability');
  adaMemory.set('token', 'ada-secret');
  assert(
    bobMemory.get('token') === undefined,
    'one actor must not observe another actor\'s remembered value',
  );

  let missingError: Error | undefined;
  try {
    ada.abilityTo('missing-capability');
  } catch (error) {
    missingError = asError(error);
  }
  assert(missingError !== undefined, 'a missing ability lookup must fail');
  assert(
    missingError.message.includes('missing-capability'),
    'a missing ability failure must identify the requested ability',
  );

  const secondScenario = provider.createScenario('Scenario memory isolation');
  const secondAdaMemory = secondScenario
    .actor('Ada')
    .abilityTo<ConformanceMemory>(MEMORY_ABILITY);
  assert(
    secondAdaMemory !== adaMemory,
    'the same actor name in a new scenario must receive fresh mutable memory',
  );
  assert(
    secondAdaMemory.get('token') === undefined,
    'remembered values must not leak between scenarios',
  );
}

async function questionsResolveSynchronouslyAndAsynchronously(
  provider: ConformanceProvider,
): Promise<void> {
  const scenario = provider.createScenario('Question resolution');
  const actor = scenario.actor('Grace');
  actor.abilityTo<ConformanceMemory>(MEMORY_ABILITY).set('base', 40);

  const synchronous = await actor.answer<number>({
    description: 'the synchronous answer',
    answeredBy: (candidate) =>
      (candidate.abilityTo<ConformanceMemory>(MEMORY_ABILITY).get<number>('base') ?? 0) + 2,
  });
  const asynchronous = await actor.answer<number>({
    description: 'the asynchronous answer',
    answeredBy: async (candidate) =>
      (candidate.abilityTo<ConformanceMemory>(MEMORY_ABILITY).get<number>('base') ?? 0) + 3,
  });

  assert(synchronous === 42, `the synchronous Question resolved to ${synchronous}, not 42`);
  assert(asynchronous === 43, `the asynchronous Question resolved to ${asynchronous}, not 43`);
}

async function activitiesRunInOrderWithExactlyOnceLifecycle(
  provider: ConformanceProvider,
): Promise<void> {
  const scenario = provider.createScenario('Ordered activity execution');
  const actor = scenario.actor('Lin');
  const trace: string[] = [];

  scenario.start();
  await actor.attemptsTo(
    activity('#actor records first', () => {
      trace.push('first');
    }),
    activity('#actor records second', async () => {
      await Promise.resolve();
      trace.push('second');
    }),
  );
  scenario.finish({ status: 'success' });

  assertSequence(trace, ['first', 'second'], 'activity execution order drifted');
  const events = scenario.events();
  assertSequence(
    events.map((event) => event.type),
    [
      'scene:starts',
      'activity:starts',
      'activity:finishes',
      'activity:starts',
      'activity:finishes',
      'scene:finishes',
    ],
    'successful lifecycle order drifted',
  );
  assert(events.filter((event) => event.type === 'scene:starts').length === 1, 'scene started more than once');
  assert(events.filter((event) => event.type === 'scene:finishes').length === 1, 'scene finished more than once');
  assert(
    events[0].description === 'Ordered activity execution' &&
      events[1].description === '#actor records first' &&
      events[3].description === '#actor records second',
    'scene or activity descriptions were not preserved',
  );
}

async function failuresStopExecutionAndPreserveNativeOutcome(
  provider: ConformanceProvider,
): Promise<void> {
  const scenario = provider.createScenario('Failure stops execution');
  const actor = scenario.actor('Mina');
  const trace: string[] = [];
  const failure = new Error('environment setup failed');
  const extension: ExecutionExtension<
    { readonly status: 'blocked'; readonly cause: 'environment'; readonly reason: string },
    { readonly scenarioId: string }
  > = {
    provider: 'conformance-native-fixture',
    outcome: { status: 'blocked', cause: 'environment', reason: failure.message },
    metadata: { scenarioId: 'blocked-scenario' },
  };

  scenario.start();
  let caught: Error | undefined;
  try {
    await actor.attemptsTo(
      activity('#actor completes setup', () => {
        trace.push('setup');
      }),
      activity('#actor encounters an environment failure', () => {
        trace.push('failure');
        throw failure;
      }),
      activity('#actor must never continue', () => {
        trace.push('continued');
      }),
    );
  } catch (error) {
    caught = asError(error);
  }
  scenario.finish({ status: 'failure', error: failure, extension });

  assert(caught === failure, 'the provider must rethrow the original activity failure');
  assertSequence(trace, ['setup', 'failure'], 'activity execution did not stop on failure');

  const events = scenario.events();
  assertSequence(
    events.map((event) => event.type),
    [
      'scene:starts',
      'activity:starts',
      'activity:finishes',
      'activity:starts',
      'activity:fails',
      'scene:finishes',
    ],
    'failing lifecycle order drifted',
  );
  assert(events.filter((event) => event.type === 'activity:fails').length === 1, 'activity failure was not emitted exactly once');
  assert(events.filter((event) => event.type === 'scene:starts').length === 1, 'failed scene started more than once');
  assert(events.filter((event) => event.type === 'scene:finishes').length === 1, 'failed scene finished more than once');

  const failedActivity = events[4];
  assert(
    failedActivity.type === 'activity:fails' &&
      failedActivity.description === '#actor encounters an environment failure' &&
      failedActivity.error === failure,
    'the failure event did not preserve its description and original error',
  );
  const sceneFinish = events[5];
  assert(sceneFinish.type === 'scene:finishes', 'the final event was not scene:finishes');
  assert(sceneFinish.outcome.status === 'failure', 'the failed scene lost its canonical status');
  assert(
    sceneFinish.outcome.extension === extension,
    'the provider-native outcome envelope did not survive unchanged',
  );
  assert(
    sceneFinish.outcome.extension.outcome !== undefined &&
      (sceneFinish.outcome.extension.outcome as { status?: unknown }).status === 'blocked',
    'the provider-specific blocked outcome was flattened or discarded',
  );
}

/** Reusable cases suitable for direct registration with any test framework. */
export const providerConformanceCases: readonly ProviderConformanceCase[] = [
  { name: 'isolates abilities and actor/scenario memory', run: abilitiesAndMemoryAreIsolated },
  {
    name: 'resolves synchronous and asynchronous Questions',
    run: questionsResolveSynchronouslyAndAsynchronously,
  },
  {
    name: 'executes activities in order with exactly-once lifecycle events',
    run: activitiesRunInOrderWithExactlyOnceLifecycle,
  },
  {
    name: 'stops on failure and preserves provider-native outcomes',
    run: failuresStopExecutionAndPreserveNativeOutcome,
  },
];

/** Runs every reusable case and returns all failures without a test dependency. */
export async function runProviderConformance(
  provider: ConformanceProvider,
  cases: readonly ProviderConformanceCase[] = providerConformanceCases,
): Promise<ProviderConformanceReport> {
  const results: ConformanceCaseResult[] = [];
  for (const conformanceCase of cases) {
    try {
      await conformanceCase.run(provider);
      results.push({ name: conformanceCase.name, status: 'passed' });
    } catch (error) {
      results.push({ name: conformanceCase.name, status: 'failed', error: asError(error) });
    }
  }
  return {
    provider: provider.name,
    passed: results.every((result) => result.status === 'passed'),
    cases: results,
  };
}
