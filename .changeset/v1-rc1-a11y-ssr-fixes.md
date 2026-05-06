---
"@kalyx/react": patch
"@kalyx/core": patch
---

P1 audit follow-ups for v1.0-rc:

- **SSR hydration safety in 4 commit/drilldown grids** — `DatePicker.MonthGrid`, `DatePicker.YearGrid`, `MonthPicker.Grid`, and `YearPicker.Grid` previously called `adapter.today()` directly inside their render bodies, producing a server/client clock-mismatch hydration warning across day boundaries (and intermittently wrong "today" highlights in tz-different SSR setups). Today is now snapshotted via `useState(null)` + post-mount `useEffect`, so the server output and the first client render agree, and the highlight settles on the first effect tick.
- **`AmPmToggle` now follows the WAI-ARIA radiogroup pattern** — Arrow / Home / End / Space / Enter move and commit selection between AM and PM, and `tabIndex` is roving (only the checked radio is in the tab order). Previously both buttons were tabbable and arrow keys were ignored.
- **`DatePicker.Preset` / `RangePicker.Preset` now use `aria-pressed`** instead of `role="option"` + `aria-selected`. `role="option"` is invalid outside `role="listbox"` / `role="combobox"`, so axe was flagging the previous markup. Active state still appears on `data-active` for CSS targeting.
- **`RangePicker.Calendar` no longer advertises `aria-multiselectable="true"`** — a date range is one selection (two endpoints), not a multi-select grid.
- **Test stability** — `useRangePicker` `respects disabled rules` test pinned to April 2026 via `defaultValue` so the calendar grid contains the expected weekend day regardless of the system clock (was failing once the clock crossed into May).
- **`labels.ts` test coverage** — first unit tests for the default-label exports.

Behavioral notes for users (none of these are breaking for code that follows the documented `data-*` styling contract):
- If you targeted Preset buttons via `[aria-selected="true"]` in CSS, switch to `[aria-pressed="true"]` or `[data-active]`.
- If you targeted the range grid via `[aria-multiselectable]`, that attribute is gone; use `[role="grid"]` on the calendar root instead.
