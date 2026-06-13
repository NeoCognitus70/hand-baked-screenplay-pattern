import { describe, expect, it } from 'vitest';
import { AssertionError } from '../src/errors/index.js';
import { buildReport } from '../src/reporting/ReportModel.js';
import { Outcome } from '../src/screenplay/Outcome.js';
import type { DomainEvent } from '../src/screenplay/StageEvents.js';

const starts = (actor: string, activity: string, timestamp: number): DomainEvent => ({
  type: 'activity:starts',
  actor,
  activity,
  timestamp,
});
const finishes = (actor: string, activity: string, timestamp: number): DomainEvent => ({
  type: 'activity:finishes',
  actor,
  activity,
  timestamp,
});
const fails = (
  actor: string,
  activity: string,
  error: Error,
  timestamp: number,
): DomainEvent => ({ type: 'activity:fails', actor, activity, error, timestamp });

describe('buildReport', () => {
  const assertionError = new AssertionError('Expected version to equal 2');

  // Two scenes, two actors, a nested task with child interactions,
  // one passing scene and one failing (assertion) scene.
  const events: DomainEvent[] = [
    { type: 'scene:starts', name: 'Ada and Bob check the health endpoint', timestamp: 100 },
    starts('Ada', '#actor checks the health endpoint', 110), // task
    starts('Ada', '#actor sends GET /health', 120), // child interaction
    starts('Bob', '#actor reads the dashboard', 125), // interleaved second actor
    finishes('Ada', '#actor sends GET /health', 130),
    starts('Ada', '#actor verifies the status is 200', 140), // child interaction
    finishes('Ada', '#actor verifies the status is 200', 150),
    finishes('Bob', '#actor reads the dashboard', 155),
    finishes('Ada', '#actor checks the health endpoint', 160),
    {
      type: 'scene:finishes',
      name: 'Ada and Bob check the health endpoint',
      outcome: Outcome.successful(),
      timestamp: 170,
    },
    { type: 'scene:starts', name: 'Ada checks the version endpoint', timestamp: 200 },
    starts('Ada', '#actor checks the version', 210), // task
    starts('Ada', '#actor verifies the version is 2', 220), // child interaction
    fails('Ada', '#actor verifies the version is 2', assertionError, 230),
    fails('Ada', '#actor checks the version', assertionError, 240),
    {
      type: 'scene:finishes',
      name: 'Ada checks the version endpoint',
      outcome: Outcome.from(assertionError),
      timestamp: 250,
    },
    { type: 'test-run:finishes', timestamp: 300 },
  ];

  it('computes the run totals and timing from the event stream', () => {
    const report = buildReport(events);

    expect(report.total).toBe(2);
    expect(report.succeeded).toBe(1);
    expect(report.failed).toBe(1);
    expect(report.startedAt).toBe(100);
    expect(report.finishedAt).toBe(300);
    expect(report.durationMs).toBe(200);
  });

  it('records per-scene outcomes and durations', () => {
    const [healthScene, versionScene] = buildReport(events).scenes;

    expect(healthScene.name).toBe('Ada and Bob check the health endpoint');
    expect(healthScene.outcome).toEqual({ status: 'success' });
    expect(healthScene.startedAt).toBe(100);
    expect(healthScene.durationMs).toBe(70);

    expect(versionScene.name).toBe('Ada checks the version endpoint');
    expect(versionScene.outcome).toMatchObject({ status: 'failure', kind: 'assertion' });
    expect(versionScene.durationMs).toBe(50);
  });

  it('nests child interactions under their task using a per-actor stack', () => {
    const [healthScene] = buildReport(events).scenes;

    // Two top-level activities: Ada's task and Bob's interleaved interaction —
    // Bob's must NOT be nested under Ada's open task.
    expect(healthScene.activities).toHaveLength(2);
    const [adaTask, bobActivity] = healthScene.activities;

    expect(adaTask).toMatchObject({
      actor: 'Ada',
      description: '#actor checks the health endpoint',
      startedAt: 110,
      durationMs: 50,
      outcome: { status: 'success' },
    });
    expect(adaTask.children.map((child) => child.description)).toEqual([
      '#actor sends GET /health',
      '#actor verifies the status is 200',
    ]);
    expect(adaTask.children.map((child) => child.durationMs)).toEqual([10, 10]);
    expect(adaTask.children.every((child) => child.children.length === 0)).toBe(true);

    expect(bobActivity).toMatchObject({
      actor: 'Bob',
      description: '#actor reads the dashboard',
      durationMs: 30,
      children: [],
    });
  });

  it('marks the failing task and interaction with the assertion outcome', () => {
    const [, versionScene] = buildReport(events).scenes;
    const [task] = versionScene.activities;

    expect(task.outcome).toMatchObject({ status: 'failure', kind: 'assertion' });
    expect(task.children).toHaveLength(1);
    expect(task.children[0].outcome).toMatchObject({
      status: 'failure',
      kind: 'assertion',
      error: assertionError,
    });
  });

  it('ignores orphan activity and scene:finishes events instead of throwing', () => {
    const malformed: DomainEvent[] = [
      starts('Ada', '#actor acts before any scene', 10), // no open scene
      finishes('Ada', '#actor acts before any scene', 20), // no open scene
      { type: 'scene:finishes', name: 'never started', outcome: Outcome.successful(), timestamp: 30 },
      { type: 'scene:starts', name: 'A real scene', timestamp: 40 },
      finishes('Bob', '#actor never started this', 50), // nothing on Bob's stack
      {
        type: 'scene:finishes',
        name: 'A real scene',
        outcome: Outcome.successful(),
        timestamp: 60,
      },
    ];

    const report = buildReport(malformed);

    expect(report.total).toBe(1);
    expect(report.succeeded).toBe(1);
    expect(report.scenes[0].activities).toEqual([]);
    expect(report.startedAt).toBe(10);
    expect(report.finishedAt).toBe(60); // falls back to the last event timestamp
  });

  it('returns an empty report for an empty event stream', () => {
    expect(buildReport([])).toEqual({
      startedAt: 0,
      finishedAt: 0,
      durationMs: 0,
      total: 0,
      succeeded: 0,
      failed: 0,
      scenes: [],
    });
  });
});
