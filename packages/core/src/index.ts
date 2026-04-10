// @kalyx/core — 플랫폼 독립 날짜 로직

// 타입
export type {
  ISODateString,
  DisabledRule,
  CalendarDay,
  CalendarWeek,
  CalendarGrid,
  CalendarOptions,
  DateAdapter,
  WeekStartsOn,
} from './types.js';

// 어댑터
export { DateFnsAdapter } from './adapters/date-fns.js';

// 유틸
export { getCalendarDays, isDateDisabled } from './utils/calendar.js';
export { normalizeISO, parseInputValue, getOrderedWeekdays, WEEKDAY_LABELS } from './utils/date.js';
