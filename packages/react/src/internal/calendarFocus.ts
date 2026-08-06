import { civilMidnightFromUtcDay, isDateDisabled } from '@kalyx/core';
import type { DateAdapter, DisabledRule, ISODateString } from '@kalyx/core';

export function resolveEnabledCalendarFocus(
  coordinate: ISODateString,
  disabled: DisabledRule[],
  adapter: DateAdapter,
  timezone?: string,
  searchDirection: 'nearest' | 'forward' | 'backward' = 'nearest',
): ISODateString {
  const isDisabled = (day: ISODateString) =>
    isDateDisabled(
      timezone ? civilMidnightFromUtcDay(day, timezone) : day,
      disabled,
      adapter,
      timezone,
    );

  if (!isDisabled(coordinate)) return coordinate;

  const monthStart = adapter.startOfMonth(coordinate);

  if (searchDirection === 'backward') {
    // Prefer an enabled day inside the target month, so a partially disabled
    // month resolves to the same day 'forward' would pick.
    for (let offset = 0; offset < 31; offset++) {
      const inMonth = adapter.addDays(monthStart, offset);
      if (!adapter.isSameMonth(inMonth, monthStart)) break;
      if (!isDisabled(inMonth)) return inMonth;
    }
    // The whole month is disabled. Keep travelling the way the user asked
    // instead of bouncing forward past the month they navigated away from —
    // that turns the "previous month" button into a permanent dead end.
    for (let offset = 1; offset <= 366; offset++) {
      const earlier = adapter.addDays(monthStart, -offset);
      if (!isDisabled(earlier)) return earlier;
    }
    return coordinate;
  }

  for (let offset = 0; offset < 366; offset++) {
    const next = adapter.addDays(monthStart, offset);
    if (!isDisabled(next)) return next;
    if (searchDirection === 'nearest' && offset > 0) {
      const previous = adapter.addDays(monthStart, -offset);
      if (!isDisabled(previous)) return previous;
    }
  }
  return coordinate;
}

/**
 * Resolves the view month and focus target for a month-navigation step.
 *
 * The focus search follows the direction the user travelled, so a fully
 * disabled month never traps navigation: stepping back past it continues
 * backward rather than bouncing forward into the month they came from.
 * The view follows the resolved focus so the two can never disagree.
 */
export function resolveMonthNavigation(
  viewMonth: ISODateString,
  direction: number,
  disabled: DisabledRule[],
  adapter: DateAdapter,
  timezone?: string,
): { viewMonth: ISODateString; focusedDate: ISODateString } {
  const monthStart = adapter.startOfMonth(adapter.addMonths(viewMonth, direction));
  const focusedDate = resolveEnabledCalendarFocus(
    monthStart,
    disabled,
    adapter,
    timezone,
    direction < 0 ? 'backward' : 'forward',
  );
  return { viewMonth: adapter.startOfMonth(focusedDate), focusedDate };
}
