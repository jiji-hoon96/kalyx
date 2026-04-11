// @kalyx/react — 공개 API 진입점

// 컴포넌트
export { DatePicker } from './components/DatePicker/index.js';
export { RangePicker } from './components/RangePicker/index.js';

// 훅
export { useDatePicker } from './hooks/useDatePicker.js';
export { useRangePicker } from './hooks/useRangePicker.js';

// 타입 — DatePicker
export type {
  DatePickerRootProps,
  DatePickerInputProps,
  DatePickerTriggerProps,
  DatePickerPopoverProps,
  DatePickerCalendarProps,
  DatePickerCalendarClassNames,
} from './components/DatePicker/index.js';

// 타입 — RangePicker
export type {
  RangePickerRootProps,
  RangePickerInputProps,
  RangeInputPart,
  RangePickerPopoverProps,
  RangePickerCalendarProps,
  RangePickerCalendarClassNames,
} from './components/RangePicker/index.js';

// 타입 — Hooks
export type { UseDatePickerOptions, UseDatePickerReturn } from './hooks/useDatePicker.js';
export type { UseRangePickerOptions, UseRangePickerReturn } from './hooks/useRangePicker.js';

// @kalyx/core 재export (사용자 편의)
export { DateFnsAdapter } from '@kalyx/core';
export type {
  ISODateString,
  DateRange,
  DisabledRule,
  DateAdapter,
  CalendarDay,
} from '@kalyx/core';
