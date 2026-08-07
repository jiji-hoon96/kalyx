import { WeekPickerRoot } from './Root.js';
import { RangePickerInput } from '../RangePicker/Input.js';
import { RangePickerPopover } from '../RangePicker/Popover.js';
import { WeekPickerCalendar } from './Calendar.js';

import type { WeekPickerRootProps } from './Root.js';
import type { RangePickerInputProps } from '../RangePicker/Input.js';
import type { RangePickerPopoverProps } from '../RangePicker/Popover.js';
import type { WeekPickerCalendarProps, WeekPickerCalendarClassNames } from './Calendar.js';

/**
 * WeekPicker — Headless week selector. Value is a `DateRange` spanning the entire week (start
 * and end days inclusive, based on `weekStartsOn`). A single click selects the full week.
 *
 * Internally reuses `RangePicker` infrastructure (Root, Input, Popover). The only new primitive
 * is `WeekPicker.Calendar`, which overrides click behavior to commit the full week.
 *
 * @example Basic
 * ```tsx
 * const [week, setWeek] = useState<DateRange>({ start: null, end: null });
 * <WeekPicker value={week} onChange={setWeek}>
 *   <WeekPicker.Input part="start" />
 *   <WeekPicker.Input part="end" />
 *   <WeekPicker.Popover>
 *     <WeekPicker.Calendar />
 *   </WeekPicker.Popover>
 * </WeekPicker>
 * ```
 */
export const WeekPicker = /*#__PURE__*/ Object.assign(WeekPickerRoot, {
  Input: RangePickerInput,
  Popover: RangePickerPopover,
  Calendar: WeekPickerCalendar,
});

export type {
  WeekPickerRootProps,
  RangePickerInputProps as WeekPickerInputProps,
  RangePickerPopoverProps as WeekPickerPopoverProps,
  WeekPickerCalendarProps,
  WeekPickerCalendarClassNames,
};
