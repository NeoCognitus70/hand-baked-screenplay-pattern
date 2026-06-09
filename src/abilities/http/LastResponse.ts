import { Question } from '../../screenplay/Question.js';
import { MakeRequests } from './MakeRequests.js';

/**
 * {@link LastResponse} provides {@link Question questions} about the most
 * recent HTTP response captured by the {@link MakeRequests} ability.
 */
export class LastResponse {
  /**
   * The HTTP status code of the last response.
   */
  static status(): Question<number> {
    return Question.about('the status of the last response', (actor) =>
      actor.abilityTo(MakeRequests).mostRecentResponse().status,
    );
  }

  /**
   * The body of the last response, optionally typed by the caller.
   */
  static body<T = unknown>(): Question<T> {
    return Question.about(
      'the body of the last response',
      (actor) => actor.abilityTo(MakeRequests).mostRecentResponse().body as T,
    );
  }

  /**
   * A single response header by (case-sensitive) name.
   */
  static header(name: string): Question<string | undefined> {
    return Question.about(
      `the '${name}' header of the last response`,
      (actor) => actor.abilityTo(MakeRequests).mostRecentResponse().headers[name],
    );
  }
}
