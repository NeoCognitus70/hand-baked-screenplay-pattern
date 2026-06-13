import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  Cast,
  Ensure,
  HtmlReporter,
  LastResponse,
  MakeRequests,
  Send,
  actorCalled,
  assign,
  engage,
  equals,
  resetDefaultStage,
  scene,
  testRunFinishes,
} from '../src/index.js';
import { InMemoryHttpClient } from './support/InMemoryHttpClient.js';

/**
 * End-to-end exercise of the reporting feature through the **public API only**,
 * mirroring the plan's §7 worked example: a passing scene and a failing scene
 * run against the default stage with an {@link HtmlReporter} whose writer is
 * injected (so no real filesystem is touched). After `testRunFinishes()` the
 * captured HTML must report exactly 1 pass / 1 fail.
 */
describe('Reporting — end-to-end through the public API', () => {
  beforeEach(() => resetDefaultStage());
  afterEach(() => resetDefaultStage());

  it('produces an HTML report showing one passing and one failing scene', async () => {
    const client = InMemoryHttpClient.withRoutes({
      'GET /health': { status: 200, headers: {}, body: { ok: true } },
      'GET /broken': { status: 500, headers: {}, body: { ok: false } },
    });

    let captured: { filePath: string; html: string } | undefined;
    engage(Cast.whereEveryoneCan(MakeRequests.using(client)));
    assign(
      HtmlReporter.storingReportsAt('./report').withWriter((filePath, html) => {
        captured = { filePath, html };
      }),
    );

    // Passing scene.
    await scene('Ada checks the health endpoint', async () => {
      await actorCalled('Ada').attemptsTo(
        Send.a({ method: 'GET', url: '/health' }),
        Ensure.that(LastResponse.status(), equals(200)),
      );
    });

    // Failing scene — the assertion throws, the scene re-throws, the test
    // would fail, so we catch it here to let the run finish and render.
    await expect(
      scene('Ada checks a broken endpoint', async () => {
        await actorCalled('Ada').attemptsTo(
          Send.a({ method: 'GET', url: '/broken' }),
          Ensure.that(LastResponse.status(), equals(200)),
        );
      }),
    ).rejects.toThrow();

    testRunFinishes(); // drives the reporter to render and "write"

    // The reporter wrote exactly one report, to the expected path.
    expect(captured).toBeDefined();
    expect(captured!.filePath).toBe('./report/index.html');

    const html = captured!.html;
    expect(html).toContain('<!DOCTYPE html>');
    // Both scene names made it into the report.
    expect(html).toContain('Ada checks the health endpoint');
    expect(html).toContain('Ada checks a broken endpoint');
    // The summary band reports 2 scenes, 1 passed and 1 failed, and the run
    // failed overall — this is the "1 pass / 1 fail" acceptance assertion.
    expect(html).toContain('class="summary fail"');
    expect(html).toContain('<b>2</b> scenes — <b>1</b> passed, <b>1</b> failed');
    // One scene rendered as passed, one as failed.
    expect(html).toContain('<section class="scene scene-pass">');
    expect(html).toContain('<section class="scene scene-fail">');
  });
});
