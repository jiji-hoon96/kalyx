import { DatePickerRoot } from '../DatePicker/Root.js';
import type { DatePickerRootProps } from '../DatePicker/Root.js';

/** Props for YearPicker Root — identical to DatePicker Root, but `displayFormat` defaults to `"yyyy"`. */
export type YearPickerRootProps = DatePickerRootProps;

/**
 * YearPicker.Root — thin wrapper over DatePicker.Root that defaults `displayFormat` to `"yyyy"`.
 */
export function YearPickerRoot(props: YearPickerRootProps) {
  const displayFormat = props.displayFormat ?? 'yyyy';
  return <DatePickerRoot {...props} displayFormat={displayFormat} />;
}
