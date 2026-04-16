---
id: react
title: '@kalyx/react'
sidebar_position: 2
---

# @kalyx/react

Public React API. All names below are importable directly from `@kalyx/react`.

```ts
import { DatePicker, RangePicker, TimePicker, DateTimePicker } from '@kalyx/react';
```

## Components

| Name | Reference |
| --- | --- |
| `DatePicker` | [Component docs](../components/datepicker.md) |
| `RangePicker` | [Component docs](../components/rangepicker.md) |
| `TimePicker` | [Component docs](../components/timepicker.md) |
| `DateTimePicker` | [Component docs](../components/datetimepicker.md) |

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
- `@floating-ui/react ^0.26.0`
- `date-fns ^4.0.0`
- `date-fns-tz ^3.0.0`

Peer dependencies: `react ^19.0.0`, `react-dom ^19.0.0`.

## Bundle size

Gzipped build of the full public surface: **~9.2 KB**. Tree-shakes per import — e.g., using only `TimePicker` drops ~3 KB of DatePicker code. Verified in CI by `scripts/check-bundle-size.js`.

## See also

- [@kalyx/core API →](./core.md)
- [Migration guide →](../migration.md)
