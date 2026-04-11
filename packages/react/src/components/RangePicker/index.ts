import { RangePickerRoot } from './Root.js';
import { RangePickerInput } from './Input.js';
import { RangePickerPopover } from './Popover.js';
import { RangePickerCalendar } from './Calendar.js';

import type { RangePickerRootProps } from './Root.js';
import type { RangePickerInputProps, RangeInputPart } from './Input.js';
import type { RangePickerPopoverProps } from './Popover.js';
import type {
  RangePickerCalendarProps,
  RangePickerCalendarClassNames,
} from './Calendar.js';

/**
 * RangePicker — Headless 날짜 범위 선택 컴포넌트
 *
 * @example
 * ```tsx
 * <RangePicker value={range} onChange={setRange}>
 *   <RangePicker.Input part="start" />
 *   <RangePicker.Input part="end" />
 *   <RangePicker.Popover>
 *     <RangePicker.Calendar />
 *   </RangePicker.Popover>
 * </RangePicker>
 * ```
 */
export const RangePicker = Object.assign(RangePickerRoot, {
  Input: RangePickerInput,
  Popover: RangePickerPopover,
  Calendar: RangePickerCalendar,
});

export type {
  RangePickerRootProps,
  RangePickerInputProps,
  RangeInputPart,
  RangePickerPopoverProps,
  RangePickerCalendarProps,
  RangePickerCalendarClassNames,
};
