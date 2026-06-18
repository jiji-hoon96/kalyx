import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import type { DateAdapter } from '@kalyx/core';
import {
  formatInTimezone,
  isSameDayInTimezone,
  startOfDayInTimezone,
  todayInTimezone,
} from '@kalyx/core';

// Run dayjs in UTC mode so every operation matches Kalyx's UTC/ISO-8601
// contract regardless of the host's local timezone. NOTE: this `extend` is a
// load-time side effect — the package deliberately does NOT set
// `"sideEffects": false`, otherwise a bundler could legally drop this call and
// `dayjs.utc(...)` would throw in the consumer's build.
dayjs.extend(utc);

const d = (iso: string) => dayjs.utc(iso);

/** Normalize an ISO date string: "YYYY-MM-DD" → "YYYY-MM-DDTHH:mm:ss.sssZ". */
function normalize(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T00:00:00.000Z`;
  }
  return value;
}

/**
 * DateAdapter implementation backed by dayjs (UTC mode). A drop-in alternative
 * to `@kalyx/adapter-date-fns` for teams already shipping dayjs — same UTC
 * semantics, validated against `@kalyx/core/test-helpers`. Timezone-aware
 * operations delegate to `@kalyx/core`'s Intl-based utilities (the correctness
 * moat lives in core, not the adapter).
 *
 * @example
 * ```ts
 * import { DayjsAdapter } from '@kalyx/adapter-dayjs';
 * import { DatePicker } from '@kalyx/react/headless';
 *
 * <DatePicker adapter={DayjsAdapter} value={iso} onChange={setIso}>…</DatePicker>
 * ```
 */
export const DayjsAdapter: DateAdapter = {
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
      yyyy: String(t.year()),
      MM: String(t.month() + 1).padStart(2, '0'),
      dd: String(t.date()).padStart(2, '0'),
      HH: String(t.hour()).padStart(2, '0'),
      mm: String(t.minute()).padStart(2, '0'),
      ss: String(t.second()).padStart(2, '0'),
      M: String(t.month() + 1),
      d: String(t.date()),
    };
    let result = formatStr;
    // Replace longer tokens first to prevent partial matches.
    for (const [token, value] of Object.entries(tokens).sort((a, b) => b[0].length - a[0].length)) {
      result = result.split(token).join(value);
    }
    return result;
  },

  addDays(iso: string, n: number): string {
    return d(iso).add(n, 'day').toISOString();
  },

  addMonths(iso: string, n: number): string {
    return d(iso).add(n, 'month').toISOString();
  },

  addYears(iso: string, n: number): string {
    return d(iso).add(n, 'year').toISOString();
  },

  isBefore(a: string, b: string): boolean {
    return d(a).isBefore(d(b));
  },

  isAfter(a: string, b: string): boolean {
    return d(a).isAfter(d(b));
  },

  isSameDay(a: string, b: string, timezone?: string): boolean {
    if (!a || !b) return false;
    if (timezone) {
      return isSameDayInTimezone(a, b, timezone);
    }
    const da = d(a);
    const db = d(b);
    return da.year() === db.year() && da.month() === db.month() && da.date() === db.date();
  },

  isSameMonth(a: string, b: string): boolean {
    const da = d(a);
    const db = d(b);
    return da.year() === db.year() && da.month() === db.month();
  },

  startOfDay(iso: string, timezone?: string): string {
    if (timezone) {
      return startOfDayInTimezone(iso, timezone);
    }
    return d(iso).startOf('day').toISOString();
  },

  startOfMonth(iso: string): string {
    return d(iso).startOf('month').toISOString();
  },

  endOfMonth(iso: string): string {
    return d(iso).endOf('month').toISOString();
  },

  startOfWeek(iso: string, weekStartsOn: 0 | 1 = 0): string {
    const t = d(iso);
    const diff = (t.day() - weekStartsOn + 7) % 7;
    return t.subtract(diff, 'day').startOf('day').toISOString();
  },

  endOfWeek(iso: string, weekStartsOn: 0 | 1 = 0): string {
    const t = d(iso);
    const diff = (t.day() - weekStartsOn + 7) % 7;
    return t.subtract(diff, 'day').add(6, 'day').endOf('day').toISOString();
  },

  now(): string {
    return dayjs.utc().toISOString();
  },

  today(timezone?: string): string {
    if (timezone) {
      return todayInTimezone(timezone);
    }
    return dayjs.utc().startOf('day').toISOString();
  },

  isValid(value: string): boolean {
    if (!value) return false;
    // dayjs parsing is lenient without customParseFormat strict mode (e.g.
    // "2026-02-30" rolls over rather than failing). That's acceptable here —
    // the DateAdapter contract only requires rejecting empty / unparseable
    // input, which this satisfies.
    return d(normalize(value)).isValid();
  },

  getYear(iso: string): number {
    return d(iso).year();
  },

  getMonth(iso: string): number {
    return d(iso).month();
  },

  getDate(iso: string): number {
    return d(iso).date();
  },

  getDay(iso: string): number {
    return d(iso).day();
  },
};
