import { describe, expect, it } from 'vitest';
import {
  Ability,
  Actor,
  Cast,
  ConfigurationError,
  Interaction,
  Stage,
} from '../src/index.js';
import { RecordingCrew } from './support/RecordingCrew.js';

class Counter extends Ability {
  static starting(): Counter {
    return new Counter();
  }
  count = 0;
  increment(): void {
    this.count += 1;
  }
}

const Increment = () =>
  Interaction.where('#actor increments the counter', (actor) =>
    actor.abilityTo(Counter).increment(),
  );

function stageWith(crew: RecordingCrew, ...abilities: Ability[]): Stage {
  const stage = new Stage(Cast.whereEveryoneCan(...abilities));
  stage.assign(crew);
  return stage;
}

describe('Actor', () => {
  it('performs a sequence of activities in order, announcing each one', async () => {
    const crew = new RecordingCrew();
    const counter = Counter.starting();
    const actor = stageWith(crew, counter).actor('Alice');

    await actor.attemptsTo(Increment(), Increment());

    expect(counter.count).toBe(2);
    expect(crew.descriptions()).toEqual([
      'activity:starts:#actor increments the counter',
      'activity:finishes:#actor increments the counter',
      'activity:starts:#actor increments the counter',
      'activity:finishes:#actor increments the counter',
    ]);
  });

  it('throws a ConfigurationError when asked to use an ability it lacks', () => {
    const stage = new Stage(Cast.whereEveryoneCan());
    const actor = stage.actor('Bob');

    expect(() => actor.abilityTo(Counter)).toThrow(ConfigurationError);
    expect(() => actor.abilityTo(Counter)).toThrow(/does not have the ability to Counter/);
  });

  it('announces an activity:fails event and rethrows when an activity throws', async () => {
    const crew = new RecordingCrew();
    const actor = stageWith(crew).actor('Carol');
    const boom = Interaction.where('#actor explodes', () => {
      throw new Error('boom');
    });

    await expect(actor.attemptsTo(boom)).rejects.toThrow('boom');
    expect(crew.events.map((e) => e.type)).toEqual(['activity:starts', 'activity:fails']);
  });

  it('reports its name via toString', () => {
    const actor = new Stage(Cast.whereEveryoneCan()).actor('Dave');
    expect(actor.toString()).toBe('Dave');
    expect(actor).toBeInstanceOf(Actor);
  });
});
