import { DatePickerRoot } from './Root.js';
import { DatePickerInput } from './Input.js';
import { DatePickerTrigger } from './Trigger.js';
import { DatePickerPopover } from './Popover.js';
import { DatePickerCalendar } from './Calendar.js';
import { DatePickerMonthGrid } from './MonthGrid.js';
import { DatePickerYearGrid } from './YearGrid.js';

import type { DatePickerRootProps } from './Root.js';
import type { DatePickerInputProps } from './Input.js';
import type { DatePickerTriggerProps } from './Trigger.js';
import type { DatePickerPopoverProps } from './Popover.js';
import type { DatePickerCalendarProps, DatePickerCalendarClassNames } from './Calendar.js';
import type { DatePickerMonthGridProps, DatePickerMonthGridClassNames } from './MonthGrid.js';
import type { DatePickerYearGridProps, DatePickerYearGridClassNames } from './YearGrid.js';

/**
 * DatePicker — Headless, SSR-safe React DatePicker
 *
 * @example Basic
 * ```tsx
 * <DatePicker value={date} onChange={setDate}>
 *   <DatePicker.Input placeholder="날짜 선택" />
 *   <DatePicker.Popover>
 *     <DatePicker.Calendar />
 *   </DatePicker.Popover>
 * </DatePicker>
 * ```
 *
 * @example Month/Year quick navigation
 * ```tsx
 * const [view, setView] = useState('days');
 * <DatePicker value={date} onChange={setDate}>
 *   <DatePicker.Input />
 *   <DatePicker.Popover>
 *     {view === 'days' && <DatePicker.Calendar onTitleClick={() => setView('months')} />}
 *     {view === 'months' && <DatePicker.MonthGrid onSelect={() => setView('days')} onTitleClick={() => setView('years')} />}
 *     {view === 'years' && <DatePicker.YearGrid onSelect={() => setView('months')} />}
 *   </DatePicker.Popover>
 * </DatePicker>
 * ```
 */
export const DatePicker = Object.assign(DatePickerRoot, {
  Input: DatePickerInput,
  Trigger: DatePickerTrigger,
  Popover: DatePickerPopover,
  Calendar: DatePickerCalendar,
  MonthGrid: DatePickerMonthGrid,
  YearGrid: DatePickerYearGrid,
});

export type {
  DatePickerRootProps,
  DatePickerInputProps,
  DatePickerTriggerProps,
  DatePickerPopoverProps,
  DatePickerCalendarProps,
  DatePickerCalendarClassNames,
  DatePickerMonthGridProps,
  DatePickerMonthGridClassNames,
  DatePickerYearGridProps,
  DatePickerYearGridClassNames,
};
