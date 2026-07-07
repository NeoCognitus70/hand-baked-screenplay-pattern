# hand-baked-screenplay-pattern

A small, **dependency-free** TypeScript implementation of the
[Screenplay Pattern](https://serenity-js.org/handbook/design/screenplay-pattern/).

It deliberately follows the **design model and naming conventions** popularised
by [Serenity/JS](https://github.com/serenity-js/serenity-js) — `Actor`,
`Ability`, `Task`, `Interaction`, `Question`, `Cast`, `Stage`,
`actor.whoCan(...).attemptsTo(...)`, `Question.about(...)`, `Ensure.that(...)` —
so that the concepts transfer directly.

> **Independent of Serenity/JS.** This project is a hand-baked, from-scratch
> implementation written for learning and lightweight use. It does **not** use,
> bundle, re-export, or depend on any `@serenity-js/*` package, and it is not
> affiliated with or endorsed by the Serenity/JS project. Serenity/JS is the
> reference for the *shape* of the API only.

## Why the Screenplay Pattern?

The Screenplay Pattern is a user-centred way to model test automation (and any
interaction-heavy code) using the [SOLID principles](https://en.wikipedia.org/wiki/SOLID).
Instead of page objects and procedural steps, you describe **actors** who, using
their **abilities**, perform **tasks** and **interactions** and ask **questions**
about the system under test. The result reads like the domain it tests.

```ts
await actor.attemptsTo(
  SignUp('ada@example.com'),
  Ensure.that(LastResponse.status(), equals(201)),
);
```

## Installation

```bash
npm install
npm run verify   # typecheck + build + test
```

This package targets Node.js 20+ and is shipped as native ES modules.

## The building blocks

| Concept       | Role |
| ------------- | ---- |
| **Actor**     | A person or external system interacting with the app. Created via `actorCalled('Ada')` or `stage.actor('Ada')`. |
| **Ability**   | Wraps an integration (HTTP, a data store, the clock). The *only* place that knows the mechanics. Retrieved with `actor.abilityTo(SomeAbility)`. |
| **Task**      | A business-level activity that composes other activities. `Task.where('#actor signs up', ...)`. |
| **Interaction** | A system-level activity that uses an ability directly. `Interaction.where('#actor clicks', actor => ...)`. |
| **Question**  | A query about the system's state. `Question.about('the status', actor => ...)`, answered via `actor.answer(...)`. |
| **Cast**      | Prepares actors with their abilities. `Cast.whereEveryoneCan(...)`. |
| **Stage**     | Instantiates/caches actors, tracks the one in the spotlight, and announces domain events to its crew. |
| **Ensure**    | An interaction that asserts a value meets an `Expectation` (`equals`, `isGreaterThan`, `isPresent`, `includes`, ...). |

### Lightweight notification layer

As actors perform activities, the `Stage` announces `DomainEvent`s
(`activity:starts` / `activity:finishes` / `activity:fails`) to any registered
`StageCrewMember`. A `ConsoleReporter` is included; implement the interface for
your own logging or reporting.

## Quick start

```ts
import {
  Cast,
  Ensure,
  LastResponse,
  MakeRequests,
  ManageData,
  Recall,
  Remember,
  Send,
  Stage,
  Task,
  equals,
  isPresent,
  type HttpClient,
} from 'hand-baked-screenplay-pattern';

// 1. Provide an ability's transport. In production back this with `fetch`.
const client: HttpClient = {
  async send(request) {
    const res = await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body === undefined ? undefined : JSON.stringify(request.body),
    });
    return {
      status: res.status,
      headers: Object.fromEntries(res.headers.entries()),
      body: await res.json(),
    };
  },
};

// 2. Capture intent as a Task, in the language of the domain.
const SignUp = (email: string) =>
  Task.where(
    `#actor signs up as ${email}`,
    Send.a({ method: 'POST', url: '/users', body: { email } }),
    Ensure.that(LastResponse.status(), equals(201)),
    Remember.that('userId', LastResponse.body<{ id: number }>()),
  );

// 3. Put actors on a stage with the abilities they need, and perform.
const stage = new Stage(
  Cast.whereEveryoneCan(MakeRequests.using(client), ManageData.usingAnEmptyStore()),
);

await stage.actor('Ada').attemptsTo(
  SignUp('ada@example.com'),
  Ensure.that(Recall.the('userId'), isPresent()),
);
```

You can also use the default-stage helpers `engage(cast)` and
`actorCalled('Ada')` instead of constructing a `Stage` yourself.

## Writing your own building blocks

**A custom Ability** wraps an integration:

```ts
import { Ability } from 'hand-baked-screenplay-pattern';

class TellTime extends Ability {
  static now() { return new TellTime(() => new Date()); }
  protected constructor(private readonly clock: () => Date) { super(); }
  currentTime() { return this.clock(); }
}
```

**A custom Interaction** uses an ability:

```ts
import { Interaction } from 'hand-baked-screenplay-pattern';

const NoteTheTime = (key: string) =>
  Interaction.where(`#actor notes the time as ${key}`, async (actor) => {
    const now = actor.abilityTo(TellTime).currentTime();
    actor.abilityTo(ManageData).set(key, now);
  });
```

**A custom Question** reads state:

```ts
import { Question } from 'hand-baked-screenplay-pattern';

const TheTime = Question.about('the current time', (actor) =>
  actor.abilityTo(TellTime).currentTime(),
);
```

## Reporting

Beyond the live `ConsoleReporter`, the library can produce a **single,
self-contained static HTML report** after a run. It is built by listening to the
same domain events the `Stage` already announces, so no extra instrumentation is
needed in your tasks.

Group activities into named **scenes** with the runner-agnostic `scene(name, fn)`
helper, register an `HtmlReporter` crew member, and call `testRunFinishes()` when
the run is over:

```ts
import {
  Cast, actorCalled, engage, assign,
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

The result is one `index.html` with inline CSS/JS (no external assets or network
requests) showing a pass/fail summary, each scene's status, its nested activity
tree with durations, and error details for failures. A failing `scene(...)`
**re-throws** after recording its outcome, so it still fails your test.

Reporting is **one report per run**: a successful write on `testRunFinishes()`
clears the reporter's event buffer, so a reporter that observes a second run
renders only that run's scenes (each write replaces `index.html`).

This is **deliberately minimal** — one static, post-run HTML file. It is *not* a
Serenity/JS reporter: there is no live streaming, no screenshots, no JSON feed,
and no multi-file dashboard. For production-grade reporting, use Serenity/JS (see
below).

A few notes:

- `scene` and `testRunFinishes` drive the **default stage**, so they compose with
  `actorCalled(...)`. If you manage your own `Stage`, use its
  `sceneStarts` / `sceneFinishes` / `testRunFinishes` methods to wire scenes into
  your runner's hooks (e.g. an `afterAll`) manually.
- `HtmlReporter.storingReportsAt(dir)` chooses the output directory (default
  `./report`). For tests, `.withWriter(writer)` injects a `ReportWriter` so you
  can capture the HTML without touching disk.
- Reporting is a `StageCrewMember` that observes events — not an actor `Ability`.

## Project layout

```
src/
  screenplay/    Actor, Ability, Activity, Task, Interaction, Question, Cast, Stage, Outcome
  expectations/  Ensure + the expectation library (equals, isGreaterThan, ...)
  abilities/     Demo abilities: MakeRequests (HTTP) and ManageData (in-memory store)
  crew/          ConsoleReporter and HtmlReporter (StageCrewMembers)
  reporting/     Pure report builder (buildReport) and HTML renderer (renderHtml)
  scene/         The scene(name, fn) helper
  errors/        ConfigurationError, LogicError, AssertionError
spec/            Vitest specs, including end-to-end worked examples
```

## Scripts

| Script              | Description |
| ------------------- | ----------- |
| `npm run typecheck` | Type-check `src` and `spec` with no emit. |
| `npm run build`     | Compile `src` to `dist/` (JS + `.d.ts`). |
| `npm test`          | Run the Vitest suite. |
| `npm run verify`    | typecheck + build + test. |

## Versioning & changelog

This project follows [Semantic Versioning](https://semver.org/). The current
version is **0.1.0**; while the major version is `0`, the public API may change
between minor versions. All notable changes are recorded in
[`CHANGELOG.md`](./CHANGELOG.md), formatted per
[Keep a Changelog](https://keepachangelog.com/).

The package publishes its compiled `dist/` (built from source, git-ignored), so
a `prepublishOnly` hook runs `npm run verify` (typecheck + build + tests) before
any `npm publish` — the tarball can never ship a missing or stale build.

## Relationship to Serenity/JS

Serenity/JS is a mature, full-featured acceptance-testing framework. If you need
production-grade web/REST testing, rich reporting, and integrations with
Playwright, WebdriverIO, Cucumber, and more, **use Serenity/JS** — this project
is intentionally tiny and exists to demonstrate the pattern from first
principles. The naming here mirrors Serenity/JS so the ideas carry over; the
code does not.

## License

[Apache-2.0](./LICENSE).
