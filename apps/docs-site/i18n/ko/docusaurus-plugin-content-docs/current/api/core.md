---
id: core
title: '@kalyx/core'
sidebar_position: 1
---

# @kalyx/core

Platform-independent date logic. Usually consumed transitively through `@kalyx/react`.

```bash
pnpm add @kalyx/core
```

The examples that use `DateFnsAdapter` also require its adapter package and underlying date library:

```bash
pnpm add @kalyx/adapter-date-fns date-fns
```

## Types

```ts
type ISODateString = string;

type DisabledRule =
  | { date: ISODateString }
  | { before: ISODateString }
  | { after: ISODateString }
  | { dayOfWeek: number[] }
  | { filter: (iso: ISODateString) => boolean };

type DateRange = {
  start: ISODateString | null;
  end: ISODateString | null;
};

type CalendarDay = {
  isoString: ISODateString;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  isFocused: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isInRange: boolean;
};

type CalendarWeek = CalendarDay[];
type CalendarGrid = CalendarWeek[];

type WeekStartsOn = 0 | 1;

type CalendarOptions = {
  weekStartsOn?: WeekStartsOn;
  today?: ISODateString;
  selected?: ISODateString | null;
  focusedDate?: ISODateString;
  disabled?: DisabledRule[];
  range?: DateRange | null;
  rangeHover?: ISODateString | null;
  timezone?: string;
  fixedWeeks?: boolean;
};

type TimeValue = {
  hours: number;
  minutes: number;
  seconds: number;
};
```

## `DateAdapter`

See the [Adapters concept →](../concepts/adapters.md) for the full interface.

## `DateFnsAdapter`

Default adapter — UTC-safe, built on date-fns v4.

```ts
import { DateFnsAdapter } from '@kalyx/adapter-date-fns';
```

## Calendar utilities

### `getCalendarDays(viewMonth, adapter, options)`

Build a 4–6 week grid for a month. Set `fixedWeeks: true` when the layout requires exactly 6 weeks.

```ts
import { DateFnsAdapter } from '@kalyx/adapter-date-fns';
import { getCalendarDays } from '@kalyx/core';

const grid = getCalendarDays(
  '2026-04-01T00:00:00.000Z',
  DateFnsAdapter,
  { weekStartsOn: 0, today: '2026-04-16T00:00:00.000Z', fixedWeeks: true },
);
```

Returns `CalendarGrid` (4–6 arrays of 7 `CalendarDay`s). Leading and trailing days belong to neighboring months (`isCurrentMonth: false`). With `fixedWeeks: true`, the result is always 6×7.

### `isDateDisabled(iso, rules, adapter, timezone?)`

```ts
import { DateFnsAdapter } from '@kalyx/adapter-date-fns';
import { isDateDisabled } from '@kalyx/core';

isDateDisabled(
  '2026-04-18T00:00:00.000Z',
  [{ dayOfWeek: [0, 6] }],
  DateFnsAdapter,
); // → true (Saturday)

// With `timezone`, `{ date }` / `{ dayOfWeek }` rules match by the civil day in
// that zone. Pass the civil-midnight-in-timezone instant the pickers emit — the
// same value `onChange` gives you — not a raw `…T00:00:00Z` grid coordinate:
isDateDisabled(
  '2026-01-15T05:00:00.000Z',            // civil Jan 15 in America/New_York
  [{ date: '2026-01-15T05:00:00.000Z' }],
  DateFnsAdapter,
  'America/New_York',
); // → true
```

`iso` is the point-in-time value being tested, not a hand-built UTC-midnight grid
coordinate: under a negative UTC offset, `2026-01-15T00:00:00.000Z` is still the
14th locally. `{ before }` / `{ after }` are instant comparisons and ignore
`timezone`. When you just need per-cell disabled state for a calendar, read the
precomputed `isDisabled` flag from `getCalendarDays(...)` instead — it normalizes
each cell for you.

### `getISOWeekNumber(iso)`

ISO 8601 week number (1–53) of the instant's UTC day. Weeks start Monday and week 1 is the one containing the first Thursday of the year, so early-January and late-December dates can belong to the neighboring year's numbering. `WeekPicker` uses this for its week labels.

```ts
import { getISOWeekNumber } from '@kalyx/core';

getISOWeekNumber('2026-01-01T00:00:00.000Z'); // → 1   (a Thursday, so ISO week 1)
getISOWeekNumber('2026-04-15T00:00:00.000Z'); // → 16
getISOWeekNumber('2026-12-31T00:00:00.000Z'); // → 53
```

