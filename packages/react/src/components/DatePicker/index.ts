import { DatePickerRoot } from './Root.js';
import { DatePickerInput } from './Input.js';
import { DatePickerTrigger } from './Trigger.js';
import { DatePickerPopover } from './Popover.js';
import { DatePickerCalendar } from './Calendar.js';

import type { DatePickerRootProps } from './Root.js';
import type { DatePickerInputProps } from './Input.js';
import type { DatePickerTriggerProps } from './Trigger.js';
import type { DatePickerPopoverProps } from './Popover.js';
import type { DatePickerCalendarProps, DatePickerCalendarClassNames } from './Calendar.js';

/**
 * DatePicker — Headless, SSR-safe React DatePicker
 *
 * @example
 * ```tsx
 * <DatePicker value={date} onChange={setDate}>
 *   <DatePicker.Input placeholder="날짜 선택" />
 *   <DatePicker.Popover>
 *     <DatePicker.Calendar />
 *   </DatePicker.Popover>
 * </DatePicker>
 * ```
 */
export const DatePicker = Object.assign(DatePickerRoot, {
  Input: DatePickerInput,
  Trigger: DatePickerTrigger,
  Popover: DatePickerPopover,
  Calendar: DatePickerCalendar,
});

export type {
  DatePickerRootProps,
  DatePickerInputProps,
  DatePickerTriggerProps,
  DatePickerPopoverProps,
  DatePickerCalendarProps,
  DatePickerCalendarClassNames,
};
