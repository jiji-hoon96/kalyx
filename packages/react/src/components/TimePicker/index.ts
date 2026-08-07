import { TimePickerRoot } from './Root.js';
import { TimePickerInput } from './Input.js';
import { TimePickerPopover } from './Popover.js';
import { TimePickerHourList } from './HourList.js';
import { TimePickerMinuteList } from './MinuteList.js';
import { TimePickerAmPmToggle } from './AmPmToggle.js';

import type { TimePickerRootProps } from './Root.js';
import type { TimePickerInputProps } from './Input.js';
import type { TimePickerPopoverProps } from './Popover.js';
import type { TimePickerHourListProps, TimePickerHourListClassNames } from './HourList.js';
import type { TimePickerMinuteListProps, TimePickerMinuteListClassNames } from './MinuteList.js';
import type { TimePickerAmPmToggleProps, TimePickerAmPmToggleClassNames } from './AmPmToggle.js';

/**
 * TimePicker — Headless time-picker component
 *
 * Can be used inline (Hour/Minute lists always visible) or in a popover: wrap
 * the controls in `TimePicker.Popover` so they appear only after the user opens
 * the picker via `TimePicker.Input` (click / ArrowDown).
 *
 * @example Inline
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
 *
 * @example Popover
 * ```tsx
 * <TimePicker value={time} onChange={setTime} format="12h">
 *   <TimePicker.Input />
 *   <TimePicker.Popover>
 *     <TimePicker.HourList />
 *     <TimePicker.MinuteList />
 *     <TimePicker.AmPmToggle />
 *   </TimePicker.Popover>
 * </TimePicker>
 * ```
 */
export const TimePicker = /*#__PURE__*/ Object.assign(TimePickerRoot, {
  Input: TimePickerInput,
  Popover: TimePickerPopover,
  HourList: TimePickerHourList,
  MinuteList: TimePickerMinuteList,
  AmPmToggle: TimePickerAmPmToggle,
});

export type {
  TimePickerRootProps,
  TimePickerInputProps,
  TimePickerPopoverProps,
  TimePickerHourListProps,
  TimePickerHourListClassNames,
  TimePickerMinuteListProps,
  TimePickerMinuteListClassNames,
  TimePickerAmPmToggleProps,
  TimePickerAmPmToggleClassNames,
};
