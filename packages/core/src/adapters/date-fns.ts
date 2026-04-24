import {
  parseISO,
  addDays as dfAddDays,
  addMonths as dfAddMonths,
  addYears as dfAddYears,
  isBefore as dfIsBefore,
  isAfter as dfIsAfter,
  isValid as dfIsValid,
} from 'date-fns';
import type { DateAdapter } from '../types.js';
import {
  formatInTimezone,
  isSameDayInTimezone,
  startOfDayInTimezone,
  todayInTimezone,
} from '../utils/timezone.js';

function toDate(iso: string): Date {
  return parseISO(iso);
}

function toISO(date: Date): string {
  return date.toISOString();
}

/** Normalize an ISO date string: "YYYY-MM-DD" → "YYYY-MM-DDTHH:mm:ss.sssZ" */
function normalize(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T00:00:00.000Z`;
  }
  return value;
}

/** Returns midnight of the given date in UTC */
function utcStartOfDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** Returns the first day of the month at midnight UTC */
function utcStartOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

/** Returns the last day of the month at 23:59:59.999 UTC */
function utcEndOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 23, 59, 59, 999));
}

/** Returns the first day of the week in UTC */
function utcStartOfWeek(d: Date, weekStartsOn: 0 | 1): Date {
  const day = d.getUTCDay();
  const diff = (day - weekStartsOn + 7) % 7;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - diff));
}

/** Returns the last day of the week in UTC */
function utcEndOfWeek(d: Date, weekStartsOn: 0 | 1): Date {
  const start = utcStartOfWeek(d, weekStartsOn);
  return new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + 6, 23, 59, 59, 999),
  );
}

/**
 * DateAdapter implementation backed by date-fns.
 * All operations run in UTC to avoid timezone interference.
 *
 * @example
 * ```ts
 * import { DateFnsAdapter } from '@kalyx/core';
 *
 * DateFnsAdapter.format('2026-01-15T00:00:00.000Z', 'yyyy-MM-dd'); // "2026-01-15"
 * DateFnsAdapter.addDays('2026-01-15T00:00:00.000Z', 7);           // "2026-01-22T..."
 * DateFnsAdapter.isSameDay('2026-01-15T00:00:00.000Z', '2026-01-15T23:59:59.000Z'); // true
 * ```
 */
export const DateFnsAdapter: DateAdapter = {
  parse(value: string): string {
    if (!value) return '';
    return normalize(value);
  },

  format(iso: string, formatStr: string, timezone?: string): string {
    if (timezone) {
      return formatInTimezone(iso, formatStr, timezone);
    }
    const d = toDate(iso);
    // Format in UTC to avoid local timezone interference
    const tokens: Record<string, string> = {
      yyyy: String(d.getUTCFullYear()),
      MM: String(d.getUTCMonth() + 1).padStart(2, '0'),
      dd: String(d.getUTCDate()).padStart(2, '0'),
      HH: String(d.getUTCHours()).padStart(2, '0'),
      mm: String(d.getUTCMinutes()).padStart(2, '0'),
      ss: String(d.getUTCSeconds()).padStart(2, '0'),
      M: String(d.getUTCMonth() + 1),
      d: String(d.getUTCDate()),
    };

    let result = formatStr;
    // Replace longer tokens first to prevent partial matches
    for (const [token, value] of Object.entries(tokens).sort((a, b) => b[0].length - a[0].length)) {
      result = result.split(token).join(value);
    }
    return result;
  },

  addDays(iso: string, n: number): string {
    return toISO(dfAddDays(toDate(iso), n));
  },

  addMonths(iso: string, n: number): string {
    return toISO(dfAddMonths(toDate(iso), n));
  },

  addYears(iso: string, n: number): string {
    return toISO(dfAddYears(toDate(iso), n));
  },

  isBefore(a: string, b: string): boolean {
    return dfIsBefore(toDate(a), toDate(b));
  },

  isAfter(a: string, b: string): boolean {
    return dfIsAfter(toDate(a), toDate(b));
  },

  isSameDay(a: string, b: string, timezone?: string): boolean {
    if (!a || !b) return false;
    if (timezone) {
      return isSameDayInTimezone(a, b, timezone);
    }
    const da = toDate(a);
    const db = toDate(b);
    return (
      da.getUTCFullYear() === db.getUTCFullYear() &&
      da.getUTCMonth() === db.getUTCMonth() &&
      da.getUTCDate() === db.getUTCDate()
    );
  },

  isSameMonth(a: string, b: string): boolean {
    const da = toDate(a);
    const db = toDate(b);
    return da.getUTCFullYear() === db.getUTCFullYear() && da.getUTCMonth() === db.getUTCMonth();
  },

  startOfDay(iso: string, timezone?: string): string {
    if (timezone) {
      return startOfDayInTimezone(iso, timezone);
    }
    return toISO(utcStartOfDay(toDate(iso)));
  },

  startOfMonth(iso: string): string {
    return toISO(utcStartOfMonth(toDate(iso)));
  },

  endOfMonth(iso: string): string {
    return toISO(utcEndOfMonth(toDate(iso)));
  },

  startOfWeek(iso: string, weekStartsOn: 0 | 1 = 0): string {
    return toISO(utcStartOfWeek(toDate(iso), weekStartsOn));
  },

  endOfWeek(iso: string, weekStartsOn: 0 | 1 = 0): string {
    return toISO(utcEndOfWeek(toDate(iso), weekStartsOn));
  },

  now(): string {
    return new Date().toISOString();
  },

  today(timezone?: string): string {
    if (timezone) {
      return todayInTimezone(timezone);
    }
    return toISO(utcStartOfDay(new Date()));
  },

  isValid(value: string): boolean {
    if (!value) return false;
    const normalized = normalize(value);
    const date = parseISO(normalized);
    return dfIsValid(date);
  },

  getYear(iso: string): number {
    return toDate(iso).getUTCFullYear();
  },

  getMonth(iso: string): number {
    return toDate(iso).getUTCMonth();
  },

  getDate(iso: string): number {
    return toDate(iso).getUTCDate();
  },

  getDay(iso: string): number {
    return toDate(iso).getUTCDay();
  },
};
