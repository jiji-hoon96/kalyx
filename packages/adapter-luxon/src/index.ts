import { DateTime } from 'luxon';
import type { DateAdapter } from '@kalyx/core';
import {
  formatInTimezone,
  isSameDayInTimezone,
  startOfDayInTimezone,
  todayInTimezone,
} from '@kalyx/core';

/**
 * Parse an ISO string into a luxon DateTime pinned to UTC, so every operation
 * matches Kalyx's UTC/ISO-8601 contract regardless of the host's local zone.
 */
const d = (iso: string): DateTime => DateTime.fromISO(iso, { zone: 'utc' });

/** Normalize an ISO date string: "YYYY-MM-DD" → "YYYY-MM-DDTHH:mm:ss.sssZ". */
function normalize(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T00:00:00.000Z`;
  }
  return value;
}

/** luxon emits ISO with a "+00:00" UTC offset; Kalyx's contract wants a "Z". */
function toISO(dt: DateTime): string {
  // { suppressMilliseconds: false } keeps ".000"; force UTC then swap offset.
  const iso = dt.toUTC().toISO({ suppressMilliseconds: false });
  if (iso === null) return '';
  return iso.replace(/\+00:00$/, 'Z');
}

/**
 * DateAdapter implementation backed by luxon (UTC mode). A drop-in alternative
 * to `@kalyx/adapter-date-fns` for teams already shipping luxon — same UTC
 * semantics, validated against `@kalyx/core/test-helpers`. Timezone-aware
 * operations delegate to `@kalyx/core`'s Intl-based utilities (the correctness
 * moat lives in core, not the adapter).
 *
 * @example
 * ```ts
 * import { LuxonAdapter } from '@kalyx/adapter-luxon';
 * import { DatePicker } from '@kalyx/react/headless';
 *
 * <DatePicker adapter={LuxonAdapter} value={iso} onChange={setIso}>…</DatePicker>
 * ```
 */
export const LuxonAdapter: DateAdapter = {
  parse(value: string): string {
    if (!value) return '';
    return normalize(value);
  },

  format(iso: string, formatStr: string, timezone?: string): string {
    if (timezone) {
      return formatInTimezone(iso, formatStr, timezone);
    }
    const t = d(iso);
    const tokens: Record<string, string> = {
      yyyy: String(t.year),
      MM: String(t.month).padStart(2, '0'),
      dd: String(t.day).padStart(2, '0'),
      HH: String(t.hour).padStart(2, '0'),
      mm: String(t.minute).padStart(2, '0'),
      ss: String(t.second).padStart(2, '0'),
      M: String(t.month),
      d: String(t.day),
    };
    let result = formatStr;
    // Replace longer tokens first to prevent partial matches.
    for (const [token, value] of Object.entries(tokens).sort((a, b) => b[0].length - a[0].length)) {
      result = result.split(token).join(value);
    }
    return result;
  },

  addDays(iso: string, n: number): string {
    return toISO(d(iso).plus({ days: n }));
  },

  addMonths(iso: string, n: number): string {
    return toISO(d(iso).plus({ months: n }));
  },

  addYears(iso: string, n: number): string {
    return toISO(d(iso).plus({ years: n }));
  },

  isBefore(a: string, b: string): boolean {
    return d(a) < d(b);
  },

  isAfter(a: string, b: string): boolean {
    return d(a) > d(b);
  },

  isSameDay(a: string, b: string, timezone?: string): boolean {
    if (!a || !b) return false;
    if (timezone) {
      return isSameDayInTimezone(a, b, timezone);
    }
    const da = d(a);
    const db = d(b);
    return da.year === db.year && da.month === db.month && da.day === db.day;
  },

  isSameMonth(a: string, b: string): boolean {
    const da = d(a);
    const db = d(b);
    return da.year === db.year && da.month === db.month;
  },

  startOfDay(iso: string, timezone?: string): string {
    if (timezone) {
      return startOfDayInTimezone(iso, timezone);
    }
    return toISO(d(iso).startOf('day'));
  },

  startOfMonth(iso: string): string {
    return toISO(d(iso).startOf('month'));
  },

  endOfMonth(iso: string): string {
    return toISO(d(iso).endOf('month'));
  },

  startOfWeek(iso: string, weekStartsOn: 0 | 1 = 0): string {
    const t = d(iso);
    // luxon weekday: 1=Monday … 7=Sunday. Convert to 0=Sunday … 6=Saturday.
    const dow = t.weekday % 7;
    const diff = (dow - weekStartsOn + 7) % 7;
    return toISO(t.minus({ days: diff }).startOf('day'));
  },

  endOfWeek(iso: string, weekStartsOn: 0 | 1 = 0): string {
    const t = d(iso);
    const dow = t.weekday % 7;
    const diff = (dow - weekStartsOn + 7) % 7;
    return toISO(t.minus({ days: diff }).plus({ days: 6 }).endOf('day'));
  },

  now(): string {
    return toISO(DateTime.utc());
  },

  today(timezone?: string): string {
    if (timezone) {
      return todayInTimezone(timezone);
    }
    return toISO(DateTime.utc().startOf('day'));
  },

  isValid(value: string): boolean {
    if (!value) return false;
    return d(normalize(value)).isValid;
  },

  getYear(iso: string): number {
    return d(iso).year;
  },

  getMonth(iso: string): number {
    // luxon month is 1-based; the contract wants 0-based.
    return d(iso).month - 1;
  },

  getDate(iso: string): number {
    return d(iso).day;
  },

  getDay(iso: string): number {
    // luxon weekday: 1=Monday … 7=Sunday. Contract wants 0=Sunday … 6=Saturday.
    return d(iso).weekday % 7;
  },
};
