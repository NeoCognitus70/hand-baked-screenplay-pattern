# Migration Strategy and Plans

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1044Z.md) | [Next: Annex - Metrics ->](ANNEX/METRICS.md)

**Reviewer:** AI assistant (CLAUDE Fable 5)
**Date:** 2026-07-06T10:44Z

Single-repository review: the template's three plan areas are scaled to what this
repo actually contains.

## Plan 1: Single Source of Truth for Features

- Current status: the library's feature record spans README, CHANGELOG, backlog,
  and the planning doc; they agree with each other except that the committed
  backlog is one version behind the working tree (Risk 1).
- Step 1: commit the backlog v4 reconciliation (one docs PR) - this alone
  restores a truthful single source on `main`.
- Step 2: cut CHANGELOG 0.2.0 so "released feature set" and "unreleased delta"
  stop being the same list (Risk 6).
- Step 3: adopt the portfolio's optional `docs/project-contract.md` to pin the
  gate (`npm run verify`) and the additive-export norm in-repo, instead of only
  in the portfolio registry row.
- Step 4: keep the canary spec's two symbol lists as the executable feature
  manifest; update them (deliberately) whenever the surface grows.
- Exit criterion: `git status` clean, backlog header version == latest merged
  cycle, CHANGELOG top release matches `package.json` version.

## Plan 2: Docker Compose for Local Development

- N/A - a zero-dependency TypeScript library with no services has no
  containerisation need; `npm ci && npm run verify` on Node 20+ is the entire
  local environment. Adding Docker here would violate the repo's own YAGNI
  stance.
- The only environment-shaped risk is Node-version drift, which is already
  managed via `engines` + the CI matrix (HBSP-10).

## Plan 3: GitHub Actions / Workflow

- Current status: one `verify` workflow, PR + push to `main`, Node `[20, 22]`
  matrix, least-privilege `permissions: contents: read`, concurrency
  cancellation, npm caching, non-gating coverage step - correct and locally
  reproducible (`npm run verify` is byte-for-byte the CI gate; verified green in
  this session). No secrets are used or needed.
- Step 1: bump `actions/checkout@v4` -> `@v5` and `actions/setup-node@v4` ->
  `@v5` (Risk 5), matching the portfolio precedent (sudoku SUD-08).
- Step 2: optionally extend the matrix with Node 24 - `engines` declares only a
  floor, so CI should prove the ceiling users will actually run.
- Step 3: consider uploading the coverage HTML (`coverage/`) as a workflow
  artifact on the Node 20 leg - the summary is currently log-only, so the
  browsable report CI generates is discarded.
- Step 4 (stretch): a scheduled consumer-contract job that clones the sibling
  `calculator-screenplay-bdd` next to a checkout of this repo and runs the
  sibling's verify gate, upgrading the canary spec's promise to end-to-end proof.
- Exit criterion: zero runner deprecation warnings, coverage artefact retained,
  and (if the stretch lands) a red build here whenever a change would break the
  sibling.

---

[<- Previous: Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1044Z.md) | [Next: Annex - Metrics ->](ANNEX/METRICS.md)
