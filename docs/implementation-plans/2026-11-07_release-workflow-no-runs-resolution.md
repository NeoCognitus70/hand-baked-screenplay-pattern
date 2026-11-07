---
version: 1
created: 2026-11-07T17:30Z
project: hand-baked-screenplay-pattern
type: implementation-plan
item: HBSP-35
status: approved
approved: 2026-11-07, by user/owner (Option A)
delivered: not yet
language: en-GB
---

# Implementation plan: HBSP-35 Release workflow NO RUNS status resolution

**Goal.** Resolve the Attention Needed item in portfolio status where `hand-baked-screenplay-pattern` CI aggregate is evaluated as `NO RUNS` under `portfolio-prompts/portfolio-status.prompt.md` Rule 4, caused by the tag-only `Release` workflow (`.github/workflows/release.yml`) having no execution records on default branch `main`.

---

## Evidence gathered before planning

All investigation was conducted strictly read-only using local Git inspection and GitHub API (`gh api`) queries. No repository state was modified.

| Finding | Consequence for the plan |
|---|---|
| **Release workflow trigger:** `.github/workflows/release.yml` triggers exclusively on `on.push.tags: ['v*.*.*']`. It does not listen to `push` or `pull_request` on `main`, nor does it define `workflow_dispatch`. | Because it only runs on tag pushes, GitHub assigns `head_branch: "v0.3.0"` (the tag name) rather than `main`. |
| **Historical execution evidence:** Run `32057409492` executed successfully on 2026-08-17T18:54:50Z for tag `v0.3.0` at merge commit `3560e76`, creating the GitHub release and attaching `hand-baked-screenplay-pattern-0.3.0.tgz` and its SHA-256 checksum (`ac5bd1f6d9bddf95c9a42f99f05f093c7875b1835ecd3ae0d5ca2385e810c36d`). | The workflow is fully functional, proven, and matches the release protocol documented in `docs/releasing.md` and `docs/backlog.md` (HBSP-33). |
| **Status evaluator query behaviour:** `portfolio-status.prompt.md` Step 2 §6 queries workflow runs using `gh api 'repos/<owner/repo>/actions/workflows/<id>/runs?branch=<default>&per_page=1'`. | For workflow ID `336419236` (`Release`), `branch=main` returns `total_count: 0` because tag runs are filtered out by GitHub's `branch` query parameter. |
| **Active inventory classification:** The workflow inventory query (`/actions/workflows`) returns `Release` in state `active`. | Under Rule 4 of `portfolio-status.prompt.md` ("NO RUNS if there are no active workflows, or at least one active workflow has no run from a successful query. Name the missing coverage"), an active workflow with 0 returned runs forces the repository's aggregate status to `NO RUNS`. |
| **Cross-portfolio release patterns:**<br>• `magento-checkout-automation` (`bake.yml`): uses BOTH `workflow_dispatch` and `push.tags: ['bake/**']` (9 runs on `main`).<br>• `credit-dashboard-sut` (`visual-baselines.yml`): uses `workflow_dispatch` (1 run on `main`).<br>• `juice-shop-dast-automation` (`dast-repeatability.yml`): uses `workflow_dispatch` (2 runs on `main`).<br>• `portfolio-prompts` (`publish-kanban.yml`): tag-only `push.tags: ["kanban-v*"]` (0 runs on `main`, 3 runs on tags). | Workflows equipped with `workflow_dispatch` and manually triggered against `main` establish a default-branch execution history, avoiding the `NO RUNS` classification. Tag-only workflows consistently lack default-branch runs across the portfolio. |

---

## Options and trade-offs

Four viable approaches exist to resolve the `NO RUNS` evaluation:

### Option A: Add `workflow_dispatch` dry-run capability to `release.yml` (Approved by owner)
Add `workflow_dispatch` to `.github/workflows/release.yml` with a `dry_run` input (defaulting to `true`).
- In `dry_run` mode (or when run on a non-tag ref like `main`), the workflow performs source checkout, Node 24 setup, `npm ci`, full `npm run verify` gate, package creation (`npm pack`), and checksum generation, but skips the tag verification check and `gh release create` publication step.
- Once merged to `main`, dispatching the workflow once via `gh workflow run release.yml --ref main -f dry_run=true` records a successful run on `main`.
- **Pros:** Preserves active workflow monitoring; matches patterns used in `magento-checkout-automation`, `credit-dashboard-sut`, and `juice-shop-dast-automation`; verifies the packaging gate on `main` without waiting for a new semantic version.
- **Cons:** Requires a PR and merge in `NeoCognitus70/hand-baked-screenplay-pattern`.

### Option B: Manually disable `release.yml` while resting (`disabled_manually`)
Run `gh workflow disable 336419236 --repo NeoCognitus70/hand-baked-screenplay-pattern`.
- In `portfolio-status.prompt.md` lines 79-82, workflows are partitioned into `active` and inactive (`disabled_manually`).
- Rule 4 only evaluates `active` workflows. When disabled, `Release` is reported under Inactive workflows with its latest known run (`v0.3.0` success), and the repo aggregate returns to `GREEN` (CI and Pages both passing).
- **Pros:** Zero code changes; no PR needed in a resting repository.
- **Cons:** Maintainers must remember to re-enable the workflow before pushing a future release tag; the workflow appears disabled in GitHub Actions UI.

