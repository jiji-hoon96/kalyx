# Aurora Visual Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify every docs-site surface that renders a Kalyx picker around the Aurora visual system (v7 from brainstorming), regenerate hero images, refresh competitive comparison.

**Architecture:** Single-source `.kx-live-*` token system in `custom.css` drives every surface (HeroDemo, Playground, PickerGrid, every live doc example). HeroDemo's bespoke `:global([role='grid'])` block is deleted and replaced with the same classNames every other example uses. Library code in `packages/core` and `packages/react` is not touched — the zero-CSS public API is preserved.

**Tech Stack:** Docusaurus 3, React 19, CSS modules + global custom.css, Playwright (e2e + recorder), pnpm workspaces.

**Spec:** `docs/superpowers/specs/2026-06-11-aurora-visual-overhaul-design.md` — read sections 4 (token values) and 5 (component mapping) before starting.

**Branching strategy:** PR-1 is the foundation; PR-2 and PR-3 depend on PR-1's tokens; PR-4 is content-only and independent. Recommended worktree layout (per the project's parallel-PR convention):

```
feat/aurora-tokens         ← PR-1 (must land first)
  └ feat/aurora-hero       ← PR-2 (after PR-1)
  └ feat/aurora-playground ← PR-3 (after PR-1, parallel with PR-2)
docs/aurora-comparison      ← PR-4 (independent, parallel from start)
```

---

## File Structure

### PR-1 — Aurora tokens & live-example styles
- **Modify:** `apps/docs-site/src/css/custom.css` — token block (lines 219–237), all `.kx-live-*` classes (lines 239–656), add global Infima `[role='grid']` reset.

### PR-2 — HeroDemo refactor + hero images
- **Modify:** `apps/docs-site/src/components/HeroDemo/HeroDemo.module.css` — delete `:global([role='grid'])` block, add a single `.timeRow` class.
- **Modify:** `apps/docs-site/src/components/HeroDemo/index.tsx` — pass `classNames` to every picker sub-component; remove inline `style` objects.
- **Modify:** `apps/docs-site/src/components/HeroDemo/__tests__/HeroDemo.test.tsx` — update any structural assertions if needed.
- **Regenerate:** `img/hero-light.webp`, `img/hero-dark.webp` via existing `scripts/record-hero.mjs` (Playwright).

### PR-3 — Playground + PickerGrid polish
- **Modify:** `apps/docs-site/src/components/Playground/PreviewPanel.tsx` — remove inline `style={{ display: 'flex', gap: 8 }}` from TimePicker and DateTimePicker previews; replace with `.kx-live-row` class.
- **Modify:** `apps/docs-site/src/components/Playground/Playground.module.css` — `.preview` border + background to Aurora tokens.
- **Modify:** `apps/docs-site/src/components/PickerGrid/PickerGrid.module.css` — `.card` border, background, hover to Aurora tokens.

### PR-4 — Comparison & README
- **Modify:** `apps/docs-site/docs/comparison.md` — add `react-calendar`, `react-native-calendars` rows; add GitHub stars + npm weekly columns; update SVG bar chart; refresh measurement date.
- **Modify:** `README.md`, `README.ko.md`, `packages/react/README.md`, `packages/core/README.md` — "Why Kalyx" section tightened, comparison link confirmed.

---

## PR-1 — Aurora tokens + .kx-live-* polish

### Task 1: Replace token block in custom.css

**Files:**
- Modify: `apps/docs-site/src/css/custom.css` (token block around lines 219–237)

- [ ] **Step 1.1: Locate the existing `--kx-ex-*` token block**

Open `apps/docs-site/src/css/custom.css`. Find the comment `/* Live example theme ... */` followed by `:root { --kx-ex-bg: ...; }`. This block also has a `[data-theme='dark'] { --kx-ex-primary-weak: ...; }` override.

- [ ] **Step 1.2: Replace the token block with Aurora tokens**

Use Edit to replace the entire `:root { --kx-ex-* }` + `[data-theme='dark'] { --kx-ex-* }` block with:

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

  /* Back-compat aliases — keep until any third-party docs page referencing
   * the old names is updated. Safe to delete in a follow-up PR. */
  --kx-ex-bg:            var(--kx-bg);
  --kx-ex-border:        var(--kx-border);
  --kx-ex-muted:         var(--kx-fg-muted);
  --kx-ex-primary:       var(--kx-primary);
  --kx-ex-primary-weak:  var(--kx-primary-weak);
  --kx-ex-primary-hover: var(--kx-primary-hover);
  --kx-ex-ring:          rgba(91, 79, 225, 0.22);
  --kx-ex-shadow:        var(--kx-shadow-card);
  --kx-ex-cell:          var(--kx-cell);
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
  --kx-shadow-card:   0 12px 30px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.02);

  --kx-ex-primary-weak:  var(--kx-primary-weak);
  --kx-ex-primary-hover: var(--kx-primary-hover);
  --kx-ex-ring:          rgba(139, 128, 255, 0.28);
  --kx-ex-shadow:        var(--kx-shadow-card);
}
```

- [ ] **Step 1.3: Verify the file parses**

Run: `pnpm --filter docs-site build`
Expected: build succeeds (no CSS parse errors). Visual changes will be incomplete at this point — that's expected, more classes update in next tasks.

---

### Task 2: Update calendar grid classes

**Files:**
- Modify: `apps/docs-site/src/css/custom.css` — `.kx-live-popover`, `.kx-live-header`, `.kx-live-title`, `.kx-live-nav`, `.kx-live-grid`, `.kx-live-weekday`, `.kx-live-cell`, `.kx-live-day`, `.kx-live-day-selected`, `.kx-live-day-today`, `.kx-live-outside`, `.kx-live-disabled`

- [ ] **Step 2.1: Update `.kx-live-popover` width**

Find the current `.kx-live-popover` block (contains the `width: 280px` comment about issue #35). Replace with:

```css
.kx-live-popover {
  padding: 14px;
  border: 1px solid var(--kx-border);
  border-radius: var(--kx-radius-card);
  background: var(--kx-bg);
  box-shadow: var(--kx-shadow-card);
  margin-top: 6px;
  z-index: 50;
  /* width: fit-content — hug the 7×var(--kx-cell) calendar grid. Replaces
   * the hardcoded 280px from issue #35 now that header and grid are the
   * same width. See spec 2026-06-11 §4.2. */
  width: fit-content;
}

.kx-live-popover--split {
  display: flex;
  gap: 12px;
  align-items: stretch;
  width: fit-content;
}
```

- [ ] **Step 2.2: Update `.kx-live-header` + nav + title**

Replace the existing `.kx-live-header`, `.kx-live-title`, `.kx-live-nav` blocks with:

```css
.kx-live-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
  gap: 4px;
}

.kx-live-title {
  font-weight: 600;
  font-size: 13.5px;
  flex: 1;
  text-align: center;
  background: transparent;
  border: 0;
  color: inherit;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 120ms, color 120ms;
}

.kx-live-title:hover {
  background: var(--kx-primary-hover);
  color: var(--kx-primary);
}

span.kx-live-title,
.kx-live-title[aria-live]:not(button) {
  cursor: default;
}

.kx-live-nav {
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--kx-fg-muted);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 120ms, color 120ms;
}

.kx-live-nav:hover {
  background: var(--kx-primary-hover);
  color: var(--kx-primary);
}
```

- [ ] **Step 2.3: Update grid + weekday + cell**

Replace `.kx-live-grid`, `.kx-live-weekday`, `.kx-live-cell`, `.kx-live-outside`, `.kx-live-disabled` with:

```css
.kx-live-grid {
  display: grid;
  grid-template-columns: repeat(7, var(--kx-cell));
  gap: 0;
  font-size: 13px;
}

