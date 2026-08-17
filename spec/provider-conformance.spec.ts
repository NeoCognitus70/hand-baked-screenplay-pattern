import { describe, expect, it } from 'vitest';

import { providerConformanceCases, runProviderConformance } from '../src/index.js';
import { HandBakedConformanceProvider } from './support/HandBakedConformanceProvider.js';
import { MinimalConformanceProvider } from './support/MinimalConformanceProvider.js';

describe('provider conformance kit', () => {
  it.each([
    ['the hand-baked async provider', new HandBakedConformanceProvider()],
    ['an independent minimal fixture', new MinimalConformanceProvider()],
  ])('passes every reusable case against %s', async (_description, provider) => {
    const report = await runProviderConformance(provider);

    expect(report.provider).toBe(provider.name);
    expect(report.cases).toHaveLength(providerConformanceCases.length);
    expect(report.cases).toEqual(
      providerConformanceCases.map((candidate) => ({
        name: candidate.name,
        status: 'passed',
      })),
    );
    expect(report.passed).toBe(true);
  });

  it('detects a deliberately non-conforming provider that continues after failure', async () => {
    const report = await runProviderConformance(new MinimalConformanceProvider(true));

    expect(report.passed).toBe(false);
    expect(report.cases.filter((result) => result.status === 'failed')).toHaveLength(1);
    expect(report.cases).toContainEqual(
      expect.objectContaining({
        name: 'stops on failure and preserves provider-native outcomes',
        status: 'failed',
      }),
    );
    const drift = report.cases.find((result) => result.status === 'failed');
    expect(drift?.status === 'failed' && drift.error.message).toContain(
      'activity execution did not stop on failure',
    );
  });
});
