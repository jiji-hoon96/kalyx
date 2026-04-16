import { DateTimePickerRoot } from './Root.js';
import { DateTimePickerInput } from './Input.js';

// Reuse: DatePicker subcomponents (consume DatePickerContext)
import { DatePickerPopover } from '../DatePicker/Popover.js';
import { DatePickerCalendar } from '../DatePicker/Calendar.js';
import { DatePickerMonthGrid } from '../DatePicker/MonthGrid.js';
import { DatePickerYearGrid } from '../DatePicker/YearGrid.js';

// Reuse: TimePicker subcomponents (consume TimePickerContext)
import { TimePickerHourList } from '../TimePicker/HourList.js';
import { TimePickerMinuteList } from '../TimePicker/MinuteList.js';
import { TimePickerAmPmToggle } from '../TimePicker/AmPmToggle.js';

import type { DateTimePickerRootProps } from './Root.js';
import type { DateTimePickerInputProps } from './Input.js';

/**
 * DateTimePicker — Combined component for selecting both date and time.
 *
 * Manages a single ISO datetime as the source of truth while providing both
 * DatePickerContext and TimePickerContext internally. This lets existing
 * components such as DatePicker.Calendar and TimePicker.HourList work as-is.
 *
 * @example
 * ```tsx
 * <DateTimePicker value={dt} onChange={setDt} format="24h" step={15}>
 *   <DateTimePicker.Input />
 *   <DateTimePicker.Popover>
 *     <DateTimePicker.Calendar />
 *     <DateTimePicker.HourList />
 *     <DateTimePicker.MinuteList />
 *   </DateTimePicker.Popover>
 * </DateTimePicker>
 * ```
 *
 * @example 12-hour mode
 * ```tsx
 * <DateTimePicker value={dt} onChange={setDt} format="12h" step={15}>
 *   <DateTimePicker.Input />
 *   <DateTimePicker.Popover>
 *     <DateTimePicker.Calendar />
 *     <DateTimePicker.HourList />
 *     <DateTimePicker.MinuteList />
 *     <DateTimePicker.AmPmToggle />
 *   </DateTimePicker.Popover>
 * </DateTimePicker>
 * ```
 */
export const DateTimePicker = Object.assign(DateTimePickerRoot, {
  Input: DateTimePickerInput,
  Popover: DatePickerPopover,
  Calendar: DatePickerCalendar,
  MonthGrid: DatePickerMonthGrid,
  YearGrid: DatePickerYearGrid,
  HourList: TimePickerHourList,
  MinuteList: TimePickerMinuteList,
  AmPmToggle: TimePickerAmPmToggle,
});

export type { DateTimePickerRootProps, DateTimePickerInputProps };
