---
'@kalyx/react': patch
---

fix(react): prevent WeekPicker from mutating RangePicker.Calendar

`WeekPicker` previously called `Object.assign(RangePickerRoot, { ..., Calendar: WeekPickerCalendar })`, which mutates the shared `RangePickerRoot` function object. Because `RangePicker.Calendar` is attached to the same object (via the earlier `Object.assign` in `RangePicker/index.ts`), importing `WeekPicker` would overwrite `RangePicker.Calendar` with `WeekPickerCalendar`.

Users of `RangePicker` would then see week-selection behavior (single click commits a full week and closes the popover) instead of the documented two-click range flow — even without importing `WeekPicker` directly, because both pickers share the module graph.

Added an internal `WeekPickerRoot` wrapper that the `Object.assign` target now uses, preserving `RangePickerRoot.Calendar` intact.

Caught by the `RangePicker › select range in start-date -> end-date order` Playwright test; all existing behavior is restored.
