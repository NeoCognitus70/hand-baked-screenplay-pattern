/**
 * An {@link Expectation} describes a condition an answered value is expected to
 * meet. It pairs a human-readable description (used in assertion messages) with
 * a predicate that decides whether the actual value satisfies it.
 */
export class Expectation<Actual> {
  constructor(
    private readonly description: string,
    private readonly predicate: (actual: Actual) => boolean,
  ) {}

  /**
   * Returns `true` when `actual` meets this expectation.
   */
  isMetFor(actual: Actual): boolean {
    return this.predicate(actual);
  }

  toString(): string {
    return this.description;
  }
}
