import type { Activity } from './Activity.js';
import type { ActivityActor } from './capabilities.js';

/**
 * A {@link Task} is a business-level activity that captures intent (e.g.
 * "place an order") by composing lower-level {@link Activity activities}.
 * Tasks read like the domain language of the system under test and hide the
 * mechanics behind the interactions they delegate to.
 */
export abstract class Task implements Activity {
  /**
   * Defines a task as an ordered sequence of activities the actor will attempt.
   */
  static where(description: string, ...activities: Activity[]): Task {
    return new TaskStatement(description, activities);
  }

  protected constructor(private readonly description: string) {}

  abstract performAs(actor: ActivityActor): Promise<void>;

  toString(): string {
    return this.description;
  }
}

class TaskStatement extends Task {
  constructor(
    description: string,
    private readonly activities: Activity[],
  ) {
    super(description);
  }

  async performAs(actor: ActivityActor): Promise<void> {
    await actor.attemptsTo(...this.activities);
  }
}
