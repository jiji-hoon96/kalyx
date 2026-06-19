// @kalyx/react/headless — adapter-explicit entry point.
//
// Re-exports the same public surface as `@kalyx/react`, but deliberately
// skips installing a default `DateAdapter`. Pass one yourself via the `adapter`
// prop on each Root component (or via the `adapter` option on each hook):
//
//   import { DatePicker } from '@kalyx/react/headless';
//   import { DateFnsAdapter } from '@kalyx/adapter-date-fns';
//   // or your own dayjs/luxon/Temporal adapter:
//   //   const MyAdapter: DateAdapter = { ... };
//
//   <DatePicker adapter={DateFnsAdapter} value={iso} onChange={setIso}>
//     <DatePicker.Calendar />
//   </DatePicker>
//
// If you forget the `adapter` prop, the Root will throw a friendly error at
// render time telling you exactly what's missing.
//
// Why this entry exists: the default `@kalyx/react` entry bundles
// `@kalyx/adapter-date-fns` (≈date-fns + date-fns-tz). Teams already shipping
// dayjs / luxon don't want that duplication. Importing from `/headless` lets
// tree-shaking strip the date-fns code path entirely while keeping the rest of
// the component surface identical.
//
// The published bundle is prefixed with `"use client";` so RSC hosts treat it
// as a client boundary without consumers wrapping each import.

export { DatePicker } from './components/DatePicker/index.js';
export { RangePicker } from './components/RangePicker/index.js';
export { TimePicker } from './components/TimePicker/index.js';
export { DateTimePicker } from './components/DateTimePicker/headless.js';
export { MonthPicker } from './components/MonthPicker/index.js';
export { YearPicker } from './components/YearPicker/index.js';
export { WeekPicker } from './components/WeekPicker/index.js';

export { useDatePicker } from './hooks/useDatePicker.js';
export { useRangePicker } from './hooks/useRangePicker.js';
export { useTimePicker } from './hooks/useTimePicker.js';
// Headless-only hooks for the remaining pickers. These deliberately live on the
// `/headless` entry alone (not the default `@kalyx/react`) to keep the budgeted
// default bundle unchanged — see the 2026-06-18 correctness-first direction spec.
export { useMonthPicker } from './hooks/useMonthPicker.js';
export { useYearPicker } from './hooks/useYearPicker.js';
export { useWeekPicker } from './hooks/useWeekPicker.js';
export { useDateTimePicker } from './hooks/useDateTimePicker.js';

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
  DateTimePickerPresetsProps,
  DateTimePickerPresetsClassNames,
  DateTimePickerPresetProps,
} from './components/DateTimePicker/headless.js';

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
export type {
  UseMonthPickerOptions,
  UseMonthPickerReturn,
  MonthCell,
} from './hooks/useMonthPicker.js';
export type { UseYearPickerOptions, UseYearPickerReturn, YearCell } from './hooks/useYearPicker.js';
export type { UseWeekPickerOptions, UseWeekPickerReturn } from './hooks/useWeekPicker.js';
export type {
  UseDateTimePickerOptions,
  UseDateTimePickerReturn,
} from './hooks/useDateTimePicker.js';

// Core types/utilities — same as the main entry. We deliberately do NOT
// re-export `DateFnsAdapter` here; importing it would defeat the point of
// the headless entry. If you want date-fns, install `@kalyx/adapter-date-fns`
// directly or just use the main `@kalyx/react` entry.
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
