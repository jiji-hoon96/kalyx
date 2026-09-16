// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { Temporal } from 'temporal-polyfill';
import { setTimeInTimezone, civilMidnightFromUtcDay } from '../utils/timezone.js';

// Exhaustive DST sweep against an independent oracle. `temporal-polyfill` (test-only)
// implements TC39 Temporal's `disambiguation: 'compatible'`, which is the documented
// policy of `setTimeInTimezone`: a wall-clock time inside a spring-forward gap is
// shifted forward by the gap length, and one inside a fall-back overlap resolves to
// the earlier instant. The library itself stays Intl-only.
//
// For every transition in every `Intl.supportedValuesOf('timeZone')` zone between
// 2020 and 2045, it checks the first, middle and last minute of the affected
// wall-clock window, the minute just before and just after it, and civil midnight
// of the surrounding days (through `civilMidnightFromUtcDay`, the calendar-grid path).
// Transitions of a day or more (none occur in this range today) are skipped.

const FROM = Temporal.Instant.from('2020-01-01T00:00:00Z');
const UNTIL = Temporal.Instant.from('2046-01-01T00:00:00Z');
const MINUTE_MS = 60_000;

const toIso = (zdt: Temporal.ZonedDateTime) =>
  zdt.toInstant().toString({ smallestUnit: 'millisecond' });

function expected(pdt: Temporal.PlainDateTime, zone: string) {
  return toIso(pdt.toZonedDateTime(zone, { disambiguation: 'compatible' }));
}

function wallClock(epochMs: number) {
  const d = new Date(epochMs);
  return new Temporal.PlainDateTime(
    d.getUTCFullYear(),
    d.getUTCMonth() + 1,
    d.getUTCDate(),
    d.getUTCHours(),
    d.getUTCMinutes(),
  );
}

function sweep() {
  const mismatches: string[] = [];
  let checked = 0;
  for (const zone of Intl.supportedValuesOf('timeZone')) {
    let cursor = FROM.toZonedDateTimeISO(zone);
    for (;;) {
      const next = cursor.getTimeZoneTransition('next');
      if (!next || Temporal.Instant.compare(next.toInstant(), UNTIL) >= 0) break;
      cursor = next;
      const before = next.subtract({ nanoseconds: 1 });
      const beforeMin = before.offsetNanoseconds / 6e10;
      const afterMin = next.offsetNanoseconds / 6e10;
      const shift = Math.abs(afterMin - beforeMin);
      if (shift === 0 || shift >= 1440) continue;

      // Wall-clock window the transition affects: skipped (gap) or repeated (overlap).
      const windowStart = next.epochMilliseconds + Math.min(beforeMin, afterMin) * MINUTE_MS;
      const probes = [-1, 0, Math.floor(shift / 2), shift - 1, shift].map((m) =>
        wallClock(windowStart + m * MINUTE_MS),
      );

      for (const pdt of probes) {
        const base = toIso(pdt.with({ hour: 12, minute: 0 }).toZonedDateTime(zone));
        const actual = setTimeInTimezone(
          base,
          { hours: pdt.hour, minutes: pdt.minute, seconds: 0 },
          zone,
        );
        const want = expected(pdt, zone);
        checked++;
        if (actual !== want)
          mismatches.push(`${zone} ${pdt.toString()} got ${actual} want ${want}`);
      }

      for (const offsetDays of [-1, 0, 1]) {
        const day = probes[2].toPlainDate().add({ days: offsetDays });
        const coordinate = new Date(Date.UTC(day.year, day.month - 1, day.day)).toISOString();
        const actual = civilMidnightFromUtcDay(coordinate, zone);
        const want = expected(day.toPlainDateTime(), zone);
        checked++;
        if (actual !== want)
          mismatches.push(`${zone} midnight ${day.toString()} got ${actual} want ${want}`);
      }
    }
  }
  return { mismatches, checked };
}

describe('DST disambiguation matches Temporal `compatible` in every supported zone (2020-2045)', () => {
  it('gaps shift forward and overlaps pick the earlier instant', () => {
    const { mismatches, checked } = sweep();
    expect(checked).toBeGreaterThan(10_000);
    expect({ count: mismatches.length, first: mismatches.slice(0, 10) }).toEqual({
      count: 0,
      first: [],
    });
    // ~3s locally with coverage on; headroom for slower CI runners.
  }, 30_000);
});
