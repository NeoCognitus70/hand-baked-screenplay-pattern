# How the Event / Notification Layer Works

> **Audience:** Anyone who has read [Guide 01](./01-screenplay-flow.md) and wants
> to understand how the library surfaces what actors are doing — for logging,
> debugging, and reporting.
>
> **You'll learn:** the domain-event model, how the `Stage` broadcasts events to
> its crew, how to write your own `StageCrewMember`, and how the flat event
> stream reconstructs into a nested activity tree.

---

## 1. Why an event layer at all?

The screenplay building blocks could just *do their work* silently. But to
**observe** a run — log it, time it, build a report — something needs to know
when each activity starts, finishes, or fails, **without** the activities
themselves knowing about logging.

The library solves this with a tiny publish/subscribe layer:

- The **`Stage`** is the publisher. As actors perform, it **announces**
  `DomainEvent`s.
- **`StageCrewMember`s** are the subscribers. Each is **notified of** every event
  and decides what to do with it.

This keeps observation completely decoupled from the screenplay. Actors, tasks,
interactions, and questions never import a logger.

```mermaid
graph LR
    A[Actor.attemptsTo] -->|announce| S[Stage]
    S -->|notifyOf| C1[ConsoleReporter]
    S -->|notifyOf| C2[Your custom crew member]
    S -->|notifyOf| C3[A reporter ...]
```

---

## 2. The domain-event model

Defined in [`src/screenplay/StageEvents.ts`](../src/screenplay/StageEvents.ts).
The events span **activity, scene, and run level**, and every event a crew
member receives is stamped with a `timestamp` by the `Stage`:

```ts
type DomainEventDetails =
  | { readonly type: 'activity:starts';   readonly actor: string; readonly activity: string }
  | { readonly type: 'activity:finishes'; readonly actor: string; readonly activity: string }
  | { readonly type: 'activity:fails';    readonly actor: string; readonly activity: string; readonly error: Error }
  | { readonly type: 'scene:starts';      readonly name: string }
  | { readonly type: 'scene:finishes';    readonly name: string; readonly outcome: Outcome }
  | { readonly type: 'test-run:finishes' };

export type DomainEventInput = DomainEventDetails & {
  readonly extension?: ExecutionExtension;
};

export type DomainEvent = DomainEventInput & { readonly timestamp: number };

export interface StageCrewMember {
  notifyOf(event: DomainEvent): void;
}
```

- It's a **discriminated union** on `type`, so a `switch (event.type)` narrows the
  shape and TypeScript knows `error` only exists on `activity:fails`, `outcome`
  only on `scene:finishes`.
- `actor` is the actor's name; `activity` is the activity's `toString()`
  description (the `#actor ...` strings you write); `name` is the scene's name.
- Call sites build the un-stamped `DomainEventInput`; the `Stage` adds the
  `timestamp` on announce (§3) — crew members only ever see the stamped
  `DomainEvent`.
- `extension` is an optional, provider-owned envelope (§2.1). Existing event
  names and required fields are unchanged.
- A `StageCrewMember` is anything with a single `notifyOf(event)` method.

The scene and run events are what lets a reporter group activities per test
case and know when to render — see [`HtmlReporter`](../src/crew/HtmlReporter.ts)
and the [static HTML reporting plan](../planning/static-html-reporting.md),
which this model implements.

### 2.1 Provider extensions without flattened outcomes

Adapters sometimes need to retain a native runner outcome or metadata that the
small canonical `Outcome` union does not model. `ExecutionExtension` carries
that data without teaching the core how every provider represents execution:

```ts
type RunnerOutcome =
  | { status: 'blocked'; cause: 'environment'; reason: string }
  | { status: 'failed'; cause: 'product'; defectId: string };

interface RunnerMetadata {
  scenarioId: string;
  tags: readonly string[];
}

const native: ExecutionExtension<RunnerOutcome, RunnerMetadata> = {
  provider: 'example-runner',
  outcome: {
    status: 'blocked',
    cause: 'environment',
    reason: 'database unavailable',
  },
  metadata: { scenarioId: 'scenario-42', tags: ['@api'] },
};

stage.sceneFinishes(
  'The environment is available',
  Outcome.from(new Error('database unavailable')), // canonical compatibility path
  native,                                           // lossless provider data
);
```

The `provider` identifies the owner of the data; `outcome` and `metadata` remain
generic so an adapter retains its discriminated native types. The `Stage`
preserves the envelope when it adds the timestamp. Built-in reporters continue
to read only canonical fields and safely ignore extensions they do not know.
Provider-specific crew members can inspect `event.extension` and narrow it for
their provider.

