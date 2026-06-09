/**
 * hand-baked-screenplay-pattern
 *
 * A dependency-free TypeScript implementation of the Screenplay Pattern that
 * follows the design model and naming conventions popularised by Serenity/JS,
 * but does not use or depend on any `@serenity-js/*` package.
 */

export * from './screenplay/index.js';
export * from './expectations/index.js';
export * from './abilities/index.js';
export * from './crew/index.js';
export { ConfigurationError, LogicError, AssertionError } from './errors/index.js';
