# @kalyx/react

> The headless React DatePicker, finally complete. Zero CSS · SSR-safe · ~15.99 KB gzip (≤ 17 KB ceiling).

[![npm](https://img.shields.io/npm/v/@kalyx/react?color=5b4fe1)](https://www.npmjs.com/package/@kalyx/react)
[![Bundle](https://img.shields.io/badge/gzip-15.99KB-brightgreen)](https://kalyx-docs-site.vercel.app/docs/api/react#bundle-size)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](https://github.com/jiji-hoon96/kalyx/blob/main/LICENSE)

Composable React primitives for **seven date-related surfaces** — single date, date range, time, date+time, month, year, and week — under one Radix-style dot-notation API. Pair with Tailwind, shadcn/ui, Chakra, or any CSS.

**📚 Full docs:** [kalyx-docs-site.vercel.app](https://kalyx-docs-site.vercel.app) · [한국어](https://kalyx-docs-site.vercel.app/ko)

## Install

```bash
pnpm add @kalyx/react
# npm install @kalyx/react
# yarn add @kalyx/react
```

Requires React ≥ 19.

> Comparing alternatives? See the [feature matrix](https://kalyx-docs-site.vercel.app/docs/comparison) — we hold every cell honestly, including where react-datepicker / react-aria / MUI win.

## Quick example

```tsx
import { useState } from 'react';
import { DatePicker, type ISODateString } from '@kalyx/react';

export function BookingField() {
  const [date, setDate] = useState<ISODateString | null>(null);
  return (
    <DatePicker value={date} onChange={setDate}>
      <DatePicker.Input placeholder="YYYY-MM-DD" />
      <DatePicker.Trigger />
      <DatePicker.Popover>
        <DatePicker.Calendar />
      </DatePicker.Popover>
    </DatePicker>
  );
}
```

Value is always an `ISODateString | null` — UTC-safe, no `Date` objects.

## What you get

```tsx
import {
  DatePicker,        // single date
  RangePicker,       // date range + presets
  TimePicker,        // hour + minute (+ seconds)
  DateTimePicker,    // date + time combined
  MonthPicker,       // month-only selection
  YearPicker,        // year-only selection
  WeekPicker,        // full-week range selection
  useDatePicker,     // hook for custom UIs
  useRangePicker,
  useTimePicker,
  DateFnsAdapter,    // default adapter (re-exported from @kalyx/core)
} from '@kalyx/react';
```

## Features

- **Zero CSS** — no stylesheets to import.
- **Composition** — Radix-style `<DatePicker.Input />`, `<DatePicker.Calendar />`, etc.
- **SSR-safe** — tested on Next.js App Router.
- **ISO 8601 UTC strings** — eliminates `Date`-object footguns.
- **Accessible** — ARIA roles, keyboard navigation, axe-clean.
- **Tree-shakable** — pay only for the components you render.
- **TypeScript strict** — no `any`, full type exports.

## Styling

Every sub-component forwards `className`, `style`, and `ref`, and accepts a `classNames` slot map:

```tsx
<DatePicker.Calendar
  classNames={{
    day: 'h-8 w-8 rounded hover:bg-neutral-100',
    daySelected: 'bg-indigo-600 text-white',
    dayToday: 'ring-1 ring-indigo-400',
  }}
/>
```

Full recipes: [Tailwind](https://kalyx-docs-site.vercel.app/docs/recipes/tailwind), [shadcn/ui](https://kalyx-docs-site.vercel.app/docs/recipes/shadcn), [React Hook Form](https://kalyx-docs-site.vercel.app/docs/recipes/react-hook-form).

## Bring your own adapter

Already shipping `dayjs`, `luxon`, or `Temporal`? Skip the bundled `date-fns` and import from `@kalyx/react/headless` instead — same component surface, no auto-installed adapter:

```tsx
import { DatePicker } from '@kalyx/react/headless';
import { DayjsAdapter } from './my-dayjs-adapter'; // your DateAdapter

<DatePicker adapter={DayjsAdapter} value={iso} onChange={setIso}>
  <DatePicker.Calendar />
</DatePicker>
```

If you forget the `adapter` prop, the Root throws a clear error telling you exactly what's missing. The full how-to (interface, dayjs reference implementation, edge cases) is in the [adapters guide](https://kalyx-docs-site.vercel.app/docs/guides/adapters).

## Documentation

- [Introduction](https://kalyx-docs-site.vercel.app/docs/intro)
- [Quick Start](https://kalyx-docs-site.vercel.app/docs/getting-started/quick-start)
- [Components](https://kalyx-docs-site.vercel.app/docs/components/datepicker)
- [Hooks](https://kalyx-docs-site.vercel.app/docs/hooks/use-date-picker)
- [Testing](https://kalyx-docs-site.vercel.app/docs/recipes/testing)
- [Troubleshooting](https://kalyx-docs-site.vercel.app/docs/troubleshooting)
- [Migration from react-datepicker / react-day-picker / React Aria](https://kalyx-docs-site.vercel.app/docs/migration)

## License

[MIT](https://github.com/jiji-hoon96/kalyx/blob/main/LICENSE)
