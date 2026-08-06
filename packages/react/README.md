# @kalyx/react

> The headless React DatePicker, finally complete. Zero CSS · SSR-safe · ~18.5 KB gzip (≤ 20 KB ceiling).

[![npm](https://img.shields.io/npm/v/@kalyx/react?color=5b4fe1)](https://www.npmjs.com/package/@kalyx/react)
[![Bundle](https://img.shields.io/badge/gzip-~18.5KB-brightgreen)](https://kalyx-docs-site.vercel.app/docs/api/react#bundle-size)
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
  DateFnsAdapter,    // default adapter (re-exported from @kalyx/adapter-date-fns)
} from '@kalyx/react';

// Four more hooks live on the /headless entry:
import {
  useMonthPicker, useYearPicker, useWeekPicker, useDateTimePicker,
} from '@kalyx/react/headless';
```

## Features

- **Zero CSS** — no stylesheets to import.
- **Composition** — Radix-style `<DatePicker.Input />`, `<DatePicker.Calendar />`, etc.
- **SSR-safe** — tested on Next.js App Router.
- **ISO 8601 UTC strings** — eliminates `Date`-object footguns.
- **Accessible** — ARIA roles, keyboard navigation, axe-clean.
- **Per-picker tree-shaking** — `sideEffects: false` plus pure-annotated exports, so unused pickers are eliminated. Measured: TimePicker alone ~16.2 KB vs ~25.0 KB for all seven. Run `pnpm check-tree-shaking` for the current numbers.
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

Already shipping `dayjs` or `luxon`? Skip the bundled `date-fns` and import from `@kalyx/react/headless` instead — same component surface, no auto-installed adapter. Official adapters are published as [`@kalyx/adapter-dayjs`](https://www.npmjs.com/package/@kalyx/adapter-dayjs) and [`@kalyx/adapter-luxon`](https://www.npmjs.com/package/@kalyx/adapter-luxon):

```tsx
import { DatePicker } from '@kalyx/react/headless';
import { DayjsAdapter } from '@kalyx/adapter-dayjs';

<DatePicker adapter={DayjsAdapter} value={iso} onChange={setIso}>
  <DatePicker.Calendar />
</DatePicker>
```

If you forget the `adapter` prop, the Root throws a clear error telling you exactly what's missing. Writing a custom adapter? The interface how-to and the `@kalyx/core/test-helpers` conformance suite are in the [adapters guide](https://kalyx-docs-site.vercel.app/docs/guides/adapters).

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