.kx-live-weekday {
  width: var(--kx-cell);
  font-size: 10px;
  font-weight: 500;
  color: var(--kx-fg-subtle);
  text-align: center;
  padding: 6px 0 8px;
  letter-spacing: 0.04em;
}

.kx-live-cell {
  padding: 0;
  text-align: center;
  vertical-align: middle;
  height: var(--kx-cell);
}

.kx-live-outside {
  color: var(--kx-fg-subtle);
  opacity: 0.5;
}

.kx-live-disabled {
  opacity: 0.3;
  pointer-events: none;
  text-decoration: line-through;
}
```

- [ ] **Step 2.4: Update `.kx-live-day` + selected + today**

Replace single-date day classes with:

```css
.kx-live-day {
  width: var(--kx-cell);
  height: var(--kx-cell);
  padding: 0;
  border: 0;
  border-radius: var(--kx-radius-cell);
  background: transparent;
  color: inherit;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition: background 120ms;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.kx-live-day:hover:not(:disabled):not(.kx-live-day-selected) {
  background: var(--kx-primary-hover);
}

.kx-live-day-selected {
  background: var(--kx-primary) !important;
  color: var(--kx-primary-fg) !important;
  font-weight: 600;
  box-shadow: var(--kx-glow);
}

.kx-live-day-today {
  box-shadow: inset 0 0 0 1.5px var(--kx-primary);
  color: var(--kx-primary);
  font-weight: 600;
}

.kx-live-day-today.kx-live-day-selected {
  /* selected wins; glow replaces the ring */
  box-shadow: var(--kx-glow);
  color: var(--kx-primary-fg);
}
```

- [ ] **Step 2.5: Verify the file still parses**

Run: `pnpm --filter docs-site build`
Expected: build succeeds. Calendar in component docs (e.g., `/docs/components/datepicker`) should now show clean 32×32 cells with no grid hairlines.

---

### Task 3: Update range visualization

**Files:**
- Modify: `apps/docs-site/src/css/custom.css` — `.kx-live-day-range`, `.kx-live-inrange`, `.kx-live-range-start`, `.kx-live-range-end`

- [ ] **Step 3.1: Replace range classes**

Find the existing range block (starts with comment "Range visual"). Replace with:

```css
.kx-live-day-range {
  width: var(--kx-cell);
  height: var(--kx-cell);
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition: background 120ms;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--kx-radius-cell);
}

.kx-live-day-range:hover:not(:disabled):not(.kx-live-range-start):not(.kx-live-range-end):not(.kx-live-inrange) {
  background: var(--kx-primary-hover);
}

/* In-range middle cells — fully rounded with primary-weak background.
 * Reads as a row of soft pills inside the band, per v7 spec. */
.kx-live-inrange {
  background: var(--kx-primary-weak) !important;
  border-radius: var(--kx-radius-cell) !important;
}

/* Start cell — left side rounded, right side flat (anchors to band). */
.kx-live-range-start {
  background: var(--kx-primary) !important;
  color: var(--kx-primary-fg) !important;
  font-weight: 600;
  box-shadow: var(--kx-glow);
  border-top-left-radius: var(--kx-radius-cell) !important;
  border-bottom-left-radius: var(--kx-radius-cell) !important;
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}

/* End cell — right side rounded, left flat. */
.kx-live-range-end {
  background: var(--kx-primary) !important;
  color: var(--kx-primary-fg) !important;
  font-weight: 600;
  box-shadow: var(--kx-glow);
  border-top-right-radius: var(--kx-radius-cell) !important;
  border-bottom-right-radius: var(--kx-radius-cell) !important;
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
}

/* Single-day range — start === end → full radius. */
.kx-live-range-start.kx-live-range-end {
  border-radius: var(--kx-radius-cell) !important;
}
```

- [ ] **Step 3.2: Visual check — RangePicker doc**

Run: `pnpm --filter docs-site start` (dev mode)
Open: `http://localhost:3000/docs/components/rangepicker`
Expected: Range visualization shows: left cell with left-only radius + glow, middle cells each as small rounded pills with primary-weak bg, right cell with right-only radius + glow. No vertical hairline gaps between in-range cells.

---

### Task 4: Update TimePicker option classes

**Files:**
- Modify: `apps/docs-site/src/css/custom.css` — `.kx-live-list`, `.kx-live-option`, `.kx-live-ampm`, `.kx-live-ampm-btn`

- [ ] **Step 4.1: Replace listbox + option blocks**

```css
.kx-live-list {
  max-height: 176px;
  overflow-y: auto;
  margin: 0;
  padding: 4px;
  list-style: none;
  border: 1px solid var(--kx-border);
  border-radius: 10px;
  background: var(--kx-bg);
  min-width: 56px;
  scrollbar-width: thin;
  display: inline-block;
  vertical-align: top;
}

.kx-live-option {
  padding: 6px 12px;
  margin-block: 1px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  text-align: center;
  list-style: none;
  color: inherit;
  font-variant-numeric: tabular-nums;
}

.kx-live-option:hover {
  background: var(--kx-primary-hover);
}

.kx-live-option-selected {
  background: var(--kx-primary) !important;
  color: var(--kx-primary-fg) !important;
  font-weight: 600;
  box-shadow: var(--kx-glow);
}

.kx-live-ampm {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.kx-live-ampm-btn {
  padding: 5px 12px;
  border: 1px solid var(--kx-border);
  background: var(--kx-bg);
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  color: inherit;
  min-width: 46px;
  font-weight: 500;
}

.kx-live-ampm-btn:hover:not(.kx-live-ampm-selected) {
  background: var(--kx-primary-hover);
}

.kx-live-ampm-selected {
  background: var(--kx-primary) !important;
  color: var(--kx-primary-fg) !important;
  border-color: var(--kx-primary) !important;
  box-shadow: var(--kx-glow);
}
```

- [ ] **Step 4.2: Visual check — TimePicker doc**

Open: `http://localhost:3000/docs/components/timepicker`
Expected: Hour/minute lists have ~30px option rows with 1px breathing between rows. Selected option has glow.

---

### Task 5: Update MonthGrid / YearGrid

**Files:**
- Modify: `apps/docs-site/src/css/custom.css` — `.kx-live-month-grid`, `.kx-live-year-grid`, `.kx-live-my-cell`, `.kx-live-my-selected`, `.kx-live-my-current`

- [ ] **Step 5.1: Replace grid + cell blocks**

```css
.kx-live-month-grid,
.kx-live-year-grid {
  display: grid;
  /* 7 × var(--kx-cell) - 2 × 6px gap, then /3 — matches calendar grid width
   * so MonthPicker and DatePicker line up to the pixel. */
  grid-template-columns: repeat(3, calc((7 * var(--kx-cell) - 2 * 6px) / 3));
  gap: 6px;
  padding: 4px 0;
}

/* ARIA row wrappers must not become grid items — they'd collapse 3 cells
 * into one each. `display: contents` lets the cells participate in the
 * outer grid directly while keeping the a11y tree intact. */
.kx-live-month-grid > [role='row'],
.kx-live-year-grid > [role='row'] {
  display: contents !important;
}

.kx-live-my-cell {
  padding: 10px 8px;
  border: 0;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: inherit;
  font-weight: 500;
  transition: background 120ms;
}

.kx-live-my-cell:hover:not(.kx-live-my-selected) {
  background: var(--kx-primary-hover);
}

.kx-live-my-selected {
  background: var(--kx-primary) !important;
  color: var(--kx-primary-fg) !important;
  font-weight: 600;
  box-shadow: var(--kx-glow);
}

.kx-live-my-current {
  box-shadow: inset 0 0 0 1.5px var(--kx-primary);
  color: var(--kx-primary);
}
```

