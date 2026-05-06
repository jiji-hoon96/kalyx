---
id: intro
title: Introduction
sidebar_position: 1
slug: /intro
---

# Kalyx

**Kalyx** is a headless React DatePicker library that ships *complete*. Seven composable pickers — **DatePicker**, **RangePicker**, **TimePicker**, **DateTimePicker**, **MonthPicker**, **YearPicker**, and **WeekPicker** — behind one consistent API.

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
- **Integrated primitives** — 7 pickers (DatePicker, RangePicker, TimePicker, DateTimePicker, MonthPicker, YearPicker, WeekPicker) share one context model.
- **Composition first** — Radix-style dot notation. No 100-prop monoliths.
- **~12 KB gzip (≤ 13 KB ceiling)** — measured, enforced in CI.
- **SSR-safe** — tested with Next.js App Router.
- **ISO 8601 UTC strings** as the value contract — no Date-object footguns.
- **Timezone-aware** — opt-in `displayTimezone` prop handles DST and civil-day semantics without changing the UTC storage contract. See the [Timezone concept page](./concepts/timezone).

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
<MonthPicker>               formatInTimezone
<YearPicker>                getMonthName
<WeekPicker>                parseInputValue
useDatePicker               normalizeISO
useRangePicker              DEFAULT_*_LABELS
useTimePicker               …and more
```

## Next steps

- [Install the package →](./getting-started/installation)
- [Quick Start (5 min) →](./getting-started/quick-start)
- [Composition API →](./concepts/composition)
- [Components →](./components/datepicker)
