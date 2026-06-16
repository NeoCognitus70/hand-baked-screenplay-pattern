# Migration Plans

[<- Back to Index](00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1543Z.md) | [Next: Annex - Test Strategy ->](ANNEX/TEST_STRATEGY.md)

**Reviewer:** AI assistant (CLAUDE_Opus_4_8)

The template's three standard plans are scaled to what this single TypeScript library actually needs.
Two of the three are largely `N/A` here and are kept as headings with justification rather than padded;
the CI/CD plan is the substantive one.

## Single Source of Truth for Features

- **Largely already achieved.** The event stream is the de facto single source of truth: console and HTML
  reporters, plus `buildReport`, all derive from the same `DomainEvent[]`, so views cannot disagree.
- The documented source of truth for project state is [docs/backlog.md](docs/backlog.md), which is
  consistent with the code (Item #1 RESOLVED, criteria validated).
- **Migration step 1:** add a public-API surface canary test so the *contract* with the sibling becomes a
  checked artefact in this repo, not just inspection (Risk 4).
- **Migration step 2:** on the next backlog edit, correct the stale "awaiting user review" note (line 49)
  now that PR #13 is merged.
- **Migration step 3 (optional):** introduce a committed `.d.ts` snapshot or `api-extractor` report as the
  enforced single source of truth for the public surface.
- **Out of scope:** there is no multi-feature/multi-repo feature-file duplication to consolidate here -
  that concern belongs to the BDD projects, not this library.

## Docker Compose for Local Development

- **`N/A` - no service to containerise.** This is a pure library with no server, database, or external
  dependency; `npm run verify` is the entire local workflow and runs in seconds on any Node 20+ host.
- For reproducibility the existing `package-lock.json` + `npm ci` (used in CI) is the right and
  sufficient mechanism; a container would add ceremony without benefit.
- If the portfolio ever wants a uniform "dev container" story across all projects, a single shared
  `devcontainer.json` pinning the Node version (see Risk 1) would be the lightweight way to do it -
  preferable to a Compose stack for a dependency-free library.
- **Recommended action:** none required; record the decision ("library, no container needed") so it is a
  deliberate choice rather than an omission.

## GitHub Actions / Workflow

- **Current status (verified):** [.github/workflows/ci.yml](.github/workflows/ci.yml) runs a single
  `verify` job on pull requests and pushes to `main`, across a Node `[20, 22]` matrix, using
  `actions/checkout@v4` and `actions/setup-node@v4` with npm caching and `npm ci`. Permissions are
  correctly minimised (`contents: read`) and concurrency cancels superseded runs. This is a clean,
  modern, secrets-free workflow.
- **Step 1 - reconcile the Node matrix with the README/engines floor (Risk 1):** make the matrix and the
  declared `engines` agree on the supported floor (recommend `>=20` and `[20, 22]`, raising the README).
- **Step 2 - add coverage visibility:** run `vitest run --coverage` and upload or print the summary, so
  the test metric is tracked over time (no hard gate needed initially).
- **Step 3 - guard the public API:** once the canary/surface test exists, it runs inside `verify`
  automatically and gives fast feedback on accidental breaking changes for the sibling.
- **Step 4 - pin action SHAs (optional hardening):** for a portfolio that wants to teach supply-chain
  hygiene, pin `actions/checkout` and `actions/setup-node` to commit SHAs rather than floating tags.
- **Local reproducibility:** already excellent - CI and local both run `npm run verify` with the same
  lockfile, so a green local gate predicts a green CI run.

---

[<- Previous: Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md) | [Back to Index](00_CODE_REVIEW_CLAUDE_Opus_4_8_v1_20260616T1543Z.md) | [Next: Annex - Test Strategy ->](ANNEX/TEST_STRATEGY.md)
