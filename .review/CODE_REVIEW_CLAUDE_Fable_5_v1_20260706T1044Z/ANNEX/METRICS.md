# Annex: Metrics and Validation Evidence

[<- Back to Index](../00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1044Z.md)

**Reviewer:** AI assistant (CLAUDE Fable 5)
**Date:** 2026-07-06T10:44Z

All commands below were run in this review session on Windows 11, Node v20.19.5,
npm 10.8.2, from the repository root at `main` `120a631`.

## Validation gate (registry row: `npm run verify`)

```text
> npm run verify        # typecheck (tsc -p tsconfig.spec.json)
                        # + build   (tsc -p tsconfig.json)
                        # + test    (vitest run)

Test Files  12 passed (12)
     Tests  81 passed (81)
  Duration  5.36s
```

Result: **PASS**. The CI gate and the local gate are the same command, so local
reproducibility is exact.

## Security audit

```text
> npm audit
found 0 vulnerabilities
```

Confirms the HBSP-09 closure (previously 1 critical + 2 high + 2 moderate, all
esbuild-transitive under vitest 2).

## Dependency currency (`npm outdated`)

| Package             | Current  | Wanted  | Latest | Note |
|---------------------|----------|---------|--------|------|
| @types/node         | 22.19.20 | 22.20.0 | 26.1.0 | Majors track Node majors; 22 matches the CI matrix ceiling |
| @vitest/coverage-v8 | 4.1.9    | 4.1.10  | 4.1.10 | Patch available |
| typescript          | 5.9.3    | 5.9.3   | 6.0.3  | Major available; gate deliberately |
| vitest              | 4.1.9    | 4.1.10  | 4.1.10 | Patch available |

Lockfile: `package-lock.json` lockfileVersion 3, consistent with the declared
ranges; all four dependencies are dev-only. Runtime dependency count: **0**.

## Coverage (`npm run coverage`, informational per HBSP-12)

```text
All files          |   90.16 |    84.49 |   94.11 |   90.32 |
 src               |   75.75 |    74.35 |      80 |   78.12 |  util.ts
 src/abilities/data|   86.66 |   100.00 |   90.90 |   86.66 |  ManageData.ts 71.42
 src/abilities/http|   79.16 |    75.00 |   93.33 |   79.16 |  LastResponse.ts 66.66
```

(Columns: % stmts / % branch / % funcs / % lines.) The all-files line matches the
backlog v4 claim (90.16 / 84.49 / 94.11 / 90.32) **to the decimal** - the
documentation is truthful. Low spots are benign accessors and formatting branches:
[util.ts](../../src/util.ts) (uncovered lines 20, 26, 41, 47-50, 57),
[ManageData.ts](../../src/abilities/data/ManageData.ts) (lines 20, 36),
[LastResponse.ts](../../src/abilities/http/LastResponse.ts) (lines 32-34,
`header()` is never asked in a spec).

## Suite shape

| Layer | Spec files | Notes |
|-------|-----------|-------|
| Unit | 9 | actor, stage-and-cast, tasks-and-questions, expectations, outcome, report-model, render-html, html-reporter (stubbed writer), public-api (canary) |
| Integration | 1 | html-reporter-fs (real `node:fs` writer against `os.tmpdir()`) |
| End-to-end (public API) | 2 | example.screenplay, reporting-e2e |

81 tests total; the 31-case delta from the pre-canary 50 comes from the
parametrised public-API surface checks.

## Repository state at review time

```text
git log --oneline -3
120a631 Merge pull request #17 (worklist/hbsp-13-14-api-canary-docs)
6a463cd docs(HBSP-14): document ConsoleReporter scope and fix stale backlog line
90a60d3 test(HBSP-13): add a public-API surface canary spec

git status --short
 M docs/backlog.md      <- uncommitted backlog v4 reconciliation (Risk 1)
```

---

[Back to Index](../00_CODE_REVIEW_CLAUDE_Fable_5_v1_20260706T1044Z.md)
