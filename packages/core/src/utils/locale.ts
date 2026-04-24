import type { WeekStartsOn } from '../types.js';

export interface WeekdayInfo {
  /** Short name (e.g. "Su", "일") */
  short: string;
  /** Full name (e.g. "Sunday", "일요일") */
  full: string;
}

// ── Intl formatter cache ──
// Avoid creating new Intl.DateTimeFormat on every call.
// Key: serialized options string, Value: cached formatter.
const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getCachedFormatter(
  locale: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = `${locale}:${JSON.stringify(options)}`;
  let fmt = formatterCache.get(key);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat(locale, options);
    formatterCache.set(key, fmt);
  }
  return fmt;
}

/** Reference date for month-invariant operations (any year works) */
const REFERENCE_YEAR = 2026;

/**
 * Returns a localized month name via Intl.DateTimeFormat.
 * @param month 0-indexed (0 = January)
 * @param locale BCP 47 locale string (e.g. "en-US", "ko-KR", "ja-JP")
 */
export function getMonthName(month: number, locale = 'en-US'): string {
  const date = new Date(Date.UTC(REFERENCE_YEAR, month, 1));
  return getCachedFormatter(locale, { month: 'long', timeZone: 'UTC' }).format(date);
}

/**
 * Returns a month+year string like "January 2026" or "2026년 1월".
 */
export function formatMonthYear(year: number, month: number, locale = 'en-US'): string {
  const date = new Date(Date.UTC(year, month, 1));
  return getCachedFormatter(locale, {
    year: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(date);
}

/**
 * Returns localized weekday names via Intl.DateTimeFormat.
 * Ordered according to weekStartsOn.
 *
 * @param locale BCP 47 locale string
 * @param weekStartsOn 0 = Sunday, 1 = Monday
 * @returns Array of 7 WeekdayInfo entries
 */
export function getWeekdayNames(locale = 'en-US', weekStartsOn: WeekStartsOn = 0): WeekdayInfo[] {
  // 2026-01-04 is a Sunday (reference point)
  const shortFormatter = getCachedFormatter(locale, { weekday: 'short', timeZone: 'UTC' });
  const fullFormatter = getCachedFormatter(locale, { weekday: 'long', timeZone: 'UTC' });

  const days: WeekdayInfo[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(Date.UTC(REFERENCE_YEAR, 0, 4 + i)); // Sun..Sat
    days.push({
      short: shortFormatter.format(date),
      full: fullFormatter.format(date),
    });
  }

  // Rotate to match weekStartsOn
  if (weekStartsOn === 1) {
    const sunday = days.shift()!;
    days.push(sunday);
  }

  return days;
}

/**
 * Returns a fully formatted date string via Intl.DateTimeFormat (for screen readers).
 * e.g. "Thursday, January 15, 2026"
 */
export function formatFullDate(iso: string, locale = 'en-US'): string {
  const date = new Date(iso);
  return getCachedFormatter(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    timeZone: 'UTC',
  }).format(date);
}
