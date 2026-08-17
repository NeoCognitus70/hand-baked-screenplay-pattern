import { describe, expect, expectTypeOf, it } from 'vitest';

import {
  Ability,
  AbilityToken,
  Cast,
  ConfigurationError,
  Question,
  Stage,
  type QuestionLike,
} from '../src/index.js';

interface Notes {
  readonly lines: string[];
  append(line: string): void;
}

const Notes = AbilityToken.named<Notes>('Notes');

const emptyNotes = (): Notes => ({
  lines: [],
  append(line: string): void {
    this.lines.push(line);
  },
});

class LegacyNotes extends Ability {
  readonly lines: string[] = [];
}

describe('portable Question contracts', () => {
  it('answers class-based and structural questions with sync/async inference', async () => {
    const notes = emptyNotes();
    notes.append('first');
    const actor = new Stage(Cast.whereEveryoneCan(Notes.bind(notes))).actor('Ada');

    const classQuestion = Question.about('the class-based count', (candidate) =>
      candidate.abilityTo(Notes).lines.length,
    );
    const structuralQuestion: QuestionLike<number> = {
      answeredBy: (candidate) => candidate.abilityTo(Notes).lines.length,
      toString: () => 'the structural count',
    };
    const asynchronousQuestion: QuestionLike<Promise<number>> = {
      answeredBy: async (candidate) => candidate.abilityTo(Notes).lines.length,
      toString: () => 'the asynchronous structural count',
    };

    const classAnswer = actor.answer(classQuestion);
    const structuralAnswer = actor.answer(structuralQuestion);
    const asynchronousAnswer = actor.answer(asynchronousQuestion);

    expectTypeOf(classAnswer).toEqualTypeOf<Promise<number>>();
    expectTypeOf(structuralAnswer).toEqualTypeOf<Promise<number>>();
    expectTypeOf(asynchronousAnswer).toEqualTypeOf<Promise<number>>();
    await expect(Promise.all([classAnswer, structuralAnswer, asynchronousAnswer])).resolves.toEqual([
      1,
      1,
      1,
    ]);
  });
});

describe('typed ability tokens', () => {
  it('keeps class-based Ability registration and lookup compatible', () => {
    const legacy = new LegacyNotes();
    const actor = new Stage(Cast.whereEveryoneCan(legacy)).actor('Grace');

    const resolved: LegacyNotes = actor.abilityTo(LegacyNotes);

    expect(resolved).toBe(legacy);
  });

  it('registers and retrieves an existing structural object with its inferred type', () => {
    const notes = emptyNotes();
    const actor = new Stage(Cast.whereEveryoneCan(Notes.bind(notes))).actor('Lin');

    const resolved: Notes = actor.abilityTo(Notes);
    resolved.append('portable');

    expect(resolved).toBe(notes);
    expect(resolved.lines).toEqual(['portable']);
  });

  it('isolates token-bound mutable objects when the cast creates one per actor', () => {
    const stage = new Stage(Cast.whereEachActorCan(() => [Notes.bind(emptyNotes())]));
    const ada = stage.actor('Ada');
    const bob = stage.actor('Bob');

    ada.abilityTo(Notes).append('Ada only');

    expect(ada.abilityTo(Notes).lines).toEqual(['Ada only']);
    expect(bob.abilityTo(Notes).lines).toEqual([]);
    expect(ada.abilityTo(Notes)).not.toBe(bob.abilityTo(Notes));
  });

  it('uses token identity rather than its display name as the lookup key', () => {
    const OtherNotes = AbilityToken.named<Notes>('Notes');
    const actor = new Stage(Cast.whereEveryoneCan(Notes.bind(emptyNotes()))).actor('Kai');

    expect(() => actor.abilityTo(OtherNotes)).toThrow(ConfigurationError);
  });

  it('fails a missing token lookup with actionable configuration guidance', () => {
    const actor = new Stage(Cast.whereEveryoneCan()).actor('Mina');

    expect(() => actor.abilityTo(Notes)).toThrowError(
      'Mina does not have the ability bound to Notes. Did you grant it with whoCan(Notes.bind(...))?',
    );
  });
});
