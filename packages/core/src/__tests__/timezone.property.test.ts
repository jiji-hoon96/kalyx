import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  startOfDayInTimezone,
  isSameDayInTimezone,
  getTimeInTimezone,
  setTimeInTimezone,
  civilMidnightFromUtcDay,
  formatInTimezone,
  todayInTimezone,
} from '../utils/timezone.js';

// Property-based hardening of the crown-jewel timezone utilities. The
// example-based DST tests in `timezone.test.ts` pin specific transitions; these
// properties assert the invariants must hold across thousands of random
// instants and zones — exactly where example tests have blind spots.
//
// Zone set: whole + fractional offsets, both hemispheres, DST + non-DST, and
// the extreme +14 / -11 ends. Deliberately EXCLUDES zones with a *midnight* DST
// transition in 2020-2045 (e.g. historical America/Sao_Paulo), because
// `startOfDayInTimezone` does not gap-snap and a non-existent civil midnight is
// a separate, out-of-scope edge — including such a zone would make the
// "reads as 00:00:00" invariant a false positive rather than a real find.
const ZONES = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Australia/Sydney',
  'Asia/Seoul',
  'Asia/Kolkata', // +5:30
  'Asia/Kathmandu', // +5:45
  'Australia/Eucla', // +8:45
  'Pacific/Niue', // -11
  'Pacific/Kiritimati', // +14
] as const;

const zone = () => fc.constantFrom(...ZONES);

const isoInstant = () =>
  fc
    .date({
      min: new Date('2020-01-01T00:00:00.000Z'),
      max: new Date('2045-01-01T00:00:00.000Z'),
      noInvalidDate: true,
    })
    .map((d) => d.toISOString());

const timeOfDay = () =>
  fc.record({
    hours: fc.integer({ min: 0, max: 23 }),
    minutes: fc.integer({ min: 0, max: 59 }),
    seconds: fc.integer({ min: 0, max: 59 }),
  });

const RUNS = { numRuns: 300 };

describe('timezone invariants (property-based)', () => {
  it('startOfDayInTimezone is idempotent', () => {
    fc.assert(
      fc.property(isoInstant(), zone(), (iso, tz) => {
        const once = startOfDayInTimezone(iso, tz);
        expect(startOfDayInTimezone(once, tz)).toBe(once);
      }),
      RUNS,
    );
  });

  it('startOfDayInTimezone lands on the same civil day as its input', () => {
    fc.assert(
      fc.property(isoInstant(), zone(), (iso, tz) => {
        expect(isSameDayInTimezone(iso, startOfDayInTimezone(iso, tz), tz)).toBe(true);
      }),
      RUNS,
    );
  });

  it('startOfDayInTimezone reads back as 00:00:00 in the zone', () => {
    fc.assert(
      fc.property(isoInstant(), zone(), (iso, tz) => {
        expect(getTimeInTimezone(startOfDayInTimezone(iso, tz), tz)).toEqual({
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
      }),
      RUNS,
    );
  });

  it('setTimeInTimezone preserves the civil day (time-only edit never crosses a date boundary)', () => {
    fc.assert(
      fc.property(isoInstant(), zone(), timeOfDay(), (iso, tz, t) => {
        expect(isSameDayInTimezone(iso, setTimeInTimezone(iso, t, tz), tz)).toBe(true);
      }),
      RUNS,
    );
  });

  it('setTimeInTimezone round-trips a midday time exactly (noon is never a DST gap/ambiguity)', () => {
    fc.assert(
      fc.property(
        isoInstant(),
        zone(),
        fc.integer({ min: 0, max: 59 }),
        fc.integer({ min: 0, max: 59 }),
        (iso, tz, minutes, seconds) => {
          const t = { hours: 12, minutes, seconds };
          expect(getTimeInTimezone(setTimeInTimezone(iso, t, tz), tz)).toEqual(t);
        },
      ),
      RUNS,
    );
  });

  it('setTimeInTimezone to an already-set midday time is stable (idempotent)', () => {
    fc.assert(
      fc.property(isoInstant(), zone(), (iso, tz) => {
        const t = { hours: 12, minutes: 0, seconds: 0 };
        const once = setTimeInTimezone(iso, t, tz);
        expect(setTimeInTimezone(once, t, tz)).toBe(once);
      }),
      RUNS,
    );
  });
});

describe('todayInTimezone (T-G3 — was zero-coverage public API)', () => {
  it('returns the civil-midnight of "today" in the zone', () => {
    const now = new Date().toISOString();
    for (const tz of [
      'Asia/Seoul',
      'America/New_York',
      'Pacific/Niue',
      'Pacific/Kiritimati',
    ] as const) {
      const today = todayInTimezone(tz);
      expect(getTimeInTimezone(today, tz)).toEqual({ hours: 0, minutes: 0, seconds: 0 });
      expect(isSameDayInTimezone(today, now, tz)).toBe(true);
    }
  });

  it('yields distinct civil days across the extreme +14 / -11 zones', () => {
    // Kiritimati (UTC+14) and Niue (UTC-11) are 25h apart, so their civil
    // "today" midnights can never resolve to the same UTC instant.
    expect(todayInTimezone('Pacific/Kiritimati')).not.toBe(todayInTimezone('Pacific/Niue'));
  });
});

describe('Feb 29 round-trip where the civil date differs from the UTC date (T-R2)', () => {
  it('maps the UTC grid day to civil Feb 29 midnight in Asia/Seoul', () => {
    // Grid iterates in UTC; clicking the 2024-02-29 cell under displayTimezone
    // Asia/Seoul must emit Seoul's civil Feb-29 midnight = UTC Feb-28 15:00.
    const seoulFeb29 = civilMidnightFromUtcDay('2024-02-29T00:00:00.000Z', 'Asia/Seoul');
    expect(seoulFeb29).toBe('2024-02-28T15:00:00.000Z');
    expect(getTimeInTimezone(seoulFeb29, 'Asia/Seoul')).toEqual({
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
    expect(formatInTimezone(seoulFeb29, 'yyyy-MM-dd', 'Asia/Seoul')).toBe('2024-02-29');
  });

  it('keeps Feb 29 a leap-day instant when set to a wall-clock time in Asia/Seoul', () => {
    const seoulFeb29 = civilMidnightFromUtcDay('2024-02-29T00:00:00.000Z', 'Asia/Seoul');
    const at0930 = setTimeInTimezone(
      seoulFeb29,
      { hours: 9, minutes: 30, seconds: 0 },
      'Asia/Seoul',
    );
    expect(formatInTimezone(at0930, 'yyyy-MM-dd HH:mm', 'Asia/Seoul')).toBe('2024-02-29 09:30');
  });
});
