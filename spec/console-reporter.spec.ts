import { describe, expect, it, vi } from 'vitest';
import { ConsoleReporter } from '../src/crew/ConsoleReporter.js';
import { AssertionError } from '../src/errors/index.js';

describe('ConsoleReporter', () => {
  it('logs one formatted line per activity:starts / activity:finishes / activity:fails', () => {
    const lines: string[] = [];
    const reporter = new ConsoleReporter((line) => lines.push(line));
    const error = new AssertionError('Expected version to equal 2');

    reporter.notifyOf({
      type: 'activity:starts',
      actor: 'Ada',
      activity: '#actor checks the version',
      timestamp: 100,
    });
    reporter.notifyOf({
      type: 'activity:finishes',
      actor: 'Ada',
      activity: '#actor checks the version',
      timestamp: 110,
    });
    reporter.notifyOf({
      type: 'activity:fails',
      actor: 'Bob',
      activity: '#actor verifies the status',
      error,
      timestamp: 120,
    });

    expect(lines).toEqual([
      'Ada begins: #actor checks the version',
      'Ada done:   #actor checks the version',
      `Bob fails:  #actor verifies the status — ${error.message}`,
    ]);
  });

  it('ignores scene:starts, scene:finishes, and test-run:finishes — documented scope, no output', () => {
    const lines: string[] = [];
    const reporter = new ConsoleReporter((line) => lines.push(line));

    reporter.notifyOf({ type: 'scene:starts', name: 'A scene', timestamp: 100 });
    reporter.notifyOf({
      type: 'scene:finishes',
      name: 'A scene',
      outcome: { status: 'success' },
      timestamp: 110,
    });
    reporter.notifyOf({ type: 'test-run:finishes', timestamp: 120 });

    expect(lines).toEqual([]);
  });

  it('defaults its sink to console.log when none is injected', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});

    try {
      new ConsoleReporter().notifyOf({
        type: 'activity:starts',
        actor: 'Ada',
        activity: '#actor does a thing',
        timestamp: 100,
      });

      expect(spy).toHaveBeenCalledWith('Ada begins: #actor does a thing');
    } finally {
      spy.mockRestore();
    }
  });
});
