import { describe, expect, it, vi } from 'vitest';
import { HtmlReporter } from '../src/crew/HtmlReporter.js';
import type { ReportWriter } from '../src/crew/HtmlReporter.js';
import { Outcome } from '../src/screenplay/Outcome.js';
import type { DomainEvent } from '../src/screenplay/StageEvents.js';

/** A minimal but complete one-scene, one-activity passing run. */
const passingRun: DomainEvent[] = [
  { type: 'scene:starts', name: 'Ada checks the health endpoint', timestamp: 100 },
  { type: 'activity:starts', actor: 'Ada', activity: '#actor sends GET /health', timestamp: 110 },
  { type: 'activity:finishes', actor: 'Ada', activity: '#actor sends GET /health', timestamp: 120 },
  {
    type: 'scene:finishes',
    name: 'Ada checks the health endpoint',
    outcome: Outcome.successful(),
    timestamp: 130,
  },
  { type: 'test-run:finishes', timestamp: 140 },
];

describe('HtmlReporter', () => {
  it('writes exactly once on test-run:finishes, to <dir>/index.html with non-empty HTML', () => {
    const writer = vi.fn<Parameters<ReportWriter>, void>();
    const reporter = HtmlReporter.storingReportsAt('./report').withWriter(writer);

    for (const event of passingRun) reporter.notifyOf(event);

    expect(writer).toHaveBeenCalledTimes(1);
    const [filePath, contents] = writer.mock.calls[0];
    expect(filePath.endsWith('index.html')).toBe(true);
    expect(filePath).toBe('./report/index.html');
    expect(contents.length).toBeGreaterThan(0);
    expect(contents).toContain('<!DOCTYPE html>');
    expect(contents).toContain('Ada checks the health endpoint');
  });

  it('does not write before test-run:finishes — it only buffers', () => {
    const writer = vi.fn<Parameters<ReportWriter>, void>();
    const reporter = HtmlReporter.storingReportsAt().withWriter(writer);

    // Feed everything except the terminal event.
    for (const event of passingRun.slice(0, -1)) reporter.notifyOf(event);

    expect(writer).not.toHaveBeenCalled();
  });

  it('defaults the directory to ./report', () => {
    const writer = vi.fn<Parameters<ReportWriter>, void>();
    const reporter = HtmlReporter.storingReportsAt().withWriter(writer);

    reporter.notifyOf({ type: 'test-run:finishes', timestamp: 1 });

    expect(writer.mock.calls[0][0]).toBe('./report/index.html');
  });

  it('honours a custom directory and trims a trailing separator', () => {
    const writer = vi.fn<Parameters<ReportWriter>, void>();
    const reporter = HtmlReporter.storingReportsAt('build/reports/').withWriter(writer);

    reporter.notifyOf({ type: 'test-run:finishes', timestamp: 1 });

    expect(writer.mock.calls[0][0]).toBe('build/reports/index.html');
  });

  it('clears its buffer after a write, so a second run is not double-counted', () => {
    const writer = vi.fn<Parameters<ReportWriter>, void>();
    const reporter = HtmlReporter.storingReportsAt().withWriter(writer);

    // First run: the passing "Ada checks the health endpoint" scene.
    for (const event of passingRun) reporter.notifyOf(event);

    // Second run observed by the SAME reporter instance: one different scene.
    const secondRun: DomainEvent[] = [
      { type: 'scene:starts', name: 'Bob checks the version endpoint', timestamp: 200 },
      {
        type: 'scene:finishes',
        name: 'Bob checks the version endpoint',
        outcome: Outcome.successful(),
        timestamp: 210,
      },
      { type: 'test-run:finishes', timestamp: 220 },
    ];
    for (const event of secondRun) reporter.notifyOf(event);

    expect(writer).toHaveBeenCalledTimes(2);
    const secondHtml = writer.mock.calls[1][1];
    // The second report holds only the second run's scene — the first run's
    // scene must not leak in (the pre-fix behaviour double-counted it).
    expect(secondHtml).toContain('Bob checks the version endpoint');
    expect(secondHtml).not.toContain('Ada checks the health endpoint');
  });

  it('reports the run outcome the buffered events describe', () => {
    const writer = vi.fn<Parameters<ReportWriter>, void>();
    const reporter = HtmlReporter.storingReportsAt().withWriter(writer);

    const failingRun: DomainEvent[] = [
      { type: 'scene:starts', name: 'A failing scene', timestamp: 0 },
      {
        type: 'scene:finishes',
        name: 'A failing scene',
        outcome: Outcome.from(new Error('boom')),
        timestamp: 10,
      },
      { type: 'test-run:finishes', timestamp: 20 },
    ];
    for (const event of failingRun) reporter.notifyOf(event);

    const html = writer.mock.calls[0][1];
    expect(html).toContain('class="summary fail"');
    expect(html).toContain('A failing scene');
  });
});
