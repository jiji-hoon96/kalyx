---
title: Date adapters & the headless entry
sidebar_position: 1
---

# Date adapters & the `/headless` entry

`@kalyx/react` ships with `date-fns` wired up out of the box. If you're starting
fresh, you don't need to think about adapters — install, import, render, done.

This guide is for the second case: you already ship `dayjs`, `luxon`, or
`Temporal` in your app, and you'd rather not bundle a second date library just
because Kalyx is here.

## Prebuilt adapter packages

Before writing your own, check whether Kalyx already ships one. Each is a thin,
UTC-pinned `DateAdapter` validated against the shared conformance suite
(`@kalyx/core/test-helpers`), so they behave identically to the default:

| Package | Backend | When to use |
| --- | --- | --- |
| `@kalyx/adapter-date-fns` | date-fns | Default. Auto-installed by `@kalyx/react`. |
| `@kalyx/adapter-dayjs` | dayjs | You already ship dayjs (Mantine and many app stacks). |
| `@kalyx/adapter-luxon` | luxon | You already ship luxon (common in enterprise / timezone-heavy stacks). |

```bash npm2yarn
npm install @kalyx/adapter-luxon   # or @kalyx/adapter-dayjs
```

```tsx
import { DatePicker } from '@kalyx/react/headless';
import { LuxonAdapter } from '@kalyx/adapter-luxon';

<DatePicker adapter={LuxonAdapter} value={iso} onChange={setIso}>
  <DatePicker.Input />
  <DatePicker.Popover>
    <DatePicker.Calendar />
  </DatePicker.Popover>
</DatePicker>
```

