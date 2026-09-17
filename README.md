<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./img/hero-dark.webp">
  <img src="./img/hero-light.webp" alt="Kalyx: seven date primitives, one API" width="720">
</picture>

# Kalyx

**Headless React date pickers that take and return ISO 8601 UTC strings.**

[Docs](https://kalyx-docs-site.vercel.app) · [한국어](https://kalyx-docs-site.vercel.app/ko) · [npm](https://www.npmjs.com/package/@kalyx/react) · [README.ko](./README.ko.md)

[![npm](https://img.shields.io/npm/v/@kalyx/react?color=5b4fe1&label=%40kalyx%2Freact)](https://www.npmjs.com/package/@kalyx/react)
[![CI](https://github.com/jiji-hoon96/kalyx/actions/workflows/pr-check.yml/badge.svg)](https://github.com/jiji-hoon96/kalyx/actions/workflows/pr-check.yml)
[![codecov](https://codecov.io/gh/jiji-hoon96/kalyx/branch/main/graph/badge.svg)](https://codecov.io/gh/jiji-hoon96/kalyx)
[![npm downloads](https://img.shields.io/npm/dw/%40kalyx%2Freact)](https://www.npmjs.com/package/@kalyx/react)
[![Bundle](https://img.shields.io/badge/gzip%20%28dist%20file%2C%20deps%20external%29-~19.5KB-brightgreen)](https://kalyx-docs-site.vercel.app/docs/api/react#bundle-size)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19%2B-61DAFB)](https://react.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/jiji-hoon96/kalyx/tree/main/examples/datepicker-basic?file=src%2FApp.tsx)

</div>

---

Kalyx ships seven date-related React pickers (single date, range, time, date+time, month, year, week) under one headless composition API, with zero CSS. Bundled with its dependencies and React left external, one DatePicker is ~19 KB gzip and all seven are ~26 KB ([how this is measured](#bundle)).

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

`onChange` always returns `ISODateString | null`. UTC-safe, no `Date` objects.

## Why Kalyx

Create a date with `new Date(2026, 3, 15)` in Seoul and store it, and the server receives April 14 (15:00 UTC), because midnight at UTC+9 is the previous afternoon in UTC. Kalyx doesn't accept `Date` at any boundary. Values go in and come out as ISO 8601 UTC strings, and the display timezone is a separate opt-in prop (`displayTimezone`), so what you store doesn't depend on the viewer's zone.

Other headless libraries already cover dates, ranges, and date+time. What Kalyx adds is narrower:

- **Value model.** Values are ISO 8601 UTC strings that go into JSON as they are, not `@internationalized/date` objects (the model Ark UI and React Aria use).
- **List-style TimePicker.** `TimePicker.HourList` and `TimePicker.MinuteList` are `role="listbox"` lists you pick from.
- **Month, year, and week pickers** use the same composition API as DatePicker.

## Features

- **Zero CSS.** Bring your own (Tailwind, shadcn/ui, Chakra, plain CSS).
- **Composition API.** Radix-style dot notation. No prop explosions.
- **SSR-safe.** Every picker has a `renderToString` test, and both entries ship with a `"use client"` directive.
- **ISO 8601 UTC strings.** No `Date` objects in or out.
- **IANA timezone-aware.** Opt-in `displayTimezone` handles DST without changing storage.
- **Accessible.** WAI-ARIA roles and full keyboard support, with jest-axe checks in the component tests.
- **i18n-ready.** `locale` prop (Intl-based month/weekday/AM-PM names, locale-inferred week start) + RTL via the `dir` prop.
- **Per-picker tree-shaking.** Pickers you don't import are eliminated, but the rest share a large base: DatePicker alone measures ~18.90 KB gzip and TimePicker alone ~16.36 KB, against ~25.65 KB for all seven pickers plus the three main-entry hooks. Verify with `pnpm check-tree-shaking`.
- **TypeScript strict.** No `any`.

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

Recorded from the [live playground](https://kalyx-docs-site.vercel.app/playground). Styling is demo-only. Kalyx ships zero CSS.

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

Two numbers, measuring different things.

- **What your app ships** (`pnpm check-tree-shaking`). Minified with esbuild, with `@kalyx/core`, `@kalyx/adapter-date-fns`, and `@floating-ui/react` bundled, React and React DOM external, then gzipped. One DatePicker ~19 KB, all seven pickers plus hooks ~26 KB.
- **The published file** (`pnpm check-bundle`, shown in the badge). `packages/react/dist/index.js` alone, with those three dependencies left as external imports: ~19.5 KB gzip. CI gates it at ≤ 20 KB for the default entry (ESM + CJS) and ≤ 22 KB for the larger headless entry.

Use the first number when comparing against size figures that include dependencies.

## Browser support

React 19+ · modern browsers · SSR: `renderToString` tested for every picker · Node ≥ 20.

## Roadmap

Shipped since 1.0: day.js & Luxon adapters, the four `/headless` hooks, `Presets` API, IANA `displayTimezone`, RTL + `Intl`-based i18n, property-based tests (`fast-check`) across `@kalyx/core`.

**Next up**

- Clearer `DisabledRule` semantics per picker (which rule shapes each picker honors)
- Per-dependency bundle-size report
- Broader e2e coverage: mid-flight prop changes, locale switching

**Exploring** (no commitment yet)

- Non-Gregorian calendar systems (Persian, Hebrew, Buddhist, …)
- React Native adapter
- Visual-regression / Storybook harness

Direction is steered by real usage. [Open an issue](https://github.com/jiji-hoon96/kalyx/issues) or [start a Discussion](https://github.com/jiji-hoon96/kalyx/discussions).

## Contributing

```bash
pnpm install
pnpm test            # unit + component
pnpm typecheck
pnpm lint
pnpm build
pnpm check-bundle    # ≤ 20 KB
```

See [CLAUDE.md](./CLAUDE.md) for architecture principles.

## License

[MIT](./LICENSE) © 2026 Kalyx contributors.
