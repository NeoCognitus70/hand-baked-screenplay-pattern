# Portable Questions and ability tokens

The concrete `Question` and `Ability` classes are convenient when all building
blocks live in this library. Adapter code often already owns a useful object,
however, or needs to expose a question without inheriting a provider-specific
class. The additive `QuestionLike<T>` and `AbilityToken<T>` contracts cover
those cases while preserving the original class-based API.

## Structural Questions

An actor recognises any object with the exported `QuestionLike<T>` shape. The
examples use the `Notes` token defined in the next section.

```ts
import {
  Question,
  type QuestionLike,
} from 'hand-baked-screenplay-pattern';

const NoteCount: QuestionLike<number> = {
  answeredBy: actor => actor.abilityTo(Notes).lines.length,
  toString: () => 'the number of notes',
};

const PersistedNoteCount: QuestionLike<Promise<number>> = {
  answeredBy: async actor => actor.abilityTo(Notes).lines.length,
  toString: () => 'the persisted number of notes',
};

const local: number = await actor.answer(NoteCount);
const persisted: number = await actor.answer(PersistedNoteCount);
```

`Actor.answer(...)` detects the `answeredBy` protocol rather than relying on
`instanceof Question`, and its Promise-native result resolves both synchronous
and asynchronous answers. The `toString()` description keeps the question
meaningful in diagnostics and higher-level activities.

The concrete factory remains fully supported and implements the same protocol:

```ts
const NoteCount = Question.about('the number of notes', actor =>
  actor.abilityTo(Notes).lines.length,
);
```

Use the class when it makes the teaching model clearer; use the structural
contract at an adapter boundary where inheritance would create unnecessary
coupling.

## Typed ability tokens

An ability token is an identity-based, typed key. It binds an existing object
to an actor without requiring that object to extend `Ability`:

```ts
import {
  AbilityToken,
  Cast,
  Stage,
} from 'hand-baked-screenplay-pattern';

interface Notes {
  readonly lines: string[];
  append(line: string): void;
}

export const Notes = AbilityToken.named<Notes>('Notes');

const notes: Notes = createNotesClient();
const stage = new Stage(Cast.whereEveryoneCan(Notes.bind(notes)));
const actor = stage.actor('Ada');

actor.abilityTo(Notes).append('portable'); // inferred as Notes
```

The name is for readable diagnostics. Token identity is the lookup key, so two
separately-created tokens named `Notes` do not alias each other. Export and
reuse one token instance for each capability contract.

Class-based abilities remain compatible and can be registered alongside token
bindings:

```ts
actor.whoCan(
  MakeRequests.using(client),
  Notes.bind(notes),
);

actor.abilityTo(MakeRequests); // existing class lookup
actor.abilityTo(Notes);        // typed token lookup
```

A missing token fails with a `ConfigurationError` that names the token and
points to `whoCan(Notes.bind(...))`.

## Shared versus isolated objects

Tokens follow the same cast lifetime rules as class-based abilities.
`whereEveryoneCan(...)` binds one shared object to every actor. For mutable
objects, create and bind a fresh object for each actor:

```ts
const cast = Cast.whereEachActorCan(() => [
  Notes.bind(createNotesClient()),
]);
```

This prevents one actor's adapter state from leaking into another actor.

## Provider boundary

These portable contracts are composition seams, not runtime provider
switches. Under [ADR 0001](./adr/0001-provider-selection-boundary.md), one
provider still owns an actor and every activity in its execution lane. Bind
adapter objects when constructing that lane; do not mix native runtime objects
from different Screenplay providers inside one actor or scenario.
