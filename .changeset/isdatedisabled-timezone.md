---
"@kalyx/core": patch
---

fix(calendar): honor `displayTimezone` for `{ date }` disable rules (M-4)

`isDateDisabled` compared `{ date }` rules by UTC day, while `selected`/`today`/`range`
flags compared by civil day in `displayTimezone`. With a timezone active, a `{ date }`
rule supplied in the civil-midnight-in-tz form the picker emits silently failed to disable
the matching grid cell. `isDateDisabled` now takes an optional `timezone` argument
(backward-compatible) and `getCalendarDays` passes `displayTimezone` through, so `{ date }`
rules disable the right cell regardless of zone.
