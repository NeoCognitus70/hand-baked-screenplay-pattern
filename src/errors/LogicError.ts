/**
 * Thrown when the system reaches an invalid state at runtime, for example when
 * a question is asked about a response before any request has been sent.
 */
export class LogicError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LogicError';
    Object.setPrototypeOf(this, LogicError.prototype);
  }
}
