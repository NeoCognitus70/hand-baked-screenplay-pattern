import type { Ability } from './Ability.js';

/**
 * An identity-based, typed lookup key for an actor capability that does not
 * need to extend the concrete {@link Ability} class.
 *
 * Two tokens with the same name remain distinct keys. Keep and export one
 * token instance for every portable capability contract.
 */
export class AbilityToken<A extends object> {
  private constructor(public readonly name: string) {}

  /** Defines a token for an existing object or structural capability. */
  static named<A extends object>(name: string): AbilityToken<A> {
    return new AbilityToken<A>(name);
  }

  /** Associates this token with the object an actor should retrieve. */
  bind(ability: A): AbilityBinding<A> {
    return new AbilityBinding(this, ability);
  }

  toString(): string {
    return this.name;
  }
}

/** A typed token/object pair accepted by {@link Actor.whoCan}. */
export class AbilityBinding<A extends object> {
  constructor(
    public readonly token: AbilityToken<A>,
    public readonly ability: A,
  ) {}
}

/** Anything that can be registered with {@link Actor.whoCan}. */
export type AbilityRegistration = Ability | AbilityBinding<object>;
