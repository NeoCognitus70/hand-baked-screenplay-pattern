import { AssertionError } from '../errors/index.js';

/**
 * The result of executing a scene or activity. Mirrors the Serenity/JS
 * outcome model (`ExecutionSuccessful`, `ExecutionFailedWithAssertionError`,
 * `ExecutionFailedWithError`) in a minimal discriminated-union form.
 */
export type Outcome =
  | { readonly status: 'success' }
  | { readonly status: 'failure'; readonly kind: 'assertion'; readonly error: Error }
  | { readonly status: 'failure'; readonly kind: 'error'; readonly error: Error };

/**
 * Companion value namespace for the {@link Outcome} type — the merged
 * type + const declaration is deliberate; both exports are named `Outcome`.
 */
export const Outcome = {
  successful(): Outcome {
    return { status: 'success' };
  },

  /** Maps a thrown value (or absence of one) to an Outcome. */
  from(error?: unknown): Outcome {
    if (!error) return { status: 'success' };
    const e = error instanceof Error ? error : new Error(String(error));
    return e instanceof AssertionError
      ? { status: 'failure', kind: 'assertion', error: e }
      : { status: 'failure', kind: 'error', error: e };
  },

  isSuccessful(outcome: Outcome): boolean {
    return outcome.status === 'success';
  },
};
