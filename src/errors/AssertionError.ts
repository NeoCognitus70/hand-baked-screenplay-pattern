/**
 * Thrown by {@link Ensure} when an expectation is not met. Carries the
 * `expected` and `actual` values so reporters can present a helpful diff.
 */
export class AssertionError extends Error {
  constructor(
    message: string,
    public readonly expected?: unknown,
    public readonly actual?: unknown,
  ) {
    super(message);
    this.name = 'AssertionError';
    Object.setPrototypeOf(this, AssertionError.prototype);
  }
}
