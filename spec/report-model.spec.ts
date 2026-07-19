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
    // The run starts at its first *scene* (40), not the stray pre-scene activity (10):
    // a stray event before any scene must not back-date the run.
    expect(report.startedAt).toBe(40);
    expect(report.finishedAt).toBe(60); // falls back to the last event timestamp
    expect(report.durationMs).toBe(20);
  });

  it('never reports a negative duration under a non-monotonic clock', () => {
    // Finishes arrive with timestamps earlier than their matching starts, and the
    // run's last event predates its first scene — a clock that went backwards.
    const nonMonotonic: DomainEvent[] = [
      { type: 'scene:starts', name: 'Backwards scene', timestamp: 1000 },
      starts('Ada', '#actor does a thing', 1100), // task
      starts('Ada', '#actor does a child thing', 1200), // child interaction
      finishes('Ada', '#actor does a child thing', 900), // clock went backwards
      fails('Ada', '#actor does a thing', new AssertionError('boom'), 800),
      {
        type: 'scene:finishes',
        name: 'Backwards scene',
        outcome: Outcome.successful(),
        timestamp: 700,
      },
      { type: 'test-run:finishes', timestamp: 500 },
    ];

    const report = buildReport(nonMonotonic);
    const [scene] = report.scenes;
    const [task] = scene.activities;

    // Every rendered duration is floored at zero.
    expect(report.durationMs).toBeGreaterThanOrEqual(0);
    expect(scene.durationMs).toBeGreaterThanOrEqual(0);
    expect(task.durationMs).toBeGreaterThanOrEqual(0);
    expect(task.children[0].durationMs).toBeGreaterThanOrEqual(0);

    // The run does not start before its first scene.
    expect(report.startedAt).toBe(1000);
  });

  it('reports a scene that starts but never finishes as not passed (crash truth), and its still-open activity likewise', () => {
    // A crashed run: the scene opens, an activity begins, the run ends —
    // no scene:finishes ever arrives. The placeholder outcome must not stand,
    // at either the scene level or the still-open activity's.
    const interrupted: DomainEvent[] = [
      { type: 'scene:starts', name: 'Ada is interrupted mid-scene', timestamp: 100 },
      starts('Ada', '#actor begins a task that never completes', 110),
      { type: 'test-run:finishes', timestamp: 160 },
    ];

    const report = buildReport(interrupted);
    const [scene] = report.scenes;
    const [task] = scene.activities;

    expect(report.total).toBe(1);
    expect(report.succeeded).toBe(0);
    expect(report.failed).toBe(1);
    expect(Outcome.isSuccessful(scene.outcome)).toBe(false);
    expect(scene.outcome).toMatchObject({ status: 'failure', kind: 'error' });
    expect(
      scene.outcome.status === 'failure' ? scene.outcome.error.message : '',
    ).toContain('never finished');
    // Duration runs to the end of the fold, floored as everywhere.
    expect(scene.durationMs).toBe(60);

    // The task was still open (only activity:starts, no finishes/fails) when the
    // fold ended — it must not keep its optimistic successful()/0ms placeholder.
    expect(Outcome.isSuccessful(task.outcome)).toBe(false);
    expect(task.outcome).toMatchObject({ status: 'failure', kind: 'error' });
    expect(
      task.outcome.status === 'failure' ? task.outcome.error.message : '',
    ).toContain('never finished');
    expect(task.durationMs).toBe(50); // 160 - 110, same end-of-fold timestamp as the scene
  });

  it('interrupts an earlier scene, and any activity still open on it, when a second scene:starts arrives before it finishes', () => {
    // Overlapping scenes: a mis-wired manual sceneStarts/sceneFinishes facade lets
    // a second scene:starts arrive while the first is still open. The first must
    // not be abandoned at its optimistic placeholder and silently counted as passed.
    const overlapping: DomainEvent[] = [
      { type: 'scene:starts', name: 'First scene, never finished', timestamp: 100 },
      starts('Ada', '#actor begins a task that never completes', 110),
      { type: 'scene:starts', name: 'Second scene', timestamp: 200 },
      starts('Bob', '#actor performs cleanly', 210),
      finishes('Bob', '#actor performs cleanly', 220),
      {
        type: 'scene:finishes',
        name: 'Second scene',
        outcome: Outcome.successful(),
        timestamp: 230,
      },
    ];

    const report = buildReport(overlapping);

    expect(report.total).toBe(2);
    expect(report.succeeded).toBe(1);
    expect(report.failed).toBe(1);

    const [firstScene, secondScene] = report.scenes;

    // The first scene is interrupted at the moment the second scene starts (200),
    // not left open and counted as passed.
    expect(Outcome.isSuccessful(firstScene.outcome)).toBe(false);
    expect(firstScene.outcome).toMatchObject({ status: 'failure', kind: 'error' });
    expect(
      firstScene.outcome.status === 'failure' ? firstScene.outcome.error.message : '',
    ).toContain('a new scene');
    expect(firstScene.durationMs).toBe(100); // 200 - 100

    const [openTask] = firstScene.activities;
    expect(Outcome.isSuccessful(openTask.outcome)).toBe(false);
    expect(openTask.durationMs).toBe(90); // 200 - 110

    // The second scene is unaffected by the first's interruption — a fresh
    // openActivities map means it does not inherit the first scene's open task.
    expect(Outcome.isSuccessful(secondScene.outcome)).toBe(true);
    expect(secondScene.activities).toHaveLength(1);
    expect(Outcome.isSuccessful(secondScene.activities[0].outcome)).toBe(true);
  });

  it('floors an interrupted scene duration at zero under a non-monotonic clock', () => {
    const interruptedBackwards: DomainEvent[] = [
      { type: 'scene:starts', name: 'Backwards interrupted scene', timestamp: 1000 },
      { type: 'test-run:finishes', timestamp: 400 }, // clock went backwards
    ];

    const [scene] = buildReport(interruptedBackwards).scenes;

    expect(Outcome.isSuccessful(scene.outcome)).toBe(false);
    expect(scene.durationMs).toBe(0);
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
