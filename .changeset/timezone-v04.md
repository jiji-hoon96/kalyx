---
"@kalyx/core": minor
"@kalyx/react": minor
---

feat: full `displayTimezone` support across all pickers (v0.4)

All four pickers (`DatePicker`, `RangePicker`, `TimePicker`, `DateTimePicker`) and their corresponding hooks (`useDatePicker`, `useRangePicker`, `useTimePicker`) now accept a `displayTimezone` prop/option.

When set, the value stored via `onChange` is the **civil midnight of the selected day in the target timezone** (in UTC-ISO form), eliminating the classic "day off by one" bug that affects picker libraries bound to `new Date()`. Input formatting, calendar highlighting, and the time-of-day controls all follow the display timezone — including DST-aware offsets for zones like `America/New_York` and `Europe/London`.

`DateFnsAdapter` now honors the `timezone` argument on `format`, `isSameDay`, `startOfDay`, and `today` (previously declared-but-ignored). Core also exposes new helpers:

- `civilMidnightFromUtcDay(iso, tz)`
- `getTimeInTimezone(iso, tz)`
- `setTimeInTimezone(iso, partial, tz)`

No breaking changes — omitting `displayTimezone` keeps the existing UTC semantics.
