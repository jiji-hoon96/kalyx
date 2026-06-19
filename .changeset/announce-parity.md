---
"@kalyx/react": minor
---

a11y: Root-level `announce()` live-region parity for DatePicker and DateTimePicker (B10 / audit A-G1).

`DatePickerContext` now exposes an `announce(message)` method backed by a polite `role="status"` live region mounted on the Root (not the Calendar). Previously DatePicker announced month navigation and date selection from a Calendar-local region that unmounted with the popover; moving it to Root matches `RangePickerContext` and keeps the announcement available across open/close. `DateTimePicker.Root` gains the same region, and `MonthPicker`/`YearPicker` inherit it via `DatePicker.Root`.

This adds a small amount of runtime code, so the gzip bundle ceiling moves **16 KB → 17 KB** (default `@kalyx/react` entry now 15.99 KB ESM / 16.12 KB CJS). Still ~3.5× smaller than react-datepicker.

No public API removal; the new `announce` context field is additive (the React layer fills it). The `selectionMode="week"` aria-label rework (A-G5) was intentionally dropped — labelling each day with its full week span made all seven days of a week share a substring and broke screen-reader/test name queries, so the per-day label is retained.
