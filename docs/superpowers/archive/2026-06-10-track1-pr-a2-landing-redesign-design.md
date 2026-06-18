# Track 1 PR-A2 — Landing Redesign

**Date:** 2026-06-10
**Status:** Approved (brainstorm) — pending implementation plan
**Track:** 1 (Visuals · Interactivity · Comparison) — PR #2 of 5
**Parent spec:** [`2026-06-09-track1-visuals-interactive-comparison-design.md`](./2026-06-09-track1-visuals-interactive-comparison-design.md)

## Context

PR-A1 shipped the `<HeroDemo>` React component (default-exported, lazy-ready) along with the README WebP artifacts, the freshness CI check, and the `recorder.tsx` capture route. That work is on `main` as of commit `7e8117c` (PR #98, merged 2026-06-10). The component is published source-only inside `apps/docs-site`; nothing in `packages/react` consumes it.

PR-A2 takes the next step on the parent spec's deliverable **E. Landing page redesign**: rewrite `apps/docs-site/src/pages/index.tsx` so that the hero swaps the current static isometric illustration for `<HeroDemo>` (lazy-loaded) and so the rest of the page matches the parent spec's 6-section layout. The current landing has 4 sections (hero / features / compare / finalCta) at 375 LoC of TSX + 333 LoC of CSS — both are replaced wholesale by 6 small focused components.

## Why

The current landing was correct for the pre-1.0 phase: ship something credible, prove headless feels right, link to docs. With v1.0.0 shipped and Track 1's hero artifact in place, the landing's job changes: it has to *demonstrate*, not describe.

Three concrete deficits in the current landing:

1. **The hero is a static screenshot.** A drawn isometric illustration doesn't prove the library does anything. PR-A1 produced a live `<HeroDemo>` that cycles through all 7 pickers — the landing is the natural home.
2. **There is no picker grid.** A visitor scrolling has no quick way to land on the docs page for the specific picker they came for (e.g., "I want a RangePicker"). The Components nav exists but is sub-menu-tucked.
3. **There is no "Same JSX, your styles" beat.** The headless story is the load-bearing differentiator vs react-datepicker / react-day-picker, but the landing currently leaves it implicit.

The redesign closes all three.

## Scope

**In:**

- Replace `apps/docs-site/src/pages/index.tsx` and `apps/docs-site/src/pages/index.module.css` with a thin composer that mounts 6 new section components.
- Add 6 new component directories under `apps/docs-site/src/components/`: `Hero/`, `FeatureGrid/`, `SameJsxBlock/`, `PickerGrid/`, `WhyKalyx/`, `GetStarted/`.
- Extend `scripts/record-hero.mjs` with a `--still=<path>` flag that emits a single PNG of frame 0 (DatePicker).
- Commit the extracted still as `apps/docs-site/static/img/og-hero.png` and point `themeConfig.image` at it.
- Extend `scripts/check-hero-freshness.mjs` to also verify `og-hero.png` (existence + size budget).
- Add a render-smoke `*.test.tsx` per new component + jest-axe pass.
- Add Korean translations for every new `Translate` id; new English copy is committed in `index.tsx`/components, new Korean strings land in `apps/docs-site/i18n/ko/code.json`.

**Out:**

- No changes to `packages/react` — `@kalyx/react` bundle size stays exactly where it is (15.63 KB ESM).
- No new CI workflow jobs. Existing `Test (Node 20/22)` + `Docs Site Build` jobs already cover the new code; `Hero WebP Freshness` already checks the freshness script (just with a 3rd file added).
- No StackBlitz embeds, no live code blocks, no comparison table content — those are PR-B / PR-D respectively.
- No mobile-first redesign of components shared with docs pages (navbar, footer, sidebar). Layout cleanup limited to the index route.
- No A/B test infrastructure or analytics events on the new sections.

## Component architecture

```
apps/docs-site/src/components/
├── Hero/
│   ├── index.tsx              left half (eyebrow + title + subtitle + CTAs + install snippet)
│   ├── HeroDemoSlot.tsx       right half — React.lazy(<HeroDemo />) inside BrowserOnly + Suspense
│   ├── StaticHero.tsx         <img src="/img/hero-light.webp"> placeholder used by SSG + Suspense fallback
│   ├── Hero.module.css
│   └── __tests__/Hero.test.tsx
├── FeatureGrid/
│   ├── index.tsx              4-card grid (2×2 mobile, 1×4 desktop)
│   ├── FeatureCard.tsx
│   ├── data.ts                4 entries: id, iconId, titleId, bodyId
│   ├── FeatureGrid.module.css
│   └── __tests__/FeatureGrid.test.tsx
├── SameJsxBlock/
│   ├── index.tsx              "Same JSX, your styles" — 3 syntax-highlighted code samples
│   ├── SameJsxBlock.module.css
│   └── __tests__/SameJsxBlock.test.tsx
├── PickerGrid/
│   ├── index.tsx              7-card grid linking to each /docs/components/<name>
│   ├── PickerCard.tsx
│   ├── data.ts                7 entries: id, label, href, oneLineId
│   ├── PickerGrid.module.css
│   └── __tests__/PickerGrid.test.tsx
├── WhyKalyx/
│   ├── index.tsx              short paragraph + CTA → /docs/intro#comparison (PR-D swap target)
│   ├── WhyKalyx.module.css
│   └── __tests__/WhyKalyx.test.tsx
└── GetStarted/
    ├── index.tsx              install snippet + first example code
    ├── GetStarted.module.css
    └── __tests__/GetStarted.test.tsx
```

New `apps/docs-site/src/pages/index.tsx` (~50 LoC):

```tsx
import Layout from '@theme/Layout';
import Hero from '../components/Hero';
import FeatureGrid from '../components/FeatureGrid';
import SameJsxBlock from '../components/SameJsxBlock';
import PickerGrid from '../components/PickerGrid';
import WhyKalyx from '../components/WhyKalyx';
import GetStarted from '../components/GetStarted';

export default function Home() {
  return (
    <Layout title="Kalyx — seven date primitives, one API"
            description="Headless React DatePicker + 6 sibling primitives. Zero CSS, SSR-safe, ≤16 KB.">
      <Hero />
      <FeatureGrid />
      <SameJsxBlock />
      <PickerGrid />
      <WhyKalyx />
      <GetStarted />
    </Layout>
  );
}
```

The old `index.module.css` is deleted in the same commit as the new `index.tsx`. Each new component owns its own `*.module.css`.

## Data flow

### Static content lives next to the component that renders it

`FeatureGrid` and `PickerGrid` each ship a `data.ts` that exports a `readonly` array of entries (`{ id, titleId, bodyId, ... }`). The component renders by mapping over the array; copy changes mean editing one file. i18n keys are stored as strings in `data.ts` and wired via `<Translate id={entry.titleId}>{defaultEnglishCopy}</Translate>` in the card.

The other four components (Hero / SameJsxBlock / WhyKalyx / GetStarted) have small enough fixed content that `data.ts` would be overkill — content lives inline in `index.tsx`.

### `<HeroDemo>` lazy boundary

```tsx
// Hero/HeroDemoSlot.tsx
import { lazy, Suspense } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import StaticHero from './StaticHero';

const HeroDemo = lazy(() => import('../HeroDemo'));

export default function HeroDemoSlot() {
  return (
    <BrowserOnly fallback={<StaticHero />}>
      {() => (
        <Suspense fallback={<StaticHero />}>
          <HeroDemo />
        </Suspense>
      )}
    </BrowserOnly>
  );
}
```

`StaticHero` is a tiny `<img src="/img/hero-light.webp" alt="..." />` — the same WebP we shipped in PR-A1, reused so the SSG HTML and the lazy-load placeholder are byte-identical to the eventual animated frame 0. No layout shift when the lazy chunk lands.

Consequences:

- SSG build emits only the static `<img>` — main bundle does not contain `HeroDemo` code → Lighthouse stays close to baseline.
- Client hydrates, lazy chunk loads, `<HeroDemo>` mounts in place of the `<img>` → animation begins.
- `prefers-reduced-motion: reduce` behaviour is the same as PR-A1 — `<HeroDemo>` itself handles it.

### og:image pipeline

`scripts/record-hero.mjs --still=apps/docs-site/static/img/og-hero.png` captures frame 0 of the sequence (DatePicker, light theme, 960×540) as a PNG, skipping the animated WebP encode. Run manually after every meaningful HeroDemo change, same as the WebP cadence.

`docusaurus.config.ts.themeConfig.image` is set to `img/og-hero.png` (Docusaurus prepends `baseUrl`, which is `/`). The og-image freshness check piggybacks on `scripts/check-hero-freshness.mjs` — the script grows from 2 verified files to 3, all under the same 250 KB hard cap and 90-day soft cap.

### Lighthouse baseline

Capture **before** opening the PR: from `main` at the SHA the PR branches from, run `pnpm --filter docs-site build && pnpm --filter docs-site serve` and a Lighthouse audit (mobile, throttled). Record the Performance score in the PR body. CI does not gate on Lighthouse; the score is a manual ratchet to detect ≥5pt regressions.

## i18n strategy

Per the brainstorm decision, Korean lands in PR-A2 alongside English. Workflow:

1. Write English copy directly in the component JSX using `<Translate id="home.section.thing" />` with a default child string.
2. After all components are wired, run `pnpm --filter docs-site write-translations -- --locale ko` to extract new ids into `apps/docs-site/i18n/ko/code.json`.
3. Fill the Korean strings by hand (or with the user's help) before opening the PR.

Build is resilient to missing keys (falls back to English), so a partial fill won't break CI — but visual review on `/ko/` requires the keys filled. Treat the ko `code.json` update as a hard prerequisite.

ID convention: `home.<section>.<element>` — e.g., `home.hero.title.line1`, `home.featureGrid.zeroCss.title`. Existing landing already uses this convention (`home.eyebrow`, `home.features.eyebrow`); reuse where applicable, retire orphaned ids.

## Testing strategy

| Layer | What | Tool |
|---|---|---|
| Per component | 1 render-smoke test: mounts, key elements present, no console errors | Vitest + @testing-library/react |
| Per component | 1 a11y test: `jest-axe` violation count = 0 | jest-axe (already wired in `test/setup.ts`) |
| Whole page | `apps/docs-site` build succeeds for en + ko | existing `Docs Site Build` CI job |
| Lazy boundary | Manual Network-tab screenshot in PR body showing `HeroDemo` as a separate chunk | manual |
| og:image | View Source on `/` confirms `<meta property="og:image" content=".../og-hero.png">` | manual |
| Lighthouse delta | Manual run pre/post-PR, recorded in PR body | manual |

No new CI jobs. The existing matrix (`Test (Node 20/22)`, `Docs Site Build`, `Hero WebP Freshness`) covers everything; the freshness check picks up `og-hero.png` automatically once the script is extended.

Coverage target: smoke-level only — these are presentational composition components. The heavy logic lives in `@kalyx/react` (still 514/514 from the existing matrix) and in `<HeroDemo>` (covered in PR-A1). The Vitest coverage thresholds in `vitest.config.ts` (85/75/85/85) stay as-is and `apps/**` stays excluded from the coverage `include` glob — no threshold change is part of this PR.

## Success criteria

- [ ] `pnpm test:run` ≥ 526 pass (514 existing + 6 smoke + 6 axe, 1 each per new component; small drift allowed if a test bundles smoke + axe in one describe)
- [ ] `pnpm typecheck` and `pnpm lint` clean
- [ ] `pnpm --filter docs-site build` succeeds for both `en` and `ko`
- [ ] Every new component passes `axe` with 0 critical / serious violations
- [ ] Network tab on a fresh load of `/` shows `HeroDemo` in its own chunk (not in the main bundle)
- [ ] Lighthouse Performance score (mobile, throttled) ≥ pre-PR-A2 baseline − 5
- [ ] `<meta property="og:image">` resolves to a real `og-hero.png` (not 404)
- [ ] `@kalyx/react` ESM bundle size unchanged at 15.63 KB (verified by `bundle-size` CI job)
- [ ] All new sections are keyboard-reachable in Tab order
- [ ] `apps/docs-site/i18n/ko/code.json` contains a Korean string for every new `home.*` id

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Lighthouse Performance drops >5pt despite the lazy split | `<StaticHero>` fallback means the LCP element is identical to the pre-PR-A2 static image. Worst case: revert `HeroDemoSlot` to `StaticHero`-only; lazy work is reversible. |
| WhyKalyx CTA link rot when PR-D ships `/docs/comparison` | Initial target is `/docs/intro#comparison` (existing anchor). PR-D's plan must include "swap WhyKalyx CTA href to `/docs/comparison`" as a follow-up task; spec called out explicitly. |
| New i18n keys land with placeholder English in ko | `write-translations -- --locale ko` runs as a planned step before opening the PR. Hand-fill is a checklist item, not optional. |
| og:image growth eats into Vercel build size budget | Single PNG ~30 KB at q=75; negligible vs current asset budget. |
| `index.module.css` deletion breaks some other route accidentally depending on a global selector | Audit with `grep -r "from.*index.module" apps/docs-site/src/` before deleting; in practice CSS modules are scoped so this is theoretical. |
| Old landing's existing `home.*` Translate ids orphan in ko `code.json` | Run `write-translations -- --messagePrefix ""` after the index rewrite; manually remove ids no longer referenced. |

## PR breakdown

This spec ships as **one PR** — PR-A2 in the parent spec's table. Splitting into per-component PRs would multiply review overhead for a coherent visual change.

```
SHIPS IN: 1 PR, ~600 LoC added, ~700 LoC deleted, net ~100 LoC reduction
```

Suggested commit shape inside that PR (each TDD: failing test → impl → pass → commit):

1. `scripts(record-hero): add --still flag for og:image extraction`
2. `scripts(check-hero-freshness): verify og-hero.png alongside WebPs`
3. `docs-site(og): commit og-hero.png and point themeConfig.image at it`
4. `feat(docs-site): add Hero component with lazy HeroDemo slot`
5. `feat(docs-site): add FeatureGrid component`
6. `feat(docs-site): add SameJsxBlock component`
7. `feat(docs-site): add PickerGrid component`
8. `feat(docs-site): add WhyKalyx component`
9. `feat(docs-site): add GetStarted component`
10. `refactor(docs-site): rewrite landing as 6-section composer`
11. `i18n(ko): translate new landing strings`

11 commits ≈ 11 plan tasks (mirrors PR-A1's plan shape).

## Dependencies

- **Hard prerequisite, satisfied:** PR-A1 — `<HeroDemo>` exists at `apps/docs-site/src/components/HeroDemo/index.tsx` as a default export. (Merged in commit `7e8117c`.)
- **Hard prerequisite, satisfied:** PR #99 — README/config domain swap (`kalyx-docs.vercel.app` → `kalyx-docs-site.vercel.app`). Merged commit `9b15120`. Without this, the new landing's external links would 404.
- **No blockers on PR-B / PR-C / PR-D** — they are independent and can be worked in parallel.
- **Follow-up obligation on PR-D:** when PR-D ships `/docs/comparison`, swap `WhyKalyx`'s CTA href.

## Out of scope (deferred to later PRs)

- StackBlitz embeds on each picker docs page → PR-B
- Live code blocks via `@docusaurus/theme-live-codeblock` ReactLiveScope extension → PR-B
- `/docs/comparison` page with bundle bar chart + feature matrix → PR-D
- Playground enhancements (picker selector, locale/tz toggles) → PR-C
- Mobile dev-tools-tested polish on viewport widths < 360px

## References

- Parent spec: `docs/superpowers/specs/2026-06-09-track1-visuals-interactive-comparison-design.md` § E
- PR-A1 plan: `docs/superpowers/plans/2026-06-09-track1-pr-a1-hero-demo.md`
- PR-A1 merge: GitHub PR #98, commit `7e8117c`
- Docs domain fix: GitHub PR #99, commit `9b15120`
- CLAUDE.md §14 (current initiative status)
- Live landing baseline (pre-PR-A2): https://kalyx-docs-site.vercel.app/
