// @kalyx/react — public API entry point
// The published bundle is prefixed with `"use client";` (injected by tsup at build
// time, see tsup.config.ts) so React Server Component hosts (Next.js App Router etc.)
// treat it as a client boundary without consumers wrapping each import.

// Auto-install the default adapter so users get "install and it works" out of the
// box. The `@kalyx/react/headless` entry deliberately skips this step — see
// src/headless.ts for the explicit-adapter contract.
import { DateFnsAdapter } from '@kalyx/adapter-date-fns';
import { setDefaultAdapter } from './internal/defaultAdapter.js';
setDefaultAdapter(DateFnsAdapter);

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
  RangePickerCalendarSelectionMode,
  RangePickerWeekAnchor,
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

// Layout direction shared across all picker Roots (`dir` prop).
export type { Direction } from './components/_shared/rtl.js';

// Re-export the default adapter so consumers can `import { DateFnsAdapter } from '@kalyx/react'`
// without pulling in the adapter package directly. Source lives in @kalyx/adapter-date-fns now.
export { DateFnsAdapter } from '@kalyx/adapter-date-fns';
export type {
  ISODateString,
  DateRange,
  DisabledRule,
  DateAdapter,
  CalendarDay,
  CalendarWeek,
  CalendarGrid,
  CalendarOptions,
  WeekStartsOn,
  TimeValue,
  WeekdayInfo,
  DatePickerLabels,
  RangePickerLabels,
  TimePickerLabels,
  DateTimePickerLabels,
} from '@kalyx/core';
export {
  DEFAULT_DATEPICKER_LABELS,
  DEFAULT_RANGEPICKER_LABELS,
  DEFAULT_TIMEPICKER_LABELS,
  DEFAULT_DATETIMEPICKER_LABELS,
} from '@kalyx/core';
