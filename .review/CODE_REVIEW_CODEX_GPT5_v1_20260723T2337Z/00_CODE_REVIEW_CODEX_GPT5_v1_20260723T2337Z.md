# Code Review: hand-baked-screenplay-pattern

**Reviewer:** AI assistant (CODEX GPT-5)
**Date:** 2026-07-23T23:37Z
**Scope:** Full repository review at `61fa54dfab97f3d21a1917633fb2311581ade51f`
**Review version:** CODEX_GPT5 v1
**Repository state:** Review branch created from fetched, fast-forwarded `origin/main`
**Preflight:** WARN - paired handover v4 predates fetched default head `61fa54d`

## Table of Contents

1. [Executive Summary](01_EXECUTIVE_SUMMARY.md)
2. [Risks and Issues](02_RISKS_AND_ISSUES.md)
3. [Project Review](03_PROJECT_REVIEWS/PROJECT_001_hand-baked-screenplay-pattern.md)
4. [Cross-Project Analysis](04_CROSS_PROJECT_ANALYSIS.md)
5. [Recommendations](05_RECOMMENDATIONS.md)
6. [Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md)
7. [Migration Plans](07_MIGRATION_PLANS.md)
8. [Evidence and Metrics Annex](ANNEX/EVIDENCE_AND_METRICS.md)

## Structure Summary

This is a single-repository review. The project review covers the TypeScript
library, Vitest suite, documentation, release metadata, and GitHub Actions
workflow. Cross-project analysis is limited to the seams between the library,
its own suite, its documentation, and its coupled calculator consumer.

## Key Findings

- **MEDIUM - release truth is inconsistent.** The authoritative backlog says
  release 0.2.0 was cut and is current, but the remote exposes only tag and
  release `v0.1.0`; the npm package lookup returns `E404`.
- **MEDIUM - actors share mutable ability instances.**
  `Cast.whereEveryoneCan(...)` grants the same `ManageData` and `MakeRequests`
  objects to every actor, permitting response, token, and scenario-data leakage.
- **LOW-MEDIUM - falsy thrown values become successful outcomes.**
  `throw false`, `throw 0`, `throw ''`, and `throw undefined` all render a
  one-scene run as one passed and zero failed.
- **LOW - reporting diagnostics have two false-confidence gaps.** A scene-level
  error is not rendered unless an activity also failed, and a zero-scene run is
  labelled "All scenes passed".
- **Strength - the normal path is robust and well tested.** The registry gate
  passed with 13 files and 88 tests; audit found zero vulnerabilities; current
  coverage is 93.15% statements and 85.49% branches.

## Validation Snapshot

- `npm run verify` - PASS: 13 files, 88 tests.
- `npm audit --json` - PASS: zero known vulnerabilities.
- `npm run coverage` - PASS: 93.15% statements, 85.49% branches, 95.83%
  functions, 93.47% lines.
- `npm pack --dry-run --json --ignore-scripts` - PASS: a 168-entry 0.2.0
  tarball would include compiled JavaScript, declarations, maps, README,
  changelog, licence, and package metadata.
- Focused, non-file-writing runtime probes - PASS as probes; they reproduced
  the shared-state and false-green findings.
- Coupled consumer validation - SKIPPED. The registry records that the
  calculator consumer's preparation script writes/builds in this provider
  checkout. The inverse cross-tree gate was deliberately not run to avoid any
  concurrent or sibling-tree writes.

## Navigation Guide

Start with the [Executive Summary](01_EXECUTIVE_SUMMARY.md), then use
[Risks and Issues](02_RISKS_AND_ISSUES.md) for evidence and remediation.
The [Architecture Assessment](06_ARCHITECTURE_ASSESSMENT.md) explains the
Screenplay, SOLID, ISTQB, and test-pyramid implications. Exact commands and
observed outputs are in the [Evidence and Metrics Annex](ANNEX/EVIDENCE_AND_METRICS.md).

---

[Next: Executive Summary ->](01_EXECUTIVE_SUMMARY.md)
