/**
 * The HTTP verbs supported by {@link MakeRequests}.
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

/**
 * A transport-agnostic HTTP request.
 */
export interface HttpRequest {
  readonly method: HttpMethod;
  readonly url: string;
  readonly headers?: Readonly<Record<string, string>>;
  readonly body?: unknown;
}

/**
 * A transport-agnostic HTTP response.
 */
export interface HttpResponse<Body = unknown> {
  readonly status: number;
  readonly headers: Readonly<Record<string, string>>;
  readonly body: Body;
}

/**
 * The pluggable transport used by {@link MakeRequests}. Provide a real
 * implementation (e.g. backed by `fetch`) in production, or a fake in tests —
 * the screenplay code stays identical either way.
 */
export interface HttpClient {
  send(request: HttpRequest): Promise<HttpResponse>;
}