### Option C: Clarify tag-only workflow classification in `portfolio-prompts/portfolio-status.prompt.md`
Update Rule 4 / Step 2 §6 in `portfolio-status.prompt.md`:
- When an active workflow's query with `?branch=<default>` returns 0 runs, check if the workflow triggers on tags/non-branch events. If an unconstrained run query (`/runs?per_page=1`) finds a successful run on a tag (e.g. `v0.3.0`), classify it based on its latest trigger ref rather than declaring `NO RUNS` on the default branch.
- **Pros:** Corrects the root evaluator logic at the portfolio level; simultaneously resolves both `hand-baked-screenplay-pattern` (`release.yml`) and `portfolio-prompts` (`publish-kanban.yml`); leaves resting repositories untouched.
- **Cons:** Requires an update to `portfolio-prompts` rather than `hand-baked-screenplay-pattern`.

### Option D: Combined Strategy (Option A + Option C)
Implement Option A in `hand-baked-screenplay-pattern` so `release.yml` can be verified on demand on `main`, and adopt Option C in `portfolio-prompts` to ensure portfolio reporting correctly accommodates event-driven / tag-only workflows without false alerts.

---

## Steps for Option A (Approved)

1. **Branch creation:**
   Create a feature branch `feat/hbsp-35-release-workflow-dispatch` in `hand-baked-screenplay-pattern` from `main` (`75eb4d7`).

2. **Update workflow configuration:**
   Edit `.github/workflows/release.yml` to introduce `workflow_dispatch` with `inputs.dry_run`:
   ```yaml
   name: Release

   on:
     push:
       tags:
         - 'v*.*.*'
     workflow_dispatch:
       inputs:
         dry_run:
           description: 'Run build and packaging validation without publishing'
           required: false
           default: true
           type: boolean
   ```

3. **Condition publication steps on non-dry-run tag context:**
   - Update step `Verify tag and release metadata`:
     ```yaml
     - name: Verify tag and release metadata
       if: startsWith(github.ref, 'refs/tags/v') && inputs.dry_run != true
       run: node scripts/verify-release-tag.mjs
     ```
   - Update step `Create matching GitHub release`:
     ```yaml
     - name: Create matching GitHub release
       if: startsWith(github.ref, 'refs/tags/v') && inputs.dry_run != true
       env:
         GH_TOKEN: ${{ github.token }}
       run: >-
         gh release create "${{ github.ref_name }}"
         "release/${{ steps.pack.outputs.package_file }}"
         "release/${{ steps.pack.outputs.package_file }}.sha256"
         --verify-tag
         --title "${{ github.ref_name }}"
         --generate-notes
     ```

4. **Update releasing documentation:**
   Update `docs/releasing.md` to document the manual dry-run capability for testing the packaging gate on `main`.

5. **Update backlog and implementation index:**
   Update `docs/backlog.md` recording HBSP-35, and ensure `docs/implementation-plans/_index.md` references this plan.

6. **Pull request, merge, and dispatch:**
   Open PR against `main`. Merge to `main`, then trigger the dispatch run:
   ```bash
   gh workflow run release.yml --ref main -f dry_run=true --repo NeoCognitus70/hand-baked-screenplay-pattern
   ```
   Wait for completion and verify that `gh api 'repos/NeoCognitus70/hand-baked-screenplay-pattern/actions/workflows/336419236/runs?branch=main&per_page=1'` returns `conclusion: "success"`.

---

## Verification

### Negative probe (confirming current failure condition)
Run the exact query used by `portfolio-status.prompt.md`:
```bash
gh api "repos/NeoCognitus70/hand-baked-screenplay-pattern/actions/workflows/336419236/runs?branch=main&per_page=1" --jq ".total_count"
```
*Current output:* `0`. Under Rule 4, this forces aggregate `NO RUNS`.

### Positive verification (post-resolution)
- Under Option A:
  ```bash
  gh api "repos/NeoCognitus70/hand-baked-screenplay-pattern/actions/workflows/336419236/runs?branch=main&per_page=1" --jq ".workflow_runs[0] | {status: .status, conclusion: .conclusion, head_branch: .head_branch}"
  ```
  *Expected:* `{status: "completed", conclusion: "success", head_branch: "main"}`.
- Re-running `portfolio-status.prompt.md` evaluates `CI` (success), `Pages` (success), and `Release` (success), yielding aggregate status `GREEN`.

---

## Delivery

- **Repository:** `NeoCognitus70/hand-baked-screenplay-pattern`
- **Branch:** `feat/hbsp-35-release-workflow-dispatch`
- **Authority:** Approved by user/owner on 2026-11-07.

---

## Decisions put to the owner

| Decision | Options | Recommended | Owner's answer |
|---|---|---|---|
| Strategy to resolve `Release` workflow `NO RUNS` evaluation | **A:** Add `workflow_dispatch` with dry-run mode to `release.yml` and execute once on `main`<br>**B:** Disable `release.yml` manually (`disabled_manually`) while repo is resting<br>**C:** Adjust `portfolio-status.prompt.md` rule 4 to recognise tag-only workflows without requiring default-branch runs<br>**D:** Combined approach (Option A for repo + Option C for portfolio prompt) | **Option A** (or **Option D** if prompt maintenance is desired) | **Approved Option A**, 2026-11-07 |

---

## Outcome

*(To be updated after merge and workflow dispatch)*
