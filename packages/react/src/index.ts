// @kalyx/react — public API entry point
// The published bundle is prefixed with `"use client";` (injected by tsup at build
// time, see tsup.config.ts) so React Server Component hosts (Next.js App Router etc.)
// treat it as a client boundary without consumers wrapping each import.

export { DatePicker } from './components/DatePicker/index.js';
export { RangePicker } from './components/RangePicker/index.js';
export { TimePicker } from './components/TimePicker/index.js';
export { DateTimePicker } from './components/DateTimePicker/index.js';
export { MonthPicker } from './components/MonthPicker/index.js';
export { YearPicker } from './components/YearPicker/index.js';
export { WeekPicker } from './components/WeekPicker/index.js';

export { useDatePicker } from './hooks/useDatePicker.js';
export { useRangePicker } from './hooks/useRangePicker.js';
export { useTimePicker } from './hooks/useTimePicker.js';

export type {
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
} from './components/DatePicker/index.js';

export type {
  RangePickerRootProps,
  RangePickerInputProps,
  RangeInputPart,
  RangePickerPopoverProps,
  RangePickerCalendarProps,
  RangePickerPresetsProps,
  RangePickerPresetsClassNames,
  RangePickerPresetProps,
  PresetKey,
  RangePickerCalendarClassNames,
} from './components/RangePicker/index.js';

export type {
  TimePickerRootProps,
  TimePickerInputProps,
  TimePickerHourListProps,
  TimePickerHourListClassNames,
  TimePickerMinuteListProps,
  TimePickerMinuteListClassNames,
  TimePickerAmPmToggleProps,
  TimePickerAmPmToggleClassNames,
} from './components/TimePicker/index.js';

export type {
  DateTimePickerRootProps,
  DateTimePickerInputProps,
} from './components/DateTimePicker/index.js';

export type {
  MonthPickerRootProps,
  MonthPickerInputProps,
  MonthPickerTriggerProps,
  MonthPickerPopoverProps,
  MonthPickerGridProps,
  MonthPickerGridClassNames,
} from './components/MonthPicker/index.js';

export type {
  YearPickerRootProps,
  YearPickerInputProps,
  YearPickerTriggerProps,
  YearPickerPopoverProps,
  YearPickerGridProps,
  YearPickerGridClassNames,
} from './components/YearPicker/index.js';

export type {
  WeekPickerRootProps,
  WeekPickerInputProps,
  WeekPickerPopoverProps,
  WeekPickerCalendarProps,
  WeekPickerCalendarClassNames,
} from './components/WeekPicker/index.js';

export type { UseDatePickerOptions, UseDatePickerReturn } from './hooks/useDatePicker.js';
export type { UseRangePickerOptions, UseRangePickerReturn } from './hooks/useRangePicker.js';
export type { UseTimePickerOptions, UseTimePickerReturn } from './hooks/useTimePicker.js';

// Re-export from @kalyx/core for convenience
export { DateFnsAdapter } from '@kalyx/core';
export type {
  ISODateString,
  DateRange,
  DisabledRule,
  DateAdapter,
  CalendarDay,
  TimeValue,
} from '@kalyx/core';
