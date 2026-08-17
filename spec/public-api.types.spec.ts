import { describe, expect, it } from 'vitest';

import {
  Ability,
  Cast,
  Question,
  Stage,
  type Actor,
  type Answerable,
  type HttpClient,
  type HttpRequest,
  type HttpResponse,
} from '../src/index.js';

/**
 * Compile-time compatibility canary for the sibling Calculator consumer
 * (HBSP-29). The explicit annotations are deliberate: `npm run typecheck`
 * fails if an export disappears or one of the consumed shapes becomes
 * incompatible, while additive exports remain unconstrained.
 */
describe('Calculator-consumed public type baseline', () => {
  it('preserves Actor, Answerable, and Ability-subclass shapes', async () => {
    const browse = CalculatorAbility.using('calculator page');
    const actor: Actor = new Stage(Cast.whereEveryoneCan(browse)).actor('Ada');
    const prepared: Actor = actor.whoCan(browse);
    const resolved: CalculatorAbility = prepared.abilityTo(CalculatorAbility);
    const activityResult: Promise<void> = prepared.attemptsTo();

    const answerables: readonly Answerable<number>[] = [
      40,
      Promise.resolve(41),
      Question.about('the ultimate answer', () => 42),
    ];
    const answers: number[] = [];
    for (const answerable of answerables) {
      const answer: Promise<number> = prepared.answer(answerable);
      answers.push(await answer);
    }

    await activityResult;
    expect(resolved.page).toBe('calculator page');
    expect(answers).toEqual([40, 41, 42]);
  });

  it('preserves the Calculator HTTP-client adapter shapes', async () => {
    const request: HttpRequest = {
      method: 'POST',
      url: '/api/calculations',
      headers: { 'content-type': 'application/json' },
      body: { leftOperand: 20, operator: 'add', rightOperand: 22 },
    };
    const client: HttpClient = new CalculatorHttpClient();
    const pendingResponse: Promise<HttpResponse> = client.send(request);
    const response: HttpResponse = await pendingResponse;

    expect(response).toEqual({
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: { result: 42 },
    });
  });
});

class CalculatorAbility extends Ability {
  static using(page: string): CalculatorAbility {
    return new CalculatorAbility(page);
  }

  protected constructor(readonly page: string) {
    super();
  }
}

class CalculatorHttpClient implements HttpClient {
  async send(request: HttpRequest): Promise<HttpResponse> {
    return {
      status: request.method === 'POST' ? 200 : 405,
      headers: { 'content-type': 'application/json' },
      body: { result: 42 },
    };
  }
}
