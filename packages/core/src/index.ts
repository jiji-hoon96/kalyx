export type {
  ISODateString,
  DisabledRule,
  DateRange,
  CalendarDay,
  CalendarWeek,
  CalendarGrid,
  CalendarOptions,
  DateAdapter,
  WeekStartsOn,
} from './types.js';

// DateFnsAdapter has been extracted to its own package (`@kalyx/adapter-date-fns`)
// so `@kalyx/core` stays date-library-agnostic. Import the adapter from there:
//
//   import { DateFnsAdapter } from '@kalyx/adapter-date-fns';
//
// `@kalyx/react` continues to wire the date-fns adapter as the default — direct
// consumers of `@kalyx/core` who held a reference to the previous re-export need
// to switch their import path.

export {
  getCalendarDays,
  getISOWeekNumber,
  isDateDisabled,
  minDate,
  maxDate,
} from './utils/calendar.js';
export { normalizeISO, parseInputValue } from './utils/date.js';
export {
  setTime,
  getTime,
  parseTimeString,
  formatTimeString,
  formatTimeFromISO,
  to12Hour,
  to24Hour,
  generateHours,
  generateMinutes,
  isSameTime,
} from './utils/time.js';
export type { TimeValue } from './utils/time.js';
export {
  getMonthName,
  formatMonthYear,
  getWeekdayNames,
  formatFullDate,
  getWeekStartForLocale,
} from './utils/locale.js';
export type { WeekdayInfo } from './utils/locale.js';
export {
  formatInTimezone,
  startOfDayInTimezone,
  isSameDayInTimezone,
  todayInTimezone,
  getTimezoneOffsetMinutes,
  civilMidnightFromUtcDay,
  getTimeInTimezone,
  setTimeInTimezone,
} from './utils/timezone.js';
export type {
  DatePickerLabels,
  RangePickerLabels,
  TimePickerLabels,
  DateTimePickerLabels,
} from './utils/labels.js';
export {
  DEFAULT_DATEPICKER_LABELS,
  DEFAULT_RANGEPICKER_LABELS,
  DEFAULT_TIMEPICKER_LABELS,
  DEFAULT_DATETIMEPICKER_LABELS,
} from './utils/labels.js';
