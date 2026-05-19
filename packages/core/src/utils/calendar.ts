import type {
  CalendarDay,
  CalendarGrid,
  CalendarOptions,
  DateAdapter,
  DateRange,
  DisabledRule,
  ISODateString,
} from '../types.js';

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
    selected,
    focusedDate,
    disabled = [],
    range,
    rangeHover,
    timezone,
  } = options;

  const todayISO = today ?? adapter.today(timezone);
  const monthStart = adapter.startOfMonth(monthISO);

  // Start of grid: start of the week containing the first day of the month
  const gridStart = adapter.startOfWeek(monthStart, weekStartsOn);

  // Normalize for range computation (ensures start <= end)
  const normalizedRange = normalizeRangeForDisplay(range, rangeHover, adapter, timezone);

  const weeks: CalendarGrid = [];
  let current = gridStart;

  // Up to 6 weeks (42 days)
  for (let week = 0; week < 6; week++) {
    const days: CalendarDay[] = [];

    for (let day = 0; day < 7; day++) {
      const isCurrentMonth = adapter.isSameMonth(current, monthISO);
      const isTodayDate = adapter.isSameDay(current, todayISO, timezone);
      const isSelected_ = selected ? adapter.isSameDay(current, selected, timezone) : false;
      const isFocused_ = focusedDate ? adapter.isSameDay(current, focusedDate, timezone) : false;
      const isDisabled_ = isDateDisabled(current, disabled, adapter);

      const rangeFlags = computeRangeFlags(current, normalizedRange, adapter, timezone);

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

    // Stop if the next week has already moved into the next month
    if (!adapter.isSameMonth(current, monthISO) && week >= 3) {
      break;
    }
  }

  return weeks;
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
 */
export function isDateDisabled(iso: string, rules: DisabledRule[], adapter: DateAdapter): boolean {
  for (const rule of rules) {
    if ('date' in rule) {
      if (adapter.isSameDay(iso, rule.date)) return true;
    } else if ('before' in rule) {
      if (adapter.isBefore(iso, rule.before)) return true;
    } else if ('after' in rule) {
      if (adapter.isAfter(iso, rule.after)) return true;
    } else if ('dayOfWeek' in rule) {
      if (rule.dayOfWeek.includes(adapter.getDay(iso))) return true;
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
