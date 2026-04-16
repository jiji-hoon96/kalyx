import { describe, it, expect } from 'vitest';
import {
  formatInTimezone,
  startOfDayInTimezone,
  isSameDayInTimezone,
  getTimezoneOffsetMinutes,
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

    expect(
      formatInTimezone('2026-03-08T07:30:00.000Z', 'yyyy-MM-dd HH:mm', 'Asia/Seoul'),
    ).toBe('2026-03-08 16:30');
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
    expect(
      getTimezoneOffsetMinutes('2026-03-08T06:00:00.000Z', 'America/New_York'),
    ).toBe(-300);
  });

  it('offset is -240 (EDT) immediately after the transition', () => {
    expect(
      getTimezoneOffsetMinutes('2026-03-08T07:00:00.000Z', 'America/New_York'),
    ).toBe(-240);
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
    expect(
      getTimezoneOffsetMinutes('2026-11-01T05:00:00.000Z', 'America/New_York'),
    ).toBe(-240);
  });

  it('offset is -300 (EST) after 02:00 local', () => {
    expect(
      getTimezoneOffsetMinutes('2026-11-01T07:00:00.000Z', 'America/New_York'),
    ).toBe(-300);
  });

  it('midnight of the fall-back day is in EDT', () => {
    expect(startOfDayInTimezone('2026-11-01T12:00:00.000Z', 'America/New_York')).toBe(
      '2026-11-01T04:00:00.000Z',
    );
  });
});

describe('DST transition — Europe/London spring forward 2026-03-29', () => {
  it('offset is 0 (GMT) before the transition', () => {
    expect(
      getTimezoneOffsetMinutes('2026-03-29T00:30:00.000Z', 'Europe/London'),
    ).toBe(0);
  });

  it('offset is +60 (BST) after the transition', () => {
    expect(
      getTimezoneOffsetMinutes('2026-03-29T02:30:00.000Z', 'Europe/London'),
    ).toBe(60);
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
      isSameDayInTimezone(
        '2026-01-15T03:00:00.000Z',
        '2026-01-15T14:00:00.000Z',
        'Asia/Seoul',
      ),
    ).toBe(true);
  });

  it('two UTC instants on different KST civil days', () => {
    expect(
      isSameDayInTimezone(
        '2026-01-15T03:00:00.000Z',
        '2026-01-15T17:00:00.000Z',
        'Asia/Seoul',
      ),
    ).toBe(false);
  });

  it('same UTC instant considered same day across timezones when civil day aligns', () => {
    // 2026-06-15 06:00 UTC → 15:00 KST, 02:00 EDT, both still on 2026-06-15
    expect(
      isSameDayInTimezone(
        '2026-06-15T06:00:00.000Z',
        '2026-06-15T06:00:00.000Z',
        'Asia/Seoul',
      ),
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
      isSameDayInTimezone(
        '2026-01-15T14:30:00.000Z',
        '2026-01-15T15:30:00.000Z',
        'Asia/Seoul',
      ),
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
