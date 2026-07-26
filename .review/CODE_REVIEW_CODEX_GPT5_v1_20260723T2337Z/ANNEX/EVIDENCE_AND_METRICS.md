# Annex: Evidence and Metrics

[<- Back to Index](../00_CODE_REVIEW_CODEX_GPT5_v1_20260723T2337Z.md)

**Reviewer:** AI assistant (CODEX GPT-5)
**Date:** 2026-07-23T23:37Z

## Repository and Preflight

- Reviewed commit:
  `61fa54dfab97f3d21a1917633fb2311581ade51f`.
- Default branch was fetched and fast-forwarded before creating the review
  branch.
- Workspace preflight: WARN, no blockers.
- Warning: paired handover v4
  `hand-baked-screenplay-pattern_session-notes_v4_20260719T1142Z` predates the
  fetched default head.
- Registry gate source: `npm run verify`.
- Registry status: resting; authoritative backlog:
  `docs/backlog.md`; review location: `.review/`.

## Commands and Results

| Command | Result |
|---|---|
| `git status --short --branch` | Clean `main` before branch; review branch contains review artefacts only |
| `git log --oneline -10` | Inspected; head `61fa54d` |
| `rg --files` | Mapped full repository; generated/dependency folders excluded from manual review |
| `npm run verify` | PASS - 13 files, 88 tests |
| `npm audit --json` | PASS - 0 vulnerabilities |
| `npm run coverage` | PASS - 93.15% statements, 85.49% branches, 95.83% functions, 93.47% lines |
| `npm outdated --json` | Expected exit 1 - `@types/node` patch wanted; TypeScript 7 newer major |
| `npm pack --dry-run --json --ignore-scripts` | PASS - 168 entries, 48,254 bytes packed, 164,893 bytes unpacked |
| Tracked-file secret pattern scan | PASS - no credential material found |
| `gh run list --branch main --limit 5` | Latest default-head CI completed successfully |
| `git ls-remote --tags origin` | Only `v0.1.0` |
| `gh release list --limit 10` | Only `v0.1.0`, marked Latest |
| `npm view hand-baked-screenplay-pattern version --json` | `E404` - package absent from npm |
| Coupled calculator validation | SKIPPED - avoided cross-tree writes under the provider/consumer coupling rule |

## Coverage Detail

| Metric | Current |
|---|---:|
| Statements | 93.15% (286/307) |
| Branches | 85.49% (112/131) |
| Functions | 95.83% (115/120) |
| Lines | 93.47% (272/291) |

Notable uncovered areas:

- `src/errors/LogicError.ts` - 0% lines.
- `LastResponse.header` and no-response path.
- `ManageData.using` and `has`.
- Several `deepEqual`/`format` branches.
- Finding-specific cases: falsy throws, empty report, scene-only error display,
  actor-scoped ability state.

## Runtime Probe Evidence

The probes imported the locally built `dist` after the green project gate. They
created no source or test files.

### Shared mutable ability

```text
Ada stores token = "ada-secret"
Bob reads token
Observed: "ada-secret"
```

### Falsy outcomes

```text
Outcome.from(false)     -> success
Outcome.from(0)         -> success
Outcome.from("")        -> success
Outcome.from(undefined) -> success
```

A public `scene` probe using `throw false` rendered:

```text
1 scenes - 1 passed, 0 failed
All scenes passed
```

### Scene-only error

```text
Scene outcome: failure(error "scene-only boom")
Activities: none
Rendered HTML contains "scene-only boom": false
```

### Empty run

```text
Events: test-run:finishes only
Rendered HTML contains "All scenes passed": true
```

## Dependency, Security, and Licence

- Runtime dependencies: zero.
- Dev dependency tree audited: 97 total, zero known vulnerabilities.
- Lockfile: present and usable by `npm ci`; one allowed `@types/node` patch is
  newer than the locked version.
- Unsafe-input surface: the HTML renderer escapes ampersand, angle brackets,
  quotes, and apostrophes for dynamic scene/activity/error data.
- I/O surface: report output path is caller-controlled; filesystem access is
  confined to the default writer and is injectable for tests.
- Secrets: no committed credentials found; no workflow secrets required.
- Licence: Apache-2.0 declared in manifest, full licence text present, GitHub
  metadata agrees.

## GitHub and Artefacts

- Latest fetched default-head CI:
  `https://github.com/NeoCognitus70/hand-baked-screenplay-pattern/actions/runs/29685886904`
  - success.
- Workflow does not upload coverage, dist, HTML reports, or package tarballs.
- GitHub release v0.1.0 has no attached assets.
- Local package 0.2.0 is packable, but no v0.2.0 tag/release or npm version was
  found.

## Review Completeness

- Source, specs, configs, workflow, README, changelog, licence, backlog, all
  guides, and planning document reviewed.
- Generated `dist`, `coverage`, `node_modules`, historical review bodies, and
  Git internals excluded from line-by-line review except where they supplied
  evidence.
- No implementation files changed.
- Cross-tree validation deliberately not run.

---

[<- Previous: Migration Plans](../07_MIGRATION_PLANS.md) | [Back to Index](../00_CODE_REVIEW_CODEX_GPT5_v1_20260723T2337Z.md)
