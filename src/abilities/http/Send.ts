import { Interaction } from '../../screenplay/Interaction.js';
import type { Answerable } from '../../screenplay/Answerable.js';
import type { ActivityActor } from '../../screenplay/capabilities.js';
import { MakeRequests } from './MakeRequests.js';
import type { HttpRequest } from './HttpClient.js';

/**
 * {@link Send} is an {@link Interaction} that dispatches an
 * {@link HttpRequest} using the actor's {@link MakeRequests} ability.
 *
 * @example
 * Send.a({ method: 'GET', url: '/users/1' })
 */
export class Send extends Interaction {
  static a(request: Answerable<HttpRequest>): Send {
    return new Send(request);
  }

  /** Alias of {@link Send.a} that reads better for some verbs. */
  static the(request: Answerable<HttpRequest>): Send {
    return new Send(request);
  }

  protected constructor(private readonly request: Answerable<HttpRequest>) {
    super(Send.describe(request));
  }

  async performAs(actor: ActivityActor): Promise<void> {
    const request = await actor.answer(this.request);
    await actor.abilityTo(MakeRequests).send(request);
  }

  private static describe(request: Answerable<HttpRequest>): string {
    if (request && typeof request === 'object' && 'method' in request && 'url' in request) {
      const plain = request as HttpRequest;
      return `#actor sends a ${plain.method} request to ${plain.url}`;
    }
    return '#actor sends an HTTP request';
  }
}
