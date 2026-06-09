import type { DomainEvent, StageCrewMember } from '../../src/index.js';

/**
 * A {@link StageCrewMember} that records every event it is notified of, so
 * tests can assert on the order and shape of announcements.
 */
export class RecordingCrew implements StageCrewMember {
  readonly events: DomainEvent[] = [];

  notifyOf(event: DomainEvent): void {
    this.events.push(event);
  }

  descriptions(): string[] {
    return this.events.map((event) => `${event.type}:${event.activity}`);
  }
}
