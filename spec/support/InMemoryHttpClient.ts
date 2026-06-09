import type { HttpClient, HttpRequest, HttpResponse } from '../../src/index.js';

/**
 * A fake {@link HttpClient} for tests: routes requests to canned responses by
 * "METHOD url" key, records every request it receives, and 404s otherwise.
 */
export class InMemoryHttpClient implements HttpClient {
  readonly received: HttpRequest[] = [];
  private readonly routes = new Map<string, HttpResponse>();

  static withRoutes(routes: Record<string, HttpResponse>): InMemoryHttpClient {
    const client = new InMemoryHttpClient();
    for (const [key, response] of Object.entries(routes)) {
      client.routes.set(key, response);
    }
    return client;
  }

  async send(request: HttpRequest): Promise<HttpResponse> {
    this.received.push(request);
    const response = this.routes.get(`${request.method} ${request.url}`);
    return (
      response ?? {
        status: 404,
        headers: {},
        body: { error: 'Not Found' },
      }
    );
  }
}
