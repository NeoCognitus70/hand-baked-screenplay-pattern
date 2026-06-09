/**
 * Thrown when the test system is misconfigured, for example when an
 * {@link Actor} is asked to use an ability they have not been given.
 */
export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}
