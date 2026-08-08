import type {
  CalendarDay,
  CalendarGrid,
  CalendarOptions,
  DateAdapter,
  DateRange,
  DisabledRule,
  ISODateString,
} from '../types.js';
import { calendarDayFromInstant, civilMidnightFromUtcDay } from './timezone.js';

/**
 * Builds the calendar grid for the given month.
 * Returns a 2D array (`CalendarGrid`) organized by week.
 *
 * @param monthISO - ISO datetime containing the month to display
 * @param adapter - Date operation adapter ({@link DateFnsAdapter})
 * @param options - Week start day, selected date, disabled rules, range, etc.
 * @returns A calendar grid of 4-6 weeks. Each week is an array of 7 {@link CalendarDay}.
 *
 * @example
 * ```ts
 * const grid = getCalendarDays('2026-01-01T00:00:00.000Z', DateFnsAdapter, {
 *   weekStartsOn: 0,
 *   selected: '2026-01-15T00:00:00.000Z',
 *   disabled: [{ dayOfWeek: [0, 6] }],
 * });
 * // grid[0] = first week (CalendarDay[7])
 * // grid[0][0].dayNumber = 28 (previous month)
 * ```
 */
export function getCalendarDays(
  monthISO: string,
  adapter: DateAdapter,
  options: CalendarOptions = {},
): CalendarGrid {
  const {
    weekStartsOn = 0,
    today,
    selected: rawSelected,
    focusedDate: rawFocusedDate,
    disabled = [],
    range: rawRange,
    rangeHover: rawRangeHover,
    timezone,
    fixedWeeks = false,
  } = options;

  // `selected` / `focusedDate` / `range` usually originate from consumer state — a form
  // field or a database row — so an unparseable string is data rather than a programming
  // error. They are only ever compared against grid cells, and a comparison that cannot be
  // computed is simply false, so drop them instead of letting `isSameDay` reach
  // `Intl.DateTimeFormat.formatToParts(Invalid Date)` and throw `RangeError` mid-render.
  const usable = (iso: ISODateString | null | undefined) =>
    iso && adapter.isValid(iso) ? iso : undefined;
  const selected = usable(rawSelected);
  const focusedDate = usable(rawFocusedDate);
  const rangeHover = usable(rawRangeHover);
  const range = rawRange
    ? { start: usable(rawRange.start) ?? null, end: usable(rawRange.end) ?? null }
    : rawRange;

  const todayISO = today ?? adapter.today(timezone);
  const monthStart = adapter.startOfMonth(monthISO);

  // Start of grid: start of the week containing the first day of the month
  const gridStart = adapter.startOfWeek(monthStart, weekStartsOn);

  // Normalize for range computation (ensures start <= end)
  const candidateRangeHover =
    timezone && rangeHover ? civilMidnightFromUtcDay(rangeHover, timezone) : rangeHover;
  const normalizedRange = normalizeRangeForDisplay(range, candidateRangeHover, adapter, timezone);

  const weeks: CalendarGrid = [];
  let current = gridStart;

  // Up to 6 weeks (42 days)
  for (let week = 0; week < 6; week++) {
    const days: CalendarDay[] = [];

    for (let day = 0; day < 7; day++) {
      const candidateInstant = timezone ? civilMidnightFromUtcDay(current, timezone) : current;
      const isCurrentMonth = adapter.isSameMonth(current, monthISO);
      const isTodayDate = adapter.isSameDay(candidateInstant, todayISO, timezone);
      const isSelected_ = selected
        ? adapter.isSameDay(candidateInstant, selected, timezone)
        : false;
      const isFocused_ = focusedDate
        ? adapter.isSameDay(candidateInstant, focusedDate, timezone)
        : false;
      const isDisabled_ = isDateDisabled(candidateInstant, disabled, adapter, timezone);

      const rangeFlags = computeRangeFlags(candidateInstant, normalizedRange, adapter, timezone);

      days.push({
        isoString: current,
        dayNumber: adapter.getDate(current),
        isCurrentMonth,
        isToday: isTodayDate,
        isSelected: isSelected_,
        isDisabled: isDisabled_,
        isFocused: isFocused_,
        ...rangeFlags,
      });

      current = adapter.addDays(current, 1);
    }

    weeks.push(days);

    // Stop if the next week has already moved into the next month.
    // `fixedWeeks` overrides this so the grid always renders 6 rows (42 cells).
    if (!fixedWeeks && !adapter.isSameMonth(current, monthISO) && week >= 3) {
      break;
    }
  }

  return weeks;
}

