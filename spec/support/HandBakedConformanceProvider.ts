import {
  AbilityToken,
  Cast,
  Interaction,
  Outcome,
  Stage,
  type Actor,
  type ConformanceActivity,
  type ConformanceActor,
  type ConformanceEvent,
  type ConformanceMemory,
  type ConformanceProvider,
  type ConformanceQuestion,
  type ConformanceScenario,
  type ConformanceSceneOutcome,
  type DomainEvent,
  type ExecutionExtension,
} from '../../src/index.js';

class MemoryStore implements ConformanceMemory {
  private readonly values = new Map<string, unknown>();

  set(key: string, value: unknown): void {
    this.values.set(key, value);
  }

  get<T>(key: string): T | undefined {
    return this.values.get(key) as T | undefined;
  }
}

const Memory = AbilityToken.named<ConformanceMemory>('memory');

class HandBakedActor implements ConformanceActor {
  private readonly missingTokens = new Map<string, AbilityToken<object>>();

  constructor(private readonly native: Actor) {}

  get name(): string {
    return this.native.name;
  }

  abilityTo<T extends object>(name: string): T {
    if (name === Memory.name) return this.native.abilityTo(Memory) as T;

    let token = this.missingTokens.get(name);
    if (!token) {
      token = AbilityToken.named<object>(name);
      this.missingTokens.set(name, token);
    }
    return this.native.abilityTo(token) as T;
  }

  async attemptsTo(...activities: ConformanceActivity[]): Promise<void> {
    await this.native.attemptsTo(
      ...activities.map((candidate) =>
        Interaction.where(candidate.description, async () => {
          await candidate.performAs(this);
        }),
      ),
    );
  }

  answer<T>(question: ConformanceQuestion<T>): Promise<T> {
    return this.native.answer<T>({
      answeredBy: () => question.answeredBy(this),
      toString: () => question.description,
    });
  }
}

function sceneOutcome(event: Extract<DomainEvent, { type: 'scene:finishes' }>): ConformanceSceneOutcome {
  if (event.outcome.status === 'success') {
    return event.extension === undefined
      ? { status: 'success' }
      : { status: 'success', extension: event.extension };
  }
  return event.extension === undefined
    ? { status: 'failure', error: event.outcome.error }
    : { status: 'failure', error: event.outcome.error, extension: event.extension };
}

function mapEvent(event: DomainEvent): ConformanceEvent | undefined {
  switch (event.type) {
    case 'activity:starts':
    case 'activity:finishes':
      return {
        type: event.type,
        actor: event.actor,
        description: event.activity,
      };
    case 'activity:fails':
      return {
        type: event.type,
        actor: event.actor,
        description: event.activity,
        error: event.error,
      };
    case 'scene:starts':
      return event.extension === undefined
        ? { type: event.type, description: event.name }
        : { type: event.type, description: event.name, extension: event.extension };
    case 'scene:finishes':
      return {
        type: event.type,
        description: event.name,
        outcome: sceneOutcome(event),
      };
    case 'test-run:finishes':
      return undefined;
  }
}

class HandBakedScenario implements ConformanceScenario {
  private readonly nativeEvents: DomainEvent[] = [];
  private readonly actors = new Map<string, HandBakedActor>();
  private readonly stage = new Stage(
    Cast.whereEachActorCan(() => [Memory.bind(new MemoryStore())]),
  );

  constructor(private readonly description: string) {
    this.stage.assign({ notifyOf: (event) => this.nativeEvents.push(event) });
  }

  actor(name: string): ConformanceActor {
    let actor = this.actors.get(name);
    if (!actor) {
      actor = new HandBakedActor(this.stage.actor(name));
      this.actors.set(name, actor);
    }
    return actor;
  }

  start(extension?: ExecutionExtension): void {
    this.stage.sceneStarts(this.description, extension);
  }

  finish(outcome: ConformanceSceneOutcome): void {
    const canonical =
      outcome.status === 'success' ? Outcome.successful() : Outcome.from(outcome.error);
    this.stage.sceneFinishes(this.description, canonical, outcome.extension);
  }

  events(): readonly ConformanceEvent[] {
    const events: ConformanceEvent[] = [];
    for (const event of this.nativeEvents) {
      const mapped = mapEvent(event);
      if (mapped) events.push(mapped);
    }
    return events;
  }
}

/** Adapts the real Promise-native implementation to the provider-neutral kit. */
export class HandBakedConformanceProvider implements ConformanceProvider {
  readonly name = 'hand-baked async provider';

  createScenario(description: string): ConformanceScenario {
    return new HandBakedScenario(description);
  }
}
