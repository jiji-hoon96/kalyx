import { TimePickerRoot } from './Root.js';
import { TimePickerInput } from './Input.js';
import { TimePickerHourList } from './HourList.js';
import { TimePickerMinuteList } from './MinuteList.js';
import { TimePickerAmPmToggle } from './AmPmToggle.js';

import type { TimePickerRootProps } from './Root.js';
import type { TimePickerInputProps } from './Input.js';
import type { TimePickerHourListProps, TimePickerHourListClassNames } from './HourList.js';
import type { TimePickerMinuteListProps, TimePickerMinuteListClassNames } from './MinuteList.js';
import type { TimePickerAmPmToggleProps, TimePickerAmPmToggleClassNames } from './AmPmToggle.js';

/**
 * TimePicker — Headless time-picker component
 *
 * @example
 * ```tsx
 * <TimePicker value={time} onChange={setTime} format="24h" step={15}>
 *   <TimePicker.Input />
 *   <div>
 *     <TimePicker.HourList />
 *     <TimePicker.MinuteList />
 *     <TimePicker.AmPmToggle />
 *   </div>
 * </TimePicker>
 * ```
 */
export const TimePicker = Object.assign(TimePickerRoot, {
  Input: TimePickerInput,
  HourList: TimePickerHourList,
  MinuteList: TimePickerMinuteList,
  AmPmToggle: TimePickerAmPmToggle,
});

export type {
  TimePickerRootProps,
  TimePickerInputProps,
  TimePickerHourListProps,
  TimePickerHourListClassNames,
  TimePickerMinuteListProps,
  TimePickerMinuteListClassNames,
  TimePickerAmPmToggleProps,
  TimePickerAmPmToggleClassNames,
};
