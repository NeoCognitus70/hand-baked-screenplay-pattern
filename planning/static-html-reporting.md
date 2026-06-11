# Implementation Plan: Static HTML Reporting

> **Status:** Ready to implement
> **Audience:** Any engineer or automated agent picking up this work.
> **Prerequisite reading:** the root `README.md` and the existing source under
> `src/screenplay/`, especially `StageEvents.ts`, `Stage.ts`, `Actor.ts`, and
> the existing `src/crew/ConsoleReporter.ts`.

This document is self-contained. It specifies exactly what to build, where,
and how to validate it. Follow it top to bottom; each task ends in a state you
can verify before moving on.

---

## 1. Objective

Add the capability to **surface test results as a single self-contained static
HTML file produced after a run**, by listening to the domain events the `Stage`
already announces.

This is **not** a replication of Serenity/JS reporting. It is one HTML file,
generated post-run, with inline CSS/JS and no external dependencies.

### In scope
- A report data model (run → scenes → nested activities, each with an outcome and timing).
- An `HtmlReporter` crew member that accumulates that model from events and writes one `.html` file when the run finishes.
- The minimal event and lifecycle additions needed to group activities into scenes and to know when the run is over.
- A runner-agnostic `scene(name, fn)` helper to delimit scenes.

### Out of scope (do not build)
- Live/streaming reporting, screenshots or other artifacts, JSON/REST report feeds, multi-file dashboards, external templating engines, or test-runner plugins.

---

## 2. Design decisions (already agreed — do not re-litigate)

| Topic | Decision |
|---|---|
| **Scene API** | Ship the `scene(name, fn)` wrapper as the **primary** API, **and** expose raw facade calls (`sceneStarts` / `sceneFinishes` / `testRunFinishes`) for manual wiring to a runner's hooks. |
| **Output path** | Default to `./report/index.html`, configurable via `HtmlReporter.storingReportsAt(dir)`. |
| **Timing** | Minimal: the `Stage` stamps each event with a `timestamp` using an injectable `now()` function. Do **not** introduce a full `Clock` / `TellsTime` abstraction. |
| **Runner integration** | Keep it runner-agnostic. No Vitest plugin. The demo/spec calls `testRunFinishes()` in an `afterAll`. |

### Terminology note
In the Screenplay vocabulary, "ability" is a specific concept (something an
`Actor` is granted). Reporting is **not** an actor `Ability`. Following the
Serenity/JS model, reporting is implemented as a **`StageCrewMember`** that
observes events. Do not create an `Ability` subclass for this.

---

## 3. Naming conventions (Serenity/JS-inspired)

Mirror these names so the concepts transfer to/from Serenity/JS:

| This project | Serenity/JS analogue |
|---|---|
| `scene:starts`, `scene:finishes` (events) | `SceneStarts`, `SceneFinished` |
| `test-run:finishes` (event) | `TestRunFinishes` |
| `Outcome`: `ExecutionSuccessful`, `ExecutionFailedWithAssertionError`, `ExecutionFailedWithError` | same names |
| `HtmlReporter` (a `StageCrewMember`) | `SerenityBDDReporter`, `ConsoleReporter` |
| `scene(name, fn)` helper | runner adapters (`@serenity-js/jasmine`, etc.) |

---

## 4. Current state & the gap to close

The current event model (`src/screenplay/StageEvents.ts`) is **activity-only**:

```ts
export type DomainEvent =
  | { type: 'activity:starts';   actor: string; activity: string }
  | { type: 'activity:finishes'; actor: string; activity: string }
  | { type: 'activity:fails';    actor: string; activity: string; error: Error };
```

