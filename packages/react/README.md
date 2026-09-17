# @kalyx/react

> Headless React date pickers that take and return ISO 8601 UTC strings. Zero CSS · SSR-safe · ~19 KB gzip for one DatePicker with its dependencies bundled, ~26 KB for all seven.

[![npm](https://img.shields.io/npm/v/@kalyx/react?color=5b4fe1)](https://www.npmjs.com/package/@kalyx/react)
[![Bundle](https://img.shields.io/badge/gzip%20%28dist%20file%2C%20deps%20external%29-~19.5KB-brightgreen)](https://kalyx-docs-site.vercel.app/docs/api/react#bundle-size)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](https://github.com/jiji-hoon96/kalyx/blob/main/LICENSE)

Composable React primitives for **seven date-related surfaces** (single date, date range, time, date+time, month, year, and week) under one Radix-style dot-notation API. Pair with Tailwind, shadcn/ui, Chakra, or any CSS.

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

Value is always an `ISODateString | null`. UTC-safe, no `Date` objects.

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

- **Zero CSS.** No stylesheets to import.
- **Composition.** Radix-style `<DatePicker.Input />`, `<DatePicker.Calendar />`, etc.
- **SSR-safe.** Every picker has a `renderToString` test, and both entries ship with a `"use client"` directive.
- **ISO 8601 UTC strings.** No `Date` objects in or out.
- **Accessible.** ARIA roles and keyboard navigation, with jest-axe checks in the component tests.
- **Per-picker tree-shaking.** `sideEffects: false` plus pure-annotated exports, so unused pickers are eliminated. The rest share a large base: DatePicker alone measures ~18.90 KB gzip and TimePicker alone ~16.36 KB, against ~25.65 KB for all seven pickers plus the three main-entry hooks. Run `pnpm check-tree-shaking` for the current numbers.
- **TypeScript strict.** No `any`, full type exports.

## Bundle size

Two numbers, measuring different things.

- **What your app ships** (`pnpm check-tree-shaking` in the repo). Minified with esbuild, with `@kalyx/core`, `@kalyx/adapter-date-fns`, and `@floating-ui/react` bundled, React and React DOM external, then gzipped. One DatePicker ~19 KB, all seven pickers plus hooks ~26 KB.
- **The published file** (`pnpm check-bundle`, shown in the badge). `dist/index.js` alone, with those three dependencies left as external imports: ~19.5 KB gzip. CI gates it at ≤ 20 KB for the default entry (ESM + CJS) and ≤ 22 KB for the larger headless entry.

Use the first number when comparing against size figures that include dependencies.

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

Already shipping `dayjs` or `luxon`? Skip the bundled `date-fns` and import from `@kalyx/react/headless` instead. Same component surface, no auto-installed adapter. Official adapters are published as [`@kalyx/adapter-dayjs`](https://www.npmjs.com/package/@kalyx/adapter-dayjs) and [`@kalyx/adapter-luxon`](https://www.npmjs.com/package/@kalyx/adapter-luxon):

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
