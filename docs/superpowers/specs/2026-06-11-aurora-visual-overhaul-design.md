# Aurora Visual Overhaul — Design Spec

**Date**: 2026-06-11
**Status**: Brainstorming complete · ready for implementation plan
**Scope**: docs-site (Docusaurus public docs), README set, hero images
**Out of scope**: apps/docs (deprecated internal Next.js demo — keep as-is)
**Library code (`packages/core`, `packages/react`)**: not touched. Zero-CSS API stays.

---

## 1. Problem

Three reported screenshots ([live preview in dark mode at docs-site](https://kalyx-docs-site.vercel.app)) showed a Calendar / DateTimePicker / MonthPicker that look unpolished — visible grid lines, cramped MonthPicker, harsh contrast on the indigo selection.

Root cause (verified by reading `apps/docs-site/src/css/custom.css` and `HeroDemo.module.css`):

1. **Grid hairlines** — HeroDemo uses `:global([role='grid'])` and never resets Docusaurus Infima's default `table th, td { border: 1px solid }`. The `.kx-live-*` system patched this locally (issue #35) but the hero never picked it up.
2. **MonthPicker cramped** — HeroDemo renders `<MonthPicker.Grid />` raw without the `.kx-live-month-grid` 3-column rule, so the underlying `<table>` falls through to a single horizontal row.
3. **DateTimePicker columns** — inline `style={{ display: 'flex', gap: 8 }}` with no width hint, so hour/minute columns are jammed together.
4. **Dark mode harshness** — solid `#000000`-ish background + sharp solid-colored selections without breathing room read as "cheap" against polished references (react-calendar, react-native-calendars).

In short: it's *two CSS systems that diverged* (`.kx-live-*` got polished via #35, HeroDemo and a few other surfaces didn't), not a fundamental design failure. The fix is **unify around one Aurora token system + apply a real polish pass**, not a ground-up rebuild.

---

## 2. Goals & Non-goals

### Goals
- Pick a single visual direction (Aurora — brand-violet polished) and apply it to every docs-site surface that renders a Kalyx picker.
- Replace the divergent `:global([role='grid'])` selectors in `HeroDemo.module.css` with the same `.kx-live-*` classes used by every other live example.
- Fix the three concrete visual bugs (grid hairlines, MonthPicker layout, DateTimePicker spacing) by closing the styling-system gap, not by patching one site at a time.
- Refresh the competitive comparison (`comparison.md`) with two libraries the user named (react-calendar, react-native-calendars) and add GitHub stars + npm weekly downloads columns.
- Regenerate hero images (`img/hero-light.webp`, `img/hero-dark.webp`) so the README first-impression reflects the new system.

### Non-goals
- No changes to the public library API (`@kalyx/react`, `@kalyx/core`). Zero-CSS guarantee stays. classNames prop unchanged.
- No bundle-size impact on the library (~15.63 KB ESM unchanged, 16 KB ceiling untouched).
- No `apps/docs` rework. It's not deployed and adding it triples the scope for zero user impact.
- No new design-system page or `.kx-aurora-*` parallel class system. We *upgrade* `.kx-live-*` in place.

---

## 3. Decisions (from brainstorming)

| # | Decision | Rationale |
|---|---|---|
| 1 | **Visual direction: B. Aurora** — refined brand violet, no grid lines, primary-glow on selection, rings on today | Chosen over react-calendar clone (A) and Editorial (C). Keeps existing `#5b4fe1` brand identity, modern shadcn/Linear feel, polished light + dark. |
| 2 | **Scope: docs-site + README** (apps/docs excluded) | apps/docs isn't deployed — only docs-site is on Vercel. Excluding apps/docs keeps the change surface area focused. |
| 3 | **Strategy: unified tokens + polish** (not a ground-up rebuild) | The "ugly" screenshots trace to CSS leaks + style-system divergence. Unifying `.kx-live-*` tokens and applying them to HeroDemo solves the symptoms by fixing the cause. |
| 4 | **Hero images: regenerate** via `recorder.tsx` once HeroDemo picks up the new classes | README's first impression is the biggest marketing lever. The recorder is already wired in. |
| 5 | **Glow strength**: `0 3px 12px /32` (between v1-strong and v2-soft) | User feedback: v1 too strong, v2 too soft. v3 middle picked. |
| 6 | **TimePicker option**: `padding: 6px 12px` + `margin-block: 1px` | User wanted breathing between options but full button height retained. |
| 7 | **RangePicker shape**: middle cells full 8px radius (primary-weak); start cell left-only radius; end cell right-only radius | start/end anchor visually to the band; middle cells read as pills inside a soft band. |
| 8 | **Grid columns**: `grid-template-columns: repeat(7, var(--kx-cell))` (not `1fr`) | Fixes weekday ↔ day vertical misalignment caused by 32px buttons sitting in `1fr` columns wider than 32px. |
| 9 | **Picker card width**: `width: fit-content` | Card hugs the 224px (7×32) calendar grid + 28px padding = 252px. Eliminates the head/arrow overhang the user spotted. |

---

## 4. Aurora visual system (final values)

### 4.1 Tokens

All tokens live in `apps/docs-site/src/css/custom.css`. They replace the existing `--kx-ex-*` block.

```css
:root {
  /* Aurora — light */
  --kx-bg:            #ffffff;
  --kx-bg-quiet:      #fafafa;
  --kx-fg:            #18181b;
  --kx-fg-muted:      #71717a;
  --kx-fg-subtle:     #a1a1aa;
  --kx-border:        rgba(91, 79, 225, 0.10);
  --kx-primary:       #5b4fe1;
  --kx-primary-fg:    #ffffff;
  --kx-primary-weak:  rgba(91, 79, 225, 0.12);
  --kx-primary-hover: rgba(91, 79, 225, 0.06);
  --kx-glow:          0 3px 12px rgba(91, 79, 225, 0.32);
  --kx-shadow-card:   0 8px 24px rgba(91, 79, 225, 0.06), 0 1px 2px rgba(0,0,0,0.04);
  --kx-radius-cell:   8px;
  --kx-radius-card:   14px;
  --kx-radius-input:  8px;
  --kx-cell:          32px;
}

[data-theme='dark'] {
  --kx-bg:            #111117;
  --kx-bg-quiet:      #0a0a0f;
  --kx-fg:            #f4f4f5;
  --kx-fg-muted:      #a1a1aa;
  --kx-fg-subtle:     #71717a;
  --kx-border:        rgba(255, 255, 255, 0.08);
  --kx-primary:       #8b80ff;
  --kx-primary-fg:    #0a0a0f;
  --kx-primary-weak:  rgba(139, 128, 255, 0.18);
  --kx-primary-hover: rgba(139, 128, 255, 0.12);
  --kx-glow:          0 3px 12px rgba(139, 128, 255, 0.32);
  --kx-shadow-card:   0 12px 30px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255,255,255,0.02);
}
```

### 4.2 Surface primitives

```css
/* Picker card — hugs content */
.kx-live-popover {
  width: fit-content;            /* was: 280px hardcoded — see issue #35 */
  padding: 14px;
  border: 1px solid var(--kx-border);
  border-radius: var(--kx-radius-card);
  background: var(--kx-bg);
  box-shadow: var(--kx-shadow-card);
  margin-top: 6px;
  z-index: 50;
}

.kx-live-popover--split { display: flex; gap: 12px; align-items: stretch; }

/* Header */
.kx-live-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.kx-live-title  { flex: 1; text-align: center; font-weight: 600; font-size: 13.5px; padding: 4px 8px; border-radius: 6px; }
.kx-live-nav    { width: 26px; height: 26px; display: inline-flex; align-items: center; justify-content: center; border-radius: 6px; background: transparent; color: var(--kx-fg-muted); }
.kx-live-nav:hover, .kx-live-title:hover { background: var(--kx-primary-hover); color: var(--kx-primary); }
```

### 4.3 Calendar grid

```css
.kx-live-grid {
  display: grid;
  grid-template-columns: repeat(7, var(--kx-cell));  /* was: width:100% on table */
  gap: 0;                                            /* range continuity */
}

.kx-live-weekday {
  width: var(--kx-cell);
  text-align: center;
  font-size: 10px;
  padding: 6px 0 8px;                                /* deliberate header rhythm */
  color: var(--kx-fg-subtle);
  font-weight: 500;
  letter-spacing: 0.04em;
}

.kx-live-cell { padding: 0; }                        /* td reset */

.kx-live-day, .kx-live-day-range {
  width: var(--kx-cell);
  height: var(--kx-cell);
  display: flex; align-items: center; justify-content: center;
  border: 0;
  border-radius: var(--kx-radius-cell);
  background: transparent;
  color: inherit;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition: background 120ms;
}

.kx-live-day:hover:not(.kx-live-day-selected) { background: var(--kx-primary-hover); }

.kx-live-day-today {
  box-shadow: inset 0 0 0 1.5px var(--kx-primary);
  color: var(--kx-primary);
  font-weight: 600;
}

.kx-live-day-selected, .kx-live-my-selected, .kx-live-option-selected {
  background: var(--kx-primary) !important;
  color: var(--kx-primary-fg) !important;
  font-weight: 600;
  box-shadow: var(--kx-glow);
}
```

### 4.4 Range visualization (key change)

```css
.kx-live-inrange {
  background: var(--kx-primary-weak) !important;
  border-radius: var(--kx-radius-cell) !important;   /* v7: middle cells fully rounded */
}

.kx-live-range-start {
  background: var(--kx-primary) !important;
  color: var(--kx-primary-fg) !important;
  box-shadow: var(--kx-glow);
  border-top-left-radius:    var(--kx-radius-cell) !important;
  border-bottom-left-radius: var(--kx-radius-cell) !important;
  border-top-right-radius:    0 !important;
  border-bottom-right-radius: 0 !important;
}

.kx-live-range-end {
  background: var(--kx-primary) !important;
  color: var(--kx-primary-fg) !important;
  box-shadow: var(--kx-glow);
  border-top-right-radius:    var(--kx-radius-cell) !important;
  border-bottom-right-radius: var(--kx-radius-cell) !important;
  border-top-left-radius:    0 !important;
  border-bottom-left-radius: 0 !important;
}

.kx-live-range-start.kx-live-range-end {
  border-radius: var(--kx-radius-cell) !important;   /* same-day range */
}
```

### 4.5 TimePicker

```css
.kx-live-list {
  max-height: 176px; overflow-y: auto;
  margin: 0; padding: 4px;
  list-style: none;
  border: 1px solid var(--kx-border);
  border-radius: 10px;
  background: var(--kx-bg);
  min-width: 56px;
}

.kx-live-option {
  padding: 6px 12px;                                 /* full height retained */
  margin-block: 1px;                                 /* 1px breathing between options */
  border-radius: 6px;
  text-align: center;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  color: inherit;
  list-style: none;
}
.kx-live-option:hover { background: var(--kx-primary-hover); }
```

### 4.6 MonthGrid / YearGrid

```css
.kx-live-month-grid, .kx-live-year-grid {
  display: grid;
  /* 224 - 2×6 gap = 212, /3 ≈ 70.67 — matches calendar grid width exactly */
  grid-template-columns: repeat(3, calc((7 * var(--kx-cell) - 2 * 6px) / 3));
  gap: 6px;
  padding: 4px 0;
}

/* React row wrappers (ARIA) must not become grid items */
.kx-live-month-grid > [role='row'],
.kx-live-year-grid > [role='row'] { display: contents !important; }

.kx-live-my-cell {
  padding: 10px 8px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: inherit;
  cursor: pointer;
}
.kx-live-my-cell:hover:not(.kx-live-my-selected) { background: var(--kx-primary-hover); }
.kx-live-my-current { box-shadow: inset 0 0 0 1.5px var(--kx-primary); color: var(--kx-primary); }
```

### 4.7 Global Infima table reset (root fix for grid hairlines)

```css
/* Infima injects `table th, table td { border: 1px solid }` (no `.markdown` prefix),
 * which leaks into every Kalyx grid that renders as <table>. Currently patched per-
 * surface (.kx-live-grid, .kx-tw-grid). Add a global reset for any [role='grid']
 * <table> so HeroDemo, future surfaces, and any consumer page is protected. */
[data-theme] [role='grid'] th,
[data-theme] [role='grid'] td {
  border: 0;
  padding: 0;
}
```

---

## 5. Component mapping (file → change)

### 5.1 Aurora tokens & live-example styles
**File**: `apps/docs-site/src/css/custom.css`
- Replace `--kx-ex-*` token block with the values in §4.1.
- Update `.kx-live-popover` (width: fit-content), `.kx-live-grid` (columns), `.kx-live-weekday` (padding 6 0 8, width), `.kx-live-day*` (32 × 32, full radius), `.kx-live-inrange`, `.kx-live-range-start`, `.kx-live-range-end`, `.kx-live-option` (padding + margin), `.kx-live-month-grid`, `.kx-live-year-grid`, `.kx-live-my-*` to match §4.
- Add the global Infima reset in §4.7.
- Keep existing comments referencing issue #35 — they explain the historical context for the table-border guards.

### 5.2 HeroDemo (largest visible change)
**Files**:
- `apps/docs-site/src/components/HeroDemo/HeroDemo.module.css` — delete `:global([role='grid'])` block and the gridcell/listbox/thead styles. The new tokens make them redundant.
- `apps/docs-site/src/components/HeroDemo/index.tsx` — pass `classNames` to every picker so each frame renders with the same `.kx-live-*` system used elsewhere:
  - `<DatePicker.Calendar classNames={{ grid: 'kx-live-grid', /* ... */ }} />`
  - Add the missing `<MonthPicker.Grid classNames={{ root: 'kx-live-month-grid', cell: 'kx-live-my-cell', /* ... */ }} />`
  - Same for YearPicker, WeekPicker, TimePicker, DateTimePicker (each gets the right sub-component classNames).
  - Remove inline `style={{ display: 'flex', gap: 8 }}` on time/datetime layouts — replace with a small CSS module class (e.g., `.timeRow`) that uses gap 6px.
- Keep the cycle hint and frame transition logic in `HeroDemo` — they're orthogonal to styling.

### 5.3 Playground page
**Files**:
- `apps/docs-site/src/components/Playground/PreviewPanel.tsx` — replace `style={{ display: 'flex', gap: 8 }}` inline with classes referencing the same Aurora tokens.
- `apps/docs-site/src/components/Playground/Playground.module.css` — refresh card surface to use `--kx-bg`, `--kx-border`, `--kx-shadow-card`.

### 5.4 PickerGrid (landing)
**File**: `apps/docs-site/src/components/PickerGrid/PickerGrid.module.css`
- Card backgrounds, borders, shadows to Aurora tokens.

### 5.5 Hero images
**Process**:
1. Land 5.1 + 5.2 first (HeroDemo now uses Aurora classes).
2. `pnpm --filter docs-site dev` → open `/recorder?frame=0…6` for both light and dark themes.
3. Capture each frame with the existing recorder tooling, encode to webp.
4. Overwrite `img/hero-light.webp` and `img/hero-dark.webp`.
5. Verify README renders the new images (light + dark via `<picture>` `prefers-color-scheme`).

### 5.6 Competitive analysis (Track A)
**File**: `apps/docs-site/docs/comparison.md`
- **Add rows** to the feature matrix: `react-calendar` (wojtekmaj), `react-native-calendars` (wix).
- **Add columns**: GitHub stars, npm weekly downloads.
- **Fetch fresh values** from npmjs.com and github.com — do not fill from memory. The current "_Last measured 2026-06-11_" stamp must be replaced with the actual fetch date.
- For each new library: note one-line "when to use" (react-calendar = simple read-only calendar; react-native-calendars = mobile-first React Native, web shim partial).
- Update the SVG bar chart to include the two new libraries.

### 5.7 README set
**Files**: `README.md`, `README.ko.md`, `packages/react/README.md`, `packages/core/README.md`
- Hero image references already point to `img/hero-{light,dark}.webp` — no change needed once images are regenerated.
- "Why Kalyx" section: tighten copy in user voice (no "I'd recommend" / "you might want to" hedging — follow `feedback_user_voice_writing.md`).
- Link the refreshed comparison table.
- Bump the badge line if applicable (no version bump from this work).

---

## 6. PR breakdown

Four PRs, ordered by dependency. Each lands independently; the next one rebases on top.

| PR | Title | Files | Risk | Validation |
|---|---|---|---|---|
| **PR-1** | `feat(docs-site): Aurora tokens + .kx-live-* polish` | `custom.css` (tokens + live classes + Infima reset) | Medium — every docs page changes visually | docs-site build, e2e Playwright (chromium/firefox/webkit), manual: every recipe page, every component doc, both themes |
| **PR-2** | `feat(docs-site): HeroDemo Aurora classes + hero image regen` | `HeroDemo.module.css`, `HeroDemo/index.tsx`, `img/hero-{light,dark}.webp` | Low — depends on PR-1, isolated to landing | manual frame 0–6 light + dark, README rendering on GitHub |
| **PR-3** | `feat(docs-site): Playground + PickerGrid polish` | `Playground.module.css`, `PreviewPanel.tsx`, `PickerGrid.module.css` | Low | manual: `/playground` interactive, landing card grid |
| **PR-4** | `docs(comparison): add react-calendar, react-native-calendars + stars/downloads` | `comparison.md`, README hero/Why sections | Low — content only | spec → fetched values must match live npmjs.com / github.com on PR date |

PR-2 → PR-3 → PR-4 can in principle land in any order after PR-1, but PR-2 should ship together with the hero image swap to avoid a window where the README hero looks dated relative to the live docs.

---

## 7. Testing & verification

### Automated
- `pnpm typecheck` — TypeScript compiles. HeroDemo classNames refactor needs `ClassNames` types from `@kalyx/react` re-export verified.
- `pnpm test:run` — Vitest unit suite (462+ cases). No library code changes → expect green.
- `pnpm --filter docs-site build` — Docusaurus build must succeed (i18n, sidebars, MDX).
- `pnpm check-bundle` — library bundle unchanged; 16 KB ceiling untouched.
- Playwright e2e (`e2e-and-docs.yml`) — cross-browser regression on chromium/firefox/webkit. **Watch for selector regressions** in tests that target `.kx-live-*` (they shouldn't break since class names stay the same; values change).
- axe — every page that currently passes must still pass under both light and dark.

### Manual
- Every component doc page (`/docs/components/{datepicker,…,weekpicker}`) renders correctly in light + dark.
- Every recipe page (`/docs/recipes/{tailwind,shadcn,react-hook-form,testing}`) renders correctly. The Tailwind recipe uses Tailwind Play CDN — verify the `.tw-enable` reset still works.
- Landing page hero animates through all 7 frames without flicker.
- Playground PreviewPanel for all 7 picker types renders correctly.
- README on GitHub: hero image (light + dark) renders, comparison link works.
- Korean docs (`/ko/...`) inherit the same Aurora tokens (no per-locale CSS).

### Bundle / performance budget
- The library code is not touched. No bundle change expected.
- Docs-site bundle: CSS may grow slightly (new Infima reset, hero classNames in JSX), but shouldn't affect Lighthouse score materially. Verify against Vercel real (per `feedback_lighthouse_localhost_vs_vercel.md` — localhost simulate ≠ Vercel real, +/-10 points).

---

## 8. Risks & rollback

| Risk | Mitigation |
|---|---|
| `.kx-live-*` class API is consumed by recipe pages and reads as "internal API" — but external users may have copy-pasted | Class names stay identical. Only token values change. Anyone copying the recipe styles gets the new look automatically (probably what they'd want). |
| Infima global reset (§4.7) is broader than the current `:not()`-guarded rule | Limit reset to `[role='grid']` only — Markdown prose tables stay unaffected because they don't carry `role="grid"`. |
| HeroDemo refactor changes JSX structure → snapshot tests | If any HeroDemo snapshot tests exist (`apps/docs-site/src/components/HeroDemo/__tests__/`), update them with the new className structure. |
| Hero image regeneration involves taking screenshots — non-deterministic | Use the existing `recorder.tsx` with `?frame=N` deterministic values (frozen dates in `sequence.ts`) so frames are byte-stable. |
| Light/dark token mismatch (e.g., contrast failure in dark) | Run axe over every page on both themes. The Aurora dark glow is the highest-risk single change — verify contrast ratio on `--kx-primary` (#8b80ff) against `--kx-bg` (#111117) is ≥ 4.5:1. |

Rollback strategy per PR:
- PR-1: revert single commit, all sites snap back to current style.
- PR-2: revert two files + restore prior hero webp (committed to git history).
- PR-3: independent, revertable.
- PR-4: content-only, easy revert.

---

## 9. Open questions

None blocking. All design decisions resolved during brainstorming. Implementation plan to follow via `writing-plans` skill.

---

## 10. Related

- Issue #35 — earlier live-example styling bug; this spec finishes what that PR started by unifying HeroDemo into the same system.
- `apps/docs-site/src/components/HeroDemo/sequence.ts` — frame sequence used by both HeroDemo and recorder; do not touch (frozen for byte-determinism).
- `feedback_user_voice_writing.md` — applies to README copy refresh in PR-4.
- `feedback_lighthouse_localhost_vs_vercel.md` — applies to performance verification.
- `feedback_avoid_brew_install_mid_session.md` — image encoding (webp) should use existing tooling, not new brew installs.

---

## Appendix: Aurora v1 → v7 iteration log

Captured for future reference. The visual companion screens (in `.superpowers/brainstorm/82824-1781157567/content/`) record each step:

- **v1** — initial Aurora draft: violet brand, light + dark, gridless calendar
- **v2** — toned-down glow (`0 2px 8px /22` from v1's `0 4px 18px /45 + ring`) + visible hover state baked into static mockup
- **v3** — TimePicker padding tightened (3px 10px + margin-block 1px), Range gap 0 (continuous band)
- **v4** — TimePicker height restored (padding back to 6×12, margin 1px kept); RangePicker middle cells get full 8px radius; weekday padding 6/0/8 for header rhythm
- **v5** — Range start = left-only radius, end = right-only radius (anchor visual); day width 100% for weekday alignment (turned out to overshoot)
- **v6** — `--kx-cell: 32px` and `grid-template-columns: repeat(7, var(--kx-cell))` so weekday columns and day cells are the same fixed width
- **v7** (final) — `picker { width: fit-content }` so the picker card hugs the 7×32 grid; head no longer overhangs the calendar; MonthGrid 3-column width = calendar width