`Actor.attemptsTo` (`src/screenplay/Actor.ts`) announces `activity:starts`
before each activity and `activity:finishes` / `activity:fails` after. Because a
`Task`'s `performAs` calls `actor.attemptsTo(...children)`, **activity events are
already correctly nested in emission order** (a task's `starts` brackets its
children before the task's own `finishes`). The reporter reconstructs the tree
from this ordering with a **per-actor stack** — no activity IDs are required.

Two things are missing for a *test report*:
1. **Scenes** — a named grouping of activities with a pass/fail outcome.
2. **A run-finished signal** — a terminal event that tells the file writer when to render.

---

## 5. Architecture & event flow

```
 actor.attemptsTo(...)   ──announce──►  Stage  ──notifyOf──►  [ StageCrewMembers ]
 scene(name, fn) wrapper ──announce──►   │                     ├─ ConsoleReporter (exists)
 stage.testRunFinishes() ──announce──►   │                     └─ HtmlReporter (NEW)
                                                                     │ buffers events
                                          on 'test-run:finishes' ────► buildReport()
                                                                     ► renderHtml()
                                                                     ► write ./report/index.html
```

The `HtmlReporter` is passive — it only reacts to events. Scene grouping and the
run-finished signal come from the orchestration layer (the `scene` helper and
the facade methods).

---

## 6. File-by-file specification

Paths are relative to the repository root. "Changed" files exist today;
"New" files must be created. After creating new files, wire up exports in the
relevant `index.ts` barrels and in `src/index.ts`.

### 6.1 CHANGED — `src/screenplay/StageEvents.ts`

Extend the `DomainEvent` union and add a shared `timestamp` field.

- Add a required `timestamp: number` (epoch milliseconds) to **every** event variant. The `Stage` populates this on announce (Section 6.2), so callers that already build events must not set it — see note below.
- Add new variants:
  - `{ type: 'scene:starts'; name: string; timestamp: number }`
  - `{ type: 'scene:finishes'; name: string; outcome: Outcome; timestamp: number }`
  - `{ type: 'test-run:finishes'; timestamp: number }`
- Import `Outcome` from `./Outcome.js`.

**Timestamp wiring decision:** to avoid every call site having to supply a
timestamp, define an internal "event without timestamp" input type and have the
`Stage.announce` method add the timestamp. Concretely:

```ts
export type DomainEventInput =
  | { type: 'activity:starts';   actor: string; activity: string }
  | { type: 'activity:finishes'; actor: string; activity: string }
  | { type: 'activity:fails';    actor: string; activity: string; error: Error }
  | { type: 'scene:starts';      name: string }
  | { type: 'scene:finishes';    name: string; outcome: Outcome }
  | { type: 'test-run:finishes' };

export type DomainEvent = DomainEventInput & { timestamp: number };
```

`StageCrewMember.notifyOf` continues to receive the fully-stamped `DomainEvent`.

### 6.2 CHANGED — `src/screenplay/Stage.ts`

1. Constructor gains an optional injectable clock: `constructor(cast: Cast, now: () => number = () => Date.now())`. Store `now`.
2. `announce(event: DomainEventInput): void` stamps the timestamp before notifying crew: build `{ ...event, timestamp: this.now() }` and pass to each `member.notifyOf(...)`.
3. Add facade methods on the `Stage` class:
   - `sceneStarts(name: string): void` → `this.announce({ type: 'scene:starts', name })`
   - `sceneFinishes(name: string, outcome: Outcome): void` → announce `scene:finishes`
   - `testRunFinishes(): void` → announce `test-run:finishes`
4. Add module-level default-stage functions next to the existing `actorCalled` / `engage` / `assign` / `actorInTheSpotlight`:
   - `sceneStarts(name)`, `sceneFinishes(name, outcome)`, `testRunFinishes()` delegating to the default stage.
5. `Actor.attemptsTo` already calls `this.stage.announce(...)` with un-stamped events — confirm it now type-checks against `DomainEventInput`. (It will, since it never sets `timestamp`.)

### 6.3 NEW — `src/screenplay/Outcome.ts`

The outcome model used by scenes and activities.

```ts
import { AssertionError } from '../errors/index.js';

export type Outcome =
  | { readonly status: 'success' }
  | { readonly status: 'failure'; readonly kind: 'assertion'; readonly error: Error }
  | { readonly status: 'failure'; readonly kind: 'error'; readonly error: Error };

export const Outcome = {
  successful(): Outcome { return { status: 'success' }; },

  /** Maps a thrown value (or absence of one) to an Outcome. */
  from(error?: unknown): Outcome {
    if (!error) return { status: 'success' };
    const e = error instanceof Error ? error : new Error(String(error));
    return e instanceof AssertionError
      ? { status: 'failure', kind: 'assertion', error: e }
      : { status: 'failure', kind: 'error', error: e };
  },

  isSuccessful(outcome: Outcome): boolean { return outcome.status === 'success'; },
};
```

> Note: `AssertionError` is exported from `src/errors/index.js`. `Outcome` is
> intentionally both a type and a const namespace object (a common TS idiom);
> verify the project's lint/tsconfig is happy with the merged declaration (it is
> under the current `tsconfig.json`).

### 6.4 NEW — `src/reporting/ReportModel.ts`

Pure types plus a **pure builder** (events in → model out). No I/O, no Date.now.

```ts
export interface ActivityReport {
  actor: string;
  description: string;
  outcome: Outcome;
  startedAt: number;
  durationMs: number;
  children: ActivityReport[];
}
export interface SceneReport {
  name: string;
  outcome: Outcome;
  startedAt: number;
  durationMs: number;
  activities: ActivityReport[];
}
export interface RunReport {
  startedAt: number;
  finishedAt: number;
  durationMs: number;
  total: number;
  succeeded: number;
  failed: number;
  scenes: SceneReport[];
}

export function buildReport(events: DomainEvent[]): RunReport;
```

