---
"@kalyx/react": minor
"@kalyx/core": minor
---

Two new `DatePicker.Calendar` / `RangePicker.Calendar` props plus an ISO-week utility:

- **`showWeekNumber`** — render an ISO 8601 week-number column (1–53) on the left of the grid. The column uses `<th scope="row" aria-hidden="true">` so it doesn't participate in the WAI-ARIA grid data region; keyboard navigation across date cells is unchanged. New className slots: `weekNumberHeader`, `weekNumber`.
- **`fixedWeeks`** — when true, always render 6 rows (42 cells) regardless of the month. Useful for popover layouts that need a stable height across month navigation.

Both also accepted on `CalendarOptions` (the `getCalendarDays` core util gains `fixedWeeks`).

New core export: **`getISOWeekNumber(iso)`** — pure UTC computation, no date-fns dep. Anchored to the Thursday of the week (so the same week always returns the same number regardless of `weekStartsOn`).

```tsx
<DatePicker value={date} onChange={setDate}>
  <DatePicker.Input />
  <DatePicker.Popover>
    <DatePicker.Calendar showWeekNumber fixedWeeks />
  </DatePicker.Popover>
</DatePicker>
```

Bundle impact: +0.46 KB ESM gzip (13.96 → 14.42 KB). Still well under the 15 KB ceiling.
