/**
 * A class reference used as the lookup key for an {@link Ability}. Modelled as
 * a `Function` carrying the ability's prototype so that classes with `protected`
 * (factory-only) constructors can still be used as keys.
 */
export type AbilityType<A extends Ability> = Function & { readonly prototype: A };

/**
 * An {@link Ability} enables an {@link Actor} to interact with a specific
 * external system or interface (an HTTP API, a database, the clock, and so on).
 *
 * Abilities are the only screenplay building block allowed to know about the
 * mechanics of the integration; tasks, interactions and questions stay
 * implementation-agnostic and reach for an ability through
 * {@link UsesAbilities.abilityTo}.
 */
export abstract class Ability {
  /**
   * Returns the type used to register and look up this ability on an actor.
   * Override in a subclass that should be retrievable under its base type.
   */
  abilityType(): AbilityType<Ability> {
    return this.constructor as unknown as AbilityType<Ability>;
  }
}
