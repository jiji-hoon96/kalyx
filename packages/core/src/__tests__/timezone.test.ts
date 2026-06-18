import { describe, it, expect } from 'vitest';
import {
  formatInTimezone,
  startOfDayInTimezone,
  isSameDayInTimezone,
  getTimezoneOffsetMinutes,
  civilMidnightFromUtcDay,
  getTimeInTimezone,
  setTimeInTimezone,
} from '../utils/timezone.js';

// Known DST transitions used as fixtures.
// US Eastern: spring forward 2026-03-08 02:00 EST -> 03:00 EDT
//             fall back       2026-11-01 02:00 EDT -> 01:00 EST
// Europe/London: spring forward 2026-03-29 01:00 GMT -> 02:00 BST
//                fall back       2026-10-25 02:00 BST -> 01:00 GMT

describe('formatInTimezone — basic behaviour', () => {
  it('formats a UTC instant in the requested timezone', () => {
    expect(
      formatInTimezone('2026-03-08T07:30:00.000Z', 'yyyy-MM-dd HH:mm', 'America/New_York'),
    ).toBe('2026-03-08 03:30');

    expect(formatInTimezone('2026-03-08T07:30:00.000Z', 'yyyy-MM-dd HH:mm', 'Asia/Seoul')).toBe(
      '2026-03-08 16:30',
    );
  });

  it('preserves the source UTC string (pure function)', () => {
    const iso = '2026-01-15T00:00:00.000Z';
    formatInTimezone(iso, 'yyyy-MM-dd', 'Asia/Seoul');
    expect(iso).toBe('2026-01-15T00:00:00.000Z');
  });
});

describe('startOfDayInTimezone — civil-day midnight in UTC', () => {
  it('returns midnight Asia/Seoul (UTC+9, no DST)', () => {
    expect(startOfDayInTimezone('2026-01-15T12:00:00.000Z', 'Asia/Seoul')).toBe(
      '2026-01-14T15:00:00.000Z',
    );
  });

  it('returns midnight America/New_York during standard time (EST, UTC-5)', () => {
    expect(startOfDayInTimezone('2026-01-15T12:00:00.000Z', 'America/New_York')).toBe(
      '2026-01-15T05:00:00.000Z',
    );
  });

  it('returns midnight America/New_York during daylight time (EDT, UTC-4)', () => {
    expect(startOfDayInTimezone('2026-07-15T12:00:00.000Z', 'America/New_York')).toBe(
      '2026-07-15T04:00:00.000Z',
    );
  });
});

describe('DST transition — America/New_York spring forward 2026-03-08', () => {
  it('offset is -300 (EST) before the transition', () => {
    expect(getTimezoneOffsetMinutes('2026-03-08T06:00:00.000Z', 'America/New_York')).toBe(-300);
  });

  it('offset is -240 (EDT) immediately after the transition', () => {
    expect(getTimezoneOffsetMinutes('2026-03-08T07:00:00.000Z', 'America/New_York')).toBe(-240);
  });

  it('startOfDay on the transition day returns midnight EST', () => {
    expect(startOfDayInTimezone('2026-03-08T12:00:00.000Z', 'America/New_York')).toBe(
      '2026-03-08T05:00:00.000Z',
    );
  });

  it('next day (2026-03-09) is full EDT — midnight is 04:00 UTC', () => {
    expect(startOfDayInTimezone('2026-03-09T12:00:00.000Z', 'America/New_York')).toBe(
      '2026-03-09T04:00:00.000Z',
    );
  });
});

describe('DST transition — America/New_York fall back 2026-11-01', () => {
  it('offset is -240 (EDT) before 02:00 local', () => {
    expect(getTimezoneOffsetMinutes('2026-11-01T05:00:00.000Z', 'America/New_York')).toBe(-240);
  });

  it('offset is -300 (EST) after 02:00 local', () => {
    expect(getTimezoneOffsetMinutes('2026-11-01T07:00:00.000Z', 'America/New_York')).toBe(-300);
  });

  it('midnight of the fall-back day is in EDT', () => {
    expect(startOfDayInTimezone('2026-11-01T12:00:00.000Z', 'America/New_York')).toBe(
      '2026-11-01T04:00:00.000Z',
    );
  });

  it('setTimeInTimezone picks the earlier offset for an ambiguous fall-back hour', () => {
    // 2026-11-01 01:30 America/New_York occurs twice — once in EDT (UTC-4) and
    // once in EST (UTC-5). The documented policy is `disambiguation: 'earlier'`
    // (matches @internationalized/date + TC39 Temporal default): pick the EDT
    // occurrence. Base 2026-11-01T12:00:00.000Z is far from the transition
    // window so the choice isn't driven by the base's own offset.
    const base = '2026-11-01T12:00:00.000Z';
    const result = setTimeInTimezone(base, { hours: 1, minutes: 30 }, 'America/New_York');
    expect(result).toBe('2026-11-01T05:30:00.000Z');
  });
});

