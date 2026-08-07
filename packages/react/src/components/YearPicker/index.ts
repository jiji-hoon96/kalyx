import { YearPickerRoot } from './Root.js';
import { DatePickerInput } from '../DatePicker/Input.js';
import { DatePickerTrigger } from '../DatePicker/Trigger.js';
import { DatePickerPopover } from '../DatePicker/Popover.js';
import { YearPickerGrid } from './Grid.js';

import type { YearPickerRootProps } from './Root.js';
import type { DatePickerInputProps } from '../DatePicker/Input.js';
import type { DatePickerTriggerProps } from '../DatePicker/Trigger.js';
import type { DatePickerPopoverProps } from '../DatePicker/Popover.js';
import type { YearPickerGridProps, YearPickerGridClassNames } from './Grid.js';

/**
 * YearPicker — Headless year selector. Value is Jan 1 of the selected year (UTC-ISO).
 *
 * Reuses DatePicker infrastructure (Root, Input, Trigger, Popover) so the public surface stays
 * consistent. The only new building block is `YearPicker.Grid`, a 12-year decade commit grid.
 *
 * @example Basic
 * ```tsx
 * const [year, setYear] = useState<string | null>(null);
 * <YearPicker value={year} onChange={setYear}>
 *   <YearPicker.Input placeholder="Pick a year" />
 *   <YearPicker.Popover>
 *     <YearPicker.Grid />
 *   </YearPicker.Popover>
 * </YearPicker>
 * ```
 */
export const YearPicker = /*#__PURE__*/ Object.assign(YearPickerRoot, {
  Input: DatePickerInput,
  Trigger: DatePickerTrigger,
  Popover: DatePickerPopover,
  Grid: YearPickerGrid,
});

export type {
  YearPickerRootProps,
  DatePickerInputProps as YearPickerInputProps,
  DatePickerTriggerProps as YearPickerTriggerProps,
  DatePickerPopoverProps as YearPickerPopoverProps,
  YearPickerGridProps,
  YearPickerGridClassNames,
};
