import { LogicError } from '../../errors/index.js';
import { Ability } from '../../screenplay/Ability.js';
import type { HttpClient, HttpRequest, HttpResponse } from './HttpClient.js';

/**
 * {@link MakeRequests} is the {@link Ability} that lets an actor send HTTP
 * requests through a pluggable {@link HttpClient} and remembers the most
 * recent response so questions like {@link LastResponse} can read it.
 */
export class MakeRequests extends Ability {
  /**
   * Grants the ability to make requests using the given client.
   */
  static using(client: HttpClient): MakeRequests {
    return new MakeRequests(client);
  }

  private lastResponse: HttpResponse | undefined;

  protected constructor(private readonly client: HttpClient) {
    super();
  }

  async send(request: HttpRequest): Promise<HttpResponse> {
    this.lastResponse = await this.client.send(request);
    return this.lastResponse;
  }

  /**
   * Returns the most recent response, throwing if no request has been sent yet.
   */
  mostRecentResponse(): HttpResponse {
    if (!this.lastResponse) {
      throw new LogicError(
        'No response is available yet. Make sure the actor has sent a request first.',
      );
    }
    return this.lastResponse;
  }
}
