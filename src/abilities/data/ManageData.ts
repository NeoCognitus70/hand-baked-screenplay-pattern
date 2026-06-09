import { Ability } from '../../screenplay/Ability.js';

/**
 * {@link ManageData} is the {@link Ability} to read from and write to a simple
 * in-memory key/value store. Useful for remembering values produced earlier in
 * a scenario (ids, tokens, generated test data) and recalling them later.
 */
export class ManageData extends Ability {
  /**
   * Grants the ability backed by an empty store.
   */
  static usingAnEmptyStore(): ManageData {
    return new ManageData(new Map());
  }

  /**
   * Grants the ability seeded with initial values.
   */
  static using(initial: Record<string, unknown>): ManageData {
    return new ManageData(new Map(Object.entries(initial)));
  }

  protected constructor(private readonly store: Map<string, unknown>) {
    super();
  }

  set(key: string, value: unknown): void {
    this.store.set(key, value);
  }

  get(key: string): unknown {
    return this.store.get(key);
  }

  has(key: string): boolean {
    return this.store.has(key);
  }
}
