import type { ActivityReport, RunReport, SceneReport } from './ReportModel.js';

/**
 * Escapes the five HTML-significant characters so user-controlled text (scene
 * names, activity descriptions, error messages and stacks) cannot break out of
 * the markup or inject script. Used for **every** dynamic value the renderer
 * emits — see plan §6.5 / §10.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Renders a duration in milliseconds as a short human-readable string. */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/** Renders an epoch-millisecond timestamp as an ISO-8601 string. */
function formatTimestamp(ms: number): string {
  return new Date(ms).toISOString();
}

/**
 * Renders the outcome of a scene or activity as a status pill. The label is a
 * fixed token (no dynamic text), so it needs no escaping.
 */
function statusPill(outcome: SceneReport['outcome']): string {
  if (outcome.status === 'success') {
    return '<span class="pill pill-pass">passed</span>';
  }
  const label = outcome.kind === 'assertion' ? 'assertion failure' : 'error';
  return `<span class="pill pill-fail">${label}</span>`;
}

/** Renders the error block for a failing activity, escaping all dynamic text. */
function renderError(outcome: ActivityReport['outcome']): string {
  if (outcome.status === 'success') return '';
  const message = escapeHtml(outcome.error.message);
  // The stack is the most useful detail for an unexpected error; for an
  // assertion failure the message is usually enough.
  const stack =
    outcome.kind === 'error' && outcome.error.stack
      ? `<pre class="error-stack">${escapeHtml(outcome.error.stack)}</pre>`
      : '';
  return `<div class="error"><div class="error-message">${message}</div>${stack}</div>`;
}

/** Recursively renders one activity and its nested children. */
function renderActivity(activity: ActivityReport): string {
  const marker = activity.outcome.status === 'success' ? '✓' : '✗';
  const cls = activity.outcome.status === 'success' ? 'activity-pass' : 'activity-fail';
  const children = activity.children.map(renderActivity).join('');
  return [
    `<li class="activity ${cls}">`,
    `<span class="marker">${marker}</span>`,
    `<span class="actor">${escapeHtml(activity.actor)}</span>`,
    `<span class="description">${escapeHtml(activity.description)}</span>`,
    `<span class="duration">${formatDuration(activity.durationMs)}</span>`,
    renderError(activity.outcome),
    children ? `<ul class="activities">${children}</ul>` : '',
    '</li>',
  ].join('');
}

/** Renders one scene section: header, status pill, and its activity tree. */
function renderScene(scene: SceneReport): string {
  const cls = scene.outcome.status === 'success' ? 'scene-pass' : 'scene-fail';
  const activities = scene.activities.map(renderActivity).join('');
  return [
    `<section class="scene ${cls}">`,
    '<header class="scene-header">',
    `<button class="toggle" aria-expanded="true">▾</button>`,
    `<h2 class="scene-name">${escapeHtml(scene.name)}</h2>`,
    statusPill(scene.outcome),
    `<span class="duration">${formatDuration(scene.durationMs)}</span>`,
    '</header>',
    `<ul class="activities scene-body">${activities}</ul>`,
    '</section>',
  ].join('');
}

const STYLE = `
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
         margin: 0; padding: 1.5rem; line-height: 1.5; }
  .summary { border-radius: 8px; padding: 1rem 1.25rem; margin-bottom: 1.5rem;
             border-left: 6px solid; }
  .summary.pass { background: #e8f5e9; border-color: #2e7d32; color: #1b3d1c; }
  .summary.fail { background: #fdecea; border-color: #c62828; color: #4a1414; }
  .summary h1 { margin: 0 0 .25rem; font-size: 1.4rem; }
  .summary .counts { font-variant-numeric: tabular-nums; }
  .summary .counts b { font-weight: 700; }
  .meta { font-size: .85rem; opacity: .8; }
  .scene { border: 1px solid #d0d0d0; border-radius: 8px; margin-bottom: 1rem;
           overflow: hidden; }
  .scene-header { display: flex; align-items: center; gap: .6rem;
                  padding: .6rem .9rem; background: #f5f5f5; }
  .scene-fail .scene-header { background: #fdecea; }
  .scene-name { margin: 0; font-size: 1.05rem; flex: 1; }
  .pill { font-size: .72rem; text-transform: uppercase; letter-spacing: .04em;
          padding: .15rem .5rem; border-radius: 999px; font-weight: 700; }
  .pill-pass { background: #2e7d32; color: #fff; }
  .pill-fail { background: #c62828; color: #fff; }
  .toggle { border: none; background: none; cursor: pointer; font-size: 1rem;
            padding: 0; width: 1.2rem; }
  .duration { font-size: .8rem; opacity: .7; font-variant-numeric: tabular-nums; }
  ul.activities { list-style: none; margin: 0; padding: .4rem 0 .4rem 1.4rem; }
  .scene-body { padding: .6rem .9rem .6rem 1.4rem; }
  .activity { padding: .15rem 0; }
  .activity .marker { display: inline-block; width: 1.1rem; font-weight: 700; }
  .activity-pass .marker { color: #2e7d32; }
  .activity-fail .marker { color: #c62828; }
  .actor { font-weight: 600; margin-right: .4rem; }
  .description { margin-right: .4rem; }
  .error { margin: .3rem 0 .3rem 1.1rem; padding: .5rem .7rem;
           background: #fff3f3; border-left: 3px solid #c62828; border-radius: 4px; }
  .error-message { font-weight: 600; color: #4a1414; }
  .error-stack { margin: .4rem 0 0; white-space: pre-wrap; font-size: .8rem;
                 overflow-x: auto; }
  .collapsed .scene-body { display: none; }
`.trim();

const SCRIPT = `
  document.querySelectorAll('.scene-header').forEach(function (header) {
    header.addEventListener('click', function () {
      var scene = header.parentElement;
      var collapsed = scene.classList.toggle('collapsed');
      var toggle = header.querySelector('.toggle');
      if (toggle) {
        toggle.textContent = collapsed ? '\\u25B8' : '\\u25BE';
        toggle.setAttribute('aria-expanded', String(!collapsed));
      }
    });
  });
`.trim();

/**
 * Pure renderer: turns a {@link RunReport} into a complete, standalone HTML
 * document with inline CSS and JS and **no** external assets or network
 * requests. No filesystem access — the caller decides where (if anywhere) the
 * string is written.
 *
 * Every piece of dynamic text (scene names, activity descriptions, error
 * messages and stacks) is HTML-escaped, so user-controlled content cannot
 * break the markup or inject script (plan §6.5 / §10).
 */
export function renderHtml(report: RunReport): string {
  const passed = report.failed === 0;
  const summaryClass = passed ? 'pass' : 'fail';
  const headline = passed ? 'All scenes passed' : 'Some scenes failed';
  const scenes = report.scenes.map(renderScene).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Screenplay test report</title>
<style>${STYLE}</style>
</head>
<body>
<div class="summary ${summaryClass}">
<h1>${headline}</h1>
<p class="counts"><b>${report.total}</b> scenes — <b>${report.succeeded}</b> passed, <b>${report.failed}</b> failed</p>
<p class="meta">Duration ${formatDuration(report.durationMs)} · finished ${formatTimestamp(report.finishedAt)}</p>
</div>
${scenes}
<script>${SCRIPT}</script>
</body>
</html>
`;
}
