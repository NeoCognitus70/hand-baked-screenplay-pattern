import type {
  ConformanceActivity,
  ConformanceActor,
  ConformanceEvent,
  ConformanceMemory,
  ConformanceProvider,
  ConformanceQuestion,
  ConformanceScenario,
  ConformanceSceneOutcome,
  ExecutionExtension,
} from '../../src/index.js';

class MinimalMemory implements ConformanceMemory {
  private readonly values = new Map<string, unknown>();

  set(key: string, value: unknown): void {
    this.values.set(key, value);
  }

  get<T>(key: string): T | undefined {
    return this.values.get(key) as T | undefined;
  }
}

function asError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

class MinimalActor implements ConformanceActor {
  private readonly abilities = new Map<string, object>([['memory', new MinimalMemory()]]);

  constructor(
    readonly name: string,
    private readonly scenario: MinimalScenario,
    private readonly continueAfterFailure: boolean,
  ) {}

  abilityTo<T extends object>(name: string): T {
    const ability = this.abilities.get(name);
    if (!ability) throw new Error(`${this.name} is missing ability ${name}`);
    return ability as T;
  }

  async attemptsTo(...activities: ConformanceActivity[]): Promise<void> {
    let firstFailure: Error | undefined;
    for (const activity of activities) {
      this.scenario.record({
        type: 'activity:starts',
        actor: this.name,
        description: activity.description,
      });
      try {
        await activity.performAs(this);
        this.scenario.record({
          type: 'activity:finishes',
          actor: this.name,
          description: activity.description,
        });
      } catch (error) {
        const failure = asError(error);
        this.scenario.record({
          type: 'activity:fails',
          actor: this.name,
          description: activity.description,
          error: failure,
        });
        if (!this.continueAfterFailure) throw error;
        firstFailure ??= failure;
      }
    }
    if (firstFailure) throw firstFailure;
  }

  async answer<T>(question: ConformanceQuestion<T>): Promise<T> {
    return question.answeredBy(this);
  }
}

class MinimalScenario implements ConformanceScenario {
  private readonly observed: ConformanceEvent[] = [];
  private readonly actors = new Map<string, MinimalActor>();

  constructor(
    private readonly description: string,
    private readonly continueAfterFailure: boolean,
  ) {}

  actor(name: string): ConformanceActor {
    let actor = this.actors.get(name);
    if (!actor) {
      actor = new MinimalActor(name, this, this.continueAfterFailure);
      this.actors.set(name, actor);
    }
    return actor;
  }

  start(extension?: ExecutionExtension): void {
    this.record(
      extension === undefined
        ? { type: 'scene:starts', description: this.description }
        : { type: 'scene:starts', description: this.description, extension },
    );
  }

  finish(outcome: ConformanceSceneOutcome): void {
    this.record({ type: 'scene:finishes', description: this.description, outcome });
  }

  events(): readonly ConformanceEvent[] {
    return [...this.observed];
  }

  record(event: ConformanceEvent): void {
    this.observed.push(event);
  }
}

/**
 * A tiny independent implementation of the harness contract. It deliberately
 * uses none of the hand-baked runtime classes.
 */
export class MinimalConformanceProvider implements ConformanceProvider {
  readonly name: string;

  constructor(private readonly continueAfterFailure = false) {
    this.name = continueAfterFailure
      ? 'non-conforming minimal fixture'
      : 'independent minimal fixture';
  }

  createScenario(description: string): ConformanceScenario {
    return new MinimalScenario(description, this.continueAfterFailure);
  }
}
