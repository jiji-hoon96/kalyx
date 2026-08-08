import { DatePickerRootWithGranularity } from '../DatePicker/Root.js';
import type { DatePickerRootProps } from '../DatePicker/Root.js';

/** Props for MonthPicker Root — identical to DatePicker Root, but `displayFormat` defaults to `"yyyy-MM"`. */
export type MonthPickerRootProps = DatePickerRootProps;

/**
 * MonthPicker.Root — thin wrapper over DatePicker.Root that defaults `displayFormat` to `"yyyy-MM"`.
 * All other behavior (controlled/uncontrolled, displayTimezone, disabled rules) is inherited.
 */
export function MonthPickerRoot(props: MonthPickerRootProps) {
  const displayFormat = props.displayFormat ?? 'yyyy-MM';
  return (
    <DatePickerRootWithGranularity
      {...props}
      displayFormat={displayFormat}
      selectionGranularity="month"
    />
  );
}
