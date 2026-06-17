import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HtmlReporter } from '../src/crew/HtmlReporter.js';
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

// Integration test for the ONE branch the unit specs never exercise: the real
// node:fs default writer. Every other reporter spec injects a fake writer, so
// without this the default `fileSystemWriter` (mkdirSync + writeFileSync) is
// untested. Here we drive the genuine default writer against a real tmpdir.
describe('HtmlReporter default node:fs writer (integration)', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'hbsp-report-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('writes a real index.html containing the rendered report via the default writer', () => {
    // No .withWriter(...) — this uses the real filesystem writer.
    const reporter = HtmlReporter.storingReportsAt(dir);

    for (const event of passingRun) reporter.notifyOf(event);

    const written = readFileSync(join(dir, 'index.html'), 'utf8');
    expect(written).toContain('<!DOCTYPE html>');
    expect(written).toContain('Ada checks the health endpoint');
  });

  it('creates the target directory if it does not yet exist', () => {
    // A nested, not-yet-created path exercises the writer's recursive mkdirSync.
    const nested = join(dir, 'nested', 'reports');
    const reporter = HtmlReporter.storingReportsAt(nested);

    reporter.notifyOf({ type: 'test-run:finishes', timestamp: 1 });

    const written = readFileSync(join(nested, 'index.html'), 'utf8');
    expect(written).toContain('<!DOCTYPE html>');
  });
});
