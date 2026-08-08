---
'@kalyx/core': patch
'@kalyx/react': patch
---

Stop a malformed `value` from crashing the whole React tree.

`value` and `defaultValue` normally arrive from a form field or a database row, so an
empty or unparseable string is data rather than a programming error. It used to throw
`RangeError: Invalid time value` during render and unmount the entire tree; under
`renderToString` a single bad row became a 500.

The crash had three layers:

- **View seed** — every Root and headless hook passed the raw value to
  `adapter.startOfDay()`, which builds its result from `new Date(value).toISOString()`.
  Six of the seven pickers and six of the seven hooks were affected; `TimePicker` and
  `useTimePicker` already parsed defensively. Note that `''` is not nullish, so an empty
  form field slipped past the existing `?? adapter.today()` fallback.
- **Comparison layer** — `getCalendarDays` handed `selected` / `focusedDate` / `range` to
  `isSameDay(..., timezone)`, reaching `Intl.DateTimeFormat.formatToParts(Invalid Date)`.
  It now treats an unparseable value as absent: a flag that cannot be computed is `false`.
  This also covers headless consumers calling `getCalendarDays` directly.
- **Time extraction** — `getTimeInTimezone(value, timezone)` took the same path in
  `TimePicker` and `DateTimePicker`.

The last two only triggered with `displayTimezone` set.

The view now falls back to the current month when the value cannot be parsed. The value
itself is left untouched and `Input` displays it verbatim, so the mistake stays visible
instead of being silently swallowed. Previously `Input` intended this via a `try/catch`,
but adapters render an unparseable value as `"NaN-NaN-NaN"` rather than throwing, so that
fallback never ran and users saw `NaN-NaN-NaN` in the field.
