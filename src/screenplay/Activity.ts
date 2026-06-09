import type { ActivityActor } from './capabilities.js';

/**
 * The smallest unit of work an {@link Actor} can perform. Both
 * {@link Task tasks} (business-level) and {@link Interaction interactions}
 * (system-level) are activities, which is what lets them compose freely.
 */
export interface Activity {
  performAs(actor: ActivityActor): Promise<void>;

  /**
   * A human-readable description of the activity, used in reporting.
   */
  toString(): string;
}
