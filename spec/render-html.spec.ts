import { describe, expect, it } from 'vitest';
import { renderHtml } from '../src/reporting/renderHtml.js';
import type { ActivityReport, RunReport, SceneReport } from '../src/reporting/ReportModel.js';
import { Outcome } from '../src/screenplay/Outcome.js';

const activity = (over: Partial<ActivityReport> = {}): ActivityReport => ({
  actor: 'Ada',
  description: '#actor sends GET /health',
  outcome: Outcome.successful(),
  startedAt: 0,
  durationMs: 10,
  children: [],
  ...over,
});

const scene = (over: Partial<SceneReport> = {}): SceneReport => ({
  name: 'Ada checks the health endpoint',
  outcome: Outcome.successful(),
  startedAt: 0,
  durationMs: 70,
  activities: [],
  ...over,
});

const report = (over: Partial<RunReport> = {}): RunReport => ({
  startedAt: 100,
  finishedAt: 300,
  durationMs: 200,
  total: 1,
  succeeded: 1,
  failed: 0,
  scenes: [],
  ...over,
});

describe('renderHtml', () => {
  it('returns a complete standalone HTML document with no external assets', () => {
    const html = renderHtml(report({ scenes: [scene()] }));

    expect(html.startsWith('<!DOCTYPE html>')).toBe(true);
    expect(html).toContain('<html');
    expect(html).toContain('</html>');
    // Inline style/script, but nothing pulled from the network.
    expect(html).toContain('<style>');
    expect(html).toContain('<script>');
    expect(html).not.toMatch(/<link[^>]+href=/i);
    expect(html).not.toMatch(/src\s*=\s*["']https?:/i);
    expect(html).not.toMatch(/href\s*=\s*["']https?:/i);
  });

  it('shows the summary counts and overall pass status', () => {
    const html = renderHtml(report({ total: 3, succeeded: 2, failed: 1 }));

    expect(html).toContain('>3</b> scenes');
    expect(html).toContain('>2</b> passed');
    expect(html).toContain('>1</b> failed');
    // failed > 0 → the failure styling class on the summary band.
    expect(html).toContain('class="summary fail"');
  });

  it('marks a clean run as passed', () => {
    const html = renderHtml(report({ total: 2, succeeded: 2, failed: 0 }));
    expect(html).toContain('class="summary pass"');
    expect(html).toContain('All scenes passed');
  });

  it('renders each scene name and a status pill', () => {
    const html = renderHtml(
      report({
        total: 2,
        succeeded: 1,
        failed: 1,
        scenes: [
          scene({ name: 'A passing scene', outcome: Outcome.successful() }),
          scene({
            name: 'A failing scene',
            outcome: Outcome.from(new Error('boom')),
          }),
        ],
      }),
    );

    expect(html).toContain('A passing scene');
    expect(html).toContain('A failing scene');
    expect(html).toContain('pill-pass');
    expect(html).toContain('pill-fail');
  });

  it('renders the error message, and the stack for kind "error"', () => {
    const error = new Error('connection refused');
    error.stack = 'Error: connection refused\n    at someModule.ts:42:7';
    const html = renderHtml(
      report({
        total: 1,
        succeeded: 0,
        failed: 1,
        scenes: [
          scene({
            outcome: Outcome.from(error),
            activities: [activity({ outcome: Outcome.from(error) })],
          }),
        ],
      }),
    );

    expect(html).toContain('connection refused');
    expect(html).toContain('error-stack');
    expect(html).toContain('someModule.ts:42:7');
  });

  it('escapes HTML-special characters in user-controlled text', () => {
    const html = renderHtml(
      report({
        scenes: [scene({ name: 'check <script>alert(1)</script> &"\'' })],
      }),
    );

    // The raw script tag must NOT appear; its escaped form must.
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('&amp;');
    expect(html).toContain('&quot;');
    expect(html).toContain('&#39;');
  });

  it('renders a scene-level failure that has no activities to carry the error', () => {
    // A scene that dies in setup/a hook/orchestration fails with an Error but
    // has no activity — the scene's own error block must still render.
    const error = new Error('beforeAll hook <exploded> & died');
    error.stack = 'Error: beforeAll hook\n    at hook.ts:7:1';
    const html = renderHtml(
      report({
        total: 1,
        succeeded: 0,
        failed: 1,
        scenes: [
          scene({
            name: 'A scene that dies in setup',
            outcome: Outcome.from(error),
            activities: [],
          }),
        ],
      }),
    );

    expect(html).toContain('<section class="scene scene-fail">');
    // The message renders, HTML-escaped (raw form must not appear).
    expect(html).toContain('beforeAll hook &lt;exploded&gt; &amp; died');
    expect(html).not.toContain('beforeAll hook <exploded> & died');
    // The stack renders for an unexpected error.
    expect(html).toContain('error-stack');
    expect(html).toContain('hook.ts:7:1');
  });

  it('does not duplicate a scene error already shown on a nested activity', () => {
    const error = new Error('unique-shared-message-xyz');
    const html = renderHtml(
      report({
        total: 1,
        succeeded: 0,
        failed: 1,
        scenes: [
          scene({
            outcome: Outcome.from(error),
            activities: [activity({ outcome: Outcome.from(error) })],
          }),
        ],
      }),
    );

    // The error-message block is shown once (on the failing activity), not
    // repeated at scene level. Count the message *div* specifically — the raw
    // string also appears inside the default Error stack.
    const messageBlocks = html.split(
      'class="error-message">unique-shared-message-xyz</div>',
    ).length - 1;
    expect(messageBlocks).toBe(1);
  });

  it('escapes special characters in error messages too', () => {
    const html = renderHtml(
      report({
        total: 1,
        succeeded: 0,
        failed: 1,
        scenes: [
          scene({
            outcome: Outcome.from(new Error('expected <b> but got </b>')),
            activities: [activity({ outcome: Outcome.from(new Error('expected <b> but got </b>')) })],
          }),
        ],
      }),
    );

    expect(html).not.toContain('expected <b> but got </b>');
    expect(html).toContain('expected &lt;b&gt; but got &lt;/b&gt;');
  });
});
