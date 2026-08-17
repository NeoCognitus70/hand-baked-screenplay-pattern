import type { AnswersQuestions, UsesAbilities } from './capabilities.js';

/**
 * The body of a {@link Question}: reads some state of the system under test
 * using the actor's abilities and returns the answer (optionally async).
 */
export type QuestionBody<T> = (actor: AnswersQuestions & UsesAbilities) => T;

/**
 * The portable, structural contract understood by {@link Actor.answer}.
 * Implement this shape to expose an adapter question without extending the
 * concrete {@link Question} class.
 */
export interface QuestionLike<T> {
  answeredBy(actor: AnswersQuestions & UsesAbilities): T;
  toString(): string;
}

/** Recognises the structural question protocol at runtime. */
export function isQuestionLike<T>(maybe: unknown): maybe is QuestionLike<T> {
  return (
    maybe !== null &&
    (typeof maybe === 'object' || typeof maybe === 'function') &&
    typeof (maybe as { answeredBy?: unknown }).answeredBy === 'function' &&
    typeof (maybe as { toString?: unknown }).toString === 'function'
  );
}

/**
 * A {@link Question} represents a query about the state of the system under
 * test. Actors {@link AnswersQuestions.answer answer} questions to make
 * assertions or to feed values into subsequent activities.
 */
export abstract class Question<T> implements QuestionLike<T> {
  /**
   * Defines an ad-hoc question from a description and a body function.
   */
  static about<T>(description: string, body: QuestionBody<T>): Question<T> {
    return new QuestionStatement(description, body);
  }

  /**
   * Type guard recognising whether a given value is a {@link Question}.
   */
  static isAQuestion<T>(maybe: unknown): maybe is Question<T> {
    return maybe instanceof Question;
  }

  abstract answeredBy(actor: AnswersQuestions & UsesAbilities): T;

  abstract toString(): string;
}

class QuestionStatement<T> extends Question<T> {
  constructor(
    private readonly description: string,
    private readonly body: QuestionBody<T>,
  ) {
    super();
  }

  answeredBy(actor: AnswersQuestions & UsesAbilities): T {
    return this.body(actor);
  }

  override toString(): string {
    return this.description;
  }
}
