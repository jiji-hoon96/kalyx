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
  | { dayOfWeek: number[] };

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

## See also

- [Concepts → ISO strings](../concepts/iso-string.md)
- [Concepts → Adapters](../concepts/adapters.md)
