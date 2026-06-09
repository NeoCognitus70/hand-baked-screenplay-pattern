import { describe, expect, it } from 'vitest';
import {
  Cast,
  Ensure,
  LastResponse,
  MakeRequests,
  ManageData,
  Recall,
  Remember,
  Send,
  Stage,
  Task,
  equals,
  isPresent,
} from '../src/index.js';
import { InMemoryHttpClient } from './support/InMemoryHttpClient.js';

/**
 * A business-level Task expressed in the domain language, composed of
 * system-level interactions. This is the payoff of the pattern: the test
 * reads like intent, the mechanics live in the interactions and abilities.
 */
const SignUp = (email: string) =>
  Task.where(
    `#actor signs up as ${email}`,
    Send.a({ method: 'POST', url: '/users', body: { email } }),
    Ensure.that(LastResponse.status(), equals(201)),
    Remember.that('userId', LastResponse.body<{ id: number }>()),
  );

describe('End-to-end screenplay example', () => {
  it('lets an actor sign up and then read back their profile', async () => {
    const client = InMemoryHttpClient.withRoutes({
      'POST /users': { status: 201, headers: {}, body: { id: 1, email: 'ada@example.com' } },
      'GET /users/1': { status: 200, headers: {}, body: { id: 1, email: 'ada@example.com' } },
    });

    const stage = new Stage(
      Cast.whereEveryoneCan(MakeRequests.using(client), ManageData.usingAnEmptyStore()),
    );

    await stage.actor('Ada').attemptsTo(
      SignUp('ada@example.com'),
      Ensure.that(Recall.the('userId'), isPresent()),
      Send.a({ method: 'GET', url: '/users/1' }),
      Ensure.that(LastResponse.status(), equals(200)),
      Ensure.that(LastResponse.body(), equals({ id: 1, email: 'ada@example.com' })),
    );

    // The fake transport saw exactly the requests the screenplay described.
    expect(client.received.map((r) => `${r.method} ${r.url}`)).toEqual([
      'POST /users',
      'GET /users/1',
    ]);
  });
});
