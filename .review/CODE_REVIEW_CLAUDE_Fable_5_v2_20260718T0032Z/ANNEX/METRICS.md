# Annex: Metrics and Validation Evidence

[<- Back to Index](../00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0032Z.md)

**Reviewer:** AI assistant (CLAUDE Fable 5)
**Date:** 2026-07-18T00:32Z

Every command below was run locally against commit `77e6df6` (`main`, in sync
with `origin/main`) during this review, on Node v20.19.5 / npm 10.8.2 (Windows,
Git Bash). Nothing here is inferred.

## Repository state

```text
git log --oneline -3
  77e6df6 Merge pull request #26 from NeoCognitus70/docs/backlog-v5-hbsp15-22
  a011bab docs(backlog): reconcile to v5 - record the HBSP-15..22 cycle (Items #8-#15)
  8ecd282 Merge pull request #25 from NeoCognitus70/worklist/hbsp-21-changelog-0.2.0

git status -sb
  ## main...origin/main          (clean apart from this review directory)
```

Tree size: 68 tracked files (source 44 under `src/`, 14 spec files under
`spec/`, 3 guides + backlog under `docs/`, 1 plan under `planning/`).

## Validation gate (registry: `npm run verify`)

```text
npm ci        -> added 66 packages (clean install from lockfile)
npm run verify
  typecheck   -> tsc -p tsconfig.spec.json   PASS
  build       -> tsc -p tsconfig.json        PASS (emits dist/)
  test        -> vitest run                  PASS

  Test Files  12 passed (12)
       Tests  84 passed (84)
    Duration  10.38s
```

The 84-test count matches the backlog v5 claim exactly.

## Dependency, security, and licence pass

```text
npm audit     -> found 0 vulnerabilities

npm outdated
  Package       Current   Wanted  Latest
  @types/node  22.19.20  22.20.1  26.1.1
  typescript      5.9.3    5.9.3   7.0.2
  (vitest / @vitest/coverage-v8 current within ^4.1.10)
```

- Runtime dependencies: **none** (dependency-free by design; four
  devDependencies only).
- Licence: Apache-2.0 declared in `package.json` (line 44) and shipped as
  `LICENSE` (Apache License 2.0 text) - declared and actual licence agree.
- Secrets: none found in the tree; the only I/O surface is the report writer
  and every rendered dynamic value is HTML-escaped
  (`src/reporting/renderHtml.ts` lines 9-16).
- No CVE is cited anywhere in this review; the historical advisories named in
  the CHANGELOG were verified as *historical* (audit is currently clean).

## Coverage (`npm run coverage`, informational - not a gate)

```text
Statements   : 89.93% ( 268/298 )
Branches     : 79.69% ( 106/133 )
Functions    : 93.27% ( 111/119 )
Lines        : 90.07% ( 254/282 )
```

Per-file highlights (v8 provider):

```text
File                          Stmts   Branch   Funcs   Lines   Uncovered
src/util.ts                   72.72   64.10    60.00   75.00   ...41,47-50,57,68
src/abilities/data/ManageData 71.42  100.00    83.33   71.42   20,36
src/abilities/http/LastResponse 66.66 100.00   83.33   66.66   32-34
src/crew/ConsoleReporter.ts    0.00    0.00     0.00    0.00   15-27
src/errors/LogicError.ts       0.00  100.00     0.00    0.00   7-9
src/reporting/ReportModel.ts  97.82   87.50   100.00  100.00   106,136-137
src/reporting/renderHtml.ts   96.42   91.66   100.00   96.15   21
src/screenplay/Actor.ts      100.00   83.33   100.00  100.00   70
```

Backlog v5 records "90.16% stmts / 84.49% branch / 94.11% funcs / 90.32%
lines" (HBSP-12 era) - the numbers have drifted, most visibly branch coverage
(84.49 -> 79.69). See Risk 4.

## CI evidence (read-only, via `gh run list`)

```text
completed  success  Merge pull request #26 ...  CI  main  push  28900036078  19s  2026-07-07T21:30:05Z
completed  success  docs(backlog): reconcile to v5 ...   pull_request  28899510531  29s
completed  success  Merge pull request #25 ...  CI  main  push  28848768219  20s
```

## Targeted evidence greps

```text
grep -rn "isPromise" src spec
  src/util.ts:67    (definition only - no callers)         -> Risk 5

README.md:239       "version is **0.1.0**"                 -> Risk 2
package.json:3      "version": "0.2.0"

docs/03-event-notification-layer.md:42-53  pre-0.2.0 DomainEvent union
docs/03-event-notification-layer.md:61-64  "no scene/run events yet"
docs/03-event-notification-layer.md:243-245 "planned HtmlReporter"
docs/01-screenplay-flow.md:345             "planned static HTML reporter"
planning/static-html-reporting.md:3        "Status: Ready to implement"
                                                            -> Risk 1
```

## Coupling note (per instructions)

The registry couples `calculator-screenplay-bdd` to this repo (the sibling
builds inside this working tree via a `file:` dependency). Per the review
instructions, **no sibling-tree build was run** - and none was needed: this
project's own gate is `npm run verify`, which was run here in full. The
sibling-facing API risk is covered statically by `spec/public-api.spec.ts`.

## Unattended-run questions recorded

The review ran unattended; no blocking questions arose. One preference is
recorded for the user rather than assumed: whether Risk 6.1 (crew-member
exceptions propagating into the actor path) should become a documented
decision or a behavioural change - this review recommends documenting, not
changing, but did neither.

---

[<- Previous: Migration Plans](../07_MIGRATION_PLANS.md) | [Back to Index](../00_CODE_REVIEW_CLAUDE_Fable_5_v2_20260718T0032Z.md)
