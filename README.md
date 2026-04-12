# Kalyx

> Headless, SSR-safe React DatePicker. Zero CSS. Composition API. < 8KB gzip.

[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19+-61DAFB)](https://react.dev/)
[![Bundle](https://img.shields.io/badge/gzip-7.71KB-brightgreen)](#bundle-size)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

## Why Kalyx?

The React DatePicker ecosystem in 2026 has only two extremes:

| Library | Headless | Input | TimePicker | Composition | Bundle |
|---|---|---|---|---|---|
| react-day-picker | Yes | No | No | No | 22KB |
| react-datepicker | No (CSS required) | Yes | Yes | No (100+ props) | 40-60KB |
| Ark UI | Yes | Yes | **Removed** | Yes | Large |
| React Aria | Yes | Yes | Yes | Yes | Large (dep chain) |
| **Kalyx** | **Yes** | **Yes** | **Yes** | **Yes** | **7.71KB** |

Kalyx fills the gap: **headless + integrated Date/Range/Time/DateTime picker + Composition API + SSR-safe + < 12KB**.

## Install

```bash
pnpm add @kalyx/react
# or
npm install @kalyx/react
```

**Peer dependencies:** `react >= 19.0.0`, `react-dom >= 19.0.0`

## Quick Start

### DatePicker

```tsx
import { DatePicker } from '@kalyx/react';
import { useState } from 'react';

function MyForm() {
  const [date, setDate] = useState<string | null>(null);

  return (
    <DatePicker value={date} onChange={setDate}>
      <DatePicker.Input placeholder="Select date" />
      <DatePicker.Popover>
        <DatePicker.Calendar />
      </DatePicker.Popover>
    </DatePicker>
  );
}
```

### RangePicker

```tsx
import { RangePicker, type DateRange } from '@kalyx/react';

const [range, setRange] = useState<DateRange>({ start: null, end: null });

<RangePicker value={range} onChange={setRange}>
  <RangePicker.Input part="start" />
  <span>~</span>
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
  <TimePicker.AmPmToggle />  {/* Only renders in 12h mode */}
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

## Key Principles

### Composition over Configuration

```tsx
// Bad: Props explosion
<DatePicker showTimeSelect timeFormat="HH:mm" showMonthDropdown />

// Good: Composition
<DatePicker value={date} onChange={setDate}>
  <DatePicker.Input />
  <DatePicker.Popover>
    <DatePicker.Calendar />
  </DatePicker.Popover>
</DatePicker>
```

### ISO 8601 UTC Strings Only

All date values are ISO 8601 UTC strings. No native `Date` objects — structurally prevents timezone bugs.

```tsx
// value is always: "2026-01-15T00:00:00.000Z"
<DatePicker
  value="2026-01-15T00:00:00.000Z"
  onChange={(iso: string | null) => save(iso)}
/>
```

### Zero CSS

Kalyx ships no CSS. Style with `classNames` prop or `data-*` attributes:

```tsx
<DatePicker.Calendar
  classNames={{
    day: 'my-day',
    daySelected: 'my-day--selected',
    dayToday: 'my-day--today',
  }}
/>

/* Or use data attributes in CSS */
[data-selected="true"] { background: blue; }
[data-today="true"] { font-weight: bold; }
[data-in-range="true"] { background: lightblue; }
```

### Headless Hooks

Every component has an equivalent hook for fully custom UIs:

```tsx
import { useDatePicker } from '@kalyx/react';

const { value, isOpen, calendar, open, selectDate } = useDatePicker({
  onChange: (iso) => console.log(iso),
});
```

Available hooks: `useDatePicker`, `useRangePicker`, `useTimePicker`.

## Accessibility

Kalyx follows WAI-ARIA patterns with full keyboard navigation:

- **Calendar**: `role="grid"` — Arrow keys (day/week), PageUp/Down (month), Home/End (week start/end), Enter/Space (select), Escape (close)
- **Input**: `role="combobox"` with `aria-expanded`, `aria-haspopup="dialog"`
- **Popover**: `role="dialog"` with focus trap and focus restoration
- **TimePicker**: `role="listbox"` with `role="option"` items
- **AmPmToggle**: `role="radiogroup"` with `role="radio"` buttons
- All components pass **axe** accessibility checks

## SSR Safe

Verified with Next.js 15 App Router (static generation). No `window`/`document` access outside `useEffect`. No hydration mismatches. Uses `useId()` for deterministic IDs.

## Bundle Size

| Component | Tests | gzip |
|---|---|---|
| DatePicker | 23 | 4.33KB (baseline) |
| + RangePicker | 22 | +1.16KB |
| + TimePicker | 27 | +1.78KB |
| + DateTimePicker | 20 | +0.44KB |
| **Total** | **185** | **7.71KB** |

Target: < 12KB gzip. Current: **7.71KB** (35% headroom).

## Packages

| Package | Description |
|---|---|
| `@kalyx/react` | React components, hooks, and public API |
| `@kalyx/core` | Platform-agnostic date logic, types, and adapters |

## Development

```bash
pnpm install
pnpm build          # Build all packages
pnpm test:run       # Run 185 tests
pnpm typecheck      # TypeScript check
pnpm check-bundle   # Verify bundle < 12KB
pnpm --filter @kalyx/docs dev  # Documentation site
```

## License

MIT
