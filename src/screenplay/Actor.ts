import { ConfigurationError } from '../errors/index.js';
import { Ability, type AbilityType } from './Ability.js';
import type { Activity } from './Activity.js';
import type { Answerable } from './Answerable.js';
import type {
  AnswersQuestions,
  CanHaveAbilities,
  PerformsActivities,
  UsesAbilities,
} from './capabilities.js';
import { Question } from './Question.js';
import type { Stage } from './Stage.js';

/**
 * An {@link Actor} represents a person or external system interacting with the
 * system under test. Actors are given {@link Ability abilities}, perform
 * {@link Activity activities} ({@link Task tasks} and
 * {@link Interaction interactions}), and answer {@link Question questions}.
 *
 * @example
 * await actor.whoCan(MakeRequests.using(client)).attemptsTo(
 *   Send.a({ method: 'GET', url: '/health' }),
 *   Ensure.that(LastResponse.status(), equals(200)),
 * );
 */
export class Actor
  implements
    PerformsActivities,
    UsesAbilities,
    AnswersQuestions,
    CanHaveAbilities<Actor>
{
  private readonly abilities = new Map<AbilityType<Ability>, Ability>();

  constructor(
    public readonly name: string,
    private readonly stage: Stage,
  ) {}

  whoCan(...abilities: Ability[]): Actor {
    for (const ability of abilities) {
      this.abilities.set(ability.abilityType(), ability);
    }
    return this;
  }

  abilityTo<T extends Ability>(doSomething: AbilityType<T>): T {
    const ability = this.abilities.get(doSomething);
    if (!ability) {
      throw new ConfigurationError(
        `${this.name} does not have the ability to ${doSomething.name}. ` +
          `Did you grant it with whoCan(...)?`,
      );
    }
    return ability as T;
  }

  async attemptsTo(...activities: Activity[]): Promise<void> {
    for (const activity of activities) {
      const description = activity.toString();
      this.stage.announce({ type: 'activity:starts', actor: this.name, activity: description });
      try {
        await activity.performAs(this);
        this.stage.announce({ type: 'activity:finishes', actor: this.name, activity: description });
      } catch (error) {
        this.stage.announce({
          type: 'activity:fails',
          actor: this.name,
          activity: description,
          error: error instanceof Error ? error : new Error(String(error)),
        });
        throw error;
      }
    }
  }

  async answer<T>(answerable: Answerable<T>): Promise<T> {
    if (Question.isAQuestion<Promise<T> | T>(answerable)) {
      return this.answer(answerable.answeredBy(this));
    }
    // A plain value or a Promise: an async method resolves either identically,
    // so no Promise-specific branch is needed here.
    return answerable;
  }

  toString(): string {
    return this.name;
  }
}
