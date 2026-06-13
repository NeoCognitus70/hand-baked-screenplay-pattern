import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import type { DomainEvent, StageCrewMember } from '../screenplay/StageEvents.js';
import { buildReport } from '../reporting/ReportModel.js';
import { renderHtml } from '../reporting/renderHtml.js';

/**
 * Writes a rendered report to a destination. The default implementation
 * targets the filesystem; tests inject a fake so they never touch real disk.
 */
export type ReportWriter = (filePath: string, contents: string) => void;

/**
 * The default {@link ReportWriter}: writes to the real filesystem using
 * `node:fs`. The only `node:fs`/`node:path` use in the class is gathered here
 * — the pure `buildReport` / `renderHtml` paths it drives stay filesystem-free,
 * and a test that injects its own writer never reaches this code.
 */
const fileSystemWriter: ReportWriter = (filePath, contents) => {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, contents, 'utf8');
};

/**
 * Joins a directory and a filename with a forward slash, collapsing any
 * trailing separator on the directory. Kept local so the reporter does not
 * import `node:path` outside the default writer.
 */
function joinPath(directory: string, file: string): string {
  return `${directory.replace(/[/\\]+$/, '')}/${file}`;
}

/**
 * A {@link StageCrewMember} that buffers every {@link DomainEvent} and, on
 * `test-run:finishes`, builds and renders a single static HTML report file.
 *
 * Following the Serenity/JS model, reporting is a crew member that **observes**
 * events — it is not an actor `Ability`. The class is passive: it reacts only
 * to the events the `Stage` announces.
 *
 * @example
 * ```ts
 * assign(HtmlReporter.storingReportsAt('./report'));
 * // ... run scenes ...
 * testRunFinishes(); // writes ./report/index.html
 * ```
 */
export class HtmlReporter implements StageCrewMember {
  private readonly events: DomainEvent[] = [];

  private constructor(
    private readonly directory: string,
    private readonly writer: ReportWriter,
  ) {}

  /**
   * Creates a reporter that writes `<directory>/index.html` (default
   * `./report`) using the real filesystem.
   */
  static storingReportsAt(directory = './report'): HtmlReporter {
    return new HtmlReporter(directory, fileSystemWriter);
  }

  /**
   * Returns a copy of this reporter that uses the given {@link ReportWriter}
   * instead of the filesystem — the seam tests use to capture output without
   * touching real disk. Any events already buffered are carried over.
   */
  withWriter(writer: ReportWriter): HtmlReporter {
    const next = new HtmlReporter(this.directory, writer);
    next.events.push(...this.events);
    return next;
  }

  /** Buffers every event; renders and writes once on `test-run:finishes`. */
  notifyOf(event: DomainEvent): void {
    this.events.push(event);
    if (event.type === 'test-run:finishes') {
      const html = renderHtml(buildReport(this.events));
      this.writer(joinPath(this.directory, 'index.html'), html);
    }
  }
}
