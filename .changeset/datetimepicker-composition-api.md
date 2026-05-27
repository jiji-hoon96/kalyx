---
'@kalyx/react': patch
---

fix(datetimepicker): close composition-API gap and expose missing public types

- `<DateTimePicker.Root>` now accepts `withSeconds` and `filterTime` props (was silently hard-coded to `withSeconds: false`, `filterTime: undefined`)
- `currentTime` no longer calls `DateFnsAdapter.today()` during render when `value` is null — eliminates the UTC-midnight hydration mismatch risk
- Public API now re-exports `CalendarWeek`, `CalendarGrid`, `CalendarOptions`, `WeekStartsOn`, `WeekdayInfo`, every `{Picker}Labels` type, and the four `DEFAULT_*_LABELS` runtime constants per CLAUDE.md §6
