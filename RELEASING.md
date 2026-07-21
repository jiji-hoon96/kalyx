# Releasing

How Kalyx publishes to npm. All five packages (`@kalyx/core`, `@kalyx/react`,
`@kalyx/adapter-date-fns`, `@kalyx/adapter-dayjs`, `@kalyx/adapter-luxon`) are
live on npm and publish hands-off via **npm Trusted Publishing (OIDC)**.

## How a release happens

1. PRs land on `main` with a `.changeset/*.md` entry.
2. `release.yml` (on every `main` push) first runs the pre-flight gates:
   build → full test run → bundle-size gate (`scripts/check-bundle-size.js`,
   ceiling 17 KB gzip) → **`scripts/verify-changesets.mjs`**, which fails fast
   if any changeset mixes ignored packages (`docs`, `@kalyx-example/*`) with
   publishable ones (that mix would abort `changeset publish` midway).
3. It then runs `changeset version`, opening/updating the
   **"chore: release packages"** Version PR with the computed bumps + changelogs.
4. **Merging that Version PR** triggers `release.yml` again; with no changesets
   left it runs `pnpm changeset publish`, which publishes every package whose
   `package.json` version is ahead of the npm `latest`, tags, and creates GitHub
   Releases.

Auth is **npm Trusted Publishing (OIDC)** — `release.yml` sets `id-token: write`,
uses Node 24 (npm ≥ 11.5.1), and sets **no `NPM_TOKEN`**. Every published
`@kalyx/*` package is registered as a Trusted Publisher on npmjs.com for
`jiji-hoon96/kalyx` + `release.yml` (environment left empty).

Note: the `main` branch is protected; bot-created Version PRs leave required
checks in `action_required`, so maintainers merge them with `gh pr merge --admin`.

## Adding a brand-new package (first publish playbook)

OIDC can only be attached to a package that **already exists** on npm, so the
CI workflow fails with `E404` on a brand-new package. The first publish must be
manual, by an authenticated maintainer. Lessons from the dayjs/luxon launches:

1. **Set the initial `package.json` version to `0.0.0`** — a `minor` changeset
   then bumps the first release to exactly `0.1.0`. (With `0.1.0` baked in, the
   changeset would skip to `0.2.0`.)
2. Land the package + changeset PR, merge the Version PR as usual — core/react
   publish over OIDC; the new package's publish step fails with `E404`. Expected.
3. **Publish manually with `pnpm publish`, never `npm publish`:**
   ```bash
   cd packages/<new-package>
   pnpm publish --no-git-checks   # publishConfig.access=public is already set
   ```
   `npm publish` uploads `workspace:^` dependency ranges verbatim and npm
   rejects the tarball with `400 Bad Request`; `pnpm publish` rewrites them to
   real versions.
4. **Don't panic at post-publish `E404`s.** `npm view <pkg> version` can 404 for
   several minutes after a successful publish (registry root-index CDN lag).
   Check the version endpoint instead —
   `https://registry.npmjs.org/@kalyx%2F<name>/<version>` returning `200` means
   it's live. **Never republish** into the lag window (you'll only get a 403
   "cannot publish over", which itself proves the publish succeeded).
5. On npmjs.com, register the Trusted Publisher for the new package
   (GitHub Actions · Repository `jiji-hoon96/kalyx` · Workflow `release.yml` ·
   environment empty) so every later release is hands-off.

## Open follow-ups

- Backfill the `@kalyx/adapter-date-fns@1.0.0` GitHub Release (the 1.0.0 manual
  token publish didn't create one; 1.0.1+ are OIDC-published and auto-created).
