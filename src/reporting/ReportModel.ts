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
 * still renders a partial report.
 */
export function buildReport(events: DomainEvent[]): RunReport {
  const scenes: SceneReport[] = [];
  let currentScene: SceneReport | undefined;
  let openActivities = new Map<string, ActivityReport[]>();
  let runFinishedAt: number | undefined;

  for (const event of events) {
    switch (event.type) {
      case 'scene:starts':
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
        activity.durationMs = event.timestamp - activity.startedAt;
        break;
      }

      case 'activity:fails': {
        const activity = openActivities.get(event.actor)?.pop();
        if (!activity) break; // orphan: nothing open for this actor
        activity.durationMs = event.timestamp - activity.startedAt;
        activity.outcome = Outcome.from(event.error);
        break;
      }

      case 'scene:finishes':
        if (!currentScene) break; // orphan: no open scene
        currentScene.outcome = event.outcome;
        currentScene.durationMs = event.timestamp - currentScene.startedAt;
        currentScene = undefined;
        openActivities = new Map();
        break;

      case 'test-run:finishes':
        runFinishedAt = event.timestamp;
        break;
    }
  }

  const startedAt = events.length > 0 ? events[0].timestamp : 0;
  const finishedAt =
    runFinishedAt ?? (events.length > 0 ? events[events.length - 1].timestamp : 0);
  const succeeded = scenes.filter((scene) => Outcome.isSuccessful(scene.outcome)).length;

  return {
    startedAt,
    finishedAt,
    durationMs: finishedAt - startedAt,
    total: scenes.length,
    succeeded,
    failed: scenes.length - succeeded,
    scenes,
  };
}