All three run every operation in UTC for the same ISO 8601 (`...Z`) semantics,
and delegate timezone-aware work to `@kalyx/core` (the correctness logic lives
in core, not in each adapter). If none fits your backend, write your own with the
[interface below](#writing-your-own-adapter).

---

## Default (date-fns)

```bash npm2yarn
npm install @kalyx/react
```

```tsx
import { DatePicker } from '@kalyx/react';

<DatePicker value={iso} onChange={setIso}>
  <DatePicker.Input />
  <DatePicker.Popover>
    <DatePicker.Calendar />
  </DatePicker.Popover>
</DatePicker>
```

The main entry auto-installs `DateFnsAdapter`, so the required date-fns functions
are part of the consumer graph and the calendar works immediately. Measure the
exact cost with your application's bundler; it varies with the surrounding graph.

This is the right choice for **most** apps. Keep reading only if you have a
reason to switch.

---

## Why would I switch?

You should switch to the `/headless` entry when:

- **You already ship `dayjs` / `luxon` / `Temporal`.** Bundling `date-fns`
  alongside is dead weight — a second parser, a second arithmetic engine,
  a second formatter.
- **You need a date library Kalyx doesn't bundle.** Pass your own adapter and
  Kalyx will route every date operation through it.
- **You need a deterministic clock for tests.** A stub adapter whose `today()`
  always returns the same ISO string makes calendar snapshots stable.

If none of these apply, stay on the default — switching costs more bytes of
your attention than it saves of your bundle.

---

## Using a custom adapter

Import from `@kalyx/react/headless` and pass an `adapter` prop. The component
surface is otherwise identical to `@kalyx/react`:

```tsx
import { DatePicker } from '@kalyx/react/headless';
import { DateFnsAdapter } from '@kalyx/adapter-date-fns';
// or a prebuilt one: import { LuxonAdapter } from '@kalyx/adapter-luxon';
// or your own: import { MyAdapter } from './my-adapter';

<DatePicker adapter={DateFnsAdapter} value={iso} onChange={setIso}>
  <DatePicker.Input />
  <DatePicker.Popover>
    <DatePicker.Calendar />
  </DatePicker.Popover>
</DatePicker>
```

Every Root component (`DatePicker`, `RangePicker`, `TimePicker`,
`DateTimePicker`, `MonthPicker`, `YearPicker`, `WeekPicker`) accepts the same
`adapter` prop. Every hook (`useDatePicker`, `useRangePicker`,
`useTimePicker`) accepts an `adapter` option.

If you forget the `adapter` prop on the headless entry, the Root throws a
clear error at render time:

```
[@kalyx/react/headless] DatePicker requires an adapter.
Pass one via <DatePicker adapter={...}>.
If you don't need a custom adapter, import from '@kalyx/react' instead.
```

This is intentional — catching the mistake at render is much friendlier than
crashing later inside a `addMonths` call with a stack trace pointing at the
Calendar grid.

### Mixing entries

You can use `@kalyx/react` (with the default adapter) for most of your app and
`@kalyx/react/headless` (with a custom adapter) for the one screen that needs
it. They compose freely — the component implementations are the same code,
only the default-adapter installation differs.

---

## Writing your own adapter

If your date library isn't in the [prebuilt list](#prebuilt-adapter-packages)
(date-fns, dayjs, luxon), implement the `DateAdapter` interface yourself. It has
**21 methods**. All of them take ISO 8601 UTC
strings as input and return either ISO strings, booleans, or numbers. Native
`Date` objects never cross the boundary.

```ts
import type { DateAdapter } from '@kalyx/react/headless';

interface DateAdapter {
  // Parsing & formatting
  parse(value: string, format?: string): string;
  format(iso: string, formatStr: string, timezone?: string): string;

  // Arithmetic
  addDays(iso: string, n: number): string;
  addMonths(iso: string, n: number): string;
  addYears(iso: string, n: number): string;

  // Comparison
  isBefore(a: string, b: string): boolean;
  isAfter(a: string, b: string): boolean;
  isSameDay(a: string, b: string, timezone?: string): boolean;
  isSameMonth(a: string, b: string): boolean;

  // Boundaries
  startOfDay(iso: string, timezone?: string): string;
  startOfMonth(iso: string): string;
  endOfMonth(iso: string): string;
  startOfWeek(iso: string, weekStartsOn?: 0 | 1): string;
  endOfWeek(iso: string, weekStartsOn?: 0 | 1): string;

  // Clock
  now(): string;       // Current instant
  today(timezone?: string): string;  // Civil midnight in the given zone

  // Validation
  isValid(value: string): boolean;

  // Component access
  getYear(iso: string): number;
  getMonth(iso: string): number;  // 0-indexed (matches Date.getUTCMonth)
  getDate(iso: string): number;
  getDay(iso: string): number;    // 0=Sunday
}
```

### dayjs reference implementation

Sketch — works for most non-DST-edge use cases. Install
`dayjs`, `dayjs/plugin/utc`, `dayjs/plugin/timezone`,
`dayjs/plugin/customParseFormat`.

```ts
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type { DateAdapter } from '@kalyx/react/headless';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

// date-fns tokens (yyyy, MM, dd, HH, mm) → dayjs tokens (YYYY, MM, DD, HH, mm).
// Kalyx passes date-fns-style format strings everywhere, so we translate at the edge.
function toDayjsFormat(fmt: string): string {
  return fmt
    .replace(/yyyy/g, 'YYYY')
    .replace(/yy/g, 'YY')
    .replace(/dd/g, 'DD')
    .replace(/d/g, 'D');
}

export const DayjsAdapter: DateAdapter = {
  parse: (value, format) =>
    format ? dayjs.utc(value, toDayjsFormat(format)).toISOString() : dayjs.utc(value).toISOString(),

  format: (iso, fmt, tz) => {
    const d = tz ? dayjs.utc(iso).tz(tz) : dayjs.utc(iso);
    return d.format(toDayjsFormat(fmt));
  },

  addDays: (iso, n) => dayjs.utc(iso).add(n, 'day').toISOString(),
  addMonths: (iso, n) => dayjs.utc(iso).add(n, 'month').toISOString(),
  addYears: (iso, n) => dayjs.utc(iso).add(n, 'year').toISOString(),

  isBefore: (a, b) => dayjs.utc(a).isBefore(dayjs.utc(b)),
  isAfter: (a, b) => dayjs.utc(a).isAfter(dayjs.utc(b)),
  isSameDay: (a, b, tz) => {
    const da = tz ? dayjs.utc(a).tz(tz) : dayjs.utc(a);
    const db = tz ? dayjs.utc(b).tz(tz) : dayjs.utc(b);
    return da.isSame(db, 'day');
  },
  isSameMonth: (a, b) => dayjs.utc(a).isSame(dayjs.utc(b), 'month'),

  startOfDay: (iso, tz) => {
    const d = tz ? dayjs.utc(iso).tz(tz) : dayjs.utc(iso);
    return d.startOf('day').toISOString();
  },
  startOfMonth: (iso) => dayjs.utc(iso).startOf('month').toISOString(),
  endOfMonth: (iso) => dayjs.utc(iso).endOf('month').toISOString(),
  startOfWeek: (iso, weekStartsOn = 0) => {
    // dayjs.startOf('week') is locale-dependent. Compute manually to match Kalyx's
    // weekStartsOn contract (0 = Sunday, 1 = Monday).
    const d = dayjs.utc(iso);
    const dow = d.day();
    const diff = (dow - weekStartsOn + 7) % 7;
    return d.subtract(diff, 'day').startOf('day').toISOString();
  },
  endOfWeek: (iso, weekStartsOn = 0) => {
    const d = dayjs.utc(iso);
    const dow = d.day();
    const diff = (weekStartsOn + 6 - dow + 7) % 7;
    return d.add(diff, 'day').endOf('day').toISOString();
  },

  now: () => dayjs.utc().toISOString(),
  today: (tz) => {
    const d = tz ? dayjs().tz(tz) : dayjs.utc();
    return d.startOf('day').toISOString();
  },

  isValid: (v) => dayjs(v).isValid(),

  getYear: (iso) => dayjs.utc(iso).year(),
  getMonth: (iso) => dayjs.utc(iso).month(),  // already 0-indexed
  getDate: (iso) => dayjs.utc(iso).date(),
  getDay: (iso) => dayjs.utc(iso).day(),
};
```

Then:

```tsx
import { DatePicker } from '@kalyx/react/headless';
import { DayjsAdapter } from './my-dayjs-adapter';

<DatePicker adapter={DayjsAdapter} value={iso} onChange={setIso}>
  <DatePicker.Calendar />
</DatePicker>
```

### Things to get right

- **Always return ISO 8601 UTC strings** (ending in `Z`). Local-time strings
  will silently drift on the next operation.
- **`getMonth` is 0-indexed.** Match `Date.getUTCMonth()`. luxon's `.month`
  is 1-indexed — subtract 1.
- **`startOfDay` / `today` take a timezone**. When provided, return the
  civil-midnight instant *of that zone*, not UTC midnight. Without it, return
  UTC midnight of the same calendar day. The TimePicker and Calendar both
  rely on this distinction across DST boundaries.
- **`format` tokens follow date-fns** (`yyyy`, `MM`, `dd`, `HH`, `mm`). If
  your library uses different tokens, translate at the adapter boundary as
  shown above.

### Testing your adapter

The fastest sanity check is to render `<DatePicker.Calendar />` with the
adapter and step through a month with arrow keys. If the dates align with
what your library reports, the contract holds.

For full confidence, run the shared conformance suite. `@kalyx/core/test-helpers`
exports `runAdapterConformanceTests`, the exact suite the prebuilt adapters are
validated against. It covers leap years, DST transitions, end-of-month
rollover, and the weekday / month-index conventions:

```ts
import { describe, it, expect } from 'vitest';
import { runAdapterConformanceTests } from '@kalyx/core/test-helpers';
import { MyAdapter } from './my-adapter';

runAdapterConformanceTests(MyAdapter, { describe, it, expect });
```

If every case passes, your adapter satisfies the same contract as
`@kalyx/adapter-date-fns`, `@kalyx/adapter-dayjs`, and `@kalyx/adapter-luxon`.

---

## Next

- [ISO strings →](../concepts/iso-string.md)
- [Timezone handling →](../concepts/timezone.md)
- [Core API reference →](../api/core.md)
