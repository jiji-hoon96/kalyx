# Deploying the docs site to Vercel

The Docusaurus site lives under `apps/docs-site/` inside a pnpm monorepo. Vercel needs to be told this, and it needs to build `@kalyx/core` before the docs site can import from it.

## One-time setup

### 1. Create the Vercel project

From your laptop (not Claude):

```bash
cd apps/docs-site
npx vercel link      # follow prompts — pick your scope, name the project "kalyx-docs-site"
```

This creates `.vercel/project.json` — commit it or keep it local (either works).

### 2. Project settings in the Vercel dashboard

Vercel will autodetect `vercel.json`, but double-check:

| Setting | Value |
| --- | --- |
| Framework Preset | Docusaurus 2 |
| Root Directory | `apps/docs-site` |
| Build Command | (from `vercel.json` — don't override) |
| Output Directory | `build` |
| Install Command | (from `vercel.json` — noop) |
| Node.js version | 20.x |

The custom `buildCommand` in `vercel.json` runs `pnpm install` + `@kalyx/core build` + docs build in one step. This avoids Vercel's default monorepo install, which doesn't know about `workspace:*` adapters.

### 3. Environment variables

None required. The site is fully static.

### 4. Git integration

Vercel's GitHub app will auto-deploy on every push. The default setup gives you:

- **Production** — commits to `main` → `https://kalyx-docs-site.vercel.app`
- **Preview** — all other branches and PRs → unique URL per PR

### 5. Custom domain (optional)

If you own a domain (e.g., `kalyx.dev`):

1. Dashboard → Project → Settings → Domains → Add Domain
2. Add `kalyx.dev` and `www.kalyx.dev`.
3. Point DNS A/AAAA records to Vercel's IPs (Vercel shows them).
4. Update `url` in `apps/docs-site/docusaurus.config.ts`.

## Local verification

Run the production build locally before pushing:

```bash
pnpm --filter @kalyx/core build
pnpm --filter docs-site build
pnpm --filter docs-site serve
```

Then open [http://localhost:3000](http://localhost:3000).

## CI Preview for non-Vercel CI (optional)

If you want a parallel preview on GitHub Pages or Cloudflare Pages, the build command is identical — just point it at `apps/docs-site/build`.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Build fails on `@kalyx/core` resolution | Confirm the `buildCommand` in `vercel.json` runs `pnpm --filter @kalyx/core build` first. |
| `Module not found: @docusaurus/*` | Clear Vercel's build cache (dashboard → Deployments → ⋯ → Redeploy with "Clear cache"). |
| Docusaurus throws on broken links | The config uses `onBrokenLinks: 'warn'` — fix the link, or bump to `'ignore'` if it's a deliberate external URL. |
| Images from `/img/*` 404 in production | Confirm the file exists under `apps/docs-site/static/img/`. Anything under `static/` is served at the site root. |

## i18n URLs

With `defaultLocale: 'en'`:

- `/docs/intro` → English
- `/ko/docs/intro` → Korean

Vercel handles both automatically — no routing config needed.
