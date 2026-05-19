/**
 * @kalyx/core type definitions.
 *
 * All date values are represented as ISO 8601 UTC strings.
 * Native Date objects are not used.
 */

/** ISO 8601 UTC date string. e.g. "2026-01-15T00:00:00.000Z" */
export type ISODateString = string;

/**
 * Date-disable rules. Multiple rules can be combined in an array.
 *
 * @example
 * ```ts
 * const rules: DisabledRule[] = [
 *   { before: '2026-01-01T00:00:00.000Z' }, // disable before Jan 1
 *   { after: '2026-12-31T00:00:00.000Z' },  // disable after Dec 31
 *   { date: '2026-06-15T00:00:00.000Z' },   // disable a specific date
 *   { dayOfWeek: [0, 6] },                  // disable weekends
 *   { filter: (iso) => holidays.has(iso) }, // programmatic filter
 * ];
 * ```
 */
export type DisabledRule =
  | { date: ISODateString }
  | { before: ISODateString }
  | { after: ISODateString }
  | { dayOfWeek: number[] }
  | { filter: (iso: ISODateString) => boolean };

/** Date range (RangePicker) */
export interface DateRange {
  start: ISODateString | null;
  end: ISODateString | null;
}

/** Represents a single day in the calendar grid */
export interface CalendarDay {
  /** ISO 8601 UTC string */
  isoString: ISODateString;
  /** Day of month (1-31) */
  dayNumber: number;
  /** Whether this day belongs to the currently displayed month */
  isCurrentMonth: boolean;
  /** Whether this day is today */
  isToday: boolean;
  /** Whether this day is the selected date (single selection) */
  isSelected: boolean;
  /** Whether this day is disabled */
  isDisabled: boolean;
  /** Whether this day is focused */
  isFocused: boolean;
  /** Whether this day is the start of a range */
  isRangeStart: boolean;
  /** Whether this day is the end of a range */
  isRangeEnd: boolean;
  /** Whether this day is inside a range (between start and end) */
  isInRange: boolean;
}

/** Calendar grid: array of weeks, each week is an array of days */
export type CalendarWeek = CalendarDay[];
export type CalendarGrid = CalendarWeek[];

/**
 * Date library adapter interface.
 * Abstracts all date operations so the underlying library (e.g. Temporal API) can be swapped.
 * Default implementation: {@link DateFnsAdapter}
 */
export interface DateAdapter {
  /** Any format → ISO 8601 UTC string */
  parse(value: string, format?: string): string;

  /** ISO string → display string */
  format(iso: string, formatStr: string, timezone?: string): string;

  addDays(iso: string, n: number): string;
  addMonths(iso: string, n: number): string;
  addYears(iso: string, n: number): string;

  isBefore(a: string, b: string): boolean;
  isAfter(a: string, b: string): boolean;
  isSameDay(a: string, b: string, timezone?: string): boolean;
  isSameMonth(a: string, b: string): boolean;

  startOfDay(iso: string, timezone?: string): string;
  startOfMonth(iso: string): string;
  endOfMonth(iso: string): string;
  startOfWeek(iso: string, weekStartsOn?: 0 | 1): string;
  endOfWeek(iso: string, weekStartsOn?: 0 | 1): string;

  now(): string;
  today(timezone?: string): string;

  isValid(value: string): boolean;

  getYear(iso: string): number;
  getMonth(iso: string): number;
  getDate(iso: string): number;
  getDay(iso: string): number;
}

/** First day of the week */
export type WeekStartsOn = 0 | 1;

/** Options for generating a calendar grid */
export interface CalendarOptions {
  weekStartsOn?: WeekStartsOn;
  today?: ISODateString;
  selected?: ISODateString | null;
  focusedDate?: ISODateString;
  disabled?: DisabledRule[];
  /** Selected range (RangePicker) */
  range?: DateRange | null;
  /** Currently hovered date (for RangePicker preview) */
  rangeHover?: ISODateString | null;
  /**
   * IANA timezone. When set, `isSameDay` comparisons for today/selected/range flags are
   * evaluated in this zone — required when the picker stores values in display-tz civil
   * midnight form while the grid iterates in UTC.
   */
  timezone?: string;
}
