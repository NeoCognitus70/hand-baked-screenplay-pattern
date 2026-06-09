import { describe, expect, it } from 'vitest';
import {
  Cast,
  ConfigurationError,
  Stage,
  actorCalled,
  actorInTheSpotlight,
  engage,
  resetDefaultStage,
} from '../src/index.js';

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

describe('Default stage helpers', () => {
  it('actorCalled and actorInTheSpotlight operate on the default stage', () => {
    resetDefaultStage();
    engage(Cast.whereEveryoneCan());

    const alice = actorCalled('Alice');
    expect(actorCalled('Alice')).toBe(alice);
    expect(actorInTheSpotlight()).toBe(alice);

    resetDefaultStage();
  });
});
