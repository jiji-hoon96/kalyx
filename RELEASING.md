# Releasing

How Kalyx publishes to npm, and the one-time setup the **new adapter packages**
need before the 1.1.0 wave can ship cleanly.

## How a release happens

1. PRs land on `main` with a `.changeset/*.md` entry.
2. `release.yml` (on every `main` push) runs `changeset version`, opening/updating
   the **"chore: release packages"** Version PR with the computed bumps + changelogs.
3. **Merging that Version PR** triggers `release.yml` again; with no changesets
   left it runs `pnpm changeset publish`, which publishes every package whose
   `package.json` version is ahead of the npm `latest`, tags, and creates GitHub
   Releases.

Auth is **npm Trusted Publishing (OIDC)** — `release.yml` sets `id-token: write`,
uses Node 24 (npm ≥ 11.5.1), and sets **no `NPM_TOKEN`**. Every package being
published must therefore be registered as a Trusted Publisher on npmjs.com for
this repo + workflow, or its publish step fails.

## ⚠️ Prerequisite for the 1.1.0 wave (new/unregistered adapters)

The pending Version PR publishes:

| Package | Bump | Trusted Publisher? |
|---|---|---|
| `@kalyx/core` | 1.0.2 → **1.1.0** | ✅ registered (publishes via this workflow today) |
| `@kalyx/react` | 1.0.3 → **1.1.0** | ✅ registered |
| `@kalyx/adapter-date-fns` | 1.0.0 → **1.0.1** | ❌ **not registered** — 1.0.0 went out by manual token |
| `@kalyx/adapter-dayjs` | **0.1.0** (new) | ❌ **not registered** — brand-new package |

If the Version PR is merged as-is, `changeset publish` will publish core + react
over OIDC and then **fail on the two adapters**, leaving a broken partial release.

**Do one of the following first:**

### Option A — register Trusted Publishing (preferred, makes future releases hands-off)
On npmjs.com, for **`@kalyx/adapter-date-fns`** and **`@kalyx/adapter-dayjs`**:
Package → Settings → *Trusted Publisher* → GitHub Actions, with
- Repository: `jiji-hoon96/kalyx`
- Workflow: `release.yml`

`@kalyx/adapter-dayjs` doesn't exist on npm yet; configuring a trusted publisher
for the (scoped) name you own lets the workflow create it on first publish. If
npm requires the package to exist first, do one manual publish (Option B) and
register afterward. Then merge the Version PR — CI publishes all four.

### Option B — manual first publish of the adapters, OIDC for the rest
```bash
pnpm changeset version          # apply the Version PR bumps locally (or check it out)
pnpm build
# adapters first, with an automation token that has publish rights:
pnpm --filter @kalyx/adapter-date-fns publish --no-git-checks --access public
pnpm --filter @kalyx/adapter-dayjs    publish --no-git-checks --access public
```
Note: `@kalyx/adapter-dayjs` intentionally omits `publishConfig.provenance`, so a
plain token publish works. After the adapters exist, merging the Version PR lets
the OIDC workflow publish core + react (and patch-publish the adapters next time).

## Post-1.0 follow-ups (still open)

- Register Trusted Publishing for both adapter packages (above) so releases are
  fully hands-off.
- Backfill the `@kalyx/adapter-date-fns@1.0.0` GitHub Release (the manual token
  publish didn't create one).
- Harden `release.yml` to pre-flight that every to-be-published package is
  publishable (fail fast with a clear message instead of a partial publish).
