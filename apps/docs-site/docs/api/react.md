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
- `@kalyx/adapter-date-fns` (workspace — bundles `date-fns` for the default entry)
- `@floating-ui/react ^0.27.0`

Peer dependencies: `react ^19.0.0`, `react-dom ^19.0.0`.

Optional adapter packages (install only if you use the `/headless` entry with a
non-default backend): `@kalyx/adapter-dayjs`, `@kalyx/adapter-luxon`.

## Bundle size

Gzipped default-entry artifact: **~18.5 KB** (7 components, CI ceiling 20 KB). The headless ESM and CJS artifacts have their own CI gate at 22 KB — that entry ships the same components plus all seven hooks and `DateTimePicker.Presets`, so it is budgeted separately rather than sharing the default entry's number.

That figure measures the artifact with its dependencies external. What your application ships is larger, because the bundler also resolves `@kalyx/core`, `@kalyx/adapter-date-fns`, and `@floating-ui/react` — the repository's consumer harness measures **~24 KB** gzipped. `sideEffects: false` is declared, but that harness does not demonstrate per-picker elimination from the root entry, so importing one picker costs about the same as importing all seven. Measure your production bundle for your exact imports, and see [Troubleshooting → bundle size](../troubleshooting.md#bundle-size-seems-larger-than-expected) for the full reconciliation.

## See also

- [@kalyx/core API →](./core.md)
- [Migration guide →](../migration.md)
