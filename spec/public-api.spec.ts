import { describe, expect, it } from 'vitest';

import * as api from '../src/index.js';

/**
 * Public-API surface canary (HBSP-13).
 *
 * The sibling `calculator-screenplay-bdd` project consumes this package as a
 * library via `file:../hand-baked-screenplay-pattern`, importing named runtime
 * exports from the package root. An accidental rename or removal of one of
 * those exports type-checks and builds cleanly *here* (nothing in this repo
 * references the export) and only surfaces as a broken build in the consumer.
 *
 * This spec pins the documented runtime root surface so such a regression fails
 * fast in THIS repo's gate instead. Type and shape compatibility are pinned by
 * `public-api.types.spec.ts`.
 *
 * Adding new exports is fine (additive). Removing or renaming one listed here is
 * a breaking change to the public surface and must be a deliberate, documented
 * decision, not an accident.
 */
describe('public API surface (package root exports)', () => {
  // Exact runtime value exports consumed by calculator-screenplay-bdd at
  // 2b10090. Keep this list aligned with docs/compatibility.md.
  const consumedByCalculator = [
    'Ability',
    'Cast',
    'Ensure',
    'Interaction',
    'LastResponse',
    'MakeRequests',
    'ManageData',
    'Question',
    'Recall',
    'Remember',
    'Send',
    'Stage',
    'Task',
    'equals',
    'includes',
  ] as const;

  const documentedSurface = [
    // screenplay core
    'Actor',
    'AbilityBinding',
    'AbilityToken',
    'Outcome',
    'isQuestionLike',
    'providerConformanceCases',
    'runProviderConformance',
    // expectations
    'Expectation',
    'isGreaterThan',
    'isLessThan',
    'isNot',
    'isPresent',
    // crew + reporting (the reporting additions)
    'ConsoleReporter',
    'HtmlReporter',
    'buildReport',
    'renderHtml',
    'scene',
    // errors
    'ConfigurationError',
    'LogicError',
    'AssertionError',
  ] as const;

  it.each([...consumedByCalculator])('exports %s (consumed by the sibling calculator)', (name) => {
    expect(api).toHaveProperty(name);
    expect((api as Record<string, unknown>)[name]).toBeDefined();
  });

  it.each([...documentedSurface])('exports %s (documented public surface)', (name) => {
    expect(api).toHaveProperty(name);
    expect((api as Record<string, unknown>)[name]).toBeDefined();
  });

  it('does not regress the count of documented runtime exports', () => {
    // A floor, not an exact match: additive changes are allowed, accidental
    // removals are not. Update this number deliberately when the surface grows.
    const runtimeExports = Object.keys(api).filter(
      (key) => (api as Record<string, unknown>)[key] !== undefined,
    );

    expect(runtimeExports.length).toBeGreaterThanOrEqual(
      consumedByCalculator.length + documentedSurface.length,
    );
  });
});
