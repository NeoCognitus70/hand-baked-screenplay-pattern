# Calculator Compatibility Baseline

- **Status:** Frozen for the HBSP-28..33 provider-first iteration
- **Established:** 2026-08-17 under HBSP-29
- **Consumer evidence:** `calculator-screenplay-bdd` `main` at `2b10090`

This baseline protects the package-root API used by the sibling Calculator
consumer before portable provider contracts are added. It applies within the
build/profile-time provider boundary established by
[ADR 0001](./adr/0001-provider-selection-boundary.md): one provider owns an
Actor and every Activity in its execution lane.

## Runtime exports

The Calculator imports these package-root runtime values:

```text
Ability       Cast           Ensure       Interaction
LastResponse  MakeRequests   ManageData    Question
Recall        Remember       Send          Stage
Task          equals         includes
```

`spec/public-api.spec.ts` checks every name at runtime. Its export-count check
is a floor rather than an exact total, so new exports remain additive.

## Type exports and consumed shapes

The Calculator imports these package-root types:

```text
Actor  Answerable  HttpClient  HttpRequest  HttpResponse
```

The compatible shapes include:

- an `Actor` returned by `Stage.actor(...)`, with `whoCan(...)`,
  `abilityTo(...)`, `attemptsTo(...)`, and `answer(...)` retaining their current
  input and result relationships;
- `Answerable<T>` accepting a value, a `Promise<T>`, or a `Question` resolved by
  an Actor;
- a consumer Ability that extends `Ability`, exposes a static factory, and
  keeps its constructor protected; and
- an `HttpClient` adapter implementing
  `send(request: HttpRequest): Promise<HttpResponse>`, including the current
  method, URL, headers, request body, status, response headers, and response body
  fields.

`spec/public-api.types.spec.ts` imports these types from the package root and
compiles representative Calculator-style implementations. A removed type,
renamed member, or incompatible shape therefore fails `npm run typecheck` in
this repository instead of surfacing only in the sibling build.

## Compatibility policy

For the HBSP-28..33 provider-first iteration:

- the runtime names and type relationships above remain compatible;
- additive exports, overloads, optional fields, and new entry points are
  allowed when they do not change existing behaviour;
- removal, rename, newly required input, narrowed accepted input, widened
  unsafe result, or incompatible class/interface change is breaking and must
  not be folded into an additive provider item; and
- Calculator does not need a source rewrite to consume HBSP-30..33.

This deliberately strengthens the package's general pre-1.0 SemVer position
for the duration of the provider iteration. The baseline is not a freeze on
the whole API; it protects the surface with a live consumer.

## HBSP-30 additive portability seams

HBSP-30 adds `QuestionLike<T>`, `isQuestionLike`, `AbilityToken<T>`,
`AbilityBinding<T>`, and `AbilityRegistration` at the package root. Existing
`Question` instances implement the structural protocol, while
`Actor.answer(...)` now recognises that protocol without changing its
Promise-native result. Existing `Ability` subclasses still register and resolve
by class; the token overload adds identity-based lookup for bound objects.

These additions do not require a Calculator source rewrite. Its frozen imports,
class-based abilities, `Question.about(...)` calls, and Actor method
relationships continue to compile under the canaries above.

## HBSP-31 additive event envelope

HBSP-31 adds the package-root `ExecutionExtension<ProviderOutcome,
ProviderMetadata>` type and an optional `extension` field to every
`DomainEventInput` / `DomainEvent`. The existing six event names, all required
fields, timestamp stamping, ordering, and canonical `Outcome` remain unchanged.
The `Stage` lifecycle methods accept the extension as a final optional argument,
so every existing call remains source-compatible.

Built-in reporters deliberately ignore unknown extensions and continue to
render the canonical event stream. Provider-specific observers can read the
envelope without forcing environment-blocked, product-failed, or other native
outcomes into one generic error category. Calculator does not need a source
rewrite.

## HBSP-32 additive conformance kit

HBSP-32 exports the test-framework-neutral `ConformanceProvider` contract,
`providerConformanceCases`, `runProviderConformance(...)`, and their supporting
types. They are an optional provider-test entry point; they do not replace or
alter `Actor`, `Ability`, `Question`, `Stage`, events, or the Calculator's
package-root imports. The kit has no framework or runner runtime dependency.

Providers adapt their native objects at the test boundary. The hand-baked and
independent minimal fixtures run the same semantic cases without mixing native
runtime objects in one execution lane, preserving the ADR 0001 boundary and
requiring no Calculator source rewrite.

## Deprecation policy

If a baseline member must eventually change:

1. introduce its replacement additively and mark the old member with
   `@deprecated`;
2. document the reason, replacement, and migration in the changelog and this
   compatibility record;
3. retain the old member through at least one published version and until the
   Calculator consumer has migrated; and
4. remove it only through a separately approved breaking-release plan, with
   the canary and consumer updated together.

Silent removal or an incompatible type-shape change is never a valid
deprecation path.
