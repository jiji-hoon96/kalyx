<div align="center">

<img src="./img/main.jpeg" alt="Kalyx — the headless DatePicker, finally complete" width="720" />

# Kalyx

**The headless React DatePicker, finally complete.**

[Docs](https://kalyx-docs.vercel.app) · [한국어 문서](https://kalyx-docs.vercel.app/ko) · [npm](https://www.npmjs.com/package/@kalyx/react) · [GitHub](https://github.com/jiji-hoon96/kalyx)

[![npm](https://img.shields.io/npm/v/@kalyx/react?color=5b4fe1&label=%40kalyx%2Freact)](https://www.npmjs.com/package/@kalyx/react)
[![Bundle](https://img.shields.io/badge/gzip-9.2KB-brightgreen)](#bundle-size)
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

| Library | Headless | Input | TimePicker | RangePicker | SSR | Bundle (gzip) |
| --- | --- | --- | --- | --- | --- | --- |
| react-day-picker | ✅ | ❌ | ❌ | ✅ | ✅ | ~22 KB |
| react-datepicker | ❌ (CSS required) | ✅ | ✅ | ✅ | △ | ~60 KB |
| Ark UI | ✅ | ✅ | ❌ (removed) | ✅ | ✅ | Large |
| React Aria | ✅ | ✅ | ✅ | ✅ | ✅ | Large |
| **Kalyx** | ✅ | ✅ | ✅ | ✅ | ✅ | **~9 KB** |

## Features

- **Zero CSS** — no stylesheets to import, no classes to override.
- **True composition** — Radix-style dot notation. No prop explosions.
- **Headless** — pair with Tailwind, shadcn/ui, Chakra, or any CSS.
- **SSR-safe** — verified on Next.js App Router. `useId` for stable IDs.
- **ISO 8601 UTC strings** — no `Date` object footguns.
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

## Components

```tsx
import {
  DatePicker,       // single date
  RangePicker,      // date range with presets
  TimePicker,       // hour + minute (+ seconds)
  DateTimePicker,   // combined date + time
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
- [Migration guide](https://kalyx-docs.vercel.app/docs/migration)

## Bundle size

```
packages/react/dist/index.js  →  9.2 KB gzip
```

Enforced in CI at `< 12 KB`. Tree-shakable per import — using only `TimePicker` drops the DatePicker code.

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
