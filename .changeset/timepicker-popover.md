---
"@kalyx/react": minor
---

feat(timepicker): add optional `TimePicker.Popover`

`TimePicker` can now be used in a popover instead of only inline. Wrap the
Hour/Minute/AmPm controls in `TimePicker.Popover` and they appear only after the
user opens the picker via `TimePicker.Input` (click or ArrowDown), then close on
Escape, outside click, or focus-out — mirroring `DatePicker.Popover` via the
shared `usePopover` hook.

- `TimePicker.Root` gains an `onOpenChange` callback and internal open state.
- `TimePicker.Input` becomes a `role="combobox"` with `aria-expanded` /
  `aria-haspopup="dialog"`, opens on click / ArrowDown, closes on Escape.
- Inline usage (no `TimePicker.Popover`) is unchanged and fully backwards-compatible.
