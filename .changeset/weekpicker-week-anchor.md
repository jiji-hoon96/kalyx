---
"@kalyx/react": minor
---

feat(weekpicker): add `weekAnchor` prop to control how the 7-day span is derived

`WeekPicker.Calendar` (and `RangePicker.Calendar` with `selectionMode="week"`)
now accepts a `weekAnchor` prop:

- `'calendar'` (default, unchanged): selects the `weekStartsOn`-aligned calendar
  week containing the clicked day (e.g. Sunday–Saturday for en-US).
- `'clicked'`: selects a rolling 7-day span that **starts on the clicked day**
  (clicked day … clicked day + 6), regardless of `weekStartsOn`.

This is additive and backwards-compatible — existing WeekPickers keep the
calendar-aligned behavior. Exposes the `RangePickerWeekAnchor` and
`RangePickerCalendarSelectionMode` types.