describe('DST transition — Europe/London spring forward 2026-03-29', () => {
  it('offset is 0 (GMT) before the transition', () => {
    expect(getTimezoneOffsetMinutes('2026-03-29T00:30:00.000Z', 'Europe/London')).toBe(0);
  });

  it('offset is +60 (BST) after the transition', () => {
    expect(getTimezoneOffsetMinutes('2026-03-29T02:30:00.000Z', 'Europe/London')).toBe(60);
  });

  it('midnight of the transition day is in GMT (UTC+0)', () => {
    expect(startOfDayInTimezone('2026-03-29T12:00:00.000Z', 'Europe/London')).toBe(
      '2026-03-29T00:00:00.000Z',
    );
  });
});

describe('isSameDayInTimezone — civil-day comparison', () => {
  it('two UTC instants on the same KST civil day', () => {
    expect(
      isSameDayInTimezone('2026-01-15T03:00:00.000Z', '2026-01-15T14:00:00.000Z', 'Asia/Seoul'),
    ).toBe(true);
  });

  it('two UTC instants on different KST civil days', () => {
    expect(
      isSameDayInTimezone('2026-01-15T03:00:00.000Z', '2026-01-15T17:00:00.000Z', 'Asia/Seoul'),
    ).toBe(false);
  });

  it('same UTC instant considered same day across timezones when civil day aligns', () => {
    // 2026-06-15 06:00 UTC → 15:00 KST, 02:00 EDT, both still on 2026-06-15
    expect(
      isSameDayInTimezone('2026-06-15T06:00:00.000Z', '2026-06-15T06:00:00.000Z', 'Asia/Seoul'),
    ).toBe(true);
  });

  it('same UTC day can span two civil days depending on timezone', () => {
    // Both instants fall on 2026-01-15 UTC, but straddle midnight in Seoul (UTC+9):
    //   14:30 UTC = 23:30 KST on 2026-01-15
    //   15:30 UTC = 00:30 KST on 2026-01-16
    // In New York (UTC-5) the same instants are both on the morning of 2026-01-15.
    expect(
      isSameDayInTimezone(
        '2026-01-15T14:30:00.000Z',
        '2026-01-15T15:30:00.000Z',
        'America/New_York',
      ),
    ).toBe(true);
    expect(
      isSameDayInTimezone('2026-01-15T14:30:00.000Z', '2026-01-15T15:30:00.000Z', 'Asia/Seoul'),
    ).toBe(false);
  });
});

describe('getTimezoneOffsetMinutes — spot checks', () => {
  it('UTC returns 0', () => {
    expect(getTimezoneOffsetMinutes('2026-06-15T12:00:00.000Z', 'UTC')).toBe(0);
  });

  it('Asia/Seoul is +540 year-round (no DST)', () => {
    expect(getTimezoneOffsetMinutes('2026-01-15T12:00:00.000Z', 'Asia/Seoul')).toBe(540);
    expect(getTimezoneOffsetMinutes('2026-07-15T12:00:00.000Z', 'Asia/Seoul')).toBe(540);
  });
});

describe('getTimezoneOffsetMinutes — fractional-offset zones (T-D3)', () => {
  // Winter (Northern-hemisphere) instant well clear of any DST window, so the
  // offset is the zone's standard, non-DST value.
  const WINTER = '2026-01-15T12:00:00.000Z';

  it('Asia/Kolkata is +330 (+5:30)', () => {
    expect(getTimezoneOffsetMinutes(WINTER, 'Asia/Kolkata')).toBe(330);
  });

  it('Asia/Kathmandu is +345 (+5:45)', () => {
    expect(getTimezoneOffsetMinutes(WINTER, 'Asia/Kathmandu')).toBe(345);
  });

  it('Australia/Eucla is +525 (+8:45)', () => {
    // January is summer in Australia, but Eucla observes no DST, so the offset
    // is the constant +8:45.
    expect(getTimezoneOffsetMinutes(WINTER, 'Australia/Eucla')).toBe(525);
  });

  it('round-trips a fractional offset end-to-end (Kolkata +5:30)', () => {
    // 2026-01-15 12:00 UTC observed in Kolkata is 17:30 local.
    expect(getTimeInTimezone(WINTER, 'Asia/Kolkata')).toEqual({
      hours: 17,
      minutes: 30,
      seconds: 0,
    });
    expect(formatInTimezone(WINTER, 'yyyy-MM-dd HH:mm', 'Asia/Kolkata')).toBe('2026-01-15 17:30');
  });
});

