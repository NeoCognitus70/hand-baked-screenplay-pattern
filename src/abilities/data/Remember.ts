import { Interaction } from '../../screenplay/Interaction.js';
import type { Answerable } from '../../screenplay/Answerable.js';
import type { ActivityActor } from '../../screenplay/capabilities.js';
import { ManageData } from './ManageData.js';

/**
 * {@link Remember} is an {@link Interaction} that resolves an
 * {@link Answerable} value and stores it under a name using the actor's
 * {@link ManageData} ability, ready to be {@link Recall recalled} later.
 *
 * @example
 * Remember.that('userId', LastResponse.body<{ id: number }>())
 */
export class Remember extends Interaction {
  static that(name: string, value: Answerable<unknown>): Remember {
    return new Remember(name, value);
  }

  protected constructor(
    private readonly name: string,
    private readonly value: Answerable<unknown>,
  ) {
    super(`#actor remembers '${name}'`);
  }

  async performAs(actor: ActivityActor): Promise<void> {
    const resolved = await actor.answer(this.value);
    actor.abilityTo(ManageData).set(this.name, resolved);
  }
}
