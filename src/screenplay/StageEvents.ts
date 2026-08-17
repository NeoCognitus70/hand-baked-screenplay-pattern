import type { Outcome } from './Outcome.js';

/**
 * Opaque provider-owned data carried alongside a canonical domain event.
 *
 * The core and its built-in reporters do not interpret this envelope. An
 * adapter can therefore retain a native outcome (for example, distinguishing
 * an environment-blocked scenario from a product failure) and any associated
 * metadata without widening or flattening the existing {@link Outcome} model.
 */
export interface ExecutionExtension<ProviderOutcome = unknown, ProviderMetadata = unknown> {
  /** Stable name of the provider or runner that owns this execution lane. */
  readonly provider: string;
  /** The provider's native outcome, preserved without core translation. */
  readonly outcome?: ProviderOutcome;
  /** Additional provider-owned event or scenario metadata. */
  readonly metadata?: ProviderMetadata;
}

type DomainEventDetails =
  | { readonly type: 'activity:starts'; readonly actor: string; readonly activity: string }
  | { readonly type: 'activity:finishes'; readonly actor: string; readonly activity: string }
  | {
      readonly type: 'activity:fails';
      readonly actor: string;
      readonly activity: string;
      readonly error: Error;
    }
  | { readonly type: 'scene:starts'; readonly name: string }
  | { readonly type: 'scene:finishes'; readonly name: string; readonly outcome: Outcome }
  | { readonly type: 'test-run:finishes' };

/**
 * Domain events as announced by call sites, before the {@link Stage} stamps
 * them with a timestamp. Callers (actors, the scene helper, facade methods)
 * build these; crew members never see them un-stamped. The optional extension
 * is additive: every existing event name and required field remains unchanged.
 */
export type DomainEventInput = DomainEventDetails & {
  readonly extension?: ExecutionExtension;
};

/**
 * Domain events announced by the {@link Stage} as actors perform activities,
 * scenes start and finish, and the test run completes. The `Stage` stamps
 * every event with a `timestamp` (epoch milliseconds) on announce.
 * This is the library's lightweight notification layer — enough to observe and
 * log execution without a full reporting infrastructure.
 */
export type DomainEvent = DomainEventInput & { readonly timestamp: number };

/**
 * A {@link StageCrewMember} observes {@link DomainEvent domain events} as they
 * happen — for logging, reporting, screenshots, and so on.
 */
export interface StageCrewMember {
  notifyOf(event: DomainEvent): void;
}
