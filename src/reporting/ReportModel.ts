import { Outcome } from '../screenplay/Outcome.js';
import type { DomainEvent } from '../screenplay/StageEvents.js';

/**
 * One performed activity (a {@link Task} or {@link Interaction}) within a
 * scene, with its nested child activities.
 */
export interface ActivityReport {
  actor: string;
  description: string;
  outcome: Outcome;
  startedAt: number;
  durationMs: number;
  children: ActivityReport[];
}

/**
 * One scene (a test case, in runner terms) with its top-level activities.
 */
export interface SceneReport {
  name: string;
  outcome: Outcome;
  startedAt: number;
  durationMs: number;
  activities: ActivityReport[];
}

/**
 * The whole test run: summary counts plus every scene.
 */
export interface RunReport {
  startedAt: number;
  finishedAt: number;
  durationMs: number;
  total: number;
  succeeded: number;
  failed: number;
  scenes: SceneReport[];
}

/**
 * Marks every still-open activity across every actor's stack as interrupted
 * (failed) with its duration run to `closedAt`, floored. Called whenever a
 * scene closes — normally, by end-of-fold, or superseded by a new
 * `scene:starts` — so a partial activity tree never keeps its optimistic
 * `successful()`/`0ms` placeholder once its enclosing scene is done.
 */
function interruptOpenActivities(
  openActivities: Map<string, ActivityReport[]>,
  closedAt: number,
): void {
  for (const stack of openActivities.values()) {
    for (const activity of stack) {
      activity.outcome = Outcome.from(
        new Error(
          `Activity "${activity.description}" started but never finished — the enclosing scene closed while it was still open (interrupted)`,
        ),
      );
      activity.durationMs = Math.max(0, closedAt - activity.startedAt);
    }
  }
}

/**
 * Marks a scene itself as interrupted (failed) because it closed without a
 * matching `scene:finishes` — end-of-fold, or a second `scene:starts`
 * arriving while it was still open. `reason` names *why* it closed, so the
 * two call sites produce an accurate message rather than a generic one.
 */
function interruptScene(scene: SceneReport, closedAt: number, reason: string): void {
  scene.outcome = Outcome.from(
    new Error(`Scene "${scene.name}" started but never finished — ${reason} (interrupted)`),
  );
  scene.durationMs = Math.max(0, closedAt - scene.startedAt);
}

/**
 * Pure builder: folds a stream of stamped {@link DomainEvent domain events}
 * into a {@link RunReport}. No I/O, no clock — timing comes exclusively from
 * the event timestamps.
 *
 * Activity nesting is reconstructed from emission order with a per-actor
 * stack (a task's `activity:starts` brackets its children's events before the
 * task's own `activity:finishes`), so interleaved activities of concurrent
 * actors do not mis-nest.
 *
 * The builder is deliberately defensive: orphan `activity:*` events (no open
 * scene, or a finish/fail with nothing on that actor's stack) and orphan
 * `scene:finishes` events are ignored rather than thrown, so a crashed run
 * still renders a partial report. A scene that closes (normally, by
 * end-of-fold, or by a second `scene:starts` arriving while it was still
 * open) without every activity having finished reports each still-open
 * activity as failed (interrupted), not its optimistic start-time
 * placeholder. A scene itself that closes without ever finishing is reported
 * as failed (interrupted) too — the partial report must not read as green in
 * exactly the crashed-run case it exists to survive, at either level.
 */
export function buildReport(events: DomainEvent[]): RunReport {
  const scenes: SceneReport[] = [];
  let currentScene: SceneReport | undefined;
  let openActivities = new Map<string, ActivityReport[]>();
  let runFinishedAt: number | undefined;

  for (const event of events) {
    switch (event.type) {
      case 'scene:starts':
        // Overlapping scenes: an earlier scene never got scene:finishes before this
        // one started (a mis-wired manual sceneStarts/sceneFinishes facade). Close it
        // as interrupted — scene and any still-open activities — rather than leaving
        // it abandoned at its optimistic placeholder, still counted as passed.
        if (currentScene) {
          interruptOpenActivities(openActivities, event.timestamp);
          interruptScene(
            currentScene,
            event.timestamp,
            `a new scene ("${event.name}") started while it was still open`,
          );
        }
        currentScene = {
          name: event.name,
          outcome: Outcome.successful(),
          startedAt: event.timestamp,
          durationMs: 0,
          activities: [],
        };
        scenes.push(currentScene);
        openActivities = new Map();
        break;

      case 'activity:starts': {
        if (!currentScene) break; // orphan: no open scene
        const activity: ActivityReport = {
          actor: event.actor,
          description: event.activity,
          outcome: Outcome.successful(),
          startedAt: event.timestamp,
          durationMs: 0,
          children: [],
        };
        const stack = openActivities.get(event.actor) ?? [];
        const parent = stack[stack.length - 1];
        (parent ? parent.children : currentScene.activities).push(activity);
        stack.push(activity);
        openActivities.set(event.actor, stack);
        break;
      }

      case 'activity:finishes': {
        const activity = openActivities.get(event.actor)?.pop();
        if (!activity) break; // orphan: nothing open for this actor
        // Floor at zero: a non-monotonic clock must not yield a negative duration.
        activity.durationMs = Math.max(0, event.timestamp - activity.startedAt);
        break;
      }

      case 'activity:fails': {
        const activity = openActivities.get(event.actor)?.pop();
        if (!activity) break; // orphan: nothing open for this actor
        activity.durationMs = Math.max(0, event.timestamp - activity.startedAt);
        activity.outcome = Outcome.from(event.error);
        break;
      }

      case 'scene:finishes':
        if (!currentScene) break; // orphan: no open scene
        // The scene itself got a real outcome from the event, but any activity still
        // open on its stack did not — close those as interrupted, not left passing.
        interruptOpenActivities(openActivities, event.timestamp);
        currentScene.outcome = event.outcome;
        currentScene.durationMs = Math.max(0, event.timestamp - currentScene.startedAt);
        currentScene = undefined;
        openActivities = new Map();
        break;

      case 'test-run:finishes':
        runFinishedAt = event.timestamp;
        break;
    }
  }

  // Crash truth: a scene still open when the fold ends never got its real outcome,
  // so its initial placeholder must not stand as a pass. Report it — and any of its
  // activities still open — as interrupted, with duration running to the end of the
  // fold (floored, as everywhere).
  if (currentScene) {
    const endOfFold =
      runFinishedAt ??
      (events.length > 0 ? events[events.length - 1].timestamp : currentScene.startedAt);
    interruptOpenActivities(openActivities, endOfFold);
    interruptScene(currentScene, endOfFold, 'the run ended while it was still open');
  }

  // Prefer the first scene's start as the run start: a stray pre-scene event (or a
  // non-monotonic clock) must not make the run appear to start before its first scene.
  // Fall back to the first event only when no scene started at all.
  const startedAt =
    scenes.length > 0 ? scenes[0].startedAt : events.length > 0 ? events[0].timestamp : 0;
  const finishedAt =
    runFinishedAt ?? (events.length > 0 ? events[events.length - 1].timestamp : 0);
  const succeeded = scenes.filter((scene) => Outcome.isSuccessful(scene.outcome)).length;

  return {
    startedAt,
    finishedAt,
    durationMs: Math.max(0, finishedAt - startedAt),
    total: scenes.length,
    succeeded,
    failed: scenes.length - succeeded,
    scenes,
  };
}
