import type { Question, QuestionLike } from './Question.js';

/**
 * Anything an {@link Actor} can resolve to a concrete value of type `T`:
 * a plain value, a `Promise`, or a structural {@link QuestionLike} (including
 * the concrete {@link Question} class).
 *
 * Accepting an `Answerable<T>` instead of a `T` lets interactions and
 * expectations defer reading the system under test until the moment of
 * execution.
 */
export type Answerable<T> = QuestionLike<Promise<T> | T> | Promise<T> | T;
