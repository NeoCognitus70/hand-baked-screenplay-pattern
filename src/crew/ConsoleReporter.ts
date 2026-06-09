import type { DomainEvent, StageCrewMember } from '../screenplay/StageEvents.js';

/**
 * A minimal {@link StageCrewMember} that logs activity events to a sink
 * (the console by default). Demonstrates the notification layer and is handy
 * for debugging a scenario.
 */
export class ConsoleReporter implements StageCrewMember {
  constructor(private readonly log: (line: string) => void = console.log) {}

  notifyOf(event: DomainEvent): void {
    switch (event.type) {
      case 'activity:starts':
        this.log(`${event.actor} begins: ${event.activity}`);
        break;
      case 'activity:finishes':
        this.log(`${event.actor} done:   ${event.activity}`);
        break;
      case 'activity:fails':
        this.log(`${event.actor} fails:  ${event.activity} — ${event.error.message}`);
        break;
    }
  }
}
