import { describe, expect, it } from 'vitest';

import { AssertionError } from '../src/errors/index.js';
import { Outcome } from '../src/screenplay/Outcome.js';

describe('Outcome', () => {
  describe('from', () => {
    it('maps an AssertionError to a failure of kind "assertion"', () => {
      const error = new AssertionError('x');

      const outcome = Outcome.from(error);

      expect(outcome).toEqual({ status: 'failure', kind: 'assertion', error });
    });

    it('maps a plain Error to a failure of kind "error"', () => {
      const error = new Error('x');

      const outcome = Outcome.from(error);

      expect(outcome).toEqual({ status: 'failure', kind: 'error', error });
    });

    it('maps the absence of an error to a success', () => {
      expect(Outcome.from(undefined)).toEqual({ status: 'success' });
    });

    it('wraps a thrown non-Error value in an Error of kind "error"', () => {
      const outcome = Outcome.from('boom');

      expect(outcome.status).toBe('failure');
      if (outcome.status === 'failure') {
        expect(outcome.kind).toBe('error');
        expect(outcome.error).toBeInstanceOf(Error);
        expect(outcome.error.message).toBe('boom');
      }
    });
  });

  it('successful() produces a success that isSuccessful() recognises', () => {
    const outcome = Outcome.successful();

    expect(Outcome.isSuccessful(outcome)).toBe(true);
    expect(Outcome.isSuccessful(Outcome.from(new Error('x')))).toBe(false);
  });
});
