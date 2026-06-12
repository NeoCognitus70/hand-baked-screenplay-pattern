import type { Outcome } from './Outcome.js';

/**
 * Domain events as announced by call sites, before the {@link Stage} stamps
 * them with a timestamp. Callers (actors, the scene helper, facade methods)
 * build these; crew members never see them un-stamped.
 */
export type DomainEventInput =
  | { readonly type: 'activity:starts'; readonly actor: string; readonly activity: string }
  | { readonly type: 'activity:finishes'; readonly actor: string; readonly activity: string }
  | {
      readonly type: 'activity:fails';
      readonly actor: string;
      readonly activity: string;
      readonly error: Error;
    }
  | { readonly type: 'scene:starts'; readonly name: string }
  | { readonly type: 'scene:finishes'; readonly name: string; readonly outcome: Outcome }
  | { readonly type: 'test-run:finishes' };

/**
 * Domain events announced by the {@link Stage} as actors perform activities,
 * scenes start and finish, and the test run completes. The `Stage` stamps
 * every event with a `timestamp` (epoch milliseconds) on announce.
 * This is the library's lightweight notification layer — enough to observe and
 * log execution without a full reporting infrastructure.
 */
export type DomainEvent = DomainEventInput & { readonly timestamp: number };

/**
 * A {@link StageCrewMember} observes {@link DomainEvent domain events} as they
 * happen — for logging, reporting, screenshots, and so on.
 */
export interface StageCrewMember {
  notifyOf(event: DomainEvent): void;
}