- [ ] **Step 5.2: Visual check — MonthPicker / YearPicker**

Open: `http://localhost:3000/docs/components/monthpicker` and `/docs/components/yearpicker`
Expected: 3×4 grid (months) and 3×4 grid (years) with the same total width as the date calendar above. No horizontal-row layout. Selected month/year has glow.

---

### Task 6: Add global Infima `[role='grid']` reset

**Files:**
- Modify: `apps/docs-site/src/css/custom.css` — add a new top-level rule

- [ ] **Step 6.1: Locate the existing local fix**

Find the block of comments starting `/* Docusaurus's Infima theme also injects styles into table th, table td ...` followed by `.kx-live-grid th, .kx-live-grid td, .kx-tw-grid th, .kx-tw-grid td { border: 0; }`.

- [ ] **Step 6.2: Replace local fix with a global `[role='grid']` reset**

Replace the entire block (the comments + the `.kx-live-grid th, td` + `.kx-tw-grid th, td` rules) with:

```css
/* Global reset for any <table role="grid"> rendered by a Kalyx picker.
 *
 * Docusaurus's Infima injects `table th, table td { border: 1px solid;
 * padding: var(--ifm-table-cell-padding) }` directly (no `.markdown` prefix),
 * which leaks into every Kalyx calendar that renders as a <table>. This rule
 * scopes the reset to ARIA grids so prose tables in Markdown stay untouched.
 *
 * Replaces the per-surface guards (`.kx-live-grid th, td`, `.kx-tw-grid th,
 * td`) that lived here before. See spec 2026-06-11 §4.7 and issue #35. */
[data-theme] [role='grid'] th,
[data-theme] [role='grid'] td {
  border: 0;
  padding: 0;
}

[data-theme] [role='grid'] {
  border-collapse: collapse;
}
```

- [ ] **Step 6.3: Verify in-doc tables still render correctly**

Open: `http://localhost:3000/docs/comparison` (has a `<table>` for the feature matrix)
Expected: comparison table renders with Infima's normal borders + padding (no regression). Markdown tables on intro/migration pages also unaffected.

Open: `http://localhost:3000/` (landing — HeroDemo renders `<table role="grid">`)
Expected: even though HeroDemo is not yet refactored, the calendar table no longer shows hairlines between cells. (This is the first visible win of the global reset.)

---

### Task 7: Tailwind recipe regression check

**Files:**
- Modify: `apps/docs-site/src/css/custom.css` — `.tw-enable table th, td` rules

- [ ] **Step 7.1: Verify the Tailwind recipe still resets cells**

The Tailwind recipe pages use `.tw-enable` wrapper and don't carry `.kx-live-*` classes. After the global `[role='grid']` reset in Task 6, the `.tw-enable table th, td { border: 0 !important; padding: 0 !important }` block becomes mostly redundant, but `!important` ensures it still wins if Infima specificity changes.

Open: `http://localhost:3000/docs/recipes/tailwind`
Expected: Tailwind recipe live example renders correctly. No regression.

- [ ] **Step 7.2: Leave the `.tw-enable` block intact**

Do NOT delete the existing `.tw-enable table th, td` rules. They protect against Infima specificity drift across Docusaurus versions. Move on.

---

### Task 8: Run full PR-1 validation

**Files:** none

- [ ] **Step 8.1: Type check**

Run: `pnpm typecheck`
Expected: PASS. (No TypeScript changes in PR-1, so this is a sanity check.)

- [ ] **Step 8.2: Library unit tests**

Run: `pnpm test:run`
Expected: 462+ tests pass. Library code is untouched — failures would indicate accidental edits.

- [ ] **Step 8.3: docs-site build**

Run: `pnpm --filter docs-site build`
Expected: build succeeds, no CSS warnings about unknown selectors.

- [ ] **Step 8.4: Manual visual walkthrough**

Start dev server: `pnpm --filter docs-site start`

Open each URL in both `?theme=light` and `?theme=dark` (toggle from navbar):
- `/` — landing (HeroDemo still uses its own CSS; the cells should look cleaner thanks to the global reset, but selection styling is from `HeroDemo.module.css` until PR-2)
- `/docs/components/datepicker` — DatePicker live example
- `/docs/components/rangepicker` — RangePicker (range visual)
- `/docs/components/timepicker` — TimePicker (option lists)
- `/docs/components/monthpicker` — MonthPicker grid
- `/docs/components/yearpicker` — YearPicker grid
- `/docs/components/weekpicker` — WeekPicker (week-mark highlights)
- `/docs/components/datetimepicker` — DateTimePicker
- `/docs/recipes/tailwind` — Tailwind recipe
- `/docs/recipes/shadcn` — shadcn recipe
- `/docs/recipes/react-hook-form` — RHF recipe
- `/playground` — interactive picker selector

Expected: every live example reflects Aurora tokens. No grid hairlines. No layout breakage in the recipe pages (they use their own classNames, but they reference `--kx-*` variables for the surface).

- [ ] **Step 8.5: axe accessibility check**

In dev mode, install the axe DevTools browser extension and run on `/docs/components/datepicker` and `/docs/components/rangepicker` in both themes.
Expected: 0 violations (matches the pre-existing baseline).

