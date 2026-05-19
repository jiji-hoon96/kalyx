---
"@kalyx/react": minor
"@kalyx/core": minor
---

`DisabledRule` gains a programmatic `filter` variant — pass any predicate `(iso: ISODateString) => boolean` to disable arbitrary days that don't fit the declarative `before` / `after` / `dayOfWeek` / `date` rules.

```tsx
const holidays = new Set([
  '2026-01-01T00:00:00.000Z',
  '2026-12-25T00:00:00.000Z',
]);

<DatePicker
  disabled={[
    { dayOfWeek: [0, 6] },                 // weekends
    { filter: (iso) => holidays.has(iso) } // holidays
  ]}
>
  …
</DatePicker>
```

The new variant slots into the existing `isDateDisabled` evaluation (short-circuits on first match) and works with keyboard-navigation disabled-skip in `DatePicker.Calendar` / `RangePicker.Calendar` with no further changes. Equivalent to `react-datepicker`'s `filterDate` prop and MUI X DatePicker's `shouldDisableDate`. Bundle impact: 0 KB (still 13.96 KB ESM gzip).
