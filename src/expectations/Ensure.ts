import { AssertionError } from '../errors/index.js';
import { Interaction } from '../screenplay/Interaction.js';
import type { Answerable } from '../screenplay/Answerable.js';
import type { ActivityActor } from '../screenplay/capabilities.js';
import { format } from '../util.js';
import type { Expectation } from './Expectation.js';

/**
 * {@link Ensure} is an {@link Interaction} that resolves an
 * {@link Answerable} value and asserts it meets an {@link Expectation},
 * throwing an {@link AssertionError} when it does not.
 *
 * @example
 * Ensure.that(LastResponse.status(), equals(200))
 */
export class Ensure<T> extends Interaction {
  static that<T>(actual: Answerable<T>, expectation: Expectation<T>): Ensure<T> {
    return new Ensure(actual, expectation);
  }

  protected constructor(
    private readonly actual: Answerable<T>,
    private readonly expectation: Expectation<T>,
  ) {
    super(`#actor ensures that the value does ${expectation.toString()}`);
  }

  async performAs(actor: ActivityActor): Promise<void> {
    const actual = await actor.answer(this.actual);
    if (!this.expectation.isMetFor(actual)) {
      throw new AssertionError(
        `Expected ${format(actual)} to ${this.expectation.toString()}`,
        this.expectation.toString(),
        actual,
      );
    }
  }
}
