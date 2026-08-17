import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  Cast,
  ConsoleReporter,
  HtmlReporter,
  Outcome,
  Stage,
  assign,
  resetDefaultStage,
  scene,
  type ExecutionExtension,
  type ReportWriter,
} from '../src/index.js';
import { RecordingCrew } from './support/RecordingCrew.js';

type NativeOutcome =
  | { readonly status: 'blocked'; readonly cause: 'environment'; readonly reason: string }
  | { readonly status: 'failed'; readonly cause: 'product'; readonly defectId: string };

interface NativeMetadata {
  readonly scenarioId: string;
  readonly tags: readonly string[];
}

const extension = (
  outcome: NativeOutcome,
  scenarioId: string,
): ExecutionExtension<NativeOutcome, NativeMetadata> => ({
  provider: 'example-runner',
  outcome,
  metadata: { scenarioId, tags: ['@portable'] },
});

describe('execution extension envelope', () => {
  it('preserves native outcome distinctions, descriptions, metadata, and event ordering', () => {
    let timestamp = 0;
    const crew = new RecordingCrew();
    const stage = new Stage(Cast.whereEveryoneCan(), () => ++timestamp);
    stage.assign(crew);

    const blocked = extension(
      { status: 'blocked', cause: 'environment', reason: 'database unavailable' },
      'scenario-blocked',
    );
    const productFailure = extension(
      { status: 'failed', cause: 'product', defectId: 'BUG-42' },
      'scenario-failed',
    );
    const blockedError = new Error('database unavailable');
    const productError = new Error('expected 200, received 500');

    stage.sceneStarts('Environment is available', blocked);
    stage.announce({
      type: 'activity:starts',
      actor: 'Ada',
      activity: '#actor probes the database',
      extension: blocked,
    });
    stage.announce({
      type: 'activity:fails',
      actor: 'Ada',
      activity: '#actor probes the database',
      error: blockedError,
      extension: blocked,
    });
    stage.sceneFinishes('Environment is available', Outcome.from(blockedError), blocked);

    stage.sceneStarts('Product returns the result', productFailure);
    stage.sceneFinishes(
      'Product returns the result',
      Outcome.from(productError),
      productFailure,
    );
    stage.testRunFinishes(productFailure);

    expect(crew.events.map((event) => event.type)).toEqual([
      'scene:starts',
      'activity:starts',
      'activity:fails',
      'scene:finishes',
      'scene:starts',
      'scene:finishes',
      'test-run:finishes',
    ]);
    expect(crew.events.filter((event) => event.type === 'scene:starts')).toHaveLength(2);
    expect(crew.events.filter((event) => event.type === 'scene:finishes')).toHaveLength(2);

    const activityStart = crew.events[1];
    expect(activityStart.type === 'activity:starts' && activityStart.activity).toBe(
      '#actor probes the database',
    );
    expect(activityStart.extension).toBe(blocked);

    const blockedFinish = crew.events[3];
    const productFinish = crew.events[5];
    expect(blockedFinish.type === 'scene:finishes' && blockedFinish.name).toBe(
      'Environment is available',
    );
    expect(productFinish.type === 'scene:finishes' && productFinish.name).toBe(
      'Product returns the result',
    );
    expect(blockedFinish.extension).toBe(blocked);
    expect(productFinish.extension).toBe(productFailure);
    expect(crew.events[6].extension).toBe(productFailure);
    expect(blockedFinish.extension?.outcome).toEqual({
      status: 'blocked',
      cause: 'environment',
      reason: 'database unavailable',
    });
    expect(productFinish.extension?.outcome).toEqual({
      status: 'failed',
      cause: 'product',
      defectId: 'BUG-42',
    });
    expect(blockedFinish.extension?.metadata).toEqual({
      scenarioId: 'scenario-blocked',
      tags: ['@portable'],
    });
  });

  it('leaves existing console and HTML reporter behaviour unchanged', () => {
    const native = extension(
      { status: 'failed', cause: 'product', defectId: 'BUG-99' },
      'scenario-reporter',
    );
    const lines: string[] = [];
    const consoleReporter = new ConsoleReporter((line) => lines.push(line));
    consoleReporter.notifyOf({
      type: 'activity:starts',
      actor: 'Lin',
      activity: '#actor checks the result',
      timestamp: 1,
      extension: native,
    });

    expect(lines).toEqual(['Lin begins: #actor checks the result']);

    const writer = vi.fn<Parameters<ReportWriter>, void>();
    const htmlReporter = HtmlReporter.storingReportsAt().withWriter(writer);
    htmlReporter.notifyOf({
      type: 'scene:starts',
      name: 'Lin checks the result',
      timestamp: 1,
      extension: native,
    });
    htmlReporter.notifyOf({
      type: 'scene:finishes',
      name: 'Lin checks the result',
      outcome: Outcome.successful(),
      timestamp: 2,
      extension: native,
    });
    htmlReporter.notifyOf({
      type: 'test-run:finishes',
      timestamp: 3,
      extension: native,
    });

    expect(writer).toHaveBeenCalledTimes(1);
    expect(writer.mock.calls[0][1]).toContain('Lin checks the result');
    expect(writer.mock.calls[0][1]).toContain('All scenes passed');
    expect(writer.mock.calls[0][1]).not.toContain('BUG-99');
  });
});

describe('scene lifecycle compatibility', () => {
  afterEach(() => {
    resetDefaultStage();
  });

  it('emits one start and one finish for both successful and failed scenes', async () => {
    const crew = new RecordingCrew();
    assign(crew);

    await scene('A successful scene', () => {});
    await expect(
      scene('A failed scene', () => {
        throw new Error('product failure');
      }),
    ).rejects.toThrow('product failure');

    expect(crew.events.map((event) => event.type)).toEqual([
      'scene:starts',
      'scene:finishes',
      'scene:starts',
      'scene:finishes',
    ]);
    expect(crew.events.filter((event) => event.type === 'scene:starts')).toHaveLength(2);
    expect(crew.events.filter((event) => event.type === 'scene:finishes')).toHaveLength(2);

    const successful = crew.events[1];
    const failed = crew.events[3];
    expect(successful.type === 'scene:finishes' && successful.outcome.status).toBe('success');
    expect(failed.type === 'scene:finishes' && failed.outcome.status).toBe('failure');
  });
});
