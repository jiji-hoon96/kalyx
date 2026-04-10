// @kalyx/react — 공개 API 진입점

// 컴포넌트
export { DatePicker } from './components/DatePicker/index.js';

// 훅
export { useDatePicker } from './hooks/useDatePicker.js';

// 타입
export type {
  DatePickerRootProps,
  DatePickerInputProps,
  DatePickerTriggerProps,
  DatePickerPopoverProps,
  DatePickerCalendarProps,
  DatePickerCalendarClassNames,
} from './components/DatePicker/index.js';

export type { UseDatePickerOptions, UseDatePickerReturn } from './hooks/useDatePicker.js';

// @kalyx/core 재export (사용자 편의)
export { DateFnsAdapter } from '@kalyx/core';
export type { ISODateString, DisabledRule, DateAdapter, CalendarDay } from '@kalyx/core';