This reads the **UTC** day. Under a `displayTimezone` the civil day can differ, so convert first with `calendarDayFromInstant(iso, timeZone)` if you need the week number the user sees.

### `minDate(a, b, adapter)` / `maxDate(a, b, adapter)`

```ts
import { DateFnsAdapter } from '@kalyx/adapter-date-fns';
import { minDate } from '@kalyx/core';

minDate(
  '2026-04-15T00:00:00.000Z',
  '2026-04-10T00:00:00.000Z',
  DateFnsAdapter,
);
// → "2026-04-10T00:00:00.000Z"
```

## Date string utilities

### `normalizeISO(value)`

Lenient normalizer — expands a date-only value like `2026-04-15` to a full UTC-midnight ISO string. Full ISO datetimes and unrecognized strings are returned unchanged; an empty string stays empty.

### `parseInputValue(input, adapter)`

Parse `yyyy-MM-dd`, `yyyy/MM/dd`, or an eight-digit `yyyyMMdd` user input.

```ts
import { DateFnsAdapter } from '@kalyx/adapter-date-fns';
import { parseInputValue } from '@kalyx/core';

parseInputValue('2026/04/15', DateFnsAdapter);
// → "2026-04-15T00:00:00.000Z"
```

## Time utilities

### `setTime(iso, partial)` / `getTime(iso)`

```ts
import { setTime, getTime } from '@kalyx/core';

setTime('2026-04-15T00:00:00.000Z', { hours: 9, minutes: 30 });
// → "2026-04-15T09:30:00.000Z"

getTime('2026-04-15T09:30:00.000Z');
// → { hours: 9, minutes: 30, seconds: 0 }
```

### `parseTimeString(input)` / `formatTimeString(time, withSeconds?)`

```ts
import { formatTimeString, parseTimeString } from '@kalyx/core';

parseTimeString('09:30');   // → { hours: 9, minutes: 30, seconds: 0 }
parseTimeString('09:30:45'); // → { hours: 9, minutes: 30, seconds: 45 }
formatTimeString({ hours: 9, minutes: 30, seconds: 0 });       // → "09:30"
formatTimeString({ hours: 9, minutes: 30, seconds: 0 }, true); // → "09:30:00"
```

### `formatTimeFromISO(iso, format)`

Format an ISO datetime in UTC using `HH:mm`, `HH:mm:ss`, `h:mm a`, or `h:mm:ss a`.

```ts
import { formatTimeFromISO } from '@kalyx/core';

formatTimeFromISO('2026-04-15T13:30:00.000Z', 'h:mm a');
// → "1:30 PM"
```

### 12h helpers

```ts
import { to12Hour, to24Hour } from '@kalyx/core';

to12Hour(13);                    // → { hours12: 1, period: 'PM' }
to24Hour(1, 'PM');               // → 13
```

### Option generators

```ts
import { generateHours, generateMinutes } from '@kalyx/core';

generateHours('24h'); // → [0, 1, 2, …, 23]
generateHours('12h'); // → [1, 2, …, 12]
generateMinutes(15);  // → [0, 15, 30, 45]
```

### `isSameTime(a, b)`

```ts
import { isSameTime } from '@kalyx/core';

isSameTime({ hours: 9, minutes: 0, seconds: 0 }, { hours: 9, minutes: 0, seconds: 0 });
// → true
```

## Locale utilities

```ts
import { formatFullDate, formatMonthYear, getMonthName, getWeekdayNames } from '@kalyx/core';

getMonthName(3, 'en-US');            // → "April"
formatMonthYear(2026, 3, 'en-US');   // → "April 2026"
getWeekdayNames('en-US', 0);
// → [{ short: 'Sun', full: 'Sunday' }, …]
formatFullDate('2026-04-15T00:00:00.000Z', 'en-US');
// → "Wednesday, April 15, 2026"
```

### `getWeekStartForLocale(locale?)`

The first day of the week the locale conventionally uses, as a `WeekStartsOn` (`0` = Sunday … `6` = Saturday). `DatePicker` and `RangePicker` call this when you don't pass `weekStartsOn`; an explicit prop always wins.

```ts
import { getWeekStartForLocale } from '@kalyx/core';

getWeekStartForLocale('en-US'); // → 0  (Sunday)
getWeekStartForLocale('de-DE'); // → 1  (Monday)
```

Only `0` and `1` are produced — those are the two starts the runtime's locale data distinguishes.

### `getDayPeriodName(period, locale?)`

Localized AM/PM name, used by `TimePicker.AmPmToggle`.

