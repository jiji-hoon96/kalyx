---
id: intro
title: Introduction
sidebar_position: 1
slug: /intro
---

# Kalyx

**Kalyx** is a headless React DatePicker library that ships *complete*. It covers the four things every date UI needs — **single date**, **date range**, **time**, and **date + time** — behind one consistent, composable API.

```tsx
import { DatePicker } from '@kalyx/react';

<DatePicker value={iso} onChange={setIso}>
  <DatePicker.Input />
  <DatePicker.Trigger />
  <DatePicker.Popover>
    <DatePicker.Calendar />
  </DatePicker.Popover>
</DatePicker>
```

## Why Kalyx exists

The React ecosystem in 2026 has two extremes — and nothing in between:

| Option | What it offers | What it doesn't |
| --- | --- | --- |
| **react-day-picker** | Headless, accessible calendar grid | No input, no time, no range out of the box |
| **react-datepicker** | All-in-one features | 60 KB, required CSS, Date-object API, timezone pitfalls |
| **Ark UI / React Aria** | Composition patterns | No TimePicker (Ark), heavy dependencies (Aria) |

Kalyx fills the gap:

- **Headless philosophy** — no stylesheets, no classes you must override.
- **Integrated primitives** — DatePicker, RangePicker, TimePicker, DateTimePicker share one context model.
- **Composition first** — Radix-style dot notation. No 100-prop monoliths.
- **Under 12 KB gzip** — measured, enforced in CI.
- **SSR-safe** — tested with Next.js App Router.
- **ISO 8601 UTC strings** as the value contract — no Date-object footguns.

## Who it's for

- Teams already using **Tailwind**, **shadcn/ui**, **Chakra**, or their own design system, who want date UI that obeys their tokens.
- Apps that care about **bundle size** and **tree-shaking**.
- Anything running on **Next.js**, **Remix**, or other SSR/RSC environments.

## What's in the box

```
@kalyx/react                @kalyx/core
─────────────────────       ─────────────────────
<DatePicker>                DateFnsAdapter
<RangePicker>               getCalendarDays
<TimePicker>                isDateDisabled
<DateTimePicker>            setTime / getTime
useDatePicker               parseInputValue
useRangePicker              normalizeISO
useTimePicker               …and more
```

## Next steps

- [Install the package →](./getting-started/installation.md)
- [Quick Start (5 min) →](./getting-started/quick-start.mdx)
- [Composition API →](./concepts/composition.md)
- [Components →](./components/datepicker.md)
