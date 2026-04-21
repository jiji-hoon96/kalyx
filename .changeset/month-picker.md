---
'@kalyx/react': minor
---

feat: add `MonthPicker` — a headless month selector.

`MonthPicker` stores the selected month as the first day of that month in UTC-ISO form (e.g., `"2026-04-01T00:00:00.000Z"`). It reuses `DatePicker` infrastructure (Input, Trigger, Popover), so the only new primitive is `MonthPicker.Grid`, a 12-month commit grid with year navigation.

```tsx
<MonthPicker value={month} onChange={setMonth}>
  <MonthPicker.Input placeholder="Pick a month" />
  <MonthPicker.Popover>
    <MonthPicker.Grid />
  </MonthPicker.Popover>
</MonthPicker>
```

- Default `displayFormat` is `"yyyy-MM"`.
- `displayTimezone` is supported (commits map to civil midnight of month-start in the target zone).
- Month selection highlighting is timezone-aware — the grid reflects the month of the current value even when stored in zone-adjusted UTC form.
- Primary UX is click-to-select; full `yyyy-MM-dd` typed input still works via the inherited Input behavior.
