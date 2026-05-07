---
"@kalyx/react": patch
---

WAI-ARIA grid keyboard navigation for the four 3×4 picker grids
(`DatePicker.MonthGrid`, `DatePicker.YearGrid`, `MonthPicker.Grid`,
`YearPicker.Grid`).

Before, these grids declared `role="grid"` but had no key handler — keyboard
users could not select a month or year, in violation of CLAUDE.md §7.

Now each grid implements:
- **Arrow keys** — ±1 column / ±3 rows, clamped to grid bounds.
- **Home / End** — first / last cell of the current row.
- **PageUp / PageDown** — previous / next year (or decade for year grids).
- **Enter / Space** — commit the focused cell (drilldown grids switch view via
  `onSelect`; commit grids close the popover via `ctx.selectDate`).
- **Roving tabIndex** — only the focused cell has `tabIndex=0`; the
  `data-focused` attribute follows.
- **Auto-refocus** — DOM focus moves with `focusedIndex` so PageUp/Down lands
  the user back on the same column position. Cells use stable index keys so
  the buttons persist across page nav.

Component-level integration tests added per CLAUDE.md §7 across `DatePicker`,
`RangePicker`, `DateTimePicker`, and `WeekPicker`: leap-year (Feb 29 2024)
click commit, `before`/`after` rule click block, `dayOfWeek` rule click block
plus visual `aria-disabled`, and keyboard ArrowLeft skip-disabled.

**Bundle target raised to 14 KB** — full grid keyboard nav (state + handlers
+ auto-refocus) added ~1.4 KB gzip across the four grids. Measured 12.85 KB
ESM / 13.64 KB CJS at this point. README, docs, `scripts/check-bundle-size.js`,
PR template, and CI gate updated to ≤14 KB.

**Internal:** new shared `useGridState` hook in
`packages/react/src/components/_shared/grid-keyboard.ts` (not exported from
the package public API) consolidates keyboard handling and roving-focus
state across all four grids.
