---
"@kalyx/core": minor
"@kalyx/react": minor
---

feat(timepicker): localize AM/PM labels + add `locale` prop

- `@kalyx/core`: new `getDayPeriodName(period, locale)` util returning the
  localized day-period label via `Intl.DateTimeFormat` (en-US → AM/PM,
  ko-KR → 오전/오후, ja-JP → 午前/午後).
- `@kalyx/react`: `TimePicker` gains a `locale` prop, and `TimePicker.AmPmToggle`
  now renders the localized day-period label (the underlying value/logic stays
  ASCII `'AM' | 'PM'`; only the visible text + aria-label are localized).
  `DateTimePicker` forwards its existing `locale` to the AM/PM toggle.

Backwards-compatible: defaults to `en-US` → "AM"/"PM" as before.