**Builder algorithm:**
- Track the current open scene and a **stack of open activities, keyed by actor**
  (a `Map<string, ActivityReport[]>`). This handles nesting and concurrent actors.
- `scene:starts` → open a new `SceneReport` (record `startedAt`); reset per-actor stacks for this scene.
- `activity:starts` → create an `ActivityReport` (outcome provisionally `successful`, record `startedAt`); push onto that actor's stack. If the stack already had a parent, append as the parent's child; otherwise append to the scene's top-level `activities`.
- `activity:finishes` → pop that actor's stack; set `durationMs = timestamp - startedAt`; outcome stays `successful`.
- `activity:fails` → pop; set `durationMs`; set `outcome = Outcome.from(error)`.
- `scene:finishes` → close the scene: set its `outcome` (from the event), `durationMs = timestamp - startedAt`.
- `test-run:finishes` → finalize the run: `finishedAt = timestamp`; `startedAt = first event timestamp` (or first scene start); compute `total` / `succeeded` / `failed` from scene outcomes.
- Be defensive: ignore an `activity:*` with no open scene, and a `scene:finishes` with no open scene, rather than throwing (a malformed event stream should still render *something*).

### 6.5 NEW — `src/reporting/renderHtml.ts`

Pure function: `renderHtml(report: RunReport): string`. No I/O.

- Produces a complete, standalone HTML document.
- **Summary band:** overall status (green if `failed === 0`, else red), counts (`total`, `succeeded`, `failed`), total duration, and a human-readable timestamp.
- **Per-scene section:** name, status pill, duration; clickable to expand/collapse.
- **Activity tree:** indented nesting (tasks → interactions), each with a ✓/✗ marker and duration. For failures, show the error message and `kind`; include the stack for `kind: 'error'`.
- Inline `<style>` and a few lines of vanilla `<script>` for collapse/expand. **No external assets or network requests.**
- **Escape all dynamic text** (scene names, activity descriptions, error messages, stacks) with a small local `escapeHtml` helper to avoid breaking the markup.

### 6.6 NEW — `src/crew/HtmlReporter.ts`

The `StageCrewMember` that ties events to a file on disk.

```ts
export type ReportWriter = (filePath: string, contents: string) => void;

export class HtmlReporter implements StageCrewMember {
  static storingReportsAt(directory: string): HtmlReporter;   // default './report'
  // For tests: allow injecting a writer instead of touching the real FS.
  withWriter(writer: ReportWriter): HtmlReporter;

  notifyOf(event: DomainEvent): void;   // buffers every event
}
```

- Buffer every event in an array.
- On `test-run:finishes`: call `buildReport(buffer)` → `renderHtml(model)` → write to `<directory>/index.html`.
- File output path: `<directory>/index.html` (default directory `./report`).
- The default `ReportWriter` uses `node:fs` (`mkdirSync(dir, { recursive: true })` then `writeFileSync`). Keep the `node:fs` import **inside** the default writer so the pure paths stay FS-free and the class is easy to test with an injected writer.
- Write exactly once per `test-run:finishes`.

### 6.7 NEW — `src/scene/scene.ts`

Runner-agnostic primary API for delimiting scenes.

```ts
import { sceneStarts, sceneFinishes } from '../screenplay/Stage.js';
import { Outcome } from '../screenplay/Outcome.js';

export async function scene(name: string, body: () => Promise<void> | void): Promise<void> {
  sceneStarts(name);
  try {
    await body();
    sceneFinishes(name, Outcome.successful());
  } catch (error) {
    sceneFinishes(name, Outcome.from(error));
    throw error;   // re-throw so the test still fails
  }
}
```

- Uses the **default stage** facade functions so it composes with `actorCalled(...)`.
- Re-throws after recording the outcome, so a failing scene still fails the test.
- (Optional, only if trivial) provide a `Stage`-bound variant for users not using the default stage; otherwise document that the default-stage `scene` is the supported path.

### 6.8 CHANGED — barrels / exports

- `src/screenplay/index.ts`: export `Outcome`, the new facade functions (`sceneStarts`, `sceneFinishes`, `testRunFinishes`), and the extended event types.
- `src/crew/index.ts`: export `HtmlReporter` and `ReportWriter`.
- Add `src/reporting/index.ts` exporting `buildReport`, `renderHtml`, and the model types.
- Add `src/scene/index.ts` exporting `scene`.
- `src/index.ts`: re-export the new `reporting` and `scene` modules so they are part of the public API.

