---
'@kalyx/react': patch
---

fix(input): drop stale typed text when the parent re-sets value externally

`<DatePicker.Input>` and `<TimePicker.Input>` keep half-typed text in a local `inputText` state while the user is editing — without it, parse-failed input would vanish on every keystroke. The state was reset only when the user committed via blur/Enter, which left a real gap:

If the value changed from anywhere else (parent re-rendered with a new `value`, a calendar click, a `Preset`, a custom-Hook `setRange`, an HourList option), the Input kept rendering the user's stale text. Source-of-truth and visible value diverged silently.

A `useEffect` keyed on `ctx.value` now resets `inputText` whenever the source-of-truth changes. The Input goes back to formatting the new value normally. For DatePicker the reset is skipped while an IME composition is in flight (Korean/Japanese/Chinese), so an in-flight character is never wiped mid-stroke.

Impact: `DatePicker`, `MonthPicker`, `YearPicker` (the last two reuse `DatePickerInput`), and `TimePicker` all get the fix. `RangePicker`/`WeekPicker`/`DateTimePicker` Inputs are read-only or non-editable and already track context directly, so they were never affected.
