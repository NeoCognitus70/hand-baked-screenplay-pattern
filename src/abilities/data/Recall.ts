import { Question } from '../../screenplay/Question.js';
import { ManageData } from './ManageData.js';

/**
 * {@link Recall} provides {@link Question questions} that read values
 * previously stored with {@link Remember} via the {@link ManageData} ability.
 */
export class Recall {
  /**
   * The value remembered under the given name, optionally typed by the caller.
   */
  static the<T = unknown>(name: string): Question<T> {
    return Question.about(
      `what is remembered about '${name}'`,
      (actor) => actor.abilityTo(ManageData).get(name) as T,
    );
  }
}
