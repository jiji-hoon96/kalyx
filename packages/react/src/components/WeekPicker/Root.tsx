import { RangePickerRoot } from '../RangePicker/Root.js';
import type { RangePickerRootProps } from '../RangePicker/Root.js';

/** Props for WeekPicker.Root — reuses RangePicker.Root. */
export type WeekPickerRootProps = RangePickerRootProps;

/**
 * WeekPicker.Root — thin wrapper over RangePicker.Root.
 *
 * The wrapper is necessary (rather than aliasing `RangePickerRoot` directly) because
 * `Object.assign` on the exported root mutates the target. Without a distinct identity here,
 * `WeekPicker.Calendar` would leak onto `RangePicker.Calendar`.
 */
export function WeekPickerRoot(props: WeekPickerRootProps) {
  return <RangePickerRoot {...props} />;
}
