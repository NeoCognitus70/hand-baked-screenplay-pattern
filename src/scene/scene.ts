import { Outcome } from '../screenplay/Outcome.js';
import { sceneFinishes, sceneStarts } from '../screenplay/Stage.js';

/**
 * Delimits a named scene on the default {@link Stage}, announcing
 * `scene:starts` before the body and `scene:finishes` (with an {@link Outcome}
 * derived from how the body terminated) after it.
 *
 * This is the **primary**, runner-agnostic way to group activities into a
 * reportable scene. Because it drives the default-stage facade functions, it
 * composes directly with `actorCalled(...)` and the rest of the default-stage
 * API. For users who manage their own {@link Stage}, the raw `sceneStarts` /
 * `sceneFinishes` facade methods remain available for manual wiring.
 *
 * On failure the original error is **re-thrown** after the outcome is recorded,
 * so a failing scene still fails the surrounding test.
 *
 * @example
 * ```ts
 * await scene('Ada checks the health endpoint', async () => {
 *   await actorCalled('Ada').attemptsTo(
 *     Send.a({ method: 'GET', url: '/health' }),
 *     Ensure.that(LastResponse.status(), equals(200)),
 *   );
 * });
 * ```
 */
export async function scene(
  name: string,
  body: () => Promise<void> | void,
): Promise<void> {
  sceneStarts(name);
  try {
    await body();
    sceneFinishes(name, Outcome.successful());
  } catch (error) {
    sceneFinishes(name, Outcome.from(error));
    throw error; // re-throw so the test still fails
  }
}
