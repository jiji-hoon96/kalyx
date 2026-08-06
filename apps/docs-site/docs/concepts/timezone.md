---
id: timezone
title: Timezone (displayTimezone)
sidebar_position: 3
---

# Timezone support

All seven pickers (`DatePicker`, `RangePicker`, `TimePicker`, `DateTimePicker`, `MonthPicker`, `YearPicker`, `WeekPicker`) accept a `displayTimezone` prop. When set, Kalyx interprets the user's input and the displayed value as *civil time in that IANA zone* while continuing to emit the plain UTC-ISO strings you already store.

This is Kalyx's structural answer to [react-datepicker #1018](https://github.com/Hacker0x01/react-datepicker/issues/1018) — the "day off by one" bug that has haunted timezone-sensitive apps for a decade.

## The problem in one snippet

Without a deliberate zone, picking "April 15" in Seoul stores April 14:

```ts
const picked = new Date(2026, 3, 15); // UTC+9 → "2026-04-14T15:00:00.000Z"
await save(picked.toISOString());     // server stores April 14
```

With `displayTimezone`, the same click always stores the same *civil* day:

```tsx
<DatePicker displayTimezone="Asia/Seoul" onChange={save}>
  <DatePicker.Input />
  <DatePicker.Popover>
    <DatePicker.Calendar />
  </DatePicker.Popover>
</DatePicker>
// click "April 15" → onChange("2026-04-14T15:00:00.000Z")
// which represents Seoul April 15 00:00 exactly
```

The ISO string is still UTC — but it is the UTC instant that equals civil midnight in the display zone, not civil midnight in the server's runtime zone.

## When to use it

| Situation | Recommendation |
| --- | --- |
| Calendar dates for logs, birthdays, anniversaries (single civil day) | Set `displayTimezone` to the user's zone. |
| Booking slots where a server renders for multiple regions | Store in UTC, render with the customer's `displayTimezone`. |
| Times of day in a single region | Set `displayTimezone` once on the root. |
| All users in one zone (e.g., a Korean-only product) | Setting `displayTimezone="Asia/Seoul"` makes timezone behavior explicit and safe against server runtime drift. |
| Never leaves UTC (analytics, audit trails) | Leave it unset — Kalyx's default semantics are UTC. |

## Component-level behavior

```tsx
<DatePicker displayTimezone="Asia/Seoul" value={iso} onChange={setIso}>
  <DatePicker.Input />           {/* formats `iso` as seen in Seoul */}
  <DatePicker.Popover>
    <DatePicker.Calendar />      {/* highlights today/selected by civil Seoul day */}
  </DatePicker.Popover>
</DatePicker>
```

| Surface | Effect |
| --- | --- |
| `DatePicker.Input` / `RangePicker.Input` / `DateTimePicker.Input` | `format` runs in `displayTimezone`. |
| `Calendar` | `today` and `isSelected` comparisons use civil-day equality in the zone. |
| `onChange` on calendar click | The stored ISO represents civil midnight of the clicked day *in the zone*. |
| `TimePicker.HourList` / `MinuteList` | Read and write time-of-day as observed in the zone (DST-aware). |

## DST handling

Kalyx delegates to `Intl.DateTimeFormat` for offset lookups, so transitions are handled correctly for all IANA zones.

```ts
// Spring forward 2026-03-08 in America/New_York: 02:00 EST → 03:00 EDT
startOfDayInTimezone('2026-03-08T12:00:00.000Z', 'America/New_York');
// → '2026-03-08T05:00:00.000Z'  (EST — midnight is still pre-transition)

startOfDayInTimezone('2026-03-09T12:00:00.000Z', 'America/New_York');
// → '2026-03-09T04:00:00.000Z'  (EDT — full day in daylight time)
```

## Low-level helpers

Import from `@kalyx/core` when you need to do the same math in your own code:

```ts
import {
  civilMidnightFromUtcDay,  // Calendar-cell UTC iso → civil midnight ISO in tz
  getTimeInTimezone,         // UTC iso → { hours, minutes, seconds } as seen in tz
  setTimeInTimezone,         // UTC iso + TimeValue → UTC iso with new time in tz
  formatInTimezone,
  startOfDayInTimezone,
  isSameDayInTimezone,
  todayInTimezone,
  getTimezoneOffsetMinutes,
} from '@kalyx/core';
```

## Migrating from no-timezone code

1. Decide on the display zone (user preference, account setting, or server-known region).
2. Add `displayTimezone={userZone}` on the root. Nothing else changes in the call site.
3. Run existing tests — they keep passing because the contract (`value`, `onChange` with UTC ISO strings) is unchanged; only the *content* of those strings now has a single, unambiguous meaning.

```diff
  <DatePicker
    value={iso}
    onChange={setIso}
+   displayTimezone={user.timezone ?? 'UTC'}
  >
    <DatePicker.Input />
    <DatePicker.Popover>
      <DatePicker.Calendar />
    </DatePicker.Popover>
  </DatePicker>
```

## Gotchas

- **Omitting the prop keeps UTC semantics.** Existing code continues to work.
- **Adapter contract unchanged.** Custom adapters implementing the `DateAdapter` interface should honor the `timezone?: string` parameter on `format`, `isSameDay`, `startOfDay`, and `today`. The built-in `DateFnsAdapter` already does.
- **IANA zone only.** Offsets like `"+09:00"` are not supported — use `"Asia/Seoul"`.
- **Hand-written `…T00:00:00.000Z` values are not civil midnight.** This is the one that bites. A literal like `'2026-01-15T00:00:00.000Z'` names a UTC coordinate; in `America/New_York` that instant is still January 14 locally, and in `Pacific/Auckland` it is already January 15 mid-afternoon. So the moment you turn on `displayTimezone`, values you assembled by hand — a `value` from a database `DATE` column, a `{ before }` / `{ after }` boundary, an argument to `isDateDisabled` — no longer mean the calendar day you typed.

  Use values of the same kind the picker emits: whatever came out of `onChange`, or an instant built with `civilMidnightFromUtcDay(coordinate, zone)`. Going the other way, `calendarDayFromInstant(instant, zone)` tells you which calendar cell an instant belongs to. Inside a custom grid, read the precomputed `isDisabled` / `isSelected` flags from `getCalendarDays` rather than re-deriving them — they are already normalized per cell.

## Next

- [Adapters →](./adapters.md)
- [ISO 8601 UTC strings →](./iso-string.md)
