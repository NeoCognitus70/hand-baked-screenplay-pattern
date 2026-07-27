import type { Ability } from './Ability.js';
import type { Actor } from './Actor.js';

/**
 * A {@link Cast} prepares actors before they step onto the {@link Stage},
 * typically by granting them the abilities they will need.
 */
export abstract class Cast {
  /**
   * Creates a cast from a preparation function applied to each new actor.
   */
  static where(preparation: (actor: Actor) => Actor): Cast {
    return new PreparedCast(preparation);
  }

  /**
   * Creates a cast that grants every actor the **same ability instances**.
   *
   * Because the abilities are constructed once and shared, this is only safe
   * for **stateless** abilities. For abilities that own mutable state — such as
   * {@link ManageData} (a key/value store) or {@link MakeRequests} (the most
   * recent response) — two actors on the same stage would share that state,
   * so one actor could read another's remembered data or last response. When
   * actors must be isolated, use {@link whereEachActorCan} instead, which builds
   * fresh ability instances per actor.
   */
  static whereEveryoneCan(...abilities: Ability[]): Cast {
    return new PreparedCast((actor) => actor.whoCan(...abilities));
  }

  /**
   * Creates a cast that gives **each actor its own ability instances** by
   * invoking `abilities()` once per prepared actor. Prefer this over
   * {@link whereEveryoneCan} for abilities that own mutable state, so remembered
   * data and last-response state cannot leak between actors:
   *
   * @example
   * Cast.whereEachActorCan(() => [
   *   MakeRequests.using(client),        // stateless transport may be shared
   *   ManageData.usingAnEmptyStore(),    // mutable store is per-actor
   * ]);
   */
  static whereEachActorCan(abilities: () => Ability[]): Cast {
    return new PreparedCast((actor) => actor.whoCan(...abilities()));
  }

  abstract prepare(actor: Actor): Actor;
}

class PreparedCast extends Cast {
  constructor(private readonly preparation: (actor: Actor) => Actor) {
    super();
  }

  prepare(actor: Actor): Actor {
    return this.preparation(actor);
  }
}
