import { civilMidnightFromUtcDay, isDateDisabled } from '@kalyx/core';
import type { DateAdapter, DisabledRule, ISODateString } from '@kalyx/core';

export function resolveEnabledCalendarFocus(
  coordinate: ISODateString,
  disabled: DisabledRule[],
  adapter: DateAdapter,
  timezone?: string,
): ISODateString {
  const isDisabled = (day: ISODateString) =>
    isDateDisabled(
      timezone ? civilMidnightFromUtcDay(day, timezone) : day,
      disabled,
      adapter,
      timezone,
    );

  if (!isDisabled(coordinate)) return coordinate;

  let candidate = adapter.startOfMonth(coordinate);
  for (let day = 0; day < 31; day++) {
    if (!isDisabled(candidate)) return candidate;
    candidate = adapter.addDays(candidate, 1);
  }
  return coordinate;
}
