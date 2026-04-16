import { parseISO } from 'date-fns';
import type { ISODateString } from '../types.js';

/**
 * Extract the calendar parts (year, month, day, hour, minute, second) of a UTC instant
 * as observed in the given IANA timezone. Runner-agnostic: driven by `Intl.DateTimeFormat`
 * so the result is identical regardless of the process's local timezone.
 */
function partsInTimezone(utc: Date, timeZone: string) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  const parts = Object.fromEntries(
    dtf.formatToParts(utc).map((p) => [p.type, p.value]),
  ) as Record<string, string>;
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: parts.hour === '24' ? 0 : Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

/**
 * Format a UTC ISO string for display in a specific IANA timezone.
 * Handles DST transitions correctly. Supports a small set of tokens: `yyyy MM dd HH mm ss`.
 *
 * @param iso - UTC ISO 8601 string
 * @param formatStr - token string (e.g. `"yyyy-MM-dd HH:mm"`)
 * @param timeZone - IANA zone (e.g. `"America/New_York"`)
 *
 * @example
 * formatInTimezone('2026-03-08T07:30:00.000Z', 'yyyy-MM-dd HH:mm', 'America/New_York');
 * // → '2026-03-08 03:30'   (post spring-forward EDT)
 */
export function formatInTimezone(
  iso: ISODateString,
  formatStr: string,
  timeZone: string,
): string {
  const p = partsInTimezone(parseISO(iso), timeZone);
  const tokens: Record<string, string> = {
    yyyy: String(p.year),
    MM: String(p.month).padStart(2, '0'),
    dd: String(p.day).padStart(2, '0'),
    HH: String(p.hour).padStart(2, '0'),
    mm: String(p.minute).padStart(2, '0'),
    ss: String(p.second).padStart(2, '0'),
  };
  let result = formatStr;
  for (const [token, value] of Object.entries(tokens).sort((a, b) => b[0].length - a[0].length)) {
    result = result.split(token).join(value);
  }
  return result;
}

/**
 * UTC offset (minutes east of UTC) at a given UTC instant, as applied by the given timezone.
 * The offset may differ on either side of a DST transition.
 *
 * @example
 * getTimezoneOffsetMinutes('2026-03-08T06:00:00.000Z', 'America/New_York'); // -300 (EST, UTC-5)
 * getTimezoneOffsetMinutes('2026-03-08T07:00:00.000Z', 'America/New_York'); // -240 (EDT, UTC-4)
 * getTimezoneOffsetMinutes('2026-01-15T12:00:00.000Z', 'Asia/Seoul');       //  540 (UTC+9)
 */
export function getTimezoneOffsetMinutes(
  iso: ISODateString,
  timeZone: string,
): number {
  const utc = parseISO(iso);
  const p = partsInTimezone(utc, timeZone);
  const asUtcEpoch = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtcEpoch - utc.getTime()) / 60_000);
}

/**
 * Midnight of the civil date (as observed in `timeZone`) returned as a UTC ISO string.
 *
 * Across DST transitions this is the correct way to compute "start of day" — the offset
 * changes, so the UTC instant of midnight differs before and after the transition.
 *
 * @example
 * startOfDayInTimezone('2026-03-08T12:00:00.000Z', 'America/New_York'); // '2026-03-08T05:00:00.000Z' (EST)
 * startOfDayInTimezone('2026-03-09T12:00:00.000Z', 'America/New_York'); // '2026-03-09T04:00:00.000Z' (EDT)
 */
export function startOfDayInTimezone(
  iso: ISODateString,
  timeZone: string,
): ISODateString {
  const utc = parseISO(iso);
  const p = partsInTimezone(utc, timeZone);
  // Civil midnight as a UTC epoch (what it would be if the wall clock reading lived in UTC).
  const civilMidnightUtc = Date.UTC(p.year, p.month - 1, p.day, 0, 0, 0);
  // Must compute the offset at civil midnight itself — the offset at the input `iso` can
  // differ (DST transition occurs between midnight and the input), which would shift the
  // result by one hour on transition days.
  const midnightProbe = new Date(civilMidnightUtc).toISOString();
  const offsetMinutes = getTimezoneOffsetMinutes(midnightProbe, timeZone);
  return new Date(civilMidnightUtc - offsetMinutes * 60_000).toISOString();
}

/**
 * Whether two UTC instants fall on the same civil day in the given timezone.
 * Timezone-safe alternative to comparing `iso.slice(0, 10)`.
 *
 * @example
 * // Seoul is UTC+9, so 03:00 UTC and 14:00 UTC are both on 2026-01-15 KST
 * isSameDayInTimezone('2026-01-15T03:00:00.000Z', '2026-01-15T14:00:00.000Z', 'Asia/Seoul'); // true
 * // But 17:00 UTC is 02:00 KST on 2026-01-16
 * isSameDayInTimezone('2026-01-15T03:00:00.000Z', '2026-01-15T17:00:00.000Z', 'Asia/Seoul'); // false
 */
export function isSameDayInTimezone(
  a: ISODateString,
  b: ISODateString,
  timeZone: string,
): boolean {
  const pa = partsInTimezone(parseISO(a), timeZone);
  const pb = partsInTimezone(parseISO(b), timeZone);
  return pa.year === pb.year && pa.month === pb.month && pa.day === pb.day;
}

/**
 * "Today" in the given timezone, returned as the UTC ISO string representing that day's midnight.
 * Prefer this over `new Date()` when the notion of "today" should follow the user's displayed
 * timezone rather than the server's local clock.
 */
export function todayInTimezone(timeZone: string): ISODateString {
  return startOfDayInTimezone(new Date().toISOString(), timeZone);
}