---

## 7. Worked example (target usage)

This is what a consumer should be able to write once the feature is done. Use it
as the basis for the end-to-end spec (Section 8, task 6).

```ts
import {
  Cast, Stage, actorCalled, engage, assign,
  scene, testRunFinishes,
  HtmlReporter,
  MakeRequests, Send, LastResponse, Ensure, equals,
} from 'hand-baked-screenplay-pattern';

engage(Cast.whereEveryoneCan(MakeRequests.using(client)));
assign(HtmlReporter.storingReportsAt('./report'));

await scene('Ada checks the health endpoint', async () => {
  await actorCalled('Ada').attemptsTo(
    Send.a({ method: 'GET', url: '/health' }),
    Ensure.that(LastResponse.status(), equals(200)),
  );
});

testRunFinishes();   // writes ./report/index.html
```

---

## 8. Implementation tasks & validation

Implement in this order. Run `npm run verify` (typecheck + build + test) after
each task; do not proceed until it is green.

1. **Events + timestamps.** Implement 6.1 and 6.2 (`Outcome` import will dangle until task 2 — create a minimal `Outcome.ts` stub first, or do task 2 before 1). **Validate:** existing 19 tests still pass; `Stage.announce` stamps `timestamp`; add a focused test asserting a crew member receives a numeric `timestamp` (use a `Stage` constructed with a fixed `now: () => 1000`).

2. **Outcome model.** Implement 6.3. **Validate:** unit test `Outcome.from(new AssertionError('x'))` → `kind: 'assertion'`; `Outcome.from(new Error('x'))` → `kind: 'error'`; `Outcome.from(undefined)` → `status: 'success'`.

3. **Pure report builder.** Implement 6.4. **Validate:** feed a hand-written event array covering: two scenes, a nested `Task` with child interactions, one passing scene and one failing (assertion) scene, and ideally two actors. Assert the tree shape, per-scene outcomes, and run totals (`total`/`succeeded`/`failed`).

4. **Pure renderer.** Implement 6.5. **Validate:** `renderHtml(model)` returns a string containing the summary counts, each scene name, status pills, and a rendered error message. Assert an HTML-special character in a scene name is escaped. No filesystem involved.

5. **Reporter writes once.** Implement 6.6. **Validate:** construct `HtmlReporter` with an injected fake `ReportWriter`; feed a full event stream ending in `test-run:finishes`; assert the writer was called exactly once, with path ending `index.html` and non-empty HTML.

6. **`scene` helper + end-to-end.** Implement 6.7 and wire exports (6.8). **Validate:** run a real passing scene and a real failing scene against a `Stage` (or default stage) with an `HtmlReporter` using an injected writer (or a temp dir via `node:os`/`node:fs`); call `testRunFinishes()`; assert the captured HTML reports 1 pass / 1 fail. If writing to a temp dir, assert the file exists and clean it up.

7. **Docs.** Add a short "Reporting" section to `README.md` with the Section 7 example and a note that it is intentionally minimal (one static HTML file, post-run). **Validate:** `npm run verify` green; the README example matches the shipped API.

---

## 9. Acceptance criteria

- `npm run verify` is green (typecheck over `src` + `spec`, build emits `dist/`, all tests pass — existing 19 plus the new ones).
- Running the worked example produces a single, self-contained `index.html` that opens in a browser with no network access and accurately shows scenes, nested activities, outcomes, durations, and a pass/fail summary.
- No new runtime dependencies are added (Node's built-in `node:fs` only, inside the default writer). Dev dependencies unchanged.
- `buildReport`, `renderHtml`, and `Outcome.from` are pure and unit-tested in isolation; filesystem access is confined to `HtmlReporter`'s default writer and is injectable for tests.
- Naming follows Section 3; reporting is a `StageCrewMember`, not an actor `Ability`.

---

## 10. Risks & notes for the implementer

- **Concurrent actors in one scene:** the per-actor activity stack (keyed by actor name) handles this. If you only keep a single global stack you will mis-nest interleaved activities — use the keyed map.
- **Malformed/partial event streams:** the builder must be defensive (ignore orphan `activity:*` / `scene:finishes`) so a crashed run still renders a partial report rather than throwing inside the reporter.
- **HTML injection:** always escape dynamic text in `renderHtml`. Scene names, activity descriptions and error messages are user-controlled.
- **`Outcome` as type + value:** the merged `type` + `const` declaration is deliberate; keep both exports named `Outcome`.
- **Don't over-build:** resist adding artifacts, JSON output, or streaming. Those are explicitly out of scope.
