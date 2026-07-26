# Migration Plans

[<- Back to Index](00_CODE_REVIEW_CODEX_GPT5_v1_20260723T2337Z.md) | [Next: Evidence and Metrics ->](ANNEX/EVIDENCE_AND_METRICS.md)

**Reviewer:** AI assistant (CODEX GPT-5)
**Date:** 2026-07-23T23:37Z

## Plan 1: Single Source of Truth for Features and Releases

- Decide the public release contract: Git tag/GitHub release, npm package, or
  both.
- Identify the commit intended to represent 0.2.0 and verify its gate, audit,
  and package dry-run.
- Create the missing tag/release if 0.2.0 is meant to be public; otherwise
  revert the wording that says it was cut.
- Add a small release check comparing `package.json`, `CHANGELOG.md`, Git tags,
  and backlog status.
- Update backlog Item #14 and the Potential Next Steps release claim.
- Refresh the paired handover once release semantics and new findings are
  reconciled.

## Plan 2: Actor-Scoped Stateful Abilities

- Add failing tests showing Bob must not read Ada's `ManageData` token or
  `MakeRequests.lastResponse`.
- Record current `whereEveryoneCan` sharing semantics before changing public
  behaviour.
- Add an additive factory-based cast constructor that creates abilities per
  actor.
- Migrate examples and the calculator consumer to the safe API for mutable
  abilities.
- Retain or deprecate the existing method according to compatibility needs;
  document that concrete instances are shared if it remains.
- Run provider validation first, then the coupled consumer gate sequentially.

## Plan 3: Reporting Truth and Diagnostics

- Add table-driven falsy-throw tests at Outcome and public-scene levels.
- Separate success creation from thrown-value conversion.
- Add a scene-only failure model and renderer test; render its error details.
- Define an empty-run policy and encode it in model/render tests.
- Retain the existing interrupted-scene/activity semantics and non-monotonic
  duration floors.
- Re-run coverage and update only dated coverage claims, not historical
  evidence.

## Docker Compose for Local Development

N/A - the library has no application service, database, browser, or external
runtime infrastructure. Adding Docker Compose would increase setup and
maintenance without improving reproducibility beyond Node plus `npm ci`.

## GitHub Actions and Workflow Plan

- Keep the existing Node 20/22/24 verify matrix and npm cache.
- Keep coverage informational unless the owner explicitly adopts a threshold.
- Add a release-verification job or manually dispatched release workflow only
  after the distribution contract is chosen.
- If package publication is chosen, use environment protection, provenance,
  least-privilege permissions, and a trusted publisher rather than a long-lived
  token where supported.
- Upload a package dry-run manifest or coverage artifact only if reviewers need
  durable CI evidence; avoid artefacts without a consumer.
- Continue branch-plus-PR delivery and never merge review PRs automatically.

---

[<- Previous: Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md) | [Back to Index](00_CODE_REVIEW_CODEX_GPT5_v1_20260723T2337Z.md) | [Next: Evidence and Metrics ->](ANNEX/EVIDENCE_AND_METRICS.md)
