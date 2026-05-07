<div align="center">

<img src="./img/main.jpeg" alt="Kalyx — the headless DatePicker, finally complete" width="720" />

# Kalyx

**The headless React DatePicker, finally complete.**

[Docs](https://kalyx-docs.vercel.app) · [한국어](https://kalyx-docs.vercel.app/ko) · [npm](https://www.npmjs.com/package/@kalyx/react) · [README.ko](./README.ko.md)

[![npm](https://img.shields.io/npm/v/@kalyx/react?color=5b4fe1&label=%40kalyx%2Freact)](https://www.npmjs.com/package/@kalyx/react)
[![RC](https://img.shields.io/npm/v/@kalyx/react/rc?color=f59e0b&label=RC)](https://www.npmjs.com/package/@kalyx/react?activeTab=versions)
[![Bundle](https://img.shields.io/badge/gzip-12.85KB-brightgreen)](https://kalyx-docs.vercel.app/docs/api/react#bundle-size)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19%2B-61DAFB)](https://react.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

</div>

---

Kalyx ships a **complete** set of date-related React primitives — single dates, date ranges, time, date+time, month, year, and week — under one composition API. ~13 KB gzip (≤14 KB ceiling), zero CSS, SSR-safe.

```bash
pnpm add @kalyx/react
```

> **Trying v1.0?** `pnpm add @kalyx/react@rc` — feedback via [`v1-rc`](https://github.com/jiji-hoon96/kalyx/issues?q=label%3Av1-rc) issue label.

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

The 2026 React date-picker landscape forces a tradeoff: **react-day-picker** ships only a calendar grid; **react-datepicker** is integrated but 40–60 KB and CSS-coupled; **Ark UI** dropped TimePicker; **React Aria** locks you into `@internationalized/date`. Kalyx fills the gap — headless + integrated + date-fns compatible + SSR-safe.

Detailed comparison table → [docs-site](https://kalyx-docs.vercel.app/docs/intro#comparison).

## Features

- **Zero CSS** — bring your own (Tailwind, shadcn/ui, Chakra, plain CSS).
- **Composition API** — Radix-style dot notation. No prop explosions.
- **SSR-safe** — Next.js App Router verified.
- **ISO 8601 UTC strings** — eliminates `Date`-object footguns.
- **IANA timezone-aware** — opt-in `displayTimezone` handles DST without changing storage.
- **Accessible** — WAI-ARIA + full keyboard, axe-clean.
- **Tree-shakable** — `sideEffects: false`. Use only what you import.
- **TypeScript strict** — no `any`.

## Packages

| Package | Purpose |
|---|---|
| [`@kalyx/react`](./packages/react) | Components, hooks, and types |
| [`@kalyx/core`](./packages/core) | Platform-independent date logic + adapters |

## Components

7 composable pickers + 3 headless hooks:

```tsx
import {
  DatePicker, RangePicker, TimePicker, DateTimePicker,
  MonthPicker, YearPicker, WeekPicker,
  useDatePicker, useRangePicker, useTimePicker,
} from '@kalyx/react';
```

API reference, recipes (Tailwind / shadcn / React Hook Form), and migration guides live in the **[full docs](https://kalyx-docs.vercel.app)**.

## Documentation

- [Introduction](https://kalyx-docs.vercel.app/docs/intro) · [Quick Start](https://kalyx-docs.vercel.app/docs/getting-started/quick-start)
- [Components](https://kalyx-docs.vercel.app/docs/components/datepicker) · [Hooks](https://kalyx-docs.vercel.app/docs/hooks/use-date-picker)
- [Recipes](https://kalyx-docs.vercel.app/docs/recipes/tailwind) · [Testing](https://kalyx-docs.vercel.app/docs/recipes/testing) · [Troubleshooting](https://kalyx-docs.vercel.app/docs/troubleshooting)
- [Migration from react-datepicker / react-day-picker / React Aria](https://kalyx-docs.vercel.app/docs/migration)

## Bundle

`@kalyx/react` v1.0.0-rc.4 → **12.85 KB** gzip (ESM) / **13.64 KB** (CJS). CI gate: ≤ 14 KB.

## Browser support

React 19+ · all modern browsers · SSR: Next.js App Router / Pages Router / Remix · Node ≥ 20.

## Contributing

```bash
pnpm install
pnpm test            # unit + component
pnpm typecheck
pnpm lint
pnpm build
pnpm check-bundle    # ≤ 14 KB
```

See [CLAUDE.md](./CLAUDE.md) for architecture principles.

## License

[MIT](./LICENSE) © 2026 Kalyx contributors.
