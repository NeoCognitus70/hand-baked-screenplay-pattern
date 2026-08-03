import { describe, expect, it } from 'vitest';
import { renderSampleReport } from '../src/sample/sampleReport.js';

/**
 * Gates the portfolio sample report (HBSP-27 / landing LAND-09B). These checks
 * run as part of `npm run verify`, so the artefact is validated by the normal
 * gate rather than a bolt-on script: it must be byte-stable, self-contained,
 * carry the truthful provenance banner, and show meaningful pass/fail content.
 */
describe('Sample report (HBSP-27) — the page published to GitHub Pages', () => {
  it('renders byte-identical output for unchanged input (deterministic)', async () => {
    const first = await renderSampleReport();
    const second = await renderSampleReport();
    expect(second).toBe(first);
  });

  it('is a complete, self-contained document with inline CSS/JS', async () => {
    const html = await renderSampleReport();
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true);
    expect(html).toContain('<style>');
    expect(html).toContain('<script>');
    // Its own title, not the generic reporter title.
    expect(html).toContain('sample report</title>');
    expect(html).not.toContain('<title>Screenplay test report</title>');
  });

  it('references no external assets or network resources', async () => {
    const html = await renderSampleReport();
    expect(html).not.toMatch(/https?:\/\//);
    expect(html).not.toMatch(/\bsrc=/);
    expect(html).not.toMatch(/\bhref=/);
  });

  it('carries a truthful provenance banner', async () => {
    const html = await renderSampleReport();
    expect(html).toContain('Illustrative sample');
    expect(html).toContain('independent of Serenity/JS');
    expect(html).toContain('current CI result');
    // The banner must not claim @serenity-js provenance.
    expect(html).not.toContain('@serenity-js/');
  });

  it('shows meaningful pass/fail content across scenes', async () => {
    const html = await renderSampleReport();
    // Overall run failed (one deliberately failing scene) with the exact tally.
    expect(html).toContain('class="summary fail"');
    expect(html).toContain('<b>3</b> scenes — <b>2</b> passed, <b>1</b> failed');
    // At least one passing and one failing scene rendered.
    expect(html).toContain('<section class="scene scene-pass">');
    expect(html).toContain('<section class="scene scene-fail">');
    // The three sample scene names are present.
    expect(html).toContain('Ada captures a booking reference');
    expect(html).toContain('Bob checks the stock level is positive');
    expect(html).toContain('Ada expects the wrong account balance');
    // The failing scene surfaces an assertion failure with an error message.
    expect(html).toContain('assertion failure');
  });
});
