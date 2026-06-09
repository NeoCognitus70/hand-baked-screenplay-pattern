import type { Ability, AbilityType } from './Ability.js';
import type { Activity } from './Activity.js';
import type { Answerable } from './Answerable.js';

/**
 * The capability of performing a sequence of {@link Activity activities}.
 */
export interface PerformsActivities {
  attemptsTo(...activities: Activity[]): Promise<void>;
}

/**
 * The capability of using {@link Ability abilities} to interact with the
 * system under test.
 */
export interface UsesAbilities {
  abilityTo<T extends Ability>(doSomething: AbilityType<T>): T;
}

/**
 * The capability of answering a {@link Question} (or any other
 * {@link Answerable}) about the state of the system under test.
 */
export interface AnswersQuestions {
  answer<T>(answerable: Answerable<T>): Promise<T>;
}

/**
 * The capability of being granted {@link Ability abilities}.
 */
export interface CanHaveAbilities<Returned = UsesAbilities> {
  whoCan(...abilities: Ability[]): Returned;
}

/**
 * The set of capabilities an actor exposes to an {@link Activity} while it is
 * being performed.
 */
export type ActivityActor = PerformsActivities & UsesAbilities & AnswersQuestions;
