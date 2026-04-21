import { RangePickerCalendar } from '../RangePicker/Calendar.js';
import type {
  RangePickerCalendarProps,
  RangePickerCalendarClassNames,
} from '../RangePicker/Calendar.js';

/**
 * WeekPicker.Calendar — renders the same calendar grid as `RangePicker.Calendar` but with
 * `selectionMode="week"` so a single click commits the full week containing the clicked day.
 *
 * This is a thin wrapper over `RangePicker.Calendar` — the two share all keyboard navigation,
 * ARIA semantics, and rendering logic.
 */
export function WeekPickerCalendar(props: Omit<RangePickerCalendarProps, 'selectionMode'>) {
  return <RangePickerCalendar {...props} selectionMode="week" />;
}

/** Re-export RangePicker calendar classNames — the surface is identical. */
export type WeekPickerCalendarClassNames = RangePickerCalendarClassNames;

export type WeekPickerCalendarProps = Omit<RangePickerCalendarProps, 'selectionMode'>;
