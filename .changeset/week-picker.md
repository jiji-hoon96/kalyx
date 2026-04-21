---
'@kalyx/react': minor
---

feat: add `WeekPicker` — a headless week selector.

`WeekPicker` stores the selected week as a `DateRange` covering all seven days (based on `weekStartsOn`). Unlike `RangePicker`, a single click on any day selects the entire week containing that day.

```tsx
<WeekPicker value={week} onChange={setWeek} weekStartsOn={1}>
  <WeekPicker.Input part="start" />
  <WeekPicker.Input part="end" />
  <WeekPicker.Popover>
    <WeekPicker.Calendar />
  </WeekPicker.Popover>
</WeekPicker>
```

- Reuses `RangePicker` Root / Input / Popover; only `WeekPicker.Calendar` is new.
- `weekStartsOn` (0=Sunday, 1=Monday) controls which seven days constitute a week.
- Enter / Space on the focused day commits the full week containing it.
- `displayTimezone`, `disabled` rules, and all other RangePicker props are supported.