/**
 * Returns the ISO 8601 week number (1-53) of the given date. ISO weeks start on Monday;
 * week 1 is the week containing the year's first Thursday. The computation works in UTC
 * to match the calendar grid's iteration semantics.
 *
 * @example
 * getISOWeekNumber('2026-01-01T00:00:00.000Z'); // 1 (Jan 1 2026 is a Thursday → ISO week 1)
 * getISOWeekNumber('2026-12-31T00:00:00.000Z'); // 53
 */
export function getISOWeekNumber(iso: ISODateString): number {
  const d = new Date(iso);
  // Anchor to the Thursday of the same ISO week, which always falls in the "owning" year.
  // ISO day numbering: Mon=1..Sun=7 (treat UTC Sunday's 0 as 7).
  const utc = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const isoDay = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - isoDay);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  return Math.ceil(((utc.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

/**
 * When only one side of the range is selected, use the hover date to create a preview range.
 * Swaps if start > end.
 */
function normalizeRangeForDisplay(
  range: DateRange | null | undefined,
  hover: ISODateString | null | undefined,
  adapter: DateAdapter,
  _timezone?: string,
): { start: ISODateString | null; end: ISODateString | null } {
  if (!range) return { start: null, end: null };

  const { start, end } = range;

  // Both selected → sort and return
  if (start && end) {
    if (adapter.isAfter(start, end)) {
      return { start: end, end: start };
    }
    return { start, end };
  }

  // Only start selected, with hover → preview up to hover
  if (start && !end && hover) {
    if (adapter.isAfter(start, hover)) {
      return { start: hover, end: start };
    }
    return { start, end: hover };
  }

  // Only start selected, no hover
  if (start && !end) {
    return { start, end: null };
  }

  return { start: null, end: null };
}

interface RangeFlags {
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isInRange: boolean;
}

function computeRangeFlags(
  iso: ISODateString,
  range: { start: ISODateString | null; end: ISODateString | null },
  adapter: DateAdapter,
  timezone?: string,
): RangeFlags {
  const { start, end } = range;

  if (!start) {
    return { isRangeStart: false, isRangeEnd: false, isInRange: false };
  }

  const isRangeStart = adapter.isSameDay(iso, start, timezone);

  if (!end) {
    return { isRangeStart, isRangeEnd: false, isInRange: false };
  }

  const isRangeEnd = adapter.isSameDay(iso, end, timezone);
  const isInRange =
    !isRangeStart && !isRangeEnd && adapter.isAfter(iso, start) && adapter.isBefore(iso, end);

  return { isRangeStart, isRangeEnd, isInRange };
}

/**
 * Checks whether the given date matches any disable rule.
 *
 * `iso` is a point-in-time value (the date being tested) — not a hand-built
 * UTC-midnight grid coordinate. When `timezone` is set, the day-granular rules
 * (`{ date }` and `{ dayOfWeek }`) are evaluated by the *civil day in that zone*,
 * so pass the same civil-midnight-in-timezone instants the pickers emit (via
 * `onChange` / {@link civilMidnightFromUtcDay}) rather than a raw `…T00:00:00Z`
 * coordinate — under a negative UTC offset the latter resolves to the previous
 * civil day. `{ before }` / `{ after }` are plain instant comparisons and are
 * timezone-independent. For rendering a calendar, prefer the precomputed
 * {@link getCalendarDays} `isDisabled` flag, which already normalizes each cell.
 *
 * @param timezone - Optional IANA timezone governing the civil-day evaluation of
 *   `{ date }` / `{ dayOfWeek }` rules. Omit for UTC-day semantics.
 */
export function isDateDisabled(
  iso: string,
  rules: DisabledRule[],
  adapter: DateAdapter,
  timezone?: string,
): boolean {
  for (const rule of rules) {
    if ('date' in rule) {
      if (adapter.isSameDay(iso, rule.date, timezone)) return true;
    } else if ('before' in rule) {
      if (adapter.isBefore(iso, rule.before)) return true;
    } else if ('after' in rule) {
      if (adapter.isAfter(iso, rule.after)) return true;
    } else if ('dayOfWeek' in rule) {
      const dayOfWeekCoordinate = timezone ? calendarDayFromInstant(iso, timezone) : iso;
      if (rule.dayOfWeek.includes(adapter.getDay(dayOfWeekCoordinate))) return true;
    } else if ('filter' in rule) {
      if (rule.filter(iso)) return true;
    }
  }
  return false;
}

/**
 * Returns the earlier of two dates.
 */
export function minDate(a: ISODateString, b: ISODateString, adapter: DateAdapter): ISODateString {
  return adapter.isBefore(a, b) ? a : b;
}

/**
 * Returns the later of two dates.
 */
export function maxDate(a: ISODateString, b: ISODateString, adapter: DateAdapter): ISODateString {
  return adapter.isAfter(a, b) ? a : b;
}
