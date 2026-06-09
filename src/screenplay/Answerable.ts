import type { Question } from './Question.js';

/**
 * Anything an {@link Actor} can resolve to a concrete value of type `T`:
 * a plain value, a `Promise`, or a {@link Question}.
 *
 * Accepting an `Answerable<T>` instead of a `T` lets interactions and
 * expectations defer reading the system under test until the moment of
 * execution.
 */
export type Answerable<T> = Question<Promise<T> | T> | Promise<T> | T;
