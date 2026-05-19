---
"@kalyx/react": minor
---

`TimePicker.Root` gains a programmatic **`filterTime`** prop — `(hours: number, minutes: number) => boolean` returning `true` for any slot that should be unselectable. Equivalent to `react-datepicker`'s `filterTime` and MUI X's `shouldDisableTime`, covering use cases the static `step` prop can't (business-hours-only, lunch breaks, blackout slots, per-day variations).

```tsx
<TimePicker
  value={time}
  onChange={setTime}
  step={15}
  // Business hours only: 09:00–11:45 and 13:00–17:45 (no lunch slot)
  filterTime={(h, m) => h < 9 || h >= 18 || (h === 12)}
>
  <TimePicker.Input />
  <TimePicker.HourList />
  <TimePicker.MinuteList />
</TimePicker>
```

Behavior:

- **`MinuteList`** — minutes for which `filterTime(currentHour, minute)` returns `true` get `aria-disabled="true"` and reject click/Enter.
- **`HourList`** — an hour is marked `aria-disabled="true"` only when `filterTime` returns `true` for **every** step minute within it. Hours with at least one open minute remain selectable.
- 12-hour mode — the predicate always receives 24-hour values (`0`–`23`) regardless of the picker's display format.

**Note**: `DateTimePicker` does not yet wire this through — combine `DatePicker.Root` + `TimePicker.Root` manually if you need both date and time-slot filtering in the same picker.

Bundle ceiling raised 15 → 16 KB (PR #N follows the 12→13→14→15 cadence — each raise tied to a documented feature; CLAUDE.md §2 records the chain). Measured 15.01 KB ESM / 15.16 KB CJS at this commit, ~4× smaller than react-datepicker.
