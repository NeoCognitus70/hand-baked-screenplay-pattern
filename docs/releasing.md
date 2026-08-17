<!--
  AUDIENCE: Maintainers cutting a release of this library.
  PURPOSE:  Keep the version metadata (package.json + CHANGELOG) and the release
            record (Git tag + GitHub release) in agreement, so the backlog can
            never again claim a release that does not exist.
  LOCATION: docs/releasing.md
-->

# Releasing

This project distributes a versioned `npm pack` artifact through **GitHub tags
and releases only**. It is not published to the npm registry. Each release owns
two immutable files:

- `hand-baked-screenplay-pattern-X.Y.Z.tgz`
- `hand-baked-screenplay-pattern-X.Y.Z.tgz.sha256`

The tag-triggered [release workflow](../.github/workflows/release.yml) creates
both from the tagged source after the full verification gate passes. The
tarball contains the ESM and CommonJS builds plus their declarations; `npm run
test:package` has already installed and exercised that exact package shape in
clean-room fixtures.

A release is only "cut" once **all four** of these agree on the version — the
gap between the first two and the last two is exactly what the Codex GPT-5 v1
review flagged as Risk 1 (the backlog said 0.2.0 was cut while no tag or release
existed):

1. `package.json` `version`
2. The matching `## [x.y.z] - <date>` heading and `[x.y.z]` compare link in
   `CHANGELOG.md`
3. A Git tag `vx.y.z` pushed to `origin`
4. A published GitHub release for that tag, with the versioned `.tgz` and its
   SHA-256 checksum attached

## Checklist

1. **Verify green:** `npm run verify` (typecheck + dual build + unit tests +
   clean-room ESM/CommonJS pack/install smokes) passes on the commit you intend
   to release.
2. **Metadata:** `package.json` `version` matches the top dated `CHANGELOG.md`
   section, and the `[Unreleased]` section is empty (or intentionally carries
   only not-yet-released changes).
3. **Merge the release PR** and wait for default-branch CI to pass.
4. **Tag that exact merge commit** — the tree the CHANGELOG section describes,
   not an earlier branch commit or a later unrelated commit:

   ```bash
   git tag vX.Y.Z <commit>        # lightweight, matching existing tags
   git push origin vX.Y.Z
   ```

   The pushed tag starts the workflow. It rejects a tag that differs from
   `package.json`, requires a matching CHANGELOG heading, repeats `npm run
   verify`, packs with lifecycle scripts disabled only after that gate, writes
   the SHA-256 checksum, and creates the matching GitHub release. Do not create
   a second manual release in parallel.

5. **Confirm the immutable record:**

   ```bash
   gh release view vX.Y.Z
   gh release download vX.Y.Z --pattern '*.tgz' --pattern '*.sha256'
   sha256sum -c hand-baked-screenplay-pattern-X.Y.Z.tgz.sha256
   ```

   Also confirm `git ls-remote --tags origin` lists the tag and the CHANGELOG
   `compare/<prev>...vX.Y.Z` link resolves.

6. **Reconcile the backlog:** record the tag, release URL, workflow run, and
   checksum once the release exists. Version metadata alone is not a published
   release.

## Local artifact inspection

`npm run verify` is the normal gate. To inspect the final file list without
triggering `prepack` a second time after that successful gate:

```bash
npm pack --dry-run --ignore-scripts
```

Only `package.json`, `LICENSE`, `README.md`, `CHANGELOG.md`, and `dist/**` belong
in the artifact. Runtime `dependencies` must remain absent.
