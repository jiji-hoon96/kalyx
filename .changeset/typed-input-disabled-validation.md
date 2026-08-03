---
"@kalyx/react": patch
---

fix(datepicker): enforce disabled/min-max rules on typed input commits

Typing a date into `DatePicker.Input` (and `MonthPicker`/`YearPicker`, which reuse it)
committed the value without checking the `disabled` rules — a weekend, out-of-range, or
otherwise-disabled date that the calendar grid blocks on click could still be entered by
typing and blurring. `selectDate` now runs the same `isDateDisabled` check the grid uses on
every commit path, so the `disabled` (and `{ before }`/`{ after }` min-max) contract holds
regardless of how the value is entered. Clearing the field (empty input → `null`) is
unaffected.
