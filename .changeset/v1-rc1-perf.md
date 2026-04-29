---
"@kalyx/react": patch
---

Performance: memoize hot paths to avoid wasted recomputation:

- `DatePicker.Calendar` and `RangePicker.Calendar` now `useMemo` their `getCalendarDays` and `getWeekdayNames` results. Previously the 42-cell grid and 7 weekday tuples were rebuilt every parent re-render even when none of the inputs changed.
- `TimePicker.HourList` and `TimePicker.MinuteList` `useMemo` their `generateHours(format)` / `generateMinutes(step)` arrays so the listbox identity is stable across renders.
- `usePopover` middleware (`offset` / `flip` / `shift`) is now hoisted to a module-level constant, eliminating Floating UI's repeated middleware-array reconciliation.
