---
id: react
title: '@kalyx/react'
sidebar_position: 2
description: 'Full API reference for @kalyx/react: every export from the main and /headless entries, plus bundle size figures.'
---

# @kalyx/react

Public React API. All names below are importable directly from `@kalyx/react`.

```ts
import {
  DatePicker, RangePicker, TimePicker, DateTimePicker,
  MonthPicker, YearPicker, WeekPicker,
} from '@kalyx/react';
```

## Components

| Name | Reference |
| --- | --- |
| `DatePicker` | [Component docs](../components/datepicker.md) |
| `RangePicker` | [Component docs](../components/rangepicker.md) |
| `TimePicker` | [Component docs](../components/timepicker.md) |
| `DateTimePicker` | [Component docs](../components/datetimepicker.md) |
| `MonthPicker` | [Component docs](../components/monthpicker.md) |
| `YearPicker` | [Component docs](../components/yearpicker.md) |
| `WeekPicker` | [Component docs](../components/weekpicker.md) |

## Hooks

| Name | Reference |
| --- | --- |
| `useDatePicker` | [Hook docs](../hooks/use-date-picker.md) |
| `useRangePicker` | [Hook docs](../hooks/use-range-picker.md) |
| `useTimePicker` | [Hook docs](../hooks/use-time-picker.md) |

Four more hooks ship on the `@kalyx/react/headless` entry only, which keeps them out of the default entry's byte budget:

| Name | Reference |
| --- | --- |
| `useMonthPicker` | [Hook docs](../hooks/use-month-picker.md) |
| `useYearPicker` | [Hook docs](../hooks/use-year-picker.md) |
| `useWeekPicker` | [Hook docs](../hooks/use-week-picker.md) |
| `useDateTimePicker` | [Hook docs](../hooks/use-date-time-picker.md) |

```ts
import { useMonthPicker } from '@kalyx/react/headless';
```

## Adapters

`DateFnsAdapter` is re-exported from `@kalyx/react` for convenience (it's the
default the main entry already installs):

```ts
import { DateFnsAdapter } from '@kalyx/react';
```

Two more prebuilt adapters ship as separate packages, for use with the
`@kalyx/react/headless` entry:

```ts
import { DayjsAdapter } from '@kalyx/adapter-dayjs';
import { LuxonAdapter } from '@kalyx/adapter-luxon';
```

All three implement the same `DateAdapter` contract, run in UTC, and are
validated against `@kalyx/core/test-helpers`. See the
[adapters guide](../guides/adapters.md).

## Types

### DatePicker types

```ts
import type {
  DatePickerRootProps,
  DatePickerInputProps,
  DatePickerTriggerProps,
  DatePickerPopoverProps,
  DatePickerCalendarProps,
  DatePickerCalendarClassNames,
  DatePickerMonthGridProps,
  DatePickerMonthGridClassNames,
  DatePickerYearGridProps,
  DatePickerYearGridClassNames,
  DatePickerPresetsProps,
  DatePickerPresetsClassNames,
  DatePickerPresetProps,
  DatePickerPresetKey,
} from '@kalyx/react';
```

### RangePicker types

```ts
import type {
  RangePickerRootProps,
  RangePickerInputProps,
  RangeInputPart,            // 'start' | 'end'
  RangePickerPopoverProps,
  RangePickerCalendarProps,
  RangePickerCalendarClassNames,
  RangePickerPresetsProps,
  RangePickerPresetsClassNames,
  RangePickerPresetProps,
  PresetKey,
} from '@kalyx/react';
```

### TimePicker types

```ts
import type {
  TimePickerRootProps,
  TimePickerInputProps,
  TimePickerHourListProps,
  TimePickerHourListClassNames,
  TimePickerMinuteListProps,
  TimePickerMinuteListClassNames,
  TimePickerAmPmToggleProps,
  TimePickerAmPmToggleClassNames,
} from '@kalyx/react';
```

### DateTimePicker types

```ts
import type {
  DateTimePickerRootProps,
  DateTimePickerInputProps,
} from '@kalyx/react';
```

Sub-component types are re-exported from DatePicker and TimePicker.

### MonthPicker types

```ts
import type {
  MonthPickerRootProps,
  MonthPickerInputProps,
  MonthPickerTriggerProps,
  MonthPickerPopoverProps,
  MonthPickerGridProps,
  MonthPickerGridClassNames,
} from '@kalyx/react';
```

### YearPicker types

```ts
import type {
  YearPickerRootProps,
  YearPickerInputProps,
  YearPickerTriggerProps,
  YearPickerPopoverProps,
  YearPickerGridProps,
  YearPickerGridClassNames,
} from '@kalyx/react';
```

### WeekPicker types

```ts
import type {
  WeekPickerRootProps,
  WeekPickerInputProps,
  WeekPickerPopoverProps,
  WeekPickerCalendarProps,
  WeekPickerCalendarClassNames,
} from '@kalyx/react';
```

### Hook types

```ts
import type {
  UseDatePickerOptions,
  UseDatePickerReturn,
  UseRangePickerOptions,
  UseRangePickerReturn,
  UseTimePickerOptions,
  UseTimePickerReturn,
} from '@kalyx/react';
```

### Re-exports from `@kalyx/core`

```ts
import type {
  ISODateString,
  DateRange,
  DisabledRule,
  DateAdapter,
  CalendarDay,
  TimeValue,
} from '@kalyx/react';
```

## Runtime dependencies

- `@kalyx/core` (workspace)
- `@kalyx/adapter-date-fns` (workspace; bundles `date-fns` for the default entry)
- `@floating-ui/react ^0.27.0`

Peer dependencies: `react ^19.0.0`, `react-dom ^19.0.0`.

Optional adapter packages (install only if you use the `/headless` entry with a
non-default backend): `@kalyx/adapter-dayjs`, `@kalyx/adapter-luxon`.

## Bundle size

Two numbers, measuring different things.

**The published file** (`pnpm check-bundle`, shown in the README badge). `packages/react/dist/index.js` alone, gzipped, with `@kalyx/core`, `@kalyx/adapter-date-fns`, and `@floating-ui/react` left as external imports: **~19.5 KB** for ESM (19.78 KB for CJS), under a CI ceiling of 20 KB. The headless ESM and CJS files (20.79 KB and 21.09 KB) have their own CI gate at 22 KB. That entry ships the same components plus all seven hooks and `DateTimePicker.Presets`, so it is budgeted separately rather than sharing the default entry's number.

**What your app ships** (`pnpm check-tree-shaking`). This is larger, because the bundler also resolves those three dependencies. The script minifies with esbuild, bundles the dependencies, leaves React and React DOM external, then gzips. One DatePicker is **~19 KB** (18.90 KB) and all seven pickers plus the three main-entry hooks are **~26 KB** (25.65 KB). Use this number when comparing against size figures that include dependencies.

`sideEffects: false` is declared and the dot-notation exports are pure-annotated, so pickers you don't import are eliminated. TimePicker alone measures ~16.36 KB and the heaviest single picker (DateTimePicker) ~20.16 KB. Run `pnpm check-tree-shaking` for the full scenario table. The pickers share a large base, so the saving is real but well short of linear. Measure your production bundle for your exact imports, and see [Troubleshooting → bundle size](../troubleshooting.md#bundle-size-seems-larger-than-expected) for the full reconciliation.

## See also

- [@kalyx/core API →](./core.md)
- [Migration guide →](../migration.md)
