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

  /**
   * Maps a value to an Outcome, treating a falsy/absent value as **success**
   * (`Outcome.from(undefined)` is the "nothing went wrong" case). Use this only
   * where absence-of-error genuinely means success. In a `catch` block a value
   * was definitely thrown, so use {@link fromError} instead — otherwise a falsy
   * thrown value (`throw 0`, `throw ''`, `throw false`) would be reported as a
   * pass.
   */
  from(error?: unknown): Outcome {
    if (!error) return { status: 'success' };
    return Outcome.fromError(error);
  },

  /**
   * Converts a caught value into a **failure** Outcome. Unlike {@link from} this
   * is total: every value produces a failure, including the falsy ones (`false`,
   * `0`, `''`, `null`, `undefined`), because JavaScript lets code throw any value
   * and a caught throw is always a failure. A non-`Error` value is wrapped in an
   * `Error`; an {@link AssertionError} is reported as kind `assertion`.
   */
  fromError(error: unknown): Outcome {
    const e = error instanceof Error ? error : new Error(describeThrownValue(error));
    return e instanceof AssertionError
      ? { status: 'failure', kind: 'assertion', error: e }
      : { status: 'failure', kind: 'error', error: e };
  },

  isSuccessful(outcome: Outcome): boolean {
    return outcome.status === 'success';
  },
};

/**
 * Renders a thrown non-`Error` value as an error message, keeping a string as-is
 * but giving the empty string a describable message so the failure is legible.
 */
function describeThrownValue(value: unknown): string {
  const text = typeof value === 'string' ? value : String(value);
  return text === '' ? 'a falsy value was thrown (empty string)' : text;
}
