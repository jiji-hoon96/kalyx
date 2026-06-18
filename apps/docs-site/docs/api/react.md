---
id: react
title: '@kalyx/react'
sidebar_position: 2
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

## Adapters

`DateFnsAdapter` — re-exported from `@kalyx/core`.

```ts
import { DateFnsAdapter } from '@kalyx/react';
```

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
- `@kalyx/adapter-date-fns` (workspace — bundles `date-fns` for the default entry)
- `@floating-ui/react ^0.27.0`

Peer dependencies: `react ^19.0.0`, `react-dom ^19.0.0`.

## Bundle size

Gzipped build of the full public surface: **~15.78 KB** (v1.0.3, 7 components, CI ceiling 16 KB). Tree-shakes per import — e.g., using only `TimePicker` drops DatePicker code. Verified in CI by `scripts/check-bundle-size.js`.

## See also

- [@kalyx/core API →](./core.md)
- [Migration guide →](../migration.md)
