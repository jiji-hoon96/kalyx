---
id: intro
title: Introduction
sidebar_position: 1
slug: /intro
description: 'Kalyx is a headless React date-picker library: seven pickers, zero CSS, SSR-safe, ISO 8601 UTC strings in and out.'
---

# Kalyx

**Kalyx** is a headless React date-picker library whose values go in and come out as ISO 8601 UTC strings. Seven composable pickers (**DatePicker**, **RangePicker**, **TimePicker**, **DateTimePicker**, **MonthPicker**, **YearPicker**, and **WeekPicker**) sit behind one consistent API.

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

All seven pickers, recorded from the [live playground](/playground). Styling is demo-only. Kalyx ships zero CSS.

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

Create a date with `new Date(2026, 3, 15)` in Seoul and store it, and the server receives April 14 (15:00 UTC), because midnight at UTC+9 is the previous afternoon in UTC. Kalyx doesn't accept `Date` at any boundary. Values go in and come out as ISO 8601 UTC strings, and the display timezone is a separate opt-in prop (`displayTimezone`), so what you store doesn't depend on the viewer's zone. See the [Timezone concept page](./concepts/timezone).

Other headless libraries already cover dates, ranges, and date+time. What Kalyx adds is narrower:

- **Value model.** Values are ISO 8601 UTC strings that go into JSON as they are, not `@internationalized/date` objects (the model Ark UI and React Aria use).
- **List-style TimePicker.** `TimePicker.HourList` and `TimePicker.MinuteList` are `role="listbox"` lists you pick from.
- **Month, year, and week pickers** use the same composition API as DatePicker.

Around that:

- **Headless.** No stylesheets, no classes you must override.
- **Composition first.** Radix-style dot notation. No 100-prop monoliths.
- **SSR-safe.** Every picker has a `renderToString` test, and both entries ship with a `"use client"` directive.
- **Accessible.** WAI-ARIA roles and full keyboard support, with jest-axe checks in the component tests.

## Who it's for

- Teams already using **Tailwind**, **shadcn/ui**, **Chakra**, or their own design system, who want date UI that obeys their tokens.
- Apps that store dates and can't afford an off-by-one day between the browser and the server.
- Apps that watch **bundle size**. Minified with its dependencies bundled and React external, one DatePicker is ~19 KB gzip and all seven pickers plus the three main-entry hooks are ~26 KB. Pickers you don't import are eliminated, but the rest share a large base. See [Troubleshooting → bundle size](./troubleshooting.md#bundle-size-seems-larger-than-expected).
- Server-rendered React apps, such as the Next.js App Router with Kalyx inside a client component. See [SSR safety](./concepts/ssr).

## What's in the box

```
@kalyx/react                @kalyx/core                 @kalyx/adapter-date-fns
─────────────────────       ─────────────────────       ───────────────────────
<DatePicker>                getCalendarDays             DateFnsAdapter
<RangePicker>               isDateDisabled
<TimePicker>                setTime / getTime           (also published:
<DateTimePicker>            formatInTimezone             @kalyx/adapter-dayjs
<MonthPicker>               getMonthName                 @kalyx/adapter-luxon)
<YearPicker>                parseInputValue
<WeekPicker>                normalizeISO
useDatePicker               DEFAULT_*_LABELS
useRangePicker              …and more
useTimePicker

@kalyx/react/headless: the same components without the bundled adapter,
plus useMonthPicker / useYearPicker / useWeekPicker / useDateTimePicker.
```

## Next steps

- [Install the package →](./getting-started/installation)
- [Quick Start (5 min) →](./getting-started/quick-start)
- [Composition API →](./concepts/composition)
- [Components →](./components/datepicker)
