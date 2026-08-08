import { civilMidnightFromUtcDay, isDateDisabled } from '@kalyx/core';
import type { DateAdapter, DisabledRule, ISODateString, WeekStartsOn } from '@kalyx/core';

export interface WeekCoordinateRange {
  start: ISODateString;
  end: ISODateString;
}

export function getWeekCoordinateRange(
  iso: ISODateString,
  adapter: DateAdapter,
  weekStartsOn: WeekStartsOn,
  weekAnchor: 'calendar' | 'clicked',
  selectingTarget: 'start' | 'end',
): WeekCoordinateRange {
  const coordinate = adapter.startOfDay(iso);
  if (weekAnchor === 'clicked') {
    return selectingTarget === 'end'
      ? { start: adapter.addDays(coordinate, -6), end: coordinate }
      : { start: coordinate, end: adapter.addDays(coordinate, 6) };
  }
  return {
    start: adapter.startOfWeek(coordinate, weekStartsOn),
    end: adapter.startOfDay(adapter.endOfWeek(coordinate, weekStartsOn)),
  };
}

/** A week is unavailable when any one of its seven civil days is unavailable. */
export function isWeekSelectionDisabled(
  iso: ISODateString,
  rules: DisabledRule[],
  adapter: DateAdapter,
  weekStartsOn: WeekStartsOn,
  weekAnchor: 'calendar' | 'clicked',
  selectingTarget: 'start' | 'end',
  timezone?: string,
): boolean {
  const { start } = getWeekCoordinateRange(iso, adapter, weekStartsOn, weekAnchor, selectingTarget);
  for (let offset = 0; offset < 7; offset++) {
    const coordinate = adapter.addDays(start, offset);
    const value = timezone ? civilMidnightFromUtcDay(coordinate, timezone) : coordinate;
    if (isDateDisabled(value, rules, adapter, timezone)) return true;
  }
  return false;
}