Verify the dark mode contrast: `--kx-primary` (#8b80ff) on `--kx-bg` (#111117) should be ≥ 4.5:1. Use a contrast checker if needed.

- [ ] **Step 8.6: Commit PR-1**

```bash
git checkout -b feat/aurora-tokens
git add apps/docs-site/src/css/custom.css
git commit -m "$(cat <<'EOF'
feat(docs-site): Aurora tokens + .kx-live-* polish

Replaces the divergent --kx-ex-* token block with a unified Aurora
system (see docs/superpowers/specs/2026-06-11-aurora-visual-overhaul-
design.md §4). Brings every live example surface under one set of
variables: brand violet (#5b4fe1 light / #8b80ff dark), 32px cell,
8px radius, soft 0 3px 12px /32 glow on selection.

Behavioral changes visible across every live doc example:
- Picker card hugs the calendar grid (fit-content width), no more
  arrow overhang.
- Range visualization: middle cells get full 8px radius (primary-weak
  bg), start/end cells get one-side-only radius (anchor to band).
- TimePicker options keep their height but breathe 1px between rows.
- MonthGrid / YearGrid widths now match the calendar width to the pixel.
- Global [role='grid'] reset replaces the per-surface guards from
  issue #35 — fixes Infima table-border leak everywhere, including
  HeroDemo (which still uses its own CSS until PR-2).

Library code (@kalyx/core, @kalyx/react) is untouched. Bundle size
unchanged.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push -u origin feat/aurora-tokens
gh pr create --title "feat(docs-site): Aurora tokens + .kx-live-* polish" --body "$(cat <<'EOF'
## Summary
- Unified Aurora token system replacing --kx-ex-* (spec §4).
- All .kx-live-* classes upgraded: 32px cell, fit-content popover, range middle cells fully rounded, range start/end one-side rounded, TimePicker option breathing.
- MonthGrid / YearGrid widths match calendar grid.
- Global [role='grid'] reset closes the Infima table-border leak.

## Test plan
- [ ] pnpm typecheck
- [ ] pnpm test:run (462+ green)
- [ ] pnpm --filter docs-site build
- [ ] Manual walk through every /docs/components/* page in light + dark
- [ ] Manual walk through every /docs/recipes/* page
- [ ] axe DevTools on DatePicker + RangePicker pages (light + dark)
- [ ] Lighthouse check on Vercel real (per feedback_lighthouse_localhost_vs_vercel)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## PR-2 — HeroDemo refactor + hero image regen

**Branch off `feat/aurora-tokens` (or main once PR-1 lands).**

### Task 9: Replace HeroDemo CSS module

**Files:**
- Modify: `apps/docs-site/src/components/HeroDemo/HeroDemo.module.css`

- [ ] **Step 9.1: Locate the `:global([role='grid'])` block**

Open `HeroDemo.module.css`. Lines ~49–119 contain the `:global([role='grid'])`, `:global([role='gridcell'] button)`, `:global([role='listbox'])`, and `:global(thead th)` blocks.

- [ ] **Step 9.2: Replace the entire bespoke styling block**

Delete lines ~49–119 (everything from `/* Minimal styling for the headless kalyx pickers …` through the closing brace of the last `:global(thead th)` rule). Keep `.root`, `.frame`, `.frameActive`, `.label`, `.cycleHint` blocks intact (lines 1–47).

Add at the end of the file:

```css
/* Composite layout helpers — HeroDemo passes structural classNames into
 * each picker so the body uses the same Aurora .kx-live-* tokens as the
 * rest of the site. No selection styling lives here; it all comes from
 * apps/docs-site/src/css/custom.css. */
.timeRow {
  display: flex;
  gap: 6px;
  align-items: flex-start;
}

.dateTimeRow {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
```

- [ ] **Step 9.3: Verify build still works**

Run: `pnpm --filter docs-site build`
Expected: build succeeds. HeroDemo on `/` may now render unstyled (no classNames piped through yet) — that's the next task.

---

### Task 10: Pipe Aurora classNames through HeroDemo frames

**Files:**
- Modify: `apps/docs-site/src/components/HeroDemo/index.tsx`

- [ ] **Step 10.1: Update imports**

In `apps/docs-site/src/components/HeroDemo/index.tsx`, the existing import line is:

```tsx
import styles from './HeroDemo.module.css';
```

Keep it. We'll reference `styles.timeRow` and `styles.dateTimeRow` from Task 9.

- [ ] **Step 10.2: Replace the `useFrames()` body**

Find the `useFrames()` function (around line 110). Replace its `useMemo` body with:

```tsx
function useFrames(): HeroFrame[] {
  return useMemo(
    () => [
      {
        id: 'datepicker',
        label: 'DatePicker',
        render: () => (
          <DatePicker value={FROZEN_DATE} onChange={() => {}}>
            <DatePicker.Calendar
              classNames={{
                root: 'kx-live-calendar',
                header: 'kx-live-header',
                title: 'kx-live-title',
                navButton: 'kx-live-nav',
                grid: 'kx-live-grid',
                weekday: 'kx-live-weekday',
                gridCell: 'kx-live-cell',
                day: 'kx-live-day',
                daySelected: 'kx-live-day-selected',
                dayToday: 'kx-live-day-today',
                dayOutsideMonth: 'kx-live-outside',
                dayDisabled: 'kx-live-disabled',
              }}
            />
          </DatePicker>
        ),
      },
      {
        id: 'rangepicker',
        label: 'RangePicker',
        render: () => (
          <RangePicker value={FROZEN_RANGE} onChange={() => {}}>
            <RangePicker.Calendar
              classNames={{
                root: 'kx-live-calendar',
                header: 'kx-live-header',
                title: 'kx-live-title',
                navButton: 'kx-live-nav',
                grid: 'kx-live-grid',
                weekday: 'kx-live-weekday',
                gridCell: 'kx-live-cell',
                day: 'kx-live-day-range',
                dayInRange: 'kx-live-inrange',
                dayRangeStart: 'kx-live-range-start',
                dayRangeEnd: 'kx-live-range-end',
                dayToday: 'kx-live-day-today',
                dayOutsideMonth: 'kx-live-outside',
                dayDisabled: 'kx-live-disabled',
              }}
            />
          </RangePicker>
        ),
      },
      {
        id: 'timepicker',
        label: 'TimePicker',
        render: () => (
          <TimePicker value={FROZEN_TIME} onChange={() => {}} format="12h">
            <div className={styles.timeRow}>
              <TimePicker.HourList
                classNames={{
                  root: 'kx-live-list',
                  option: 'kx-live-option',
                  optionSelected: 'kx-live-option-selected',
                }}
              />
              <TimePicker.MinuteList
                classNames={{
                  root: 'kx-live-list',
                  option: 'kx-live-option',
                  optionSelected: 'kx-live-option-selected',
                }}
              />
              <TimePicker.AmPmToggle
                classNames={{
                  root: 'kx-live-ampm',
                  option: 'kx-live-ampm-btn',
                  optionSelected: 'kx-live-ampm-selected',
                }}
              />
            </div>
          </TimePicker>
        ),
      },
      {
        id: 'datetimepicker',
        label: 'DateTimePicker',
        render: () => (
          <DateTimePicker value={FROZEN_DATE} onChange={() => {}} format="24h">
            <div className={styles.dateTimeRow}>
              <DateTimePicker.Calendar
                classNames={{
                  root: 'kx-live-calendar',
                  header: 'kx-live-header',
                  title: 'kx-live-title',
                  navButton: 'kx-live-nav',
                  grid: 'kx-live-grid',
                  weekday: 'kx-live-weekday',
                  gridCell: 'kx-live-cell',
                  day: 'kx-live-day',
                  daySelected: 'kx-live-day-selected',
                  dayToday: 'kx-live-day-today',
                  dayOutsideMonth: 'kx-live-outside',
                  dayDisabled: 'kx-live-disabled',
                }}
              />
              <div className={styles.timeRow}>
                <DateTimePicker.HourList
                  classNames={{
                    root: 'kx-live-list',
                    option: 'kx-live-option',
                    optionSelected: 'kx-live-option-selected',
                  }}
                />
                <DateTimePicker.MinuteList
                  classNames={{
                    root: 'kx-live-list',
                    option: 'kx-live-option',
                    optionSelected: 'kx-live-option-selected',
                  }}
                />
              </div>
            </div>
          </DateTimePicker>
        ),
      },
      {
        id: 'monthpicker',
        label: 'MonthPicker',
        render: () => (
          <MonthPicker value={FROZEN_DATE} onChange={() => {}}>
            <MonthPicker.Grid
              classNames={{
                root: 'kx-live-month-grid',
                header: 'kx-live-header',
                title: 'kx-live-title',
                navButton: 'kx-live-nav',
                month: 'kx-live-my-cell',
                monthSelected: 'kx-live-my-selected',
                monthCurrent: 'kx-live-my-current',
              }}
            />
          </MonthPicker>
        ),
      },
      {
        id: 'yearpicker',
        label: 'YearPicker',
        render: () => (
          <YearPicker value={FROZEN_DATE} onChange={() => {}}>
            <YearPicker.Grid
              classNames={{
                root: 'kx-live-year-grid',
                header: 'kx-live-header',
                title: 'kx-live-title',
                navButton: 'kx-live-nav',
                year: 'kx-live-my-cell',
                yearSelected: 'kx-live-my-selected',
                yearCurrent: 'kx-live-my-current',
              }}
            />
          </YearPicker>
        ),
      },
      {
        id: 'weekpicker',
        label: 'WeekPicker',
        render: () => (
          <WeekPicker value={FROZEN_WEEK} onChange={() => {}}>
            <WeekPicker.Calendar
              classNames={{
                root: 'kx-live-calendar',
                header: 'kx-live-header',
                title: 'kx-live-title',
                navButton: 'kx-live-nav',
                grid: 'kx-live-grid',
                weekday: 'kx-live-weekday',
                gridCell: 'kx-live-cell',
                day: 'kx-live-day-range',
                dayInWeek: 'kx-live-inrange',
                dayWeekStart: 'kx-live-range-start',
                dayWeekEnd: 'kx-live-range-end',
                dayToday: 'kx-live-day-today',
                dayOutsideMonth: 'kx-live-outside',
              }}
            />
          </WeekPicker>
        ),
      },
    ],
    []
  );
}
```

- [ ] **Step 10.3: Verify each classNames key matches the picker's API**

Before running, sanity-check each `classNames={{...}}` shape against the picker's TypeScript type. Open the picker's source (e.g., `packages/react/src/components/DatePicker/Calendar.tsx`) and confirm every key (`root`, `header`, `title`, `navButton`, `grid`, `weekday`, `gridCell`, `day`, `daySelected`, `dayToday`, `dayOutsideMonth`, `dayDisabled`) is listed in its `ClassNames` type.

If any key is missing from the type, either:
- (a) the key isn't supported — drop it from the classNames object, OR
- (b) it's named differently — adjust the key

For RangePicker.Calendar: confirm `dayInRange`, `dayRangeStart`, `dayRangeEnd` exist. For WeekPicker.Calendar: confirm `dayInWeek`, `dayWeekStart`, `dayWeekEnd`.

If a class name change is needed, also update the corresponding CSS class in `custom.css` to match — keep the names symmetric.

- [ ] **Step 10.4: Verify build**

Run: `pnpm typecheck`
Expected: PASS. TypeScript catches any unknown classNames keys.

Run: `pnpm --filter docs-site build`
Expected: PASS.

---

### Task 11: Update HeroDemo snapshot tests

**Files:**
- Modify: `apps/docs-site/src/components/HeroDemo/__tests__/HeroDemo.test.tsx` (only if it snapshots structure)

- [ ] **Step 11.1: Read the existing test file**

Open `HeroDemo.test.tsx`. Identify any assertions that depend on:
- Inline `style={{ display: 'flex', gap: 8 }}` strings (removed in Task 10)
- Specific selector chains like `[role='grid'] > div > [role='gridcell']` (still present but now styled by global rules)

- [ ] **Step 11.2: Update assertions**

If a test asserts inline style presence, change it to assert the new `className` (e.g., `expect(container.querySelector(`.${styles.timeRow}`)).toBeInTheDocument()`).

If tests snapshot HTML output, update the snapshot:
```bash
pnpm --filter docs-site test -u
```

- [ ] **Step 11.3: Run tests**

Run: `pnpm --filter docs-site test`
Expected: PASS.

---

### Task 12: Regenerate hero images

**Files:**
- Modify: `img/hero-light.webp`, `img/hero-dark.webp`

- [ ] **Step 12.1: Verify the recorder script exists**

Run: `ls scripts/record-hero.mjs`
Expected: file exists. (If not, check `apps/docs-site/scripts/` — the project may have moved the path.) This script uses Playwright to capture HeroDemo at the deterministic `?frame=N` query, light + dark.

- [ ] **Step 12.2: Start docs-site dev**

Run: `pnpm --filter docs-site start`
Wait for "compiled successfully" — recorder script needs a live server.

- [ ] **Step 12.3: Run the recorder**

In a separate terminal:
```bash
node scripts/record-hero.mjs
```

Expected output: 14 frames captured (7 frames × 2 themes), composed into `hero-light.webp` and `hero-dark.webp`. Check the output directory the script writes to (likely `img/` at repo root or `apps/docs-site/static/img/`).

- [ ] **Step 12.4: Move the images to the canonical location**

The README references `./img/hero-light.webp` from the repo root. Confirm the files landed there (or move them):
```bash
ls -lh img/hero-light.webp img/hero-dark.webp
```
Expected: both files exist and are ≤ 200 KB each (webp is small).

- [ ] **Step 12.5: Spot-check the images**

Open both webp files in a viewer (Finder Quick Look on macOS works). Verify:
- All 7 frames look like the v7 mockup
- Light hero has white surface with violet selection
- Dark hero has #111117 surface with #8b80ff selection
- No grid hairlines anywhere
- MonthPicker frame shows a 3×4 grid (not a horizontal row)

If anything looks off, investigate before committing — the regenerated image is what every README reader sees.

---

### Task 13: Commit PR-2

- [ ] **Step 13.1: Stage files**

```bash
git checkout -b feat/aurora-hero
git add apps/docs-site/src/components/HeroDemo/HeroDemo.module.css \
        apps/docs-site/src/components/HeroDemo/index.tsx \
        apps/docs-site/src/components/HeroDemo/__tests__/HeroDemo.test.tsx \
        img/hero-light.webp \
        img/hero-dark.webp
```

- [ ] **Step 13.2: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(docs-site): HeroDemo uses Aurora classNames + regen hero images

Closes the styling-system divergence between HeroDemo and the rest of
the live examples. HeroDemo.module.css no longer ships its own
:global([role='grid']) selectors — every frame now passes classNames
into the picker so the Aurora .kx-live-* tokens drive the look.

Side effects:
- Hero MonthPicker frame is now a proper 3-column grid (was a single
  horizontal row falling through to <table>).
- DateTimePicker frame's inline style={{ display:'flex', gap:8 }} on
  the time columns is replaced by a CSS-module class.
- hero-light.webp and hero-dark.webp regenerated via scripts/record-
  hero.mjs from the new system — README first impression matches the
  live docs.

Depends on PR feat/aurora-tokens (Aurora token definitions).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push -u origin feat/aurora-hero
gh pr create --title "feat(docs-site): HeroDemo Aurora classNames + hero image regen" --body "$(cat <<'EOF'
## Summary
- HeroDemo no longer carries bespoke calendar CSS; it now consumes Aurora .kx-live-* via classNames.
- Hero images regenerated to reflect the v7 system (spec §5.5).
- Closes the gap that left MonthPicker rendering as a single horizontal row in the landing demo.

## Test plan
- [ ] pnpm typecheck
- [ ] pnpm --filter docs-site test
- [ ] pnpm --filter docs-site build
- [ ] Manual: open / in light + dark, watch all 7 frames cycle correctly
- [ ] Verify regenerated img/hero-light.webp + hero-dark.webp render on GitHub README

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## PR-3 — Playground + PickerGrid polish

**Branch off `feat/aurora-tokens` (or main once PR-1 lands). Independent of PR-2.**

### Task 14: Strip PreviewPanel inline styles

**Files:**
- Modify: `apps/docs-site/src/components/Playground/PreviewPanel.tsx`

- [ ] **Step 14.1: Locate inline styles**

Open `PreviewPanel.tsx`. Two places use inline style objects:
- `TimePickerPreview` — `<div style={{ display: 'flex', gap: 8 }}>` wraps HourList/MinuteList/AmPmToggle (line ~77)
- `DateTimePickerPreview` — no explicit time row wrapper, but layout may need one

- [ ] **Step 14.2: Add CSS module classes**

Open `apps/docs-site/src/components/Playground/Playground.module.css`. After the existing `.preview` rule, add:

```css
.timeRow {
  display: flex;
  gap: 6px;
  align-items: flex-start;
}

.dateTimeRow {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
```

- [ ] **Step 14.3: Update PreviewPanel**

In `PreviewPanel.tsx`:

Update the `TimePickerPreview` function:

```tsx
function TimePickerPreview({ timezone }: SubProps) {
  const [v, setV] = useState<string | null>(FROZEN_TIME);
  return (
    <TimePicker value={v} onChange={setV} format="12h" displayTimezone={timezone}>
      <TimePicker.Input className="kx-live-input" />
      <div className={styles.timeRow}>
        <TimePicker.HourList classNames={{ root: 'kx-live-list', option: 'kx-live-option', optionSelected: 'kx-live-option-selected' }} />
        <TimePicker.MinuteList classNames={{ root: 'kx-live-list', option: 'kx-live-option', optionSelected: 'kx-live-option-selected' }} />
        <TimePicker.AmPmToggle classNames={{ root: 'kx-live-ampm', option: 'kx-live-ampm-btn', optionSelected: 'kx-live-ampm-selected' }} />
      </div>
    </TimePicker>
  );
}
```

Update the `DateTimePickerPreview` to use a similar pattern:

```tsx
function DateTimePickerPreview({ classNames, locale, timezone }: SubProps) {
  const [v, setV] = useState<string | null>(FROZEN_DATE);
  const cn = classNames as { input?: string; calendar?: Record<string, string> };
  return (
    <DateTimePicker value={v} onChange={setV} locale={locale} displayTimezone={timezone}>
      <DateTimePicker.Input className={cn.input} />
      <DateTimePicker.Popover>
        <div className={styles.dateTimeRow}>
          <DateTimePicker.Calendar classNames={cn.calendar} />
          <div className={styles.timeRow}>
            <DateTimePicker.HourList classNames={{ root: 'kx-live-list', option: 'kx-live-option', optionSelected: 'kx-live-option-selected' }} />
            <DateTimePicker.MinuteList classNames={{ root: 'kx-live-list', option: 'kx-live-option', optionSelected: 'kx-live-option-selected' }} />
          </div>
        </div>
      </DateTimePicker.Popover>
    </DateTimePicker>
  );
}
```

- [ ] **Step 14.4: Verify import**

At the top of `PreviewPanel.tsx`, confirm `import styles from './Playground.module.css';` exists. Add if missing.

- [ ] **Step 14.5: Type check + manual test**

Run: `pnpm typecheck`
Expected: PASS.

Run: `pnpm --filter docs-site start`
Open: `http://localhost:3000/playground` → switch to TimePicker, DateTimePicker
Expected: both render with proper layout (no jammed columns) in light + dark.

---

### Task 15: Refresh Playground card surface

**Files:**
- Modify: `apps/docs-site/src/components/Playground/Playground.module.css`

- [ ] **Step 15.1: Replace the `.preview` rule**

Find:
```css
.preview {
  border: 1px solid var(--ifm-color-emphasis-200);
  border-radius: 8px;
  padding: 1.5rem;
  background: var(--ifm-background-color);
  min-height: 320px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}
```

Replace with:
```css
.preview {
  border: 1px solid var(--kx-border);
  border-radius: var(--kx-radius-card);
  padding: 1.5rem;
  background: var(--kx-bg);
  box-shadow: var(--kx-shadow-card);
  min-height: 320px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}
```

- [ ] **Step 15.2: Update the `.classNamesEditor` and `.leafInput` surfaces**

In the same file, find `.classNamesEditor` and `.leafInput`. Replace `var(--ifm-color-emphasis-*)` references with `var(--kx-border)` / `var(--kx-bg)` to stay consistent with the Aurora palette:

```css
.classNamesEditor {
  border: 1px solid var(--kx-border);
  border-radius: 8px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin: 0;
  background: var(--kx-bg-quiet);
}

.leafInput {
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--kx-border);
  border-radius: 4px;
  background: var(--kx-bg);
  color: var(--kx-fg);
  font-family: var(--ifm-font-family-monospace);
  font-size: 0.78rem;
}
```

- [ ] **Step 15.3: Visual check**

`http://localhost:3000/playground`
Expected: the preview panel and classNames editor pick up the Aurora surface (subtle violet-tinted border, Aurora shadow).

---

### Task 16: Refresh PickerGrid cards

**Files:**
- Modify: `apps/docs-site/src/components/PickerGrid/PickerGrid.module.css`

- [ ] **Step 16.1: Update the `.card` rule**

Find:
```css
.card {
  background: var(--ifm-background-color);
  border: 1px solid var(--ifm-color-emphasis-200);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-decoration: none;
  color: inherit;
  transition: border-color 150ms ease, transform 150ms ease;
}

.card:hover {
  border-color: var(--ifm-color-primary);
  transform: translateY(-2px);
  text-decoration: none;
  color: inherit;
}
```

Replace with:
```css
.card {
  background: var(--kx-bg);
  border: 1px solid var(--kx-border);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-decoration: none;
  color: inherit;
  transition: border-color 150ms ease, transform 150ms ease, box-shadow 150ms ease;
}

.card:hover {
  border-color: var(--kx-primary);
  transform: translateY(-2px);
  box-shadow: var(--kx-shadow-card);
  text-decoration: none;
  color: inherit;
}
```

- [ ] **Step 16.2: Update `.section` background to use `--kx-bg-quiet`**

Find:
```css
.section {
  padding: 5rem 0;
  background: var(--ifm-color-emphasis-100);
}
```

Replace with:
```css
.section {
  padding: 5rem 0;
  background: var(--kx-bg-quiet);
}
```

- [ ] **Step 16.3: Visual check**

Open: `http://localhost:3000/` and scroll to the PickerGrid section (7 cards).
Expected: cards have Aurora-tinted hover state with subtle shadow lift.

---

### Task 17: Run PR-3 validation + commit

- [ ] **Step 17.1: Tests + build**

Run: `pnpm typecheck && pnpm --filter docs-site test && pnpm --filter docs-site build`
Expected: all PASS.

- [ ] **Step 17.2: Manual visual walk**

Open `/playground` and `/` (PickerGrid section) in light + dark.

- [ ] **Step 17.3: Commit + PR**

```bash
git checkout -b feat/aurora-playground
git add apps/docs-site/src/components/Playground/PreviewPanel.tsx \
        apps/docs-site/src/components/Playground/Playground.module.css \
        apps/docs-site/src/components/PickerGrid/PickerGrid.module.css
git commit -m "$(cat <<'EOF'
feat(docs-site): Playground + PickerGrid Aurora polish

- PreviewPanel: drop inline style={{ display:'flex', gap:8 }} for
  TimePicker and DateTimePicker layouts; use module-scoped .timeRow /
  .dateTimeRow classes instead.
- Playground.module.css: .preview, .classNamesEditor, .leafInput surfaces
  use Aurora tokens (border, bg, shadow) instead of Infima emphasis.
- PickerGrid.module.css: .card and .section pick up Aurora palette;
  hover lifts with the soft Aurora shadow.

Depends on PR feat/aurora-tokens.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push -u origin feat/aurora-playground
gh pr create --title "feat(docs-site): Playground + PickerGrid Aurora polish" --body "$(cat <<'EOF'
## Summary
- Playground PreviewPanel: removed inline styles, added module classes.
- Playground + PickerGrid surfaces use Aurora tokens.

## Test plan
- [ ] pnpm typecheck
- [ ] pnpm --filter docs-site test
- [ ] pnpm --filter docs-site build
- [ ] Manual: /playground all 7 picker types in light + dark
- [ ] Manual: / scroll to PickerGrid cards, verify hover lift

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## PR-4 — Comparison & README

**Branch off main. Independent of PR-1/2/3 — content only.**

### Task 18: Fetch competitor stats from live sources

**Files:** none (research)

- [ ] **Step 18.1: Fetch react-calendar stats**

Open in browser:
- GitHub: `https://github.com/wojtekmaj/react-calendar` — read the star count from the header.
- npm: `https://www.npmjs.com/package/react-calendar` — read "Weekly Downloads" from the sidebar.
- bundlephobia: `https://bundlephobia.com/package/react-calendar` — read gzip size.

Record values in a scratch note:
```
react-calendar (wojtekmaj/react-calendar)
- GitHub stars: ___
- npm weekly downloads: ___
- gzip size: ___ KB
- License: MIT
- Last update measured: 2026-MM-DD
```

- [ ] **Step 18.2: Fetch react-native-calendars stats**

Same drill:
- GitHub: `https://github.com/wix/react-native-calendars`
- npm: `https://www.npmjs.com/package/react-native-calendars`
- bundlephobia: probably not meaningful for React Native — note the package is RN-focused with a partial web shim.

```
react-native-calendars (wix/react-native-calendars)
- GitHub stars: ___
- npm weekly downloads: ___
- Note: React Native first, web shim via react-native-web
- License: MIT
```

- [ ] **Step 18.3: Refresh existing competitor stats**

While at it, refresh the existing 6 competitors' numbers since the spec stamp ("Last measured 2026-06-11") is over 6 months old by the time this lands:
- react-datepicker
- react-day-picker
- react-aria
- ark-ui
- @mui/x-date-pickers
- @mantine/dates

Record GitHub stars + npm weekly for each.

---

### Task 19: Update comparison.md feature matrix

**Files:**
- Modify: `apps/docs-site/docs/comparison.md`

- [ ] **Step 19.1: Add the two new library columns**

Open `apps/docs-site/docs/comparison.md`. Find the feature matrix table (starts around line 20). The current header is:

```
| Feature | react-datepicker | react-day-picker | react-aria | ark-ui | @mui/x-date-pickers | @mantine/dates | **Kalyx** |
```

Replace with:

```
| Feature | react-datepicker | react-day-picker | react-calendar | react-native-calendars | react-aria | ark-ui | @mui/x-date-pickers | @mantine/dates | **Kalyx** |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
```

Then add the new columns to every row. For react-calendar (read-only calendar grid, no time/range/RSC):

| Feature | react-calendar |
|---|---|
| DatePicker | ✓ |
| RangePicker | ✓ |
| TimePicker | ✗ |
| DateTimePicker | ✗ |
| MonthPicker | partial[^11] |
| YearPicker | partial[^11] |
| WeekPicker | ✗ |
| Timezone-aware (IANA) | ✗ |
| Zero CSS (no required import) | ✗ |
| SSR-safe (App Router) | ✓ |
| RSC-friendly | partial[^6] |
| a11y verified | ✓ |
| ISO string API | ✗ |
| Adapter pattern | ✗ |
| Bundle gzip (KB) | ~17 |
| License | MIT |

For react-native-calendars (RN-first with web shim):

| Feature | react-native-calendars |
|---|---|
| DatePicker | ✓ |
| RangePicker | ✓ |
| TimePicker | ✗ |
| DateTimePicker | ✗ |
| MonthPicker | ✓ |
| YearPicker | partial[^11] |
| WeekPicker | ✓ |
| Timezone-aware (IANA) | partial[^4] |
| Zero CSS (no required import) | partial[^12] |
| SSR-safe (App Router) | partial[^13] |
| RSC-friendly | ✗ |
| a11y verified | ✓ |
| ISO string API | ✗ |
| Adapter pattern | ✗ |
| Bundle gzip (KB) | ~85 (RN) |
| License | MIT |

Add new footnotes at the end of the footnote block:

```
[^11]: Surfaces a `view` or `defaultView` prop for month/year drilldown; not exported as a dedicated standalone component.
[^12]: Inline styles by default; theme can be customized but there is no CSS-free escape hatch comparable to Kalyx.
[^13]: React Native first; the web shim runs in browsers but the package isn't designed for Next.js App Router server boundaries.
```

- [ ] **Step 19.2: Add a "Popularity" subsection above the feature matrix**

Insert a new H2 section right before `## Feature matrix`:

```markdown
## Popularity at a glance

Numbers measured at the time of writing — see footer for date.

| Library | GitHub stars | npm weekly downloads |
| --- | :---: | :---: |
| react-datepicker | _value from 18.3_ | _value_ |
| react-day-picker | _value_ | _value_ |
| react-calendar | _value_ | _value_ |
| react-native-calendars | _value_ | _value_ |
| react-aria | _value_ | _value_ |
| ark-ui | _value_ | _value_ |
| @mui/x-date-pickers | _value_ | _value_ |
| @mantine/dates | _value_ | _value_ |
| **Kalyx** | _check our own_ | _check npm_ |

> _Last measured YYYY-MM-DD._ Stars and download counts move quickly; treat these as a snapshot, not a leaderboard.

```

Replace each `_value_` with the actual number fetched in Task 18.

- [ ] **Step 19.3: Update the date stamp**

Find the existing line at the end of the feature matrix section:
```
> _Last measured 2026-06-11. Methodology: bundle sizes via bundlephobia + each
> library's published `size-limit`; feature presence verified against each
> library's v-latest docs at the time of writing._
```

Update the date to the actual PR date.

---

### Task 20: Update the comparison.md SVG bar chart

**Files:**
- Modify: `apps/docs-site/docs/comparison.md`

- [ ] **Step 20.1: Locate the SVG**

The bar chart starts around line 58. It currently has 7 bars (6 competitors + Kalyx). Extend to 9 bars (8 competitors + Kalyx).

- [ ] **Step 20.2: Update viewBox + spacing**

Change the SVG viewBox height from `280` to `360` to fit 9 rows at 32px each + padding.

Each row is 32px tall. Y positions: 22, 54, 86, 118, 150, 182, 214, 246, 278. Add labels for react-calendar (between react-day-picker and ark-ui — order by bundle size) and react-native-calendars.

Use the actual gzip values fetched in Task 18 to redraw the bar widths. Formula: `width = (kb / 90) * 410` where 90 is the new chart max (since react-native-calendars at ~85 KB pushes the upper bound).

Example layout:
```
| react-native-calendars | 85 KB |
| react-datepicker       | 62 KB |
| @mui/x-date-pickers    | 45 KB |
| @mantine/dates         | 30 KB |
| react-aria             | 28 KB |
| react-day-picker       | 22 KB |
| ark-ui                 | 20 KB |
| react-calendar         | 17 KB |
| **Kalyx**              | 15 KB |
```

- [ ] **Step 20.3: Update the SVG aria-label**

Change the title:
```
aria-label="Bundle size comparison in KB gzip — Kalyx is among the smallest, alongside react-calendar and ark-ui"
```

- [ ] **Step 20.4: Render check**

Run: `pnpm --filter docs-site build && pnpm --filter docs-site serve`
Open: `http://localhost:3000/docs/comparison`
Expected: feature matrix scrolls horizontally if needed (existing `overflowX: auto` wrapper handles this), bar chart renders with all 9 bars, Kalyx bar still highlighted via `.barKalyx` class.

---

### Task 21: Refresh "Why Kalyx" copy in README files

**Files:**
- Modify: `README.md`, `README.ko.md`, `packages/react/README.md`, `packages/core/README.md`

- [ ] **Step 21.1: Refresh root `README.md`**

Find the `## Why Kalyx` section (around line 30). The current text references the comparison page. Tighten the language per the user-voice convention (see memory: `feedback_user_voice_writing.md` — no "I'd recommend" hedging).

Replace the existing `## Why Kalyx` section with:

```markdown
## Why Kalyx

In 2026, the React date-picker landscape forces a trade-off: integrated-but-heavy (react-datepicker ~62 KB, MUI ~45 KB) or headless-but-partial (react-day-picker, react-aria, ark-ui — calendar grid only). React-calendar covers single dates and ranges but stops short of time, RSC, and timezone-aware storage. React-native-calendars is mobile-first.

Kalyx ships **seven primitives** — single date, range, time, date+time, month, year, week — under one composition API. Headless, ~15 KB gzip, SSR-safe, ISO strings in / ISO strings out, adapter pattern for date-fns / dayjs / luxon.

[See the full comparison →](https://kalyx-docs-site.vercel.app/docs/comparison)
```

- [ ] **Step 21.2: Refresh `README.ko.md`**

Open `README.ko.md`. Find the equivalent Korean section (likely `## Kalyx를 쓰는 이유` or similar). Translate the new copy:

```markdown
## Kalyx를 쓰는 이유

2026년 React 데이트 피커 시장은 둘 중 하나를 강요한다: 통합됐지만 무거운 것(react-datepicker ~62 KB, MUI ~45 KB), 또는 가볍지만 부분적인 것(react-day-picker · react-aria · ark-ui — calendar grid만). react-calendar는 단일 날짜·범위는 다루지만 time·RSC·timezone 저장이 빠지고, react-native-calendars는 모바일 우선이다.

Kalyx는 **7개 프리미티브** — 단일 날짜, 범위, 시간, 날짜+시간, 월, 연, 주 — 를 하나의 composition API로 묶는다. Headless, ~15 KB gzip, SSR 안전, ISO 문자열 입출력, date-fns/dayjs/luxon용 adapter 패턴.

[전체 비교 표 →](https://kalyx-docs-site.vercel.app/ko/docs/comparison)
```

- [ ] **Step 21.3: Refresh `packages/react/README.md`**

The package README is shorter. Find the first paragraph (around line 11). It currently reads "Composable React primitives for single dates, date ranges, time, and date + time." Update to mention all seven:

```markdown
Composable React primitives for **seven date-related surfaces** — single date, date range, time, date+time, month, year, and week — under one Radix-style dot-notation API. Pair with Tailwind, shadcn/ui, Chakra, or any CSS.
```

Then below the install block, add a one-line link to the comparison page:

```markdown
> Comparing alternatives? See the [feature matrix](https://kalyx-docs-site.vercel.app/docs/comparison) — we hold every cell honestly, including where react-datepicker / react-aria / MUI win.
```

- [ ] **Step 21.4: Refresh `packages/core/README.md`**

Same treatment — tighten the intro paragraph if needed; do not change the API examples.

- [ ] **Step 21.5: Verify the bundle-size badge in the root README**

The root README has `[![Bundle](https://img.shields.io/badge/gzip-15.01KB-brightgreen)]`. Confirm the current measured value (run `pnpm check-bundle` if uncertain). Update the badge URL to match.

---

### Task 22: Run PR-4 validation + commit

- [ ] **Step 22.1: Markdown sanity check**

Run: `pnpm --filter docs-site build`
Expected: comparison.md renders without MDX errors. Open `http://localhost:3000/docs/comparison` and verify the table + bar chart.

- [ ] **Step 22.2: GitHub README preview**

Push the README changes to a draft branch and use GitHub's "preview" view (or `gh pr view --web`) to confirm the hero image still resolves and the new copy renders.

- [ ] **Step 22.3: Commit + PR**

```bash
git checkout -b docs/aurora-comparison
git add apps/docs-site/docs/comparison.md \
        README.md README.ko.md \
        packages/react/README.md packages/core/README.md
git commit -m "$(cat <<'EOF'
docs(comparison): add react-calendar, react-native-calendars + popularity

- comparison.md: added rows for react-calendar (wojtekmaj/react-calendar)
  and react-native-calendars (wix/react-native-calendars).
- Added a new "Popularity at a glance" table with GitHub stars and npm
  weekly downloads, alongside the existing feature matrix.
- Updated the bundle-size SVG to include both new libraries; Kalyx
  remains among the smallest.
- Refreshed measurement date stamp.
- Tightened "Why Kalyx" copy in root README.md, README.ko.md, and
  the package READMEs so the new comparison page is the primary
  reference for the landscape framing.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push -u origin docs/aurora-comparison
gh pr create --title "docs(comparison): react-calendar, react-native-calendars + popularity table" --body "$(cat <<'EOF'
## Summary
- Added 2 new libraries the user explicitly named (react-calendar, react-native-calendars).
- New "Popularity at a glance" table with stars + weekly downloads.
- Updated SVG bar chart to include both.
- Refreshed README "Why Kalyx" copy across root, ko, and package READMEs.

## Test plan
- [ ] pnpm --filter docs-site build
- [ ] Manual: /docs/comparison renders correctly (table, popularity, bar chart)
- [ ] GitHub README preview shows refreshed copy and hero
- [ ] Verify fetched stat values match live npmjs.com / github.com on PR date (not stale)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Post-merge — Verification matrix

Once all 4 PRs are merged, do a final sweep before declaring done:

- [ ] **Lighthouse — Vercel real (not localhost simulate)**

Per `feedback_lighthouse_localhost_vs_vercel.md`: localhost simulate gives misleading numbers. Wait for the Vercel deploy preview to publish, then run Lighthouse against the real URL: `https://kalyx-docs-site.vercel.app/` and `/docs/components/datepicker`. Compare against the pre-PR baseline. Acceptable threshold: no Lighthouse score regression > 5 points.

- [ ] **e2e Playwright on main**

After PR-1+2+3 land:
```bash
pnpm --filter docs-site exec playwright test
```
Expected: all browsers PASS (chromium / firefox / webkit per the workflow).

- [ ] **axe across themes**

For each `/docs/components/*` page, toggle light + dark, run axe DevTools.
Expected: 0 violations.

- [ ] **README check on GitHub**

After PR-4 lands and PR-2's hero images are deployed, refresh the GitHub README and confirm:
- Light hero shows in light-mode browsers
- Dark hero shows in dark-mode browsers (via `<picture>` `prefers-color-scheme`)
- Comparison link works
- All badges resolve

- [ ] **Bundle size**

Run: `pnpm check-bundle`
Expected: ≤ 16 KB ceiling. No library changes were made, so this should be unchanged from main.

---

## Self-review checklist (run before declaring plan ready)

- ✅ Every section of `2026-06-11-aurora-visual-overhaul-design.md` is covered by at least one task.
  - §4.1 tokens → Task 1
  - §4.2 surface primitives → Task 2
  - §4.3 grid → Task 2
  - §4.4 range → Task 3
  - §4.5 TimePicker → Task 4
  - §4.6 MonthGrid/YearGrid → Task 5
  - §4.7 Infima reset → Task 6
  - §5.1 tokens & live-example → Tasks 1–7
  - §5.2 HeroDemo → Tasks 9–11
  - §5.3 Playground → Tasks 14, 15
  - §5.4 PickerGrid → Task 16
  - §5.5 hero images → Task 12
  - §5.6 comparison Track A → Tasks 18–20
  - §5.7 README → Task 21
  - §6 PR breakdown → 4 PR groups
  - §7 testing → Tasks 8, 17, 22 + post-merge sweep
  - §8 risks → addressed inline (Infima scope `[role='grid']`, contrast verified, snapshot tests in Task 11, hero images use deterministic recorder)

- ✅ No "TBD", "TODO", "implement later", "similar to Task N" placeholders.
- ✅ Class names used in PR-2 (HeroDemo classNames) match the keys defined in PR-1 CSS (Task 10 includes a sanity-check step against the picker source types).
- ✅ Branch + commit messages are written out verbatim, not described.
- ✅ Each PR can be reviewed and merged independently (with the dependency order stated up top).

---

Plan complete and saved to `docs/superpowers/plans/2026-06-11-aurora-visual-overhaul.md`. Two execution options:

**1. Subagent-Driven (recommended)** — fresh subagent per task, two-stage review between tasks, fast iteration; matches the user's parallel-PR convention well since PR-2/3/4 can each be its own worktree-isolated subagent.

**2. Inline Execution** — execute tasks in this session using `executing-plans`, batch execution with checkpoints.

Which approach?
