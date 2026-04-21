---
'@kalyx/react': minor
---

feat: add `DatePicker.Presets` and `DatePicker.Preset` for single-date quick selection.

Mirrors the existing `RangePicker.Presets` API. Pass a predefined `value` key (`today`, `tomorrow`, `yesterday`, `startOfMonth`, `endOfMonth`, `startOfYear`) or a direct ISO via `date`.

```tsx
<DatePicker value={date} onChange={setDate}>
  <DatePicker.Input />
  <DatePicker.Popover>
    <DatePicker.Presets>
      <DatePicker.Preset value="today">Today</DatePicker.Preset>
      <DatePicker.Preset value="tomorrow">Tomorrow</DatePicker.Preset>
      <DatePicker.Preset date="2026-12-25T00:00:00.000Z">Christmas</DatePicker.Preset>
    </DatePicker.Presets>
    <DatePicker.Calendar />
  </DatePicker.Popover>
</DatePicker>
```

- Active preset is marked `aria-selected="true"` when its resolved date matches the current value (timezone-aware).
- Clicking a preset commits and closes the popover.
- `displayTimezone` is honored when resolving "today"-relative presets.
