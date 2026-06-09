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
   * Creates a cast that grants every actor the same set of abilities.
   */
  static whereEveryoneCan(...abilities: Ability[]): Cast {
    return new PreparedCast((actor) => actor.whoCan(...abilities));
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
