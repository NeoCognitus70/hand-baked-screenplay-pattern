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
 * This spec pins the documented root surface so such a regression fails fast in
 * THIS repo's gate instead. It is intentionally a presence check — it asserts
 * each symbol is exported and defined, not its shape — because the contract it
 * guards is "the name resolves", which is exactly what the consumer relies on.
 *
 * Adding new exports is fine (additive). Removing or renaming one listed here is
 * a breaking change to the public surface and must be a deliberate, documented
 * decision, not an accident.
 */
describe('public API surface (package root exports)', () => {
  // The runtime value exports the sibling calculator consumes today, plus the
  // reporting additions that ship as part of the documented surface.
  const consumedByCalculator = [
    'Ability',
    'Cast',
    'Ensure',
    'Interaction',
    'LastResponse',
    'MakeRequests',
    'ManageData',
    'Question',
    'Stage',
    'Task',
    'equals',
    'includes',
  ] as const;

  const documentedSurface = [
    // screenplay core
    'Actor',
    'Remember',
    'Send',
    'Outcome',
    // expectations
    'Expectation',
    'isGreaterThan',
    'isLessThan',
    'isNot',
    'isPresent',
    // abilities/data
    'Recall',
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
