import { MonthPickerRoot } from './Root.js';
import { DatePickerInput } from '../DatePicker/Input.js';
import { DatePickerTrigger } from '../DatePicker/Trigger.js';
import { DatePickerPopover } from '../DatePicker/Popover.js';
import { MonthPickerGrid } from './Grid.js';

import type { MonthPickerRootProps } from './Root.js';
import type { DatePickerInputProps } from '../DatePicker/Input.js';
import type { DatePickerTriggerProps } from '../DatePicker/Trigger.js';
import type { DatePickerPopoverProps } from '../DatePicker/Popover.js';
import type { MonthPickerGridProps, MonthPickerGridClassNames } from './Grid.js';

/**
 * MonthPicker — Headless month selector. Value is the first day of the selected month (UTC-ISO).
 *
 * Reuses DatePicker infrastructure (Root, Input, Trigger, Popover) so the public surface stays
 * consistent. The only new building block is `MonthPicker.Grid`, a 12-month commit grid.
 *
 * @example Basic
 * ```tsx
 * const [month, setMonth] = useState<string | null>(null);
 * <MonthPicker value={month} onChange={setMonth}>
 *   <MonthPicker.Input placeholder="Pick a month" />
 *   <MonthPicker.Popover>
 *     <MonthPicker.Grid />
 *   </MonthPicker.Popover>
 * </MonthPicker>
 * ```
 */
export const MonthPicker = Object.assign(MonthPickerRoot, {
  Input: DatePickerInput,
  Trigger: DatePickerTrigger,
  Popover: DatePickerPopover,
  Grid: MonthPickerGrid,
});

export type {
  MonthPickerRootProps,
  DatePickerInputProps as MonthPickerInputProps,
  DatePickerTriggerProps as MonthPickerTriggerProps,
  DatePickerPopoverProps as MonthPickerPopoverProps,
  MonthPickerGridProps,
  MonthPickerGridClassNames,
};