The lifecycle methods `sceneStarts`, `sceneFinishes`, and `testRunFinishes`
accept an optional extension. `Stage.announce(...)` accepts it on activity
events too. Omitting it produces the exact existing event shapes and behaviour.

**One scenario, one lifecycle owner.** Under
[ADR 0001](./adr/0001-provider-selection-boundary.md), the selected runner or
provider owns scene start, finish, and failure signalling for its execution
lane. An adapter must enrich that owner's events; it must not emit a second,
competing `Stage` lifecycle around the same scenario. This prevents duplicate
starts/finishes and conflicting outcomes.

---

## 3. Who announces, and when

Two pieces collaborate.

**The `Stage`** holds the crew and broadcasts to them
([`src/screenplay/Stage.ts`](../src/screenplay/Stage.ts)):

```ts
assign(...crewMembers: StageCrewMember[]): void {
  this.crew.push(...crewMembers);
}

announce(event: DomainEventInput): void {
  const stamped: DomainEvent = { ...event, timestamp: this.now() };
  for (const member of this.crew) {
    member.notifyOf(stamped);
  }
}
```

`announce` is where the un-stamped `DomainEventInput` a call site builds becomes the
stamped `DomainEvent` a crew member receives — the injectable `now()` clock (defaulting
to `Date.now`) is what lets tests control timestamps deterministically.

**The `Actor`** announces around every activity it performs
([`src/screenplay/Actor.ts`](../src/screenplay/Actor.ts)):

```ts
async attemptsTo(...activities: Activity[]): Promise<void> {
  for (const activity of activities) {
    const description = activity.toString();
    this.stage.announce({ type: 'activity:starts', actor: this.name, activity: description });
    try {
      await activity.performAs(this);
      this.stage.announce({ type: 'activity:finishes', actor: this.name, activity: description });
    } catch (error) {
      this.stage.announce({ type: 'activity:fails', actor: this.name, activity: description, error: ... });
      throw error; // re-throw so the test still fails
    }
  }
}
```

So for every activity you get **exactly one** `starts`, followed by **either**
`finishes` **or** `fails`. On failure the error is announced *and* re-thrown.

```mermaid
sequenceDiagram
    participant Actor
    participant Stage
    participant Crew

    Actor->>Stage: announce(activity:starts)
    Stage->>Crew: notifyOf(activity:starts)
    Note over Actor: await activity.performAs(actor)
    alt success
        Actor->>Stage: announce(activity:finishes)
        Stage->>Crew: notifyOf(activity:finishes)
    else throws
        Actor->>Stage: announce(activity:fails, error)
        Stage->>Crew: notifyOf(activity:fails)
        Actor-->>Actor: re-throw
    end
```

---

## 4. The built-in `ConsoleReporter`

The simplest possible crew member
([`src/crew/ConsoleReporter.ts`](../src/crew/ConsoleReporter.ts)) just prints:

```ts
export class ConsoleReporter implements StageCrewMember {
  constructor(private readonly log: (line: string) => void = console.log) {}

  notifyOf(event: DomainEvent): void {
    switch (event.type) {
      case 'activity:starts':   this.log(`${event.actor} begins: ${event.activity}`); break;
      case 'activity:finishes': this.log(`${event.actor} done:   ${event.activity}`); break;
      case 'activity:fails':    this.log(`${event.actor} fails:  ${event.activity} — ${event.error.message}`); break;
    }
  }
}
```

Note the injectable `log` sink — pass your own function to capture output in a
test instead of writing to the console. Wire it up with `assign`:

```ts
const stage = new Stage(Cast.whereEveryoneCan(/* abilities */));
stage.assign(new ConsoleReporter());
// ...actors now produce a running commentary as they perform.
```

(The default-stage helper `assign(...)` does the same for `actorCalled(...)`.)

---

## 5. Writing your own crew member

Implement the one-method interface. Here's a timing reporter that measures how
long each activity takes. It keeps **a start-time stack per actor** (keyed by
`event.actor`) and uses the event's **stamped `timestamp`** rather than calling
`Date.now()` — the same two rules the tree reconstruction relies on (see §6):

