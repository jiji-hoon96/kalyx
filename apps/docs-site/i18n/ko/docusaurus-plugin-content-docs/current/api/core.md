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
  range?: DateRange;
  rangeHover?: ISODateString | null;
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
import { DateFnsAdapter } from '@kalyx/core';
```

## Calendar utilities

### `getCalendarDays(viewMonth, adapter, options)`

Build a 6-week grid for a month.

```ts
import { getCalendarDays, DateFnsAdapter } from '@kalyx/core';

const grid = getCalendarDays(
  '2026-04-01T00:00:00.000Z',
  DateFnsAdapter,
  { weekStartsOn: 0, today: '2026-04-16T00:00:00.000Z' },
);
```

Returns `CalendarGrid` (6×7 `CalendarDay`s). Leading and trailing days belong to neighboring months (`isCurrentMonth: false`).

### `isDateDisabled(iso, rules, adapter)`

```ts
import { isDateDisabled, DateFnsAdapter } from '@kalyx/core';

isDateDisabled(
  '2026-04-18T00:00:00.000Z',
  [{ dayOfWeek: [0, 6] }],
  DateFnsAdapter,
); // → true (Saturday)
```

### `minDate(dates)` / `maxDate(dates)`

```ts
import { minDate, maxDate } from '@kalyx/core';

minDate(['2026-04-15T00:00:00.000Z', '2026-04-10T00:00:00.000Z']);
// → "2026-04-10T00:00:00.000Z"
```

## Date string utilities

### `normalizeISO(value)`

Lenient parser — accepts partial inputs like `2026-04-15` and returns a full UTC midnight ISO string. Returns `null` for invalid input.

### `parseInputValue(input, format, adapter)`

Parse a user-typed string with an explicit format.

```ts
parseInputValue('15/04/2026', 'dd/MM/yyyy', DateFnsAdapter);
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
parseTimeString('09:30');   // → { hours: 9, minutes: 30, seconds: 0 }
parseTimeString('09:30:45'); // → { hours: 9, minutes: 30, seconds: 45 }
formatTimeString({ hours: 9, minutes: 30, seconds: 0 });       // → "09:30"
formatTimeString({ hours: 9, minutes: 30, seconds: 0 }, true); // → "09:30:00"
```

### `formatTimeFromISO(iso, withSeconds?)`

Convenience wrapper — equivalent to `formatTimeString(getTime(iso), withSeconds)`.

### 12h helpers

```ts
import { to12Hour, to24Hour } from '@kalyx/core';

to12Hour(13);                    // → { hours12: 1, period: 'PM' }
to24Hour(1, 'PM');               // → 13
```

### Option generators

```ts
generateHours('24h'); // → [0, 1, 2, …, 23]
generateHours('12h'); // → [12, 1, 2, …, 11]
generateMinutes(15);  // → [0, 15, 30, 45]
```

### `isSameTime(a, b)`

```ts
isSameTime({ hours: 9, minutes: 0, seconds: 0 }, { hours: 9, minutes: 0, seconds: 0 });
// → true
```

## Locale utilities

```ts
getMonthName(3, 'en-US');            // → "April"
formatMonthYear(2026, 3, 'en-US');   // → "April 2026"
getWeekdayNames('en-US', 0);
// → [{ short: 'Sun', full: 'Sunday' }, …]
formatFullDate('2026-04-15T00:00:00.000Z', 'en-US');
// → "April 15, 2026"
```

## Timezone utilities

Used internally by every picker when `displayTimezone` is set. Exposed publicly so you can run the same math yourself.

### `formatInTimezone(iso, formatStr, timeZone)`

Format a UTC instant in the requested zone. Handles DST transitions.

```ts
formatInTimezone('2026-03-08T07:30:00.000Z', 'yyyy-MM-dd HH:mm', 'America/New_York');
// → '2026-03-08 03:30'   (post spring-forward EDT)
```

### `startOfDayInTimezone(iso, timeZone)`

Civil midnight of the given UTC instant's day, expressed as a UTC ISO string.

```ts
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

### `getTimeInTimezone(iso, timeZone)` / `setTimeInTimezone(iso, partial, timeZone)`

Read and write time-of-day as observed in the zone. `setTimeInTimezone` preserves the civil date and replaces the time portion, iterating once to absorb DST offsets.

```ts
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
<DatePicker labels={{ triggerOpen: 'Open calendar', triggerClose: 'Close calendar' }}>
```

## See also

- [Concepts → ISO strings](../concepts/iso-string.md)
- [Concepts → Adapters](../concepts/adapters.md)
- [Concepts → Timezone](../concepts/timezone.md)
