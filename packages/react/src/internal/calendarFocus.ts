import { civilMidnightFromUtcDay, isDateDisabled } from '@kalyx/core';
import type { DateAdapter, DisabledRule, ISODateString } from '@kalyx/core';

export function resolveEnabledCalendarFocus(
  coordinate: ISODateString,
  disabled: DisabledRule[],
  adapter: DateAdapter,
  timezone?: string,
  searchDirection: 'nearest' | 'forward' = 'nearest',
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
