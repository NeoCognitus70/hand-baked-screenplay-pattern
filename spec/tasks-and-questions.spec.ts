import { describe, expect, it } from 'vitest';
import {
  Ability,
  Cast,
  Interaction,
  Question,
  Stage,
  Task,
} from '../src/index.js';
import { RecordingCrew } from './support/RecordingCrew.js';

class Log extends Ability {
  static empty(): Log {
    return new Log();
  }
  readonly lines: string[] = [];
  write(line: string): void {
    this.lines.push(line);
  }
}

const Write = (line: string) =>
  Interaction.where(`#actor writes "${line}"`, (actor) => actor.abilityTo(Log).write(line));

describe('Task composition', () => {
  it('delegates to its sub-activities in order', async () => {
    const log = Log.empty();
    const stage = new Stage(Cast.whereEveryoneCan(log));
    const greet = Task.where('#actor greets', Write('hello'), Write('world'));

    await stage.actor('Eve').attemptsTo(greet);

    expect(log.lines).toEqual(['hello', 'world']);
  });

  it('announces the task and each nested interaction', async () => {
    const crew = new RecordingCrew();
    const stage = new Stage(Cast.whereEveryoneCan(Log.empty()));
    stage.assign(crew);

    await stage.actor('Eve').attemptsTo(Task.where('#actor greets', Write('hi')));

    expect(crew.descriptions()).toEqual([
      'activity:starts:#actor greets',
      'activity:starts:#actor writes "hi"',
      'activity:finishes:#actor writes "hi"',
      'activity:finishes:#actor greets',
    ]);
  });
});

describe('Question and Answerable', () => {
  it('answers a Question by reading ability state', async () => {
    const log = Log.empty();
    log.write('first');
    const stage = new Stage(Cast.whereEveryoneCan(log));
    const actor = stage.actor('Frank');

    const LineCount = Question.about('the number of log lines', (a) => a.abilityTo(Log).lines.length);

    await expect(actor.answer(LineCount)).resolves.toBe(1);
  });

  it('unwraps plain values, promises and nested questions', async () => {
    const stage = new Stage(Cast.whereEveryoneCan());
    const actor = stage.actor('Grace');

    await expect(actor.answer(42)).resolves.toBe(42);
    await expect(actor.answer(Promise.resolve('async'))).resolves.toBe('async');

    const nested = Question.about<Promise<number>>('a question returning a promise', () =>
      Promise.resolve(7),
    );
    await expect(actor.answer(nested)).resolves.toBe(7);
  });
});
