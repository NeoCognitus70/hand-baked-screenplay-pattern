<!--
  AUDIENCE: Maintainers cutting a release of this library.
  PURPOSE:  Keep the version metadata (package.json + CHANGELOG) and the release
            record (Git tag + GitHub release) in agreement, so the backlog can
            never again claim a release that does not exist.
  LOCATION: docs/releasing.md
-->

# Releasing

This project distributes via **GitHub tags and releases only** — it is not
published to npm (the same stance as `v0.1.0`). The `prepublishOnly` hook still
guards any future `npm publish`, but publication is not part of the current
contract.

A release is only "cut" once **all four** of these agree on the version — the
gap between the first two and the last two is exactly what the Codex GPT-5 v1
review flagged as Risk 1 (the backlog said 0.2.0 was cut while no tag or release
existed):

1. `package.json` `version`
2. The matching `## [x.y.z] - <date>` heading and `[x.y.z]` compare link in
   `CHANGELOG.md`
3. A Git tag `vx.y.z` pushed to `origin`
4. A published GitHub release for that tag

## Checklist

1. **Verify green:** `npm run verify` (typecheck + build + tests) passes on the
   commit you intend to release.
2. **Metadata:** `package.json` `version` matches the top dated `CHANGELOG.md`
   section, and the `[Unreleased]` section is empty (or intentionally carries
   only not-yet-released changes).
3. **Tag the release commit** — the commit whose tree the CHANGELOG section
   describes, not necessarily `HEAD`:

   ```bash
   git tag vX.Y.Z <commit>        # lightweight, matching existing tags
   git push origin vX.Y.Z
   ```

4. **Publish the GitHub release** from that tag, using the CHANGELOG section as
   the notes:

   ```bash
   gh release create vX.Y.Z --title "vX.Y.Z — <headline>" --notes-file <notes>
   ```

5. **Confirm the record:** `git ls-remote --tags origin` lists the tag,
   `gh release list` shows the release as Latest, and the CHANGELOG
   `compare/<prev>...vX.Y.Z` link resolves.
6. **Reconcile the backlog:** update the relevant item so "release cut" means the
   release record actually exists, and note the date.
