import type { DateAdapter, ISODateString } from '@kalyx/core';

/**
 * Returns `value` only when the adapter can actually parse it, and `null` otherwise.
 *
 * `value` / `defaultValue` normally arrive from a form field or a database row, so an empty
 * or malformed string is *data*, not a programming error. The calendar view is seeded from
 * that value, and every adapter builds its result from `new Date(value).toISOString()` — on
 * an unparseable string that throws `RangeError: Invalid time value` during render and takes
 * the whole React tree down with it. Under `renderToString` a single bad row becomes a 500.
 *
 * Callers pair this with the existing `?? adapter.today(...)` fallback so a malformed value
 * degrades to "open on the current month" instead. The raw string is left untouched in the
 * picker's value, and `Input` still displays it verbatim, so the consumer can see and correct
 * what they passed.
 */
export function usableDate(
  value: ISODateString | null | undefined,
  adapter: DateAdapter,
): ISODateString | null {
  if (!value) return null;
  try {
    return adapter.isValid(value) ? value : null;
  } catch {
    return null;
  }
}

export function isUsableDate(
  value: ISODateString | null | undefined,
  adapter: DateAdapter,
): value is ISODateString {
  return usableDate(value, adapter) !== null;
}

export function getUsableDate(
  value: ISODateString | null | undefined,
  adapter: DateAdapter,
  fallback: () => ISODateString,
): ISODateString {
  return usableDate(value, adapter) ?? fallback();
}
