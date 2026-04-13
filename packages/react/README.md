# @kalyx/react

> Headless, SSR-safe React DatePicker. Zero CSS. Composition API. < 8KB gzip.

## Install

```bash
pnpm add @kalyx/react
```

**Peer dependencies:** `react >= 19.0.0`, `react-dom >= 19.0.0`

## Components

### DatePicker

```tsx
import { DatePicker } from '@kalyx/react';

<DatePicker value={date} onChange={setDate}>
  <DatePicker.Input placeholder="Select date" />
  <DatePicker.Popover>
    <DatePicker.Calendar />
  </DatePicker.Popover>
</DatePicker>
```

### RangePicker

```tsx
import { RangePicker } from '@kalyx/react';

<RangePicker value={range} onChange={setRange}>
  <RangePicker.Input part="start" />
  <RangePicker.Input part="end" />
  <RangePicker.Popover>
    <RangePicker.Calendar />
  </RangePicker.Popover>
</RangePicker>
```

### TimePicker

```tsx
import { TimePicker } from '@kalyx/react';

<TimePicker value={time} onChange={setTime} format="24h" step={15}>
  <TimePicker.Input />
  <TimePicker.HourList />
  <TimePicker.MinuteList />
  <TimePicker.AmPmToggle />
</TimePicker>
```

### DateTimePicker

```tsx
import { DateTimePicker } from '@kalyx/react';

<DateTimePicker value={dt} onChange={setDt} format="24h" step={15}>
  <DateTimePicker.Input />
  <DateTimePicker.Popover>
    <DateTimePicker.Calendar />
    <DateTimePicker.HourList />
    <DateTimePicker.MinuteList />
  </DateTimePicker.Popover>
</DateTimePicker>
```

## Hooks

For fully custom UIs, use the equivalent hooks:

```tsx
import { useDatePicker, useRangePicker, useTimePicker } from '@kalyx/react';
```

## Key Features

- **Zero CSS** — Style with `classNames` prop or `data-*` attributes
- **ISO 8601 UTC** — All values are UTC strings, no native Date objects
- **SSR Safe** — Verified with Next.js 15 App Router
- **Accessible** — WAI-ARIA patterns, keyboard navigation, axe tested
- **7.71KB gzip** — DatePicker + RangePicker + TimePicker + DateTimePicker

## License

MIT
