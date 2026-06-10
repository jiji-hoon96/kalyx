# Track 1 — Visuals · Interactivity · Comparison

**Date:** 2026-06-09
**Status:** Approved (brainstorm) — pending implementation plan
**Track:** 1 of 4 in the v1.0.0 post-ship roadmap

## Roadmap context

This spec is **Track 1 of 4** in the post-v1.0.0-stable improvement initiative. The other tracks are sequenced after this one and each will get its own spec at the time it begins:

| Track | Theme | Status |
|---|---|---|
| **1** | **Visuals · Interactivity · Comparison** | **this spec** |
| 2 | Integration recipes + react-datepicker→kalyx codemod | Pending |
| 3 | OSS governance + community (ROADMAP, Discussions, v1.0 release post, showcase) | Pending |
| 4 | Library feature improvements (RTL, holiday plugin, DevTools, etc.) | Pending |

Tracks have no hard dependencies on each other. Order is impact-first.

## Why

v1.0.0 stable shipped 2026-06-08. The library is feature-complete (7 pickers, 3 headless hooks, 15.63 KB gzip, 497 unit tests, axe-clean), but the discovery / "try it in 30 seconds" surface is thin:

- README hero is one static image. No GIF or screencast.
- docs-site landing is text-heavy with no live demo.
- The `/playground` page exists but only renders one component.
- Per-picker docs pages have code blocks but no embedded sandboxes — readers can't fork-and-try.
- Comparison vs other libraries (react-datepicker, react-day-picker, react-aria, ark-ui, MUI X, mantine) is buried as a paragraph in the README. No dedicated page, no bundle-size chart.
- 1 outdated StackBlitz example (`examples/stackblitz-rc`).

Adoption right after a 1.0 launch hinges on **what a first-time visitor can see and try in under a minute**. This track closes that gap.

## Scope (5 sub-deliverables, all in)

### A. Hero animated demo

Two artifacts, same source sequence, different rendering targets.

