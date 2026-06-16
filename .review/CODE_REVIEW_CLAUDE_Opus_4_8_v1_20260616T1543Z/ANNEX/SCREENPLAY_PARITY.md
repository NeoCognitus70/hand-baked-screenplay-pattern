# Annex: Screenplay Parity

[<- Back to Index](../00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1543Z.md) | [Next: Annex - Metrics ->](METRICS.md)

**Reviewer:** AI assistant (CLAUDE_Opus_4_8)

How faithfully this hand-baked library tracks the Serenity/JS model it imitates, and where it
deliberately diverges. The library's stated goal is concept-portability, not code-compatibility
([README.md](../README.md) "Relationship to Serenity/JS").

## Parity table

| Concept | This library | Serenity/JS analogue | Verdict |
|---|---|---|---|
| Actor | [Actor.ts](../src/screenplay/Actor.ts): `whoCan`, `attemptsTo`, `abilityTo`, `answer` | `Actor` | Faithful |
| Ability | [Ability.ts](../src/screenplay/Ability.ts) with `abilityType()` lookup key | `Ability` | Faithful |
| Task | [Task.ts](../src/screenplay/Task.ts): `Task.where(desc, ...activities)` | `Task` | Faithful |
| Interaction | [Interaction.ts](../src/screenplay/Interaction.ts): `Interaction.where(...)` | `Interaction` | Faithful |
| Question | [Question.ts](../src/screenplay/Question.ts): `Question.about(...)` | `Question` | Faithful |
| Cast / Stage | [Cast.ts](../src/screenplay/Cast.ts), [Stage.ts](../src/screenplay/Stage.ts) | `Cast`, `Stage` | Faithful |
| Ensure | [Ensure.ts](../src/expectations/Ensure.ts): `Ensure.that(actual, expectation)` | `Ensure` | Faithful |
| Crew member | `StageCrewMember.notifyOf(event)` ([StageEvents.ts](../src/screenplay/StageEvents.ts)) | `StageCrewMember` | Faithful |
| Outcome | [Outcome.ts](../src/screenplay/Outcome.ts): minimal union | `ExecutionSuccessful` / `ExecutionFailedWith*` | Faithful (minimal) |
| Scene events | `scene:starts`/`scene:finishes`/`test-run:finishes` | `SceneStarts`/`SceneFinished`/`TestRunFinishes` | Faithful naming |
| HtmlReporter | [HtmlReporter.ts](../src/crew/HtmlReporter.ts) | `SerenityBDDReporter` | Deliberately minimal |

## Deliberate, well-documented deviations

- **Reporting is a `StageCrewMember`, not an actor `Ability`.** The plan called this out explicitly
  ([planning/static-html-reporting.md](../planning/static-html-reporting.md) section 2), and the code
  honours it - `HtmlReporter` observes events and is never granted to an actor. Correct mapping of the
  Serenity/JS concept.
- **Minimal timing, not a `Clock`/`TellsTime` abstraction.** The `Stage` takes an injectable
  `now()` ([Stage.ts](../src/screenplay/Stage.ts) line 20) instead of a full clock ability - a YAGNI
  call that keeps the teaching surface small while remaining testable (the specs inject fixed clocks).
- **The `scene(name, fn)` helper** is offered as the primary runner-agnostic API, with the raw
  `sceneStarts`/`sceneFinishes`/`testRunFinishes` facades retained for manual wiring
  ([scene.ts](../src/scene/scene.ts)) - a pragmatic substitute for Serenity/JS's per-runner adapters.

## Cross-implementation parity within the portfolio

- The sibling `calculator-screenplay-bdd` is the real parity proof: it consumes this exact library from a
  different runner (playwright-bdd) and language-level entry (Playwright-backed abilities), demonstrating
  that the hand-baked API genuinely transfers. The additivity of the reporting work means that consumer
  did not have to change to keep building (see [Cross-Cutting Analysis](../04_CROSS_PROJECT_ANALYSIS.md)).

## Verdict

High fidelity. A reader who learns the pattern here will recognise it directly in Serenity/JS, and the
deviations are all conscious simplifications documented in the plan and README rather than gaps in
understanding.

---

[<- Back to Index](../00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1543Z.md) | [Next: Annex - Metrics ->](METRICS.md)
