<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./img/hero-dark.webp">
  <img src="./img/hero-light.webp" alt="Kalyx — seven date primitives, one API" width="720">
</picture>

# Kalyx

**The headless React DatePicker, finally complete.**

[Docs](https://kalyx-docs-site.vercel.app) · [한국어](https://kalyx-docs-site.vercel.app/ko) · [npm](https://www.npmjs.com/package/@kalyx/react) · [README.ko](./README.ko.md)

[![npm](https://img.shields.io/npm/v/@kalyx/react?color=5b4fe1&label=%40kalyx%2Freact)](https://www.npmjs.com/package/@kalyx/react)
[![Bundle](https://img.shields.io/badge/gzip-16.64KB-brightgreen)](https://kalyx-docs-site.vercel.app/docs/api/react#bundle-size)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19%2B-61DAFB)](https://react.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

</div>

---

Kalyx ships a **complete** set of date-related React primitives — single dates, date ranges, time, date+time, month, year, and week — under one composition API. ~16.6 KB gzip (≤17 KB ceiling), zero CSS, SSR-safe.

```bash
pnpm add @kalyx/react
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

`onChange` always returns `ISODateString | null` — UTC-safe, no `Date` objects.

## Why Kalyx

In 2026, the React date-picker landscape forces a trade-off: integrated-but-heavy (react-datepicker ~62 KB, MUI ~58 KB) or headless-but-partial (react-day-picker — calendar grid only; Ark UI — no standalone TimePicker; React Aria — `@internationalized/date` lock-in). react-calendar covers single dates and ranges but stops short of time, RSC, and timezone-aware storage. react-native-calendars is mobile-first.

Kalyx ships **seven primitives** — single date, range, time, date+time, month, year, week — under one composition API. Headless, ~16.6 KB gzip, SSR-safe, ISO strings in / ISO strings out, adapter pattern for date-fns / dayjs / luxon.

## Features

- **Zero CSS** — bring your own (Tailwind, shadcn/ui, Chakra, plain CSS).
- **Composition API** — Radix-style dot notation. No prop explosions.
- **SSR-safe** — Next.js App Router verified.
- **ISO 8601 UTC strings** — eliminates `Date`-object footguns.
- **IANA timezone-aware** — opt-in `displayTimezone` handles DST without changing storage.
- **Accessible** — WAI-ARIA + full keyboard, axe-clean.
- **i18n-ready** — `locale` prop (Intl-based month/weekday/AM-PM names, locale-inferred week start) + RTL via the `dir` prop.
- **Tree-shakable** — `sideEffects: false`. Use only what you import.
- **TypeScript strict** — no `any`.

## Packages

| Package | Purpose |
|---|---|
| [`@kalyx/react`](./packages/react) | Components, hooks, and types |
| [`@kalyx/core`](./packages/core) | Platform-independent date logic + the `DateAdapter` contract |
| [`@kalyx/adapter-date-fns`](./packages/adapter-date-fns) | date-fns adapter (bundled default for `@kalyx/react`) |
| [`@kalyx/adapter-dayjs`](./packages/adapter-dayjs) | dayjs adapter (for `@kalyx/react/headless`) |
| [`@kalyx/adapter-luxon`](./packages/adapter-luxon) | luxon adapter (for `@kalyx/react/headless`) |

## Components

7 composable pickers + 7 headless hooks (3 on the main entry, 4 more on `@kalyx/react/headless`):

```tsx
import {
  DatePicker, RangePicker, TimePicker, DateTimePicker,
  MonthPicker, YearPicker, WeekPicker,
  useDatePicker, useRangePicker, useTimePicker,
} from '@kalyx/react';

import {
  useMonthPicker, useYearPicker, useWeekPicker, useDateTimePicker,
} from '@kalyx/react/headless';
```

API reference, recipes (Tailwind / shadcn / React Hook Form), and migration guides live in the **[full docs](https://kalyx-docs-site.vercel.app)**.

### Demos

Recorded from the [live playground](https://kalyx-docs-site.vercel.app/playground). Styling is demo-only — Kalyx ships zero CSS.

| | | |
|:---:|:---:|:---:|
| **DatePicker**<br><img src="./img/demos/datepicker.avif" alt="DatePicker demo" width="260"> | **RangePicker**<br><img src="./img/demos/rangepicker.avif" alt="RangePicker demo" width="260"> | **TimePicker**<br><img src="./img/demos/timepicker.avif" alt="TimePicker demo" width="260"> |
| **DateTimePicker**<br><img src="./img/demos/datetimepicker.avif" alt="DateTimePicker demo" width="260"> | **MonthPicker**<br><img src="./img/demos/monthpicker.avif" alt="MonthPicker demo" width="260"> | **YearPicker**<br><img src="./img/demos/yearpicker.avif" alt="YearPicker demo" width="260"> |
| **WeekPicker**<br><img src="./img/demos/weekpicker.avif" alt="WeekPicker demo" width="260"> | | |

## Documentation

- [Introduction](https://kalyx-docs-site.vercel.app/docs/intro) · [Quick Start](https://kalyx-docs-site.vercel.app/docs/getting-started/quick-start)
- [Components](https://kalyx-docs-site.vercel.app/docs/components/datepicker) · [Hooks](https://kalyx-docs-site.vercel.app/docs/hooks/use-date-picker)
- [Recipes](https://kalyx-docs-site.vercel.app/docs/recipes/tailwind) · [Testing](https://kalyx-docs-site.vercel.app/docs/recipes/testing) · [Troubleshooting](https://kalyx-docs-site.vercel.app/docs/troubleshooting)
- [Migration from react-datepicker / react-day-picker / React Aria](https://kalyx-docs-site.vercel.app/docs/migration)

## Bundle

`@kalyx/react` → **16.64 KB** gzip (ESM) / **16.89 KB** (CJS). CI gate: ≤ 17 KB.

## Browser support

React 19+ · all modern browsers · SSR: Next.js App Router / Pages Router / Remix · Node ≥ 20.

## Contributing

```bash
pnpm install
pnpm test            # unit + component
pnpm typecheck
pnpm lint
pnpm build
pnpm check-bundle    # ≤ 17 KB
```

See [CLAUDE.md](./CLAUDE.md) for architecture principles.

## License

[MIT](./LICENSE) © 2026 Kalyx contributors.
