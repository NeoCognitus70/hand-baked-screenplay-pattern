import { describe, expect, it } from 'vitest';
import {
  AssertionError,
  Cast,
  Ensure,
  Question,
  Stage,
  equals,
  includes,
  isGreaterThan,
  isLessThan,
  isNot,
  isPresent,
} from '../src/index.js';

function actor() {
  return new Stage(Cast.whereEveryoneCan()).actor('Tester');
}

describe('Ensure with expectations', () => {
  it('passes when the expectation is met', async () => {
    await expect(actor().attemptsTo(Ensure.that(200, equals(200)))).resolves.toBeUndefined();
  });

  it('throws an AssertionError with expected and actual on failure', async () => {
    const promise = actor().attemptsTo(Ensure.that(200, equals(201)));
    await expect(promise).rejects.toThrow(AssertionError);
    await expect(promise).rejects.toThrow('Expected 200 to equal 201');
  });

  it('resolves an Answerable actual before asserting', async () => {
    const TheValue = Question.about('the value', () => Promise.resolve(5));
    await expect(actor().attemptsTo(Ensure.that(TheValue, isGreaterThan(3)))).resolves.toBeUndefined();
  });

  it('supports the bundled expectation library', async () => {
    const a = actor();
    await a.attemptsTo(
      Ensure.that(10, isGreaterThan(5)),
      Ensure.that(10, isLessThan(20)),
      Ensure.that(10, isNot(11)),
      Ensure.that('hello world', includes('world')),
      Ensure.that([1, 2, 3], includes(2)),
      Ensure.that('something', isPresent()),
      Ensure.that({ a: 1 }, equals({ a: 1 })),
    );
  });

  it('isPresent fails for null and undefined', async () => {
    await expect(actor().attemptsTo(Ensure.that(null, isPresent()))).rejects.toThrow(AssertionError);
    await expect(actor().attemptsTo(Ensure.that(undefined, isPresent()))).rejects.toThrow(
      AssertionError,
    );
  });
});
