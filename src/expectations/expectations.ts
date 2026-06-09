import { deepEqual, format } from '../util.js';
import { Expectation } from './Expectation.js';

/**
 * Expects the actual value to be structurally equal to `expected`.
 */
export function equals<T>(expected: T): Expectation<T> {
  return new Expectation(`equal ${format(expected)}`, (actual) => deepEqual(actual, expected));
}

/**
 * Expects the actual value to differ from `expected`.
 */
export function isNot<T>(expected: T): Expectation<T> {
  return new Expectation(`not equal ${format(expected)}`, (actual) => !deepEqual(actual, expected));
}

/**
 * Expects the actual number to be greater than `expected`.
 */
export function isGreaterThan(expected: number): Expectation<number> {
  return new Expectation(`be greater than ${format(expected)}`, (actual) => actual > expected);
}

/**
 * Expects the actual number to be less than `expected`.
 */
export function isLessThan(expected: number): Expectation<number> {
  return new Expectation(`be less than ${format(expected)}`, (actual) => actual < expected);
}

/**
 * Expects the actual value to be neither `null` nor `undefined`.
 */
export function isPresent<T>(): Expectation<T> {
  return new Expectation('be present', (actual) => actual !== null && actual !== undefined);
}

/**
 * Expects a string or array to contain `expected`.
 */
export function includes<T>(expected: T): Expectation<string | readonly T[]> {
  return new Expectation(`include ${format(expected)}`, (actual) =>
    typeof actual === 'string' ? actual.includes(String(expected)) : actual.includes(expected),
  );
}
