import { afterEach, describe, expect, it } from 'vitest';
import {
  Cast,
  ConfigurationError,
  Interaction,
  LogicError,
  MakeRequests,
  ManageData,
  Stage,
  actorCalled,
  actorInTheSpotlight,
  assign,
  engage,
  resetDefaultStage,
} from '../src/index.js';
import { Outcome } from '../src/screenplay/Outcome.js';
import {
  sceneFinishes,
  sceneStarts,
  testRunFinishes,
} from '../src/screenplay/Stage.js';
import { InMemoryHttpClient } from './support/InMemoryHttpClient.js';
import { RecordingCrew } from './support/RecordingCrew.js';

describe('Stage and Cast', () => {
  it('returns the same actor instance for the same name', () => {
    const stage = new Stage(Cast.whereEveryoneCan());
    expect(stage.actor('Heidi')).toBe(stage.actor('Heidi'));
    expect(stage.actor('Heidi')).not.toBe(stage.actor('Ivan'));
  });

  it('prepares actors using a custom Cast', () => {
    const prepared: string[] = [];
    const stage = new Stage(
      Cast.where((actor) => {
        prepared.push(actor.name);
        return actor;
      }),
    );
    stage.actor('Judy');
    expect(prepared).toEqual(['Judy']);
  });

  it('tracks the actor in the spotlight', () => {
    const stage = new Stage(Cast.whereEveryoneCan());
    stage.actor('Mallory');
    expect(stage.theActorInTheSpotlight().name).toBe('Mallory');
  });

  it('throws when no actor is in the spotlight', () => {
    const stage = new Stage(Cast.whereEveryoneCan());
    expect(() => stage.theActorInTheSpotlight()).toThrow(ConfigurationError);
  });
});

describe('Stage event timestamps', () => {
  it('stamps every announced event with a timestamp from the injected clock', async () => {
    const stage = new Stage(Cast.whereEveryoneCan(), () => 1000);
    const crew = new RecordingCrew();
    stage.assign(crew);

    await stage.actor('Nina').attemptsTo(Interaction.where('#nods', () => {}));

    expect(crew.events).toHaveLength(2);
    for (const event of crew.events) {
      expect(event.timestamp).toBe(1000);
      expect(typeof event.timestamp).toBe('number');
    }
  });

  it('defaults to Date.now for the timestamp', () => {
    const before = Date.now();
    const stage = new Stage(Cast.whereEveryoneCan());
    const crew = new RecordingCrew();
    stage.assign(crew);

    stage.sceneStarts('A timely scene');

    const after = Date.now();
    expect(crew.events).toHaveLength(1);
    const [event] = crew.events;
    expect(event.timestamp).toBeGreaterThanOrEqual(before);
    expect(event.timestamp).toBeLessThanOrEqual(after);
  });
});

describe('Scene and test-run lifecycle events', () => {
  // Reset the default stage after every test so a failing assertion cannot leak
  // default-stage state into a later test — teardown runs even when a test throws.
  afterEach(() => {
    resetDefaultStage();
  });

  it('announces scene:starts, scene:finishes, and test-run:finishes via the Stage facade', () => {
    const stage = new Stage(Cast.whereEveryoneCan(), () => 1000);
    const crew = new RecordingCrew();
    stage.assign(crew);

    stage.sceneStarts('Ada checks the health endpoint');
    stage.sceneFinishes('Ada checks the health endpoint', Outcome.successful());
    stage.testRunFinishes();

    expect(crew.events).toEqual([
      { type: 'scene:starts', name: 'Ada checks the health endpoint', timestamp: 1000 },
      {
        type: 'scene:finishes',
        name: 'Ada checks the health endpoint',
        outcome: { status: 'success' },
        timestamp: 1000,
      },
      { type: 'test-run:finishes', timestamp: 1000 },
    ]);
  });

  it('exposes module-level facade functions operating on the default stage', () => {
    resetDefaultStage();
    engage(Cast.whereEveryoneCan());
    const crew = new RecordingCrew();
    assign(crew);

    sceneStarts('Default-stage scene');
    sceneFinishes('Default-stage scene', Outcome.from(new Error('boom')));
    testRunFinishes();

    expect(crew.descriptions()).toEqual([
      'scene:starts',
      'scene:finishes',
      'test-run:finishes',
    ]);
    const finish = crew.events[1];
    expect(finish.type === 'scene:finishes' && finish.outcome.status).toBe('failure');
  });
});

describe('Actor ability isolation', () => {
  it('whereEveryoneCan shares one ability instance across actors (documented sharing)', () => {
    const stage = new Stage(Cast.whereEveryoneCan(ManageData.usingAnEmptyStore()));
    const ada = stage.actor('Ada');
    const bob = stage.actor('Bob');

    ada.abilityTo(ManageData).set('token', 'ada-secret');

    // Both actors hold the *same* ManageData instance, so Bob reads Ada's value.
    expect(bob.abilityTo(ManageData).get('token')).toBe('ada-secret');
    expect(ada.abilityTo(ManageData)).toBe(bob.abilityTo(ManageData));
  });

  it('whereEachActorCan gives each actor its own ManageData store', () => {
    const stage = new Stage(
      Cast.whereEachActorCan(() => [ManageData.usingAnEmptyStore()]),
    );
    const ada = stage.actor('Ada');
    const bob = stage.actor('Bob');

    ada.abilityTo(ManageData).set('token', 'ada-secret');

    // Fresh instances per actor: Ada's remembered data does not leak to Bob.
    expect(bob.abilityTo(ManageData).has('token')).toBe(false);
    expect(ada.abilityTo(ManageData)).not.toBe(bob.abilityTo(ManageData));
  });

  it('whereEachActorCan isolates MakeRequests.lastResponse per actor', async () => {
    const client = InMemoryHttpClient.withRoutes({
      'GET /ping': { status: 200, headers: {}, body: 'pong' },
    });
    const stage = new Stage(
      // A stateless transport (the client) may be shared; the mutable
      // MakeRequests wrapper that remembers the last response is per-actor.
      Cast.whereEachActorCan(() => [MakeRequests.using(client)]),
    );
    const ada = stage.actor('Ada');
    const bob = stage.actor('Bob');

    await ada.abilityTo(MakeRequests).send({ method: 'GET', url: '/ping' });

    expect(ada.abilityTo(MakeRequests).mostRecentResponse().status).toBe(200);
    // Bob never sent a request, so his own MakeRequests has no last response.
    expect(() => bob.abilityTo(MakeRequests).mostRecentResponse()).toThrow(LogicError);
  });
});

describe('Default stage helpers', () => {
  afterEach(() => {
    resetDefaultStage();
  });

  it('actorCalled and actorInTheSpotlight operate on the default stage', () => {
    resetDefaultStage();
    engage(Cast.whereEveryoneCan());

    const alice = actorCalled('Alice');
    expect(actorCalled('Alice')).toBe(alice);
    expect(actorInTheSpotlight()).toBe(alice);
  });
});
