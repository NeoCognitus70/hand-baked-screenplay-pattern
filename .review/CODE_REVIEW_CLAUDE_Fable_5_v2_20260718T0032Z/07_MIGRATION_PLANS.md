# Migration Strategy and Plans

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0032Z.md) | [Next: Annex Metrics ->](ANNEX/METRICS.md)

**Reviewer:** AI assistant (CLAUDE Fable 5)
**Date:** 2026-07-18T00:32Z

Per the single-repository customisation, the template's three plan areas are
scaled to what this repo actually contains.

## Single Source of Truth for Features

- Today feature truth is spread across source, README, CHANGELOG, `docs/`
  guides, and `planning/` - and only the guides/planning pair has drifted
  (Risk 1). The consolidation strategy is procedural, not structural:
- Treat the CHANGELOG as the release-time trigger: cutting a version includes a
  sweep of `docs/` and `planning/` for references to the features it ships
  (grep for "planned", "yet", "forthcoming", and the old version string).
- Keep the planning doc permanently, but with a delivered-status header so it
  reads as a worked example rather than open work.
- Keep the backlog as the sole *status* authority (it already is); avoid
  duplicating exact coverage numbers in it without a commit anchor (Risk 4).
- No new tooling is warranted for a repo this size - a checklist line in the
  release process is proportionate (KISS/YAGNI).

## Docker Compose for Local Development

- N/A - a dependency-free TypeScript library with a Node-only toolchain needs
  no containerisation; `npm ci && npm run verify` is the entire local story and
  was verified reproducible in this review. Adding Docker would be pure
  overhead.

## GitHub Actions / Workflow

- **Current status: healthy.** [.github/workflows/ci.yml](../../.github/workflows/ci.yml)
  runs `npm ci` + `npm run verify` on a Node 20/22/24 matrix with
  `fail-fast: false`, npm caching, `permissions: contents: read`, concurrency
  cancellation, and pinned major action versions at the portfolio baseline
  (checkout@v5 / setup-node@v5). Latest `main` run green (28900036078).
- The informational coverage step (Node 20 only, `continue-on-error: true`) is
  correctly a non-gate; if the ConsoleReporter spec lands (Risk 4), coverage
  will rise and the step needs no change.
- Local reproducibility is exact: CI runs the same `npm run verify` the README
  documents, and the lockfile is committed and fresh (audit 0, vitest current
  within its range).
- Possible future refinements (not needed now): upload the coverage report as
  an artifact for reviewers, and add a scheduled monthly `npm audit` run so
  advisory drift surfaces between development cycles.
- Secrets: none used or needed; the publish path is manual by design with the
  `prepublishOnly` verify guard as its gate.

---

[<- Previous: Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0032Z.md) | [Next: Annex Metrics ->](ANNEX/METRICS.md)
