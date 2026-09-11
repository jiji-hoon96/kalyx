---
id: adapters
title: Date adapters
sidebar_position: 4
description: 'Kalyx talks to date libraries through a DateAdapter. Use the published date-fns, Day.js or Luxon adapter, or write your own.'
---

# Date adapters

Kalyx doesn't hard-wire a date library. Everything goes through a `DateAdapter` interface. The default implementation wraps **date-fns v4**, but you can ship your own.

## The interface

```ts
import type { DateAdapter, ISODateString } from '@kalyx/react';

interface DateAdapter {
  /** Any format → ISO 8601 UTC string. `format` is a parsing hint, not required. */
  parse(value: string, format?: string): string;

  /** ISO string → display string. The third argument is an IANA timezone, not a locale. */
  format(iso: string, formatStr: string, timezone?: string): string;

  addDays(iso: string, n: number): string;
  addMonths(iso: string, n: number): string;
  addYears(iso: string, n: number): string;

  isBefore(a: string, b: string): boolean;
  isAfter(a: string, b: string): boolean;
  isSameDay(a: string, b: string, timezone?: string): boolean;
  isSameMonth(a: string, b: string): boolean;

  startOfDay(iso: string, timezone?: string): string;
  startOfMonth(iso: string): string;
  endOfMonth(iso: string): string;
  startOfWeek(iso: string, weekStartsOn?: 0 | 1): string;
  endOfWeek(iso: string, weekStartsOn?: 0 | 1): string;

  now(): string;
  today(timezone?: string): string;

  isValid(value: string): boolean;

  getYear(iso: string): number;
  getMonth(iso: string): number;
  getDate(iso: string): number;
  getDay(iso: string): number;
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

## Using a non-default adapter

Day.js and Luxon do not need a hand-written adapter any more. Both ship as published
packages, so the supported path is to install one and pass it to the `/headless` entry:

```bash npm2yarn
npm install @kalyx/react @kalyx/adapter-dayjs dayjs
```

```tsx
import { DatePicker } from '@kalyx/react/headless';
import { DayjsAdapter } from '@kalyx/adapter-dayjs';

<DatePicker adapter={DayjsAdapter} value={iso} onChange={setIso}>
  <DatePicker.Input />
  <DatePicker.Popover>
    <DatePicker.Calendar />
  </DatePicker.Popover>
</DatePicker>;
```

`@kalyx/adapter-luxon` works the same way with `LuxonAdapter`. The `/headless` entry
ships no adapter of its own, so `adapter` is required there — omitting it throws at
render time with a message naming the component.

## Writing your own adapter

Write one only for a backend Kalyx does not publish. The contract is the `DateAdapter`
interface above; three details are easy to get wrong:

- `parse` returns an **ISO string**, not a `Date`. Its `format` argument is an optional hint.
- `format`'s third argument is an **IANA timezone**, not a locale.
- `isSameDay`, `startOfDay`, and `today` all take an optional `timezone`. Ignoring it
  breaks `displayTimezone` for every picker.

Keep all arithmetic in UTC — Kalyx assumes ISO strings end in `Z`.

Do not hand-verify the result. `@kalyx/core/test-helpers` exports the same conformance
suite the three official adapters run, and it is the definition of "correct" here:

```ts
import { describe, it, expect } from 'vitest';
import { runAdapterConformanceTests } from '@kalyx/core/test-helpers';
import { MyAdapter } from './my-adapter';

runAdapterConformanceTests(MyAdapter, { describe, it, expect });
```

## Dependency note

`@kalyx/core` is now date-library-agnostic — it carries no `date-fns`
dependency of its own. The default adapter lives in `@kalyx/adapter-date-fns`
and is auto-installed by the main `@kalyx/react` entry, so installing
`@kalyx/react` still "just works".

If you already ship `dayjs`, `luxon`, or `Temporal`, you can swap the
adapter out and drop `date-fns` from your bundle entirely by importing from
`@kalyx/react/headless`. Kalyx publishes drop-in adapters for two of these
(`@kalyx/adapter-dayjs` and `@kalyx/adapter-luxon`), so you don't have to write
one yourself. See the [adapters guide](../guides/adapters.md) for the full
how-to.

## Next

- [Adapters guide (custom adapters, `/headless` entry) →](../guides/adapters.md)
- [ISO strings →](./iso-string.md)
- [API Reference — core →](../api/core.md)
