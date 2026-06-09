import type { Activity } from './Activity.js';
import type { ActivityActor, AnswersQuestions, UsesAbilities } from './capabilities.js';

/**
 * The body of an {@link Interaction}: a low-level step that uses the actor's
 * abilities (and may answer questions) to act upon the system under test.
 */
export type InteractionBody = (
  actor: UsesAbilities & AnswersQuestions,
) => Promise<void> | void;

/**
 * An {@link Interaction} is a system-level activity that directly uses an
 * {@link Ability} to interact with the system under test, e.g. sending an
 * HTTP request or clicking a button.
 */
export abstract class Interaction implements Activity {
  /**
   * Defines an ad-hoc interaction from a description and a body function.
   */
  static where(description: string, interaction: InteractionBody): Interaction {
    return new InteractionStatement(description, interaction);
  }

  protected constructor(private readonly description: string) {}

  abstract performAs(actor: ActivityActor): Promise<void>;

  toString(): string {
    return this.description;
  }
}

class InteractionStatement extends Interaction {
  constructor(
    description: string,
    private readonly interaction: InteractionBody,
  ) {
    super(description);
  }

  async performAs(actor: ActivityActor): Promise<void> {
    await this.interaction(actor);
  }
}