**A.1 — `img/hero-light.webp` + `img/hero-dark.webp` (for GitHub README)**
- Format: animated WebP, infinite loop
- Dimensions: 960×540 (downsamples cleanly to the README's display width)
- Duration: ~6 seconds, 30 fps
- Size budget: ≤ 250 KB per file
- Light + dark variants, served via `<picture>` element in README:
  ```html
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./img/hero-dark.webp">
    <img src="./img/hero-light.webp" alt="Kalyx — 7 date primitives, one API" width="720">
  </picture>
  ```

**A.2 — `apps/docs-site/src/components/HeroDemo.tsx` (for docs-site landing)**
- Live React component
- Renders real `@kalyx/react` components cycling through all 7 picker types
- Each picker is displayed for ~5 seconds with a smooth cross-fade
- Pause-on-hover (resumes on mouse-leave)
- Reduced-motion respect: when `prefers-reduced-motion: reduce`, freeze on the DatePicker frame and disable autoplay (manual prev/next buttons appear)
- Lazy-loaded via `React.lazy()` so it does not block landing first paint

**Sequence (both A.1 and A.2):**
1. DatePicker (single date, with popover open showing month grid)
2. RangePicker (4-day range hover, then commit)
3. TimePicker (12h, scrolling through hours)
4. DateTimePicker (date + time combined)
5. MonthPicker (month grid)
6. YearPicker (year grid)
7. WeekPicker (week highlighted)

Frame text overlay: "DatePicker → RangePicker → TimePicker → DateTimePicker → MonthPicker → YearPicker → WeekPicker → 7 primitives. one API."

**Capture pipeline:**
- New local-only docs-site route: `/__recorder` (excluded from production builds via Docusaurus plugin config or simple `process.env.NODE_ENV !== 'production'` guard).
- The route deterministically renders each frame of the sequence with the timer driven by a URL query parameter (e.g., `?frame=42`).
- New script: `scripts/record-hero.mjs`
  - Uses Playwright (headless Chromium) to drive `/__recorder`
  - Iterates frame indices 0..N, screenshots each at 960×540
  - Pipes PNG frames into `cwebp -loop 0 -q 75 -m 6`
  - Outputs `img/hero-light.webp` and `img/hero-dark.webp` (script accepts `--theme=light|dark` flag and toggles `[data-theme]` on the root element)
  - Run manually before opening the PR — checked-in artifact
- CI does not regenerate. CI only verifies:
  - Files exist
  - Sizes ≤ 250 KB each
  - Modified-within-90-days check (script in `scripts/check-hero-freshness.mjs`)

### B. Per-picker sandbox infrastructure

Two parallel mechanisms.

**B.1 — Inline Docusaurus live blocks**

Already enabled via `@docusaurus/theme-live-codeblock` and `src/theme/ReactLiveScope`. Extend the scope to expose every public kalyx export:

```tsx
// src/theme/ReactLiveScope/index.tsx
import * as React from 'react';
import {
  DatePicker, RangePicker, TimePicker, DateTimePicker,
  MonthPicker, YearPicker, WeekPicker,
  useDatePicker, useRangePicker, useTimePicker,
  DateFnsAdapter,
} from '@kalyx/react';

export default {
  React, ...React,
  DatePicker, RangePicker, TimePicker, DateTimePicker,
  MonthPicker, YearPicker, WeekPicker,
  useDatePicker, useRangePicker, useTimePicker,
  DateFnsAdapter,
};
```

After this, every `.md`/`.mdx` in `apps/docs-site/docs/` can use:

````mdx
```tsx live
function Example() {
  const [iso, setIso] = React.useState<string | null>(null);
  return (
    <DatePicker value={iso} onChange={setIso}>
      <DatePicker.Input className="border rounded px-2 py-1" />
      <DatePicker.Popover>
        <DatePicker.Calendar />
      </DatePicker.Popover>
    </DatePicker>
  );
}
```
````

**B.2 — `<StackBlitzEmbed>` component + `examples/*` projects**

- New component: `apps/docs-site/src/components/StackBlitzEmbed.tsx`
  - Props: `{ id: string, file?: string, height?: number, theme?: 'dark' | 'light' }`
  - Renders an iframe at `https://stackblitz.com/github/jiji-hoon96/kalyx/tree/main/examples/{id}?embed=1&file={file ?? 'src/App.tsx'}&hideExplorer=1&theme={theme ?? 'dark'}`
  - Default height 600px, prop-overridable
  - Lazy-loaded via `loading="lazy"`
  - Includes an "Open in StackBlitz ↗" link below the iframe (full-screen new tab)

- New example projects (7), each a real pnpm package under `examples/`:
  - `examples/datepicker-basic/`
  - `examples/datepicker-rhf/`
  - `examples/rangepicker-presets/`
  - `examples/timepicker-12h/`
  - `examples/datetimepicker-timezone/`
  - `examples/datepicker-tailwind/`
  - `examples/datepicker-shadcn/`

  Each example follows a uniform structure:
  ```
  examples/<id>/
  ├── package.json   (name = "@kalyx-example/<id>", private)
  ├── src/
  │   ├── App.tsx
  │   └── main.tsx
  ├── index.html
  ├── tsconfig.json
  └── vite.config.ts
  ```
  Uses Vite + React 19 + `@kalyx/react` (workspace dep).

- Delete `examples/stackblitz-rc/` (stale, RC-era).

- Picker docs pages get embeds added. Convention:
  - `docs/components/datepicker.md` → `<StackBlitzEmbed id="datepicker-basic" />` near the top, after the intro.
  - "Recipes" sections in each picker doc reference the relevant example (e.g., `datepicker.md` "With React Hook Form" section embeds `datepicker-rhf`).

### C. `/playground` enhancement

Current `apps/docs-site/src/pages/playground.mdx` renders one editable DatePicker. Upgrade in place (still MDX, but with a richer custom component imported):

New component: `apps/docs-site/src/components/Playground/index.tsx`

Three controls in a left sidebar:
1. **Picker selector** — `<select>` for the 7 picker types. Switching swaps the live component and resets the example code.
2. **classNames editor** — per-part Tailwind class string inputs. For DatePicker: `root, input, popover, calendar, day, daySelected, dayToday, dayDisabled, dayOutsideMonth`. Live applied. (Other pickers have their own part lists derived from existing component types.)
3. **Locale + timezone toggle** — two `<select>`s. Locale: `en-US, ko-KR, ja-JP, fr-FR`. Timezone: `UTC, Asia/Seoul, America/New_York, Europe/London`.

Right side: live render area + an "Open in StackBlitz" button at the bottom that uses `@stackblitz/sdk` (`sdk.openProject(...)`) to spawn a sandbox seeded with the current playground state (picker type, classNames, locale, timezone). Project name suffix includes a hash of the state for shareability.

### D. `/docs/comparison` page

New file: `apps/docs-site/docs/comparison.md` + Korean translation at `apps/docs-site/i18n/ko/docusaurus-plugin-content-docs/current/comparison.md`.

Page structure:

**Intro (~3 sentences):** the 2026 landscape problem statement (lifted from CLAUDE.md §1), positioned as the rationale for the comparison.

**Section 1 — Feature matrix** (markdown table):

Libraries (rows):
- react-datepicker
- react-day-picker (v9)
- react-aria
- ark-ui (DatePicker)
- @mui/x-date-pickers
- @mantine/dates
- **Kalyx** (highlighted)

Features (columns):
- DatePicker
- TimePicker
- DateTimePicker
- MonthPicker
- YearPicker
- WeekPicker
- RangePicker
- Timezone-aware (IANA)
- Zero CSS (no required stylesheet import)
- SSR-safe (Next.js App Router)
- RSC-friendly
- a11y verified (axe + WAI-ARIA)
- ISO string API (UTC string in/out)
- Adapter pattern (date-fns / dayjs / luxon swappable)
- Bundle gzip (KB)
- License

Cell values: `✓` / `✗` / `partial` (footnote-linked).

Footer note: "Last measured YYYY-MM-DD (filled in at PR-D merge time). Methodology: bundle sizes via bundlephobia + size-limit; feature presence verified against each library's v-latest docs."

**Section 2 — Bundle size chart**

Inline SVG, hand-coded, no chart library. Horizontal bars, one per library, sized proportionally:

```
react-datepicker     ████████████████████████  ~62 KB
react-day-picker     █████████  ~22 KB
react-aria           ███████████  ~28 KB
@mui/x-date-pickers  ██████████████████  ~45 KB
@mantine/dates       ████████████  ~30 KB
ark-ui               ████████  ~20 KB
Kalyx                ██████  ~15 KB        ← highlighted
```

(Sizes are illustrative — actual numbers measured during PR-D.)

**Section 3 — When to NOT use Kalyx** (honesty paragraph)

A short paragraph admitting where each competitor wins (e.g., "If you need a kitchen-sink solution and don't care about bundle size, react-datepicker has more years of edge-case fixes. If you're building a design system from scratch and want the full Adobe a11y guarantee, react-aria.").

This earns credibility — every comparison page that pretends "we win at everything" loses trust.

### E. Landing page redesign

`apps/docs-site/src/pages/index.tsx` rewrite. Decompose into:

```
src/components/
├── Hero/
│   ├── index.tsx          (left half — copy + CTAs)
│   └── HeroDemo.tsx       (right half — from sub-deliverable A.2)
├── FeatureGrid/
│   └── index.tsx          (4 cards: Zero CSS, SSR-safe, Timezone-aware, 15 KB)
├── PickerGrid/
│   └── index.tsx          (7 cards linking to each picker doc page)
└── GetStarted/
    └── index.tsx          (install snippet + first example)
```

Page layout (top to bottom):

1. **Hero** (above the fold)
   - Left half: title + 1-line description + install snippet + two CTAs ("Try playground" → `/playground`, "Read docs" → `/docs/intro`)
   - Right half: `<HeroDemo />`
2. **Feature grid** — 4 cards in a 2×2 (mobile) / 1×4 (desktop) grid
3. **"Same JSX, your styles"** — a small code block showing the same `<DatePicker>` rendered three ways (Tailwind / shadcn / plain)
4. **Picker grid** — 7 cards, each with picker name, 1-line description, and a "Docs →" link
5. **"Why Kalyx"** — short paragraph → CTA to `/docs/comparison`
6. **Get started** — install snippet + first example code

Preserve all existing SEO meta tags (title, description, og:image). Update og:image to use a static export of one HeroDemo frame.

## PR breakdown

| # | PR title | Files touched | Depends on | Estimated diff |
|---|---|---|---|---|
| 1 | **A1** — Hero recorder + `<HeroDemo>` + WebP artifacts | `scripts/record-hero.mjs`, `apps/docs-site/src/components/HeroDemo/`, `apps/docs-site/src/pages/__recorder.tsx`, `img/hero-light.webp`, `img/hero-dark.webp`, `README.md`, `README.ko.md`, `scripts/check-hero-freshness.mjs`, `.github/workflows/pr-check.yml` (hero freshness step) | none | ~400 LoC + 2 binaries |
| 2 | **A2** — Landing hero redesign | `apps/docs-site/src/pages/index.tsx`, `apps/docs-site/src/components/{Hero,FeatureGrid,PickerGrid,GetStarted}/` | A1 (uses `<HeroDemo>`) | ~600 LoC |
| 3 | **B** — Sandbox infra + 7 example projects + picker docs embeds | `apps/docs-site/src/theme/ReactLiveScope/index.tsx`, `apps/docs-site/src/components/StackBlitzEmbed/`, `examples/{7 projects}/`, all 7 picker docs (en+ko) | none | ~1200 LoC across many files |
| 4 | **C** — Playground enhancement | `apps/docs-site/src/components/Playground/`, `apps/docs-site/src/pages/playground.mdx` | none (can reuse A1 patterns if merged) | ~500 LoC |
| 5 | **D** — Comparison page (en+ko) | `apps/docs-site/docs/comparison.md`, `apps/docs-site/i18n/ko/.../comparison.md`, `apps/docs-site/sidebars.ts` | none | ~300 LoC |

Merge order:
1. A1 first (produces the `<HeroDemo>` that A2 depends on)
2. A2 + B + C + D in parallel (no dependencies)

Each PR is independently shippable. If the team wants to pause after any PR, the work to date stays useful.

## Success criteria

Per-deliverable, all measurable:

- **A.1 — README hero WebP**
  - [ ] Both files exist in `img/`
  - [ ] Each ≤ 250 KB
  - [ ] GitHub README preview renders them inline (manual verify on the PR)
  - [ ] `<picture>` switches between light/dark when GitHub theme changes
- **A.2 — `<HeroDemo>`**
  - [ ] Lazy-loaded (network tab shows separate chunk)
  - [ ] Docs-site landing Lighthouse Performance ≥ pre-PR-A2 baseline minus 5 (baseline captured on the main branch immediately before PR-A2 work, recorded in PR description)
  - [ ] Cycles through all 7 pickers without console errors
  - [ ] Pauses on hover, resumes on leave
  - [ ] `prefers-reduced-motion: reduce` freezes autoplay
- **B — Sandbox infra**
  - [ ] `ReactLiveScope` exposes all 7 pickers + 3 hooks + `DateFnsAdapter`
  - [ ] At least one inline `live` code block on each picker docs page works
  - [ ] At least one `<StackBlitzEmbed>` on each picker docs page loads its iframe
  - [ ] All 7 example projects pass `pnpm typecheck`
  - [ ] All 7 example StackBlitz URLs return HTTP 200 (validated by `scripts/check-stackblitz-urls.mjs`)
  - [ ] `examples/stackblitz-rc/` removed
- **C — Playground**
  - [ ] Picker selector switches between all 7
  - [ ] classNames edits apply live
  - [ ] Locale + timezone toggles render correctly
  - [ ] "Open in StackBlitz" button spawns a working sandbox
- **D — Comparison page**
  - [ ] Page exists in en + ko, linked from sidebar
  - [ ] Feature matrix includes all 7 listed libraries
  - [ ] Bundle SVG chart present, with measurement date string within 90 days of HEAD
  - [ ] "When NOT to use Kalyx" section present
- **Global**
  - [ ] `@kalyx/react` bundle unchanged (16 KB ceiling intact)
  - [ ] All new docs-site pages pass axe (no critical/serious) — same bar as CLAUDE.md §7 component standard
  - [ ] All new docs-site pages keyboard-navigable

## Testing strategy

**Per PR:**
- TypeScript checks pass on `apps/docs-site` and all `examples/*`
- New components have at least one render-smoke test (`@testing-library/react` + Vitest)
- `<StackBlitzEmbed>` rendered iframe presence verified with Playwright
- Docs-site builds successfully (`pnpm --filter docs-site build`)

**CI additions:**
- `scripts/check-hero-freshness.mjs` runs in `pr-check.yml`, fails if hero WebP > 90 days old (warning, not blocker, for the first 30 days after merge)
- `scripts/check-stackblitz-urls.mjs` runs nightly via a new workflow step in `e2e-and-docs.yml`, opens an issue if any URL 404s
- `scripts/check-comparison-freshness.mjs` lints the "Last measured" date string in `docs/comparison.md`, warns at 90 days, fails at 180

**Manual review on PR:**
- WebP visual quality
- HeroDemo cycle timing feel
- Comparison feature matrix accuracy (each row's claims verified against that library's v-latest docs)
- Landing page on mobile (iPhone SE width)

**Coverage:** ≥ 80 % for new `apps/docs-site/src/components/*` (consistent with library testing standard, lower than 100% because UI assembly code).

## Risks & mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| StackBlitz URL breaks on `examples/` file rename | Med | High (broken embeds) | Convention: stable paths in `examples/<id>/src/App.tsx`. Add `scripts/check-stackblitz-urls.mjs` nightly. |
| Comparison page bundle numbers go stale | High | Med (misleading) | "Last measured" date + 90-day lint. Note: numbers are illustrative; doc reviewers must re-measure before each major update. |
| Hero WebP capture environment depends on local Playwright + cwebp | Med | Low (annoying but localized) | Script is local-only; CI verifies output. Include `cwebp` install instructions in PR-A1 description. |
| Landing redesign breaks SEO (meta tags, og:image) | Low | High (search ranking) | Explicitly preserve all `<head>` tags; capture a static `og:image` from `<HeroDemo>` frame. PR-A2 checklist item. |
| `<HeroDemo>` bloats docs-site landing first paint | Med | Med (Lighthouse) | `React.lazy()` + `Suspense` fallback (skeleton). Lighthouse delta ≤ 5 = success criterion. |
| StackBlitz iframes slow page load on slow connections | Low | Low | `loading="lazy"` on all iframes. |
| Korean comparison page diverges from English over time | Med | Low | Add `scripts/check-comparison-parity.mjs` that compares row/column counts and warns on drift. |

## Out of scope (deferred)

- **Track 2** — Formik / Zod / MUI / Chakra / Astro / Remix recipes; react-datepicker → kalyx codemod (jscodeshift)
- **Track 3** — `ROADMAP.md`, GitHub Discussions setup, good-first-issue queue, v1.0.0 release blog post, showcase page
- **Track 4** — RTL mode, holiday plugin, virtualized year/month grid, DevTools panel, additional adapter packages

Each gets its own brainstorm cycle and spec when it begins.

## Open questions

None currently. All design decisions are locked in per the brainstorm session:
1. Hero story: "seven primitives, one API" (all 7 pickers tour)
2. Comparison page: static feature matrix + bundle bar chart (no side-by-side code)
3. Sandbox: hybrid (Docusaurus live blocks for inline; StackBlitz iframes for multi-file)
4. Effort scope: Full (5 PRs)

## Reconciliation with current state (2026-06-09, post-brainstorm)

After the brainstorm was approved, a closer read of `apps/docs-site/src/pages/index.tsx`, `playground.mdx`, `src/theme/ReactLiveScope/index.tsx`, and the per-picker docs pages revealed that several pieces this spec proposed already exist. The deltas below replace the original PR breakdown.

**Already done (no work needed):**
- `ReactLiveScope/index.tsx` already exposes all 7 pickers + 3 hooks + `DateFnsAdapter` to inline live blocks. Sub-deliverable B.1 is complete; no change required.
- `src/pages/index.tsx` already has the proposed landing structure: `Hero` (2-column grid: copy left, media right), `Features` (6 cards), `Compare` (10-row feature matrix table vs react-datepicker / react-day-picker / Ark UI / React Aria), `FinalCta` (mascot + CTAs). Sub-deliverable E ("Landing redesign") collapses into just **swapping the static `<img>` in `Hero` for `<HeroDemo />`**.
- Each picker docs page (`docs/components/{datepicker,rangepicker,…}.md`) already contains a `tsx` static snippet plus a `jsx live` editable block. Per-picker live-block coverage is already there.
- `playground.mdx` already renders 8 tabs (7 pickers + a "Timezone demo" tab), each with a full live-editable example. The proposed picker selector and timezone toggle are essentially already there. Sub-deliverable C's real delta is much smaller than originally scoped.
- Static "Open in StackBlitz / Open in CodeSandbox" links already exist on `playground.mdx` (pointing at the docs-site tree).
- The landing `Compare` section already includes a Bundle (gzip) row covering 5 libraries.

**Real remaining delta per sub-deliverable:**

| Original | Reconciled delta |
|---|---|
| **A.1** — Hero WebP | Unchanged. Static JPEG (`img/kalyx-hero.jpeg`) → animated WebP (light + dark) required. |
| **A.2** — `<HeroDemo>` component | Unchanged. Build the live React component for the docs-site landing. |
| **E** — Landing redesign | **Collapses into a 1-line swap** inside `Hero` in `index.tsx`: replace `<img className={styles.heroImage} … />` with `<HeroDemo />` (lazy-loaded). Preserve all SEO meta tags. Update og:image to a captured HeroDemo frame. |
| **B** — Sandbox infra | `ReactLiveScope` is already done. Real work: build `<StackBlitzEmbed>` component, add 7 example projects under `examples/`, embed them on each picker docs page (alongside existing live blocks, **not replacing**), nightly URL check script, and remove stale `examples/stackblitz-rc/`. |
| **C** — Playground enhancement | Real delta is small: (a) a classNames live editor sidebar (the existing playground edits the whole code block — a part-by-part editor is genuinely new); (b) a locale toggle (timezone is already a tab; locale isn't); (c) make the "Open in StackBlitz" link seed a sandbox with the **current playground state** (today it's a static link). Consider whether (a)+(b) are worth the complexity given how rich the playground already is — implementation plan may scope these down further or split into a separate PR. |
| **D** — `/docs/comparison` page | Mostly unchanged. The landing has an inline 10-row table covering 4 competitors; this spec creates a deeper **dedicated** page with: extended matrix (add MUI X + mantine + ark-ui), inline SVG bundle bar chart, "When NOT to use Kalyx" honesty paragraph, freshness lint, en + ko. The landing table stays; the dedicated page is deeper. The landing's "How Kalyx compares" section gains a "Full comparison →" link to it. |

**Updated PR sizing:**

| # | PR | Original LoC | Reconciled LoC | Notes |
|---|---|---|---|---|
| 1 | **A1** Hero recorder + WebP + `<HeroDemo>` | ~400 | ~400 | unchanged |
| 2 | **A2** Landing hero swap (not full redesign) | ~600 | **~50** | collapses to a swap + og:image script |
| 3 | **B** StackBlitzEmbed + 7 examples + picker docs embeds | ~1200 | ~1000 | ReactLiveScope already done; rest unchanged |
| 4 | **C** Playground enhancement | ~500 | **~200 or skip** | revisit during planning; may defer or split |
| 5 | **D** Comparison page | ~300 | ~400 | grows slightly (more libs, bundle chart, honesty section) |

**Decision impact:** Success criteria stay the same. Out-of-scope list stays the same. The brainstorm conclusions (hero story, sandbox hybrid, static matrix + bundle graph, full scope) all stand.

## References

- Existing scaffolding leveraged:
  - `apps/docs-site/src/pages/playground.mdx` (extended in PR-C)
  - `apps/docs-site/src/theme/ReactLiveScope` (extended in PR-B)
  - `@docusaurus/theme-live-codeblock` already installed
  - Tailwind Play CDN already loaded in `docusaurus.config.ts` (recipes work out of the box)
- New deps:
  - `@stackblitz/sdk` (docs-site only, for `/playground` "Open in StackBlitz")
  - `cwebp` (system tool, install instructions in PR-A1)
  - Playwright (already a dev dep)
- CLAUDE.md sections referenced: §1 (mission), §3 (architecture principles), §4 (file structure), §14 (current initiative)
