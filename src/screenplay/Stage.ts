import { ConfigurationError } from '../errors/index.js';
import { Actor } from './Actor.js';
import { Cast } from './Cast.js';
import type { DomainEvent, StageCrewMember } from './StageEvents.js';

/**
 * The {@link Stage} is where the performance takes place. It instantiates and
 * caches {@link Actor actors} (preparing each via the {@link Cast}), keeps
 * track of the actor currently in the spotlight, and announces
 * {@link DomainEvent domain events} to its {@link StageCrewMember crew}.
 */
export class Stage {
  private readonly actorsInPlay = new Map<string, Actor>();
  private readonly crew: StageCrewMember[] = [];
  private actorInSpotlight: Actor | undefined;

  constructor(private cast: Cast) {}

  /**
   * Swaps in a new {@link Cast} and dismisses any actors currently in play.
   */
  engage(cast: Cast): void {
    this.cast = cast;
    this.actorsInPlay.clear();
    this.actorInSpotlight = undefined;
  }

  /**
   * Registers one or more {@link StageCrewMember crew members} to observe
   * domain events.
   */
  assign(...crewMembers: StageCrewMember[]): void {
    this.crew.push(...crewMembers);
  }

  /**
   * Returns the named actor, creating and preparing them on first request.
   * Repeated calls with the same name return the same actor instance.
   */
  actor(name: string): Actor {
    let actor = this.actorsInPlay.get(name);
    if (!actor) {
      actor = this.cast.prepare(new Actor(name, this));
      this.actorsInPlay.set(name, actor);
    }
    this.actorInSpotlight = actor;
    return actor;
  }

  /**
   * Returns the actor who most recently performed an activity.
   */
  theActorInTheSpotlight(): Actor {
    if (!this.actorInSpotlight) {
      throw new ConfigurationError(
        'There is no actor in the spotlight yet. Make sure an actor has been called upon first.',
      );
    }
    return this.actorInSpotlight;
  }

  /**
   * Announces a {@link DomainEvent} to every registered crew member.
   */
  announce(event: DomainEvent): void {
    for (const member of this.crew) {
      member.notifyOf(event);
    }
  }
}

let defaultStage = new Stage(Cast.whereEveryoneCan());

/**
 * Replaces the cast of the default {@link Stage}. Call this before your actors
 * step on stage to give them their abilities.
 */
export function engage(cast: Cast): void {
  defaultStage.engage(cast);
}

/**
 * Registers crew members with the default {@link Stage}.
 */
export function assign(...crewMembers: StageCrewMember[]): void {
  defaultStage.assign(...crewMembers);
}

/**
 * Returns the named actor from the default {@link Stage}.
 */
export function actorCalled(name: string): Actor {
  return defaultStage.actor(name);
}

/**
 * Returns the actor currently in the spotlight on the default {@link Stage}.
 */
export function actorInTheSpotlight(): Actor {
  return defaultStage.theActorInTheSpotlight();
}

/**
 * Resets the default {@link Stage} to a fresh, empty cast. Primarily useful
 * for isolating tests that rely on the module-level stage.
 */
export function resetDefaultStage(): void {
  defaultStage = new Stage(Cast.whereEveryoneCan());
}
