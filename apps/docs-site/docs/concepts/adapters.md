---
id: adapters
title: Date adapters
sidebar_position: 4
---

# Date adapters

Kalyx doesn't hard-wire a date library. Everything goes through a `DateAdapter` interface. The default implementation wraps **date-fns v4**, but you can ship your own.

## The interface

```ts
import type { DateAdapter, ISODateString } from '@kalyx/react';

interface DateAdapter {
  parse(value: string, format: string): Date | null;
  format(iso: ISODateString, format: string, locale?: string): string;
  addDays(iso: ISODateString, amount: number): ISODateString;
  addMonths(iso: ISODateString, amount: number): ISODateString;
  addYears(iso: ISODateString, amount: number): ISODateString;
  isBefore(a: ISODateString, b: ISODateString): boolean;
  isAfter(a: ISODateString, b: ISODateString): boolean;
  isSameDay(a: ISODateString, b: ISODateString): boolean;
  isSameMonth(a: ISODateString, b: ISODateString): boolean;
  startOfDay(iso: ISODateString): ISODateString;
  startOfMonth(iso: ISODateString): ISODateString;
  endOfMonth(iso: ISODateString): ISODateString;
  startOfWeek(iso: ISODateString, weekStartsOn: 0 | 1): ISODateString;
  endOfWeek(iso: ISODateString, weekStartsOn: 0 | 1): ISODateString;
  now(): ISODateString;
  today(): ISODateString;
  isValid(value: string): boolean;
  getYear(iso: ISODateString): number;
  getMonth(iso: ISODateString): number;
  getDate(iso: ISODateString): number;
  getDay(iso: ISODateString): number;
}
```

## Using the default adapter

`DateFnsAdapter` is applied automatically. You rarely need to touch it:

```tsx
import { DatePicker } from '@kalyx/react';

<DatePicker value={iso} onChange={setIso}>
  <DatePicker.Calendar />
</DatePicker>
```

If you want to be explicit:

```tsx
import { DatePicker, DateFnsAdapter } from '@kalyx/react';

<DatePicker adapter={DateFnsAdapter} value={iso} onChange={setIso}>
  ...
</DatePicker>
```

## Why adapters?

- **Swap engines without changing component code.** The next big date API is `Temporal` — a lighter adapter will drop in when it lands in stable browsers.
- **Shrink bundles for niche use cases.** Teams using Luxon or Day.js can provide their own adapter and avoid shipping date-fns.
- **Test with a frozen clock.** A stub adapter that returns a fixed `today()` makes calendar tests deterministic.

## Writing a custom adapter

Any object satisfying the `DateAdapter` type works. A minimal Day.js-backed sketch:

```ts
import dayjs from 'dayjs';
import type { DateAdapter, ISODateString } from '@kalyx/react';

export const DayjsAdapter: DateAdapter = {
  parse: (value, format) => {
    const d = dayjs(value, format);
    return d.isValid() ? d.toDate() : null;
  },
  format: (iso, fmt) => dayjs.utc(iso).format(fmt),
  addDays: (iso, n) => dayjs.utc(iso).add(n, 'day').toISOString(),
  addMonths: (iso, n) => dayjs.utc(iso).add(n, 'month').toISOString(),
  addYears: (iso, n) => dayjs.utc(iso).add(n, 'year').toISOString(),
  isBefore: (a, b) => dayjs.utc(a).isBefore(dayjs.utc(b)),
  isAfter: (a, b) => dayjs.utc(a).isAfter(dayjs.utc(b)),
  isSameDay: (a, b) => dayjs.utc(a).isSame(dayjs.utc(b), 'day'),
  isSameMonth: (a, b) => dayjs.utc(a).isSame(dayjs.utc(b), 'month'),
  startOfDay: (iso) => dayjs.utc(iso).startOf('day').toISOString(),
  startOfMonth: (iso) => dayjs.utc(iso).startOf('month').toISOString(),
  endOfMonth: (iso) => dayjs.utc(iso).endOf('month').toISOString(),
  startOfWeek: (iso, w) => dayjs.utc(iso).startOf('week').add(w, 'day').toISOString(),
  endOfWeek: (iso, w) => dayjs.utc(iso).endOf('week').add(w, 'day').toISOString(),
  now: () => dayjs.utc().toISOString(),
  today: () => dayjs.utc().startOf('day').toISOString(),
  isValid: (v) => dayjs(v).isValid(),
  getYear: (iso) => dayjs.utc(iso).year(),
  getMonth: (iso) => dayjs.utc(iso).month(),
  getDate: (iso) => dayjs.utc(iso).date(),
  getDay: (iso) => dayjs.utc(iso).day(),
};
```

Pass it via the `adapter` prop:

```tsx
<DatePicker adapter={DayjsAdapter} value={iso} onChange={setIso}>
  <DatePicker.Calendar />
</DatePicker>
```

:::warning
Day.js support is an *example*, not an officially supported adapter. Keep all arithmetic in UTC — Kalyx assumes ISO strings end in `Z`.
:::

## Dependency note

`date-fns` and `date-fns-tz` are **runtime dependencies** of `@kalyx/react` today. A future release will move them behind a separate `@kalyx/adapter-date-fns` package so zero-adapter bundles can drop the weight entirely.

## Next

- [ISO strings →](./iso-string.md)
- [API Reference — core →](../api/core.md)
