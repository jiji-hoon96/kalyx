<div align="center">

<img src="./img/main.jpeg" alt="Kalyx — the headless DatePicker, finally complete" width="720" />

# Kalyx

**The headless React DatePicker, finally complete.**

[Docs](https://kalyx-docs.vercel.app) · [한국어 문서](https://kalyx-docs.vercel.app/ko) · [npm](https://www.npmjs.com/package/@kalyx/react) · [GitHub](https://github.com/jiji-hoon96/kalyx)

[![npm](https://img.shields.io/npm/v/@kalyx/react?color=5b4fe1&label=%40kalyx%2Freact)](https://www.npmjs.com/package/@kalyx/react)
[![RC](https://img.shields.io/npm/v/@kalyx/react/next?color=f59e0b&label=RC)](https://www.npmjs.com/package/@kalyx/react?activeTab=versions)
[![Bundle](https://img.shields.io/badge/gzip-11.36KB-brightgreen)](#bundle-size)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19%2B-61DAFB)](https://react.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

</div>

---

> 한국어 README: [README.ko.md](./README.ko.md)

Kalyx is a headless React DatePicker library that ships **complete**. One composable API covers single dates, date ranges, time, and date-time — under 12 KB gzipped, zero CSS, SSR-safe.

```bash
pnpm add @kalyx/react
```

> **Trying the v1.0 release candidate?**
> `pnpm add @kalyx/react@next` — please report issues with the [`v1-rc`](https://github.com/jiji-hoon96/kalyx/issues?q=label%3Av1-rc) label.

```tsx
import { DatePicker } from '@kalyx/react';

<DatePicker value={iso} onChange={setIso}>
  <DatePicker.Input />
  <DatePicker.Popover>
    <DatePicker.Calendar />
  </DatePicker.Popover>
</DatePicker>
```

## Why Kalyx?

The React ecosystem in 2026 has two extremes — Kalyx fills the gap.

Numbers come from bundlephobia (April 2026). See [notes below the table](#footnotes).

| | Kalyx | react-datepicker | react-day-picker | Ark UI | React Aria |
|---|---|---|---|---|---|
| Version measured | 1.0.0-rc.0 | 9.1.0 | 9.14.0 | 5.36.1 | 1.17.0 |
| Bundle (min+gzip) | **11.36 KB** | 44 KB | 2.4 KB¹ | 265 KB² | 247 KB² |
| DatePicker | ✅ | ✅ | ✅ | ✅ | ✅ |
| RangePicker | ✅ dedicated | ✅ two-picker pattern | ✅ `mode="range"` | ✅ | ✅ |
| TimePicker | ✅ dedicated | ⚠️ `showTimeSelect` prop | ❌ | ❌ (removed) | ✅ |
| DateTimePicker | ✅ dedicated | ⚠️ combined picker | ❌ | ❌ | ✅ |
| Text Input included | ✅ | ✅ | ❌ BYO | ✅ | ✅ |
| Headless (Zero CSS) | ✅ | ❌ CSS required | ✅ | ✅ | ✅ |
| Composition API | ✅ dot notation | ❌ 100+ props | ✅ | ✅ | ✅ |
| SSR Safe | ✅ | ⚠️ | ✅ | ✅ | ✅ |
| TypeScript Strict | ✅ | ⚠️ | ✅ | ✅ | ✅ |
| Value contract | ISO 8601 UTC string | `Date` object | `Date` object | `Date` object | `CalendarDate` (internationalized/date) |
| date-fns compatible | ✅ | ✅ | ✅ | ❌ | ❌ |
| Timezone-aware (IANA, DST) | ✅ `displayTimezone` | ⚠️ native `Date` pitfalls | ⚠️ via adapter | ⚠️ partial | ✅ `@internationalized/date` |
| React 19+ | ✅ | ✅ | ✅ | ✅ | ✅ |

#### Footnotes

1. react-day-picker ships only a calendar grid — no Input, no TimePicker, no DateTimePicker. Matching Kalyx's feature surface means composing it with your own input, popover, and time components. The 2.4 KB figure is the default entry point.
2. `@ark-ui/react` and `react-aria-components` are full component monoliths covering 40+ patterns. Both are tree-shakeable, so an app that only imports DatePicker will ship substantially less — but also inherits a multi-package ecosystem (`@internationalized/date`, Ark's state-chart engine). Kalyx targets the "I want a DatePicker, not a framework" use case.

## Features

- **Zero CSS** — no stylesheets to import, no classes to override.
- **True composition** — Radix-style dot notation. No prop explosions.
- **Headless** — pair with Tailwind, shadcn/ui, Chakra, or any CSS.
- **SSR-safe** — verified on Next.js App Router. `useId` for stable IDs.
- **ISO 8601 UTC strings** — no `Date` object footguns.
- **Timezone-aware** — opt-in `displayTimezone` prop handles IANA zones and DST without changing the UTC storage contract.
- **Accessible** — WAI-ARIA, full keyboard, passes axe out of the box.
- **Tree-shakable** — pay only for what you render.
- **TypeScript first** — strict types, zero `any`.

## Packages

| Package | Purpose |
| --- | --- |
| [`@kalyx/react`](./packages/react) | React components, hooks, and types |
| [`@kalyx/core`](./packages/core) | Platform-independent date logic and adapters |

## Quick Start

```tsx
'use client';

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

Value is always an `ISODateString | null`:

```ts
// onChange receives "2026-04-15T00:00:00.000Z" | null
```

See the [Quick Start guide →](https://kalyx-docs.vercel.app/docs/getting-started/quick-start)

## Styling with Tailwind CSS

Kalyx is headless — bring your own styles via `classNames` and `data-*` attributes.

### Using classNames

```tsx
<DatePicker value={date} onChange={setDate}>
  <DatePicker.Input
    className="w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm
               focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    placeholder="Select a date"
  />
  <DatePicker.Popover className="mt-1 rounded-xl border bg-white p-4 shadow-lg">
    <DatePicker.Calendar
      classNames={{
        header: "flex items-center justify-between mb-2",
        title: "text-sm font-semibold",
        navButton: "p-1 rounded hover:bg-gray-100",
        grid: "w-full border-collapse",
        weekdayHeader: "text-xs font-medium text-gray-500 pb-2",
        day: "h-9 w-9 rounded-lg text-sm hover:bg-gray-100",
        daySelected: "bg-blue-600 text-white hover:bg-blue-700",
        dayToday: "font-bold text-blue-600",
        dayDisabled: "text-gray-300 cursor-not-allowed",
        dayOutsideMonth: "text-gray-300",
      }}
    />
  </DatePicker.Popover>
</DatePicker>
```

### Using data attributes

All interactive states are exposed as `data-*` attributes for CSS or Tailwind arbitrary selectors:

```css
[data-selected] { @apply bg-blue-600 text-white; }
[data-today] { @apply font-bold ring-1 ring-blue-400; }
[data-disabled] { @apply opacity-30 cursor-not-allowed; }
[data-in-range] { @apply bg-blue-100; }
[data-range-start] { @apply rounded-l-lg bg-blue-600 text-white; }
[data-range-end] { @apply rounded-r-lg bg-blue-600 text-white; }
```

See more recipes: [Tailwind](https://kalyx-docs.vercel.app/docs/recipes/tailwind) · [shadcn/ui](https://kalyx-docs.vercel.app/docs/recipes/shadcn) · [React Hook Form](https://kalyx-docs.vercel.app/docs/recipes/react-hook-form)

## Components

```tsx
import {
  DatePicker,       // single date
  RangePicker,      // date range with presets
  TimePicker,       // hour + minute (+ seconds)
  DateTimePicker,   // combined date + time
  MonthPicker,      // month-only selection
  YearPicker,       // year-only selection
  WeekPicker,       // full-week range selection
} from '@kalyx/react';
```

Each root exposes sub-components via dot notation:

```tsx
<DatePicker.Input />
<DatePicker.Trigger />
<DatePicker.Popover />
<DatePicker.Calendar />
<DatePicker.MonthGrid />
<DatePicker.YearGrid />
<DatePicker.Presets />
```

## Hooks

```tsx
import { useDatePicker, useRangePicker, useTimePicker } from '@kalyx/react';
```

Use when you need a fully custom UI that the components can't express.

## Documentation

Full documentation is at **[kalyx-docs.vercel.app](https://kalyx-docs.vercel.app)**.

- [Introduction](https://kalyx-docs.vercel.app/docs/intro)
- [Installation](https://kalyx-docs.vercel.app/docs/getting-started/installation)
- [Composition API](https://kalyx-docs.vercel.app/docs/concepts/composition)
- [Components](https://kalyx-docs.vercel.app/docs/components/datepicker)
- [Hooks](https://kalyx-docs.vercel.app/docs/hooks/use-date-picker)
- [Recipes — Tailwind / shadcn / React Hook Form](https://kalyx-docs.vercel.app/docs/recipes/tailwind)
- [Testing](https://kalyx-docs.vercel.app/docs/recipes/testing)
- [Troubleshooting](https://kalyx-docs.vercel.app/docs/troubleshooting)
- [Migration guide](https://kalyx-docs.vercel.app/docs/migration)

## Bundle size

```
@kalyx/react  →  11.36 KB gzip  (v1.0.0-rc.0, 7 components)
```

Enforced in CI at `< 12 KB`. Tree-shakable per import — `@kalyx/core` is published with `sideEffects: false`, so using only `TimePicker` drops the DatePicker code.

## Browser support

- React 19+
- All modern browsers (Chrome, Firefox, Safari, Edge)
- SSR: Next.js App Router, Pages Router, Remix, any `renderToString` env
- Node ≥ 20 for development

## Contributing

```bash
pnpm install
pnpm test           # unit + component tests
pnpm test:e2e       # Playwright
pnpm typecheck
pnpm lint
pnpm build
pnpm check-bundle   # enforce ≤ 12 KB
pnpm --filter docs-site start  # docs site at localhost:3000
```

PRs welcome. Before opening one, see [CLAUDE.md](./CLAUDE.md) for the architecture principles.

## License

[MIT](./LICENSE) © 2026 Kalyx contributors.
