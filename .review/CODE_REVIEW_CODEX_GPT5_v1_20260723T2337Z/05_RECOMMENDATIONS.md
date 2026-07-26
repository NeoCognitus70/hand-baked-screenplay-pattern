# Recommendations

[<- Back to Index](00_CODE_REVIEW_CODEX_GPT5_v1_20260723T2337Z.md) | [Next: Architecture Assessment ->](06_ARCHITECTURE_ASSESSMENT.md)

**Reviewer:** AI assistant (CODEX GPT-5)
**Date:** 2026-07-23T23:37Z

## Recommended Refactors

- **P1 - reconcile release truth.** Decide whether 0.2.0 is a GitHub release,
  npm release, or prepared source version; then align tag, release record,
  changelog, manifest, backlog, and handover.
- **P1 - introduce actor-scoped ability factories.** Preserve compatibility
  while giving stateful abilities a safe per-actor construction path.
- **P2 - make catch-to-outcome conversion total.** Every thrown value,
  including falsy values and `undefined`, must produce failure.
- **P2 - improve report truth.** Render scene-level failure details and define
  a non-green zero-scene state.
- **P3 - correct Guide 03.** Key TimingReporter start stacks by actor and use
  event timestamps.

## Next Steps

- Triage Risks 1-6 into a fourth review-derived backlog cycle; keep Risk 7 as
  routine maintenance unless owner policy says otherwise.
- Answer the recorded release, ability-scope, empty-run, and crew-isolation
  questions before selecting API behaviour.
- Add regression tests first: two-actor state separation, falsy thrown values,
  scene-only error rendering, and terminal-only empty report.
- Run this provider's `npm run verify`, audit, coverage, and pack dry-run after
  changes.
- Validate the calculator consumer sequentially only after provider changes are
  committed and no other agent is writing either tree.

## Future Project Ideas

- A tiny runner-adapter example that guarantees scene/run lifecycle events in
  hooks without coupling the core library to a specific test runner.
- A neutral `RunOutcome` state such as `passed | failed | incomplete` to make
  empty and interrupted evidence explicit.
- A release-verification script that checks SemVer consistency and remote tag
  presence before the backlog marks a release resolved.
- An actor-isolation guide showing when an ability may safely be shared
  (stateless transport) and when it must be created per actor (tokens, session,
  remembered data, last response).

## Recorded Questions

This review ran unattended, so the questions are recorded rather than blocking
the report:

1. Does release 0.2.0 require a GitHub tag/release, npm publication, or both?
2. Is `Cast.whereEveryoneCan` intentionally an object-sharing API?
3. What status should a zero-scene run report?
4. Should a failing crew member abort execution or be isolated from other crew?

## Priority Order

1. Correct release/source-of-truth state.
2. Decide and protect actor ability isolation.
3. Eliminate false-green outcome paths.
4. Restore complete failure diagnostics.
5. Correct the concurrency teaching example and refresh dependencies.

---

[<- Previous: Cross-Project Analysis](04_CROSS_PROJECT_ANALYSIS.md) | [Back to Index](00_CODE_REVIEW_CODEX_GPT5_v1_20260723T2337Z.md) | [Next: Architecture Assessment ->](06_ARCHITECTURE_ASSESSMENT.md)
