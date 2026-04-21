---
'@kalyx/react': minor
---

feat: add `YearPicker` — a headless year selector.

`YearPicker` stores the selected year as Jan 1 of that year in UTC-ISO form (e.g., `"2026-01-01T00:00:00.000Z"`). It reuses `DatePicker` infrastructure (Input, Trigger, Popover) and exposes `YearPicker.Grid`, a 12-year decade commit grid with decade navigation.

```tsx
<YearPicker value={year} onChange={setYear}>
  <YearPicker.Input placeholder="Pick a year" />
  <YearPicker.Popover>
    <YearPicker.Grid />
  </YearPicker.Popover>
</YearPicker>
```

- Default `displayFormat` is `"yyyy"`.
- `displayTimezone` is supported with timezone-aware year highlighting.
- Primary UX is click-to-select; full `yyyy-MM-dd` typed input still works via the inherited Input behavior.