describe('civilMidnightFromUtcDay — calendar-grid cell bridge', () => {
  it('maps UTC-midnight Jan 15 to Seoul civil midnight (Jan 14 15:00 UTC)', () => {
    expect(civilMidnightFromUtcDay('2026-01-15T00:00:00.000Z', 'Asia/Seoul')).toBe(
      '2026-01-14T15:00:00.000Z',
    );
  });

  it('maps UTC-midnight Jan 15 to New York civil midnight during EST (Jan 15 05:00 UTC)', () => {
    expect(civilMidnightFromUtcDay('2026-01-15T00:00:00.000Z', 'America/New_York')).toBe(
      '2026-01-15T05:00:00.000Z',
    );
  });

  it('keeps the same day on UTC-midnight → UTC', () => {
    expect(civilMidnightFromUtcDay('2026-06-15T00:00:00.000Z', 'UTC')).toBe(
      '2026-06-15T00:00:00.000Z',
    );
  });
});

describe('getTimeInTimezone', () => {
  it('reads Seoul wall-clock time from a UTC instant', () => {
    // 2026-01-15 03:30 UTC = 2026-01-15 12:30 KST
    expect(getTimeInTimezone('2026-01-15T03:30:00.000Z', 'Asia/Seoul')).toEqual({
      hours: 12,
      minutes: 30,
      seconds: 0,
    });
  });

  it('reads New York wall-clock time during EDT (UTC-4)', () => {
    // 2026-07-15 16:00 UTC = 2026-07-15 12:00 EDT
    expect(getTimeInTimezone('2026-07-15T16:00:00.000Z', 'America/New_York')).toEqual({
      hours: 12,
      minutes: 0,
      seconds: 0,
    });
  });
});

describe('setTimeInTimezone', () => {
  it('replaces only the hour in Asia/Seoul while keeping the civil date', () => {
    // Starting from 2026-01-15T00:00:00Z (= Seoul Jan 15 09:00) → set hours to 10
    // Expected: Seoul Jan 15 10:00 = UTC Jan 15 01:00
    expect(setTimeInTimezone('2026-01-15T00:00:00.000Z', { hours: 10 }, 'Asia/Seoul')).toBe(
      '2026-01-15T01:00:00.000Z',
    );
  });

  it('updates minutes while preserving the hour and civil date', () => {
    expect(setTimeInTimezone('2026-01-15T01:00:00.000Z', { minutes: 30 }, 'Asia/Seoul')).toBe(
      '2026-01-15T01:30:00.000Z',
    );
  });

  it('set hour across DST in America/New_York (after spring forward)', () => {
    // Starting at 2026-07-15T16:00Z (= EDT 12:00). Set hour 15.
    // Target: EDT 15:00 = UTC 19:00
    expect(setTimeInTimezone('2026-07-15T16:00:00.000Z', { hours: 15 }, 'America/New_York')).toBe(
      '2026-07-15T19:00:00.000Z',
    );
  });

  it('round-trips getTimeInTimezone ∘ setTimeInTimezone', () => {
    const input = '2026-03-15T08:00:00.000Z';
    const tz = 'Europe/London';
    const { hours, minutes, seconds } = getTimeInTimezone(input, tz);
    const round = setTimeInTimezone(input, { hours, minutes, seconds }, tz);
    expect(round).toBe(input);
  });

  it('snaps forward when the civil time falls in a spring-forward gap (DST gap)', () => {
    // 2026-03-08 02:30 in America/New_York doesn't exist — clocks jump
    // 02:00 EST → 03:00 EDT. Without explicit handling, the two-pass offset
    // algorithm lands on the pre-transition reading (01:30 EST = 06:30 UTC),
    // silently corrupting the user's intent. The documented policy is
    // snap-forward: return the equivalent post-transition instant
    // (03:30 EDT = 07:30 UTC). This matches @internationalized/date and the
    // TC39 Temporal default disambiguation behavior for non-existent times.
    const base = '2026-03-08T12:00:00.000Z';
    const result = setTimeInTimezone(base, { hours: 2, minutes: 30 }, 'America/New_York');
    expect(result).toBe('2026-03-08T07:30:00.000Z');
  });

  it('snaps forward when the civil time falls in the Europe/London spring-forward gap', () => {
    // 2026-03-29 01:30 in Europe/London doesn't exist — clocks jump
    // 01:00 GMT → 02:00 BST. Snap forward to 02:30 BST = 01:30 UTC.
    const base = '2026-03-29T12:00:00.000Z';
    const result = setTimeInTimezone(base, { hours: 1, minutes: 30 }, 'Europe/London');
    expect(result).toBe('2026-03-29T01:30:00.000Z');
  });

  it('leaves non-gap times unchanged near a DST transition', () => {
    // 03:30 on spring-forward day in NY exists (it's after the gap, in EDT).
    // Must NOT be modified by snap-forward logic.
    const base = '2026-03-08T12:00:00.000Z';
    const result = setTimeInTimezone(base, { hours: 3, minutes: 30 }, 'America/New_York');
    // 03:30 EDT = 07:30 UTC
    expect(result).toBe('2026-03-08T07:30:00.000Z');
  });
});
