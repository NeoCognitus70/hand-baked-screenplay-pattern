/**
 * Portfolio sample-report generator (backlog HBSP-27 / portfolio landing LAND-09B).
 *
 * This module is **deliberately not part of the public API** — it is not
 * re-exported from `src/index.ts`. Its only job is to produce one deterministic,
 * self-contained, illustrative HTML page that demonstrates the library's
 * built-in static HTML reporter for publication to GitHub Pages.
 *
 * Everything is driven through the public API (`Stage`, `Cast`, actors,
 * tasks/interactions, `buildReport`, `renderHtml`) from **fixed sample data**.
 * A dedicated {@link Stage} is constructed with an injected **monotonic clock**
 * (never the default stage's `Date.now()`), so timestamps and durations — and
 * therefore the entire rendered document — are **byte-stable**: the same input
 * always renders the same bytes.
 *
 * The page is framed with a provenance banner that states, prominently, that it
 * is an illustrative sample, is independent of Serenity/JS, and is not a current
 * CI result. The library's generic `renderHtml` output is unchanged for real
 * consumers — the banner is added here, around the core report, only for this
 * sample.
 */
import {
  Cast,
  Ensure,
  ManageData,
  Outcome,
  Recall,
  Remember,
  Stage,
  Task,
  buildReport,
  equals,
  isGreaterThan,
  renderHtml,
  type Activity,
  type DomainEvent,
  type StageCrewMember,
} from '../index.js';

/** A fixed instant so the rendered ISO timestamp is stable across runs. */
const CLOCK_BASE = Date.UTC(2026, 0, 1, 9, 0, 0);
/** Each announced event advances the clock by this many milliseconds. */
const CLOCK_STEP = 5;

/**
 * Builds a monotonic clock: successive calls return `base`, `base + step`,
 * `base + 2*step`, ... A fresh clock is created per render, so repeated renders
 * produce identical timestamps.
 */
function monotonicClock(base = CLOCK_BASE, step = CLOCK_STEP): () => number {
  let current = base;
  return () => {
    const value = current;
    current += step;
    return value;
  };
}

/** A crew member that simply records every event it is notified of. */
class CapturingCrew implements StageCrewMember {
  readonly events: DomainEvent[] = [];
  notifyOf(event: DomainEvent): void {
    this.events.push(event);
  }
}

/**
 * Runs one scene on the given stage. A thrown value (e.g. an assertion failure)
 * is captured as the scene's {@link Outcome} rather than re-thrown, so a
 * deliberately failing sample scene still renders instead of aborting the run.
 */
async function runScene(
  stage: Stage,
  name: string,
  actorName: string,
  activities: Activity[],
): Promise<void> {
  stage.sceneStarts(name);
  try {
    await stage.actor(actorName).attemptsTo(...activities);
    stage.sceneFinishes(name, Outcome.successful());
  } catch (error) {
    stage.sceneFinishes(name, Outcome.from(error));
  }
}

/** The provenance banner injected at the top of the sample document. */
const SAMPLE_BANNER = [
  '<div class="sample-banner" role="note" style="max-width:960px;margin:0 auto 1.25rem;',
  'padding:.85rem 1.1rem;border:1px solid #c9a227;border-left:6px solid #c9a227;',
  'border-radius:8px;background:#fff8e1;color:#4a3b0a;font-size:.92rem;line-height:1.5;',
  'font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">',
  '<strong>Illustrative sample &mdash; not a live test run.</strong> ',
  "This page is a fixed, self-contained demonstration of the hand-baked Screenplay ",
  "pattern's built-in static HTML reporter (<code>HtmlReporter</code> / ",
  '<code>renderHtml</code>), generated from sample data. It is <strong>not</strong> a ',
  'current CI result and is <strong>independent of Serenity/JS</strong>.',
  '</div>',
].join('');

/**
 * Renders the deterministic sample report as a complete, self-contained HTML
 * document string. Pure apart from constructing its own stage; performs no
 * filesystem or network access.
 */
export async function renderSampleReport(): Promise<string> {
  const stage = new Stage(
    Cast.whereEveryoneCan(ManageData.usingAnEmptyStore()),
    monotonicClock(),
  );
  const capture = new CapturingCrew();
  stage.assign(capture);

  // Scene 1 — passing, with a nested task bracketing two child interactions.
  await runScene(stage, 'Ada captures a booking reference', 'Ada', [
    Task.where(
      '#actor captures the booking reference',
      Remember.that('bookingRef', 'BK-1001'),
      Ensure.that(Recall.the<string>('bookingRef'), equals('BK-1001')),
    ),
  ]);

  // Scene 2 — passing, a second actor with two top-level interactions.
  await runScene(stage, 'Bob checks the stock level is positive', 'Bob', [
    Remember.that('stockLevel', 42),
    Ensure.that(Recall.the<number>('stockLevel'), isGreaterThan(0)),
  ]);

  // Scene 3 — deliberately failing, to demonstrate a red scene and an error.
  await runScene(stage, 'Ada expects the wrong account balance', 'Ada', [
    Remember.that('accountBalance', 100),
    Ensure.that(Recall.the<number>('accountBalance'), equals(250)),
  ]);

  stage.testRunFinishes();

  const core = renderHtml(buildReport(capture.events));
  return core
    .replace(
      '<title>Screenplay test report</title>',
      '<title>Hand-baked Screenplay &mdash; sample report</title>',
    )
    .replace('<body>\n', `<body>\n${SAMPLE_BANNER}\n`);
}
