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

## See it in action

All seven pickers, recorded from the [live playground](/playground). Styling is demo-only — Kalyx ships zero CSS.

<div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', margin: '1.5rem 0'}}>
  <figure style={{margin: 0}}><img src="/img/demos/datepicker.avif" alt="DatePicker demo" loading="lazy" style={{width: '100%', borderRadius: '10px', border: '1px solid var(--ifm-color-emphasis-200)'}} /><figcaption>DatePicker</figcaption></figure>
  <figure style={{margin: 0}}><img src="/img/demos/rangepicker.avif" alt="RangePicker demo" loading="lazy" style={{width: '100%', borderRadius: '10px', border: '1px solid var(--ifm-color-emphasis-200)'}} /><figcaption>RangePicker</figcaption></figure>
  <figure style={{margin: 0}}><img src="/img/demos/timepicker.avif" alt="TimePicker demo" loading="lazy" style={{width: '100%', borderRadius: '10px', border: '1px solid var(--ifm-color-emphasis-200)'}} /><figcaption>TimePicker</figcaption></figure>
  <figure style={{margin: 0}}><img src="/img/demos/datetimepicker.avif" alt="DateTimePicker demo" loading="lazy" style={{width: '100%', borderRadius: '10px', border: '1px solid var(--ifm-color-emphasis-200)'}} /><figcaption>DateTimePicker</figcaption></figure>
  <figure style={{margin: 0}}><img src="/img/demos/monthpicker.avif" alt="MonthPicker demo" loading="lazy" style={{width: '100%', borderRadius: '10px', border: '1px solid var(--ifm-color-emphasis-200)'}} /><figcaption>MonthPicker</figcaption></figure>
  <figure style={{margin: 0}}><img src="/img/demos/yearpicker.avif" alt="YearPicker demo" loading="lazy" style={{width: '100%', borderRadius: '10px', border: '1px solid var(--ifm-color-emphasis-200)'}} /><figcaption>YearPicker</figcaption></figure>
  <figure style={{margin: 0}}><img src="/img/demos/weekpicker.avif" alt="WeekPicker demo" loading="lazy" style={{width: '100%', borderRadius: '10px', border: '1px solid var(--ifm-color-emphasis-200)'}} /><figcaption>WeekPicker</figcaption></figure>
</div>

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
- **~18.3 KB gzip (≤ 20 KB ceiling)** — measured, enforced in CI.
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