```ts
import { getDayPeriodName } from '@kalyx/core';

getDayPeriodName('AM', 'en-US'); // → "AM"
getDayPeriodName('PM', 'ko-KR'); // → "오후"
```

## Timezone utilities

Used internally by every picker when `displayTimezone` is set. Exposed publicly so you can run the same math yourself.

### `formatInTimezone(iso, formatStr, timeZone)`

Format a UTC instant in the requested zone. Handles DST transitions.

```ts
import { formatInTimezone } from '@kalyx/core';

formatInTimezone('2026-03-08T07:30:00.000Z', 'yyyy-MM-dd HH:mm', 'America/New_York');
// → '2026-03-08 03:30'   (post spring-forward EDT)
```

### `startOfDayInTimezone(iso, timeZone)`

Civil midnight of the given UTC instant's day, expressed as a UTC ISO string.

```ts
import { startOfDayInTimezone } from '@kalyx/core';

startOfDayInTimezone('2026-01-15T12:00:00.000Z', 'Asia/Seoul');
// → '2026-01-14T15:00:00.000Z'
```

### `isSameDayInTimezone(a, b, timeZone)`

Civil-day equality in the zone. Timezone-safe alternative to comparing `iso.slice(0, 10)`.

### `todayInTimezone(timeZone)`

"Today" expressed as civil midnight in the zone.

### `getTimezoneOffsetMinutes(iso, timeZone)`

UTC offset (minutes east of UTC) at the given instant. Differs before and after DST transitions.

### `civilMidnightFromUtcDay(gridUtcIso, timeZone)`

The bridge Calendar uses: maps a UTC-midnight grid cell ISO to civil midnight of the same calendar day in the zone. You rarely need this directly — it is exported for custom calendar renderers.

```ts
import { civilMidnightFromUtcDay } from '@kalyx/core';

civilMidnightFromUtcDay('2026-01-15T00:00:00.000Z', 'Asia/Seoul');
// → '2026-01-14T15:00:00.000Z'   (Seoul Jan 15, 00:00)
```

### `calendarDayFromInstant(iso, timeZone)`

The inverse of `civilMidnightFromUtcDay`: takes any instant and returns the UTC-midnight coordinate of the civil day that instant falls on in the zone. Use it to answer "which calendar cell does this value belong to?"

```ts
import { calendarDayFromInstant } from '@kalyx/core';

calendarDayFromInstant('2025-12-31T15:00:00.000Z', 'Asia/Seoul');
// → '2026-01-01T00:00:00.000Z'   (already Jan 1 in Seoul)
calendarDayFromInstant('2026-01-15T05:00:00.000Z', 'America/New_York');
// → '2026-01-15T00:00:00.000Z'
```

The two functions round-trip in every IANA zone: `calendarDayFromInstant(civilMidnightFromUtcDay(c, tz), tz) === c`. That property is enforced across all zones in the core test suite.

### `getTimeInTimezone(iso, timeZone)` / `setTimeInTimezone(iso, partial, timeZone)`

Read and write time-of-day as observed in the zone. `setTimeInTimezone` preserves the civil date and replaces the time portion, iterating once to absorb DST offsets.

```ts
import { setTimeInTimezone } from '@kalyx/core';

setTimeInTimezone('2026-01-15T00:00:00.000Z', { hours: 10 }, 'Asia/Seoul');
// → '2026-01-15T01:00:00.000Z'   (Seoul 10:00 = UTC 01:00)
```

See the [Timezone concept page](../concepts/timezone.md) for usage patterns.

## Accessibility labels

Default ARIA label sets. Override via the `labels` prop on any picker Root.

```ts
import {
  DEFAULT_DATEPICKER_LABELS,
  DEFAULT_RANGEPICKER_LABELS,
  DEFAULT_TIMEPICKER_LABELS,
  DEFAULT_DATETIMEPICKER_LABELS,
} from '@kalyx/core';

import type {
  DatePickerLabels,
  RangePickerLabels,
  TimePickerLabels,
  DateTimePickerLabels,
} from '@kalyx/core';
```

Each label set provides keys like `triggerOpen`, `prevMonth`, `nextMonth`, `hourOption(h)`, etc. Pass a `Partial<*Labels>` to override only what you need:

```tsx
import { DatePicker } from '@kalyx/react';

<DatePicker labels={{ triggerOpen: 'Open calendar', triggerClose: 'Close calendar' }}>
  <span />
</DatePicker>;
```

## See also

- [Concepts → ISO strings](../concepts/iso-string.md)
- [Concepts → Adapters](../concepts/adapters.md)
- [Concepts → Timezone](../concepts/timezone.md)