```ts
import type { DomainEvent, StageCrewMember } from 'hand-baked-screenplay-pattern';

export class TimingReporter implements StageCrewMember {
  // One stack of start timestamps per actor, so interleaved actors don't mispair.
  private readonly started = new Map<string, number[]>();
  readonly timings: { actor: string; activity: string; ms: number; ok: boolean }[] = [];

  notifyOf(event: DomainEvent): void {
    switch (event.type) {
      case 'activity:starts': {
        const stack = this.started.get(event.actor) ?? [];
        stack.push(event.timestamp); // the Stage-stamped time, not Date.now()
        this.started.set(event.actor, stack);
        break;
      }
      case 'activity:finishes':
      case 'activity:fails': {
        const start = this.started.get(event.actor)?.pop() ?? event.timestamp;
        this.timings.push({
          actor: event.actor,
          activity: event.activity,
          ms: event.timestamp - start,
          ok: event.type === 'activity:finishes',
        });
        break;
      }
    }
  }
}
```

Why the per-actor key (and the stamped timestamp) matter — imagine Ada and Bob
performing concurrently, so their events interleave:

```text
starts    Ada  GET /health     <-- push onto Ada's stack
starts    Bob  GET /version    <-- push onto Bob's stack
finishes  Bob  GET /version    <-- pop Bob's stack  → pairs with Bob's start
finishes  Ada  GET /health     <-- pop Ada's stack  → pairs with Ada's start
```

A single global stack would pop Bob's finish against **Ada's** start time, timing
the wrong activity. Keying by `event.actor` keeps each pairing correct — exactly
the rule §6 uses to rebuild the tree. Using `event.timestamp` (stamped once, on
announce) instead of a fresh `Date.now()` also keeps the measurement tied to when
the event actually happened, not to when this reporter got around to handling it.

That's the whole extension point. Anything you can express as "react to a stream
of start/finish/fail events" — logging, metrics, JSON output, a progress bar —
is a `StageCrewMember`.

---

## 6. Flat stream in, nested tree out

The events arrive as a **flat stream**, but they encode a **tree**. Because a
`Task`'s `performAs` calls `actor.attemptsTo(...children)`, a task's `starts` is
always announced *before* its children's events, and its `finishes` *after* them
(see Guide 01 §7). So the stream is a depth-first traversal:

```text
starts   Task: signs up           <-- push
  starts   Send POST /users       <-- push (child of Task)
  finishes Send POST /users       <-- pop
  starts   Ensure status == 201
  finishes Ensure status == 201
  starts   Remember 'userId'
  finishes Remember 'userId'
finishes Task: signs up           <-- pop
```

To rebuild the tree, a reporter keeps a **stack per actor**: push on `starts`,
and on `finishes`/`fails` pop and attach the node to its parent (the new top of
the stack), or to the root if the stack is empty.

```mermaid
graph TD
    Root["(run)"] --> T["Task: signs up"]
    T --> S["Send POST /users"]
    T --> E["Ensure status == 201"]
    T --> R["Remember 'userId'"]
```

> **Why per-actor?** If two actors perform concurrently, their events interleave
> in the stream. Keying the stack by `event.actor` keeps each actor's nesting
> correct. A single global stack would mis-nest interleaved activities.

---

## 7. What this enables next

This layer is intentionally minimal, but it's the foundation for richer tooling
without changing any screenplay code:

- **Logging / debugging** — `ConsoleReporter` today.
- **Metrics** — the `TimingReporter` above.
- **Static HTML reports** — [`HtmlReporter`](../src/crew/HtmlReporter.ts) buffers
  events, reconstructs the tree (per §6), and renders a file on a
  `test-run:finishes` signal. See
  [`planning/static-html-reporting.md`](../planning/static-html-reporting.md)
  for the design this shipped from.

Because observation is decoupled, you can add any of these by writing a new crew
member and `assign`-ing it — actors, tasks, interactions, and questions never
change.

---

## 8. Where to look in the code

| Concept | File |
|---|---|
| `DomainEvent` union & `StageCrewMember` | [`src/screenplay/StageEvents.ts`](../src/screenplay/StageEvents.ts) |
| `Stage.assign` / `Stage.announce` | [`src/screenplay/Stage.ts`](../src/screenplay/Stage.ts) |
| Where events are emitted (`attemptsTo`) | [`src/screenplay/Actor.ts`](../src/screenplay/Actor.ts) |
| Example crew member | [`src/crew/ConsoleReporter.ts`](../src/crew/ConsoleReporter.ts) |
| Shipped `HtmlReporter` | [`src/crew/HtmlReporter.ts`](../src/crew/HtmlReporter.ts) |
| Reporting design this shipped from | [`planning/static-html-reporting.md`](../planning/static-html-reporting.md) |

---

### Next steps

- Add a `TimingReporter` (above) to the example run and print the slowest steps.
- Read the reporting plan and see how scene/run events extend this same model.
