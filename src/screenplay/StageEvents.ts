/**
 * Domain events announced by the {@link Stage} as actors perform activities.
 * This is the library's lightweight notification layer — enough to observe and
 * log execution without a full reporting infrastructure.
 */
export type DomainEvent =
  | { readonly type: 'activity:starts'; readonly actor: string; readonly activity: string }
  | { readonly type: 'activity:finishes'; readonly actor: string; readonly activity: string }
  | {
      readonly type: 'activity:fails';
      readonly actor: string;
      readonly activity: string;
      readonly error: Error;
    };

/**
 * A {@link StageCrewMember} observes {@link DomainEvent domain events} as they
 * happen — for logging, reporting, screenshots, and so on.
 */
export interface StageCrewMember {
  notifyOf(event: DomainEvent): void;
}
