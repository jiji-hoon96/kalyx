import type { ISODateString } from '../types.js';

// Inputs reaching this module are already validated ISO 8601 UTC strings (every
// caller routes through `normalizeISO` or `DateAdapter.parse`), so native
// `new Date(string)` is fully spec-defined here. Dropping the `date-fns` import
// keeps `@kalyx/core` adapter-agnostic — see `.claude/skills/adapter-extraction.md`.

// ── Intl formatter cache ──
const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getCachedPartsFormatter(timeZone: string): Intl.DateTimeFormat {
  const key = `parts:${timeZone}`;
  let fmt = formatterCache.get(key);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });
    formatterCache.set(key, fmt);
  }
  return fmt;
}

/**
 * Extract the calendar parts (year, month, day, hour, minute, second) of a UTC instant
 * as observed in the given IANA timezone. Runner-agnostic: driven by `Intl.DateTimeFormat`
 * so the result is identical regardless of the process's local timezone.
 */
function partsInTimezone(utc: Date, timeZone: string) {
  const dtf = getCachedPartsFormatter(timeZone);
  const parts = Object.fromEntries(dtf.formatToParts(utc).map((p) => [p.type, p.value])) as Record<
    string,
    string
  >;
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    // Some locales/engines return '24' instead of '0' at midnight
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
export function formatInTimezone(iso: ISODateString, formatStr: string, timeZone: string): string {
  const p = partsInTimezone(new Date(iso), timeZone);
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
export function getTimezoneOffsetMinutes(iso: ISODateString, timeZone: string): number {
  const utc = new Date(iso);
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
export function startOfDayInTimezone(iso: ISODateString, timeZone: string): ISODateString {
  const utc = new Date(iso);
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
export function isSameDayInTimezone(a: ISODateString, b: ISODateString, timeZone: string): boolean {
  const pa = partsInTimezone(new Date(a), timeZone);
  const pb = partsInTimezone(new Date(b), timeZone);
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

/**
 * Converts a UTC-midnight ISO (as produced by the default calendar grid iteration) into the
 * civil midnight of the same calendar day in `timeZone`.
 *
 * This is the bridge used by DatePicker/RangePicker when `displayTimezone` is set: the grid
 * iterates in UTC, so a cell's `isoString` is `YYYY-MM-DDT00:00:00.000Z`. When the user clicks
 * that cell we want to emit an ISO representing the same civil day's midnight in the display
 * timezone. A probe at noon UTC is used so the target civil day is unambiguous across any zone.
 *
 * @example
 * civilMidnightFromUtcDay('2026-01-15T00:00:00.000Z', 'Asia/Seoul');
 * // → '2026-01-14T15:00:00.000Z'  (Seoul Jan 15 00:00 = UTC Jan 14 15:00)
 */
export function civilMidnightFromUtcDay(
  gridUtcIso: ISODateString,
  timeZone: string,
): ISODateString {
  const utc = new Date(gridUtcIso);
  const probe = new Date(
    Date.UTC(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate(), 12, 0, 0),
  ).toISOString();
  return startOfDayInTimezone(probe, timeZone);
}

/**
 * Extracts the time-of-day (hours / minutes / seconds) of a UTC instant as observed in
 * `timeZone`. The result differs from reading UTC hours when the zone has a non-zero offset.
 *
 * @example
 * getTimeInTimezone('2026-01-15T00:00:00.000Z', 'Asia/Seoul');
 * // → { hours: 9, minutes: 0, seconds: 0 }  (Seoul is UTC+9)
 */
export function getTimeInTimezone(
  iso: ISODateString,
  timeZone: string,
): { hours: number; minutes: number; seconds: number } {
  const p = partsInTimezone(new Date(iso), timeZone);
  return { hours: p.hour, minutes: p.minute, seconds: p.second };
}

/**
 * Returns a new ISO UTC string where the civil date in `timeZone` is preserved and the time
 * portion is replaced according to `partial` (as observed in that same timezone). Undefined
 * fields keep their current value.
 *
 * Implementation note: the civil target (Y,M,D,H,m,s) is first mapped to a UTC epoch as if
 * the wall-clock reading lived in UTC; then we subtract the timezone offset at that instant
 * to recover the real UTC instant. The offset is refined once to absorb DST transitions.
 *
 * @example
 * // In Asia/Seoul (UTC+9): set the hour to 10
 * setTimeInTimezone('2026-01-15T00:00:00.000Z', { hours: 10 }, 'Asia/Seoul');
 * // → '2026-01-15T01:00:00.000Z'   (Seoul Jan 15 10:00 = UTC 01:00)
 *
 * DST disambiguation policy:
 *
 * - **Spring-forward gaps** (non-existent civil time): the requested civil time
 *   is snapped forward to the first valid instant past the gap. Asking for
 *   2026-03-08 02:30 America/New_York — which doesn't exist because clocks
 *   jump 02:00 EST → 03:00 EDT — returns 03:30 EDT (= 2026-03-08T07:30:00.000Z).
 * - **Fall-back ambiguity** (civil time occurs twice): the earlier offset
 *   (e.g. EDT before EST in US Eastern, BST before GMT in Europe/London) is
 *   chosen, matching `@internationalized/date` and the TC39 Temporal default
 *   (`disambiguation: 'earlier'`).
 */
export function setTimeInTimezone(
  iso: ISODateString,
  partial: { hours?: number; minutes?: number; seconds?: number },
  timeZone: string,
): ISODateString {
  const p = partsInTimezone(new Date(iso), timeZone);
  const targetHours = partial.hours ?? p.hour;
  const targetMinutes = partial.minutes ?? p.minute;
  const targetSeconds = partial.seconds ?? p.second;
  const civilEpoch = Date.UTC(
    p.year,
    p.month - 1,
    p.day,
    targetHours,
    targetMinutes,
    targetSeconds,
  );

  // Two-pass offset resolution: probe at civil-as-UTC, then re-probe at the
  // first-pass result so the second probe sees the offset that actually applies
  // at the resolved instant. The two candidate UTC instants are then classified
  // by whether their civil round-trip in the target zone matches the requested
  // civil time:
  //
  //   match1 && match2  → fall-back ambiguity, both are valid wall-clock
  //                       interpretations → pick the earlier instant (matches
  //                       @internationalized/date and TC39 Temporal default).
  //   match1 ^ match2   → the matching candidate is the correct one. (This is
  //                       the common case near a DST boundary where one of the
  //                       two probes picked the wrong-side offset.)
  //   neither match     → spring-forward gap: the requested civil time does not
  //                       exist → snap forward to the later instant.
  const probe1 = new Date(civilEpoch).toISOString();
  const offset1 = getTimezoneOffsetMinutes(probe1, timeZone);
  const realEpoch1 = civilEpoch - offset1 * 60_000;
  const probe2 = new Date(realEpoch1).toISOString();
  const offset2 = getTimezoneOffsetMinutes(probe2, timeZone);
  const realEpoch2 = civilEpoch - offset2 * 60_000;

  const civilMatches = (epoch: number) => {
    const rt = partsInTimezone(new Date(epoch), timeZone);
    return (
      rt.year === p.year &&
      rt.month === p.month &&
      rt.day === p.day &&
      rt.hour === targetHours &&
      rt.minute === targetMinutes &&
      rt.second === targetSeconds
    );
  };
  const match1 = civilMatches(realEpoch1);
  const match2 = civilMatches(realEpoch2);

  let chosen: number;
  if (match1 && match2) chosen = Math.min(realEpoch1, realEpoch2);
  else if (match1) chosen = realEpoch1;
  else if (match2) chosen = realEpoch2;
  else chosen = Math.max(realEpoch1, realEpoch2);

  return new Date(chosen).toISOString();
}
