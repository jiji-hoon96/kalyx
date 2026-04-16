# @kalyx/react

> The headless React DatePicker, finally complete. Zero CSS · SSR-safe · under 12 KB gzip.

[![npm](https://img.shields.io/npm/v/@kalyx/react?color=5b4fe1)](https://www.npmjs.com/package/@kalyx/react)
[![Bundle](https://img.shields.io/badge/gzip-9.2KB-brightgreen)](https://kalyx-docs.vercel.app/docs/api/react#bundle-size)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](https://github.com/jiji-hoon96/kalyx/blob/main/LICENSE)

Composable React primitives for single dates, date ranges, time, and date + time. Radix-style dot notation. Pair with Tailwind, shadcn/ui, Chakra, or any CSS.

**📚 Full docs:** [kalyx-docs.vercel.app](https://kalyx-docs.vercel.app) · [한국어](https://kalyx-docs.vercel.app/ko)

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

Full recipes: [Tailwind](https://kalyx-docs.vercel.app/docs/recipes/tailwind), [shadcn/ui](https://kalyx-docs.vercel.app/docs/recipes/shadcn), [React Hook Form](https://kalyx-docs.vercel.app/docs/recipes/react-hook-form).

## Documentation

- [Introduction](https://kalyx-docs.vercel.app/docs/intro)
- [Quick Start](https://kalyx-docs.vercel.app/docs/getting-started/quick-start)
- [Components](https://kalyx-docs.vercel.app/docs/components/datepicker)
- [Hooks](https://kalyx-docs.vercel.app/docs/hooks/use-date-picker)
- [Migration from react-datepicker / react-day-picker / React Aria](https://kalyx-docs.vercel.app/docs/migration)

## License

[MIT](https://github.com/jiji-hoon96/kalyx/blob/main/LICENSE)
