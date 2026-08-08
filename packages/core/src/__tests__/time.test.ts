import { describe, it, expect } from 'vitest';
import {
  setTime,
  getTime,
  parseTimeString,
  formatTimeString,
  formatTimeFromISO,
  to12Hour,
  to24Hour,
  generateHours,
  generateMinutes,
  isSameTime,
} from '../utils/time.js';

describe('setTime', () => {
  it('updates the hour in UTC', () => {
    const result = setTime('2026-01-15T00:00:00.000Z', { hours: 14 });
    expect(result).toBe('2026-01-15T14:00:00.000Z');
  });

  it('updates the minute', () => {
    const result = setTime('2026-01-15T14:00:00.000Z', { minutes: 30 });
    expect(result).toBe('2026-01-15T14:30:00.000Z');
  });

  it('updates the second', () => {
    const result = setTime('2026-01-15T14:30:00.000Z', { seconds: 45 });
    expect(result).toBe('2026-01-15T14:30:45.000Z');
  });

  it('updates multiple time parts at once', () => {
    const result = setTime('2026-01-15T00:00:00.000Z', {
      hours: 14,
      minutes: 30,
      seconds: 45,
    });
    expect(result).toBe('2026-01-15T14:30:45.000Z');
  });

  it.each([
    [{ hours: 24 }, 'hours'],
    [{ hours: -1 }, 'hours'],
    [{ minutes: 60 }, 'minutes'],
    [{ seconds: 1.5 }, 'seconds'],
  ])('rejects an out-of-range programmatic partial %o', (partial, field) => {
    expect(() => setTime('2026-01-15T00:00:00.000Z', partial)).toThrow(new RegExp(field));
  });
});

describe('getTime', () => {
  it('extracts time parts from an ISO datetime', () => {
    expect(getTime('2026-01-15T14:30:45.000Z')).toEqual({
      hours: 14,
      minutes: 30,
      seconds: 45,
    });
  });

  it('handles midnight correctly', () => {
    expect(getTime('2026-01-15T00:00:00.000Z')).toEqual({
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });
});

describe('parseTimeString', () => {
  it('parses HH:MM format', () => {
    expect(parseTimeString('14:30')).toEqual({ hours: 14, minutes: 30, seconds: 0 });
  });

  it('parses HH:MM:SS format', () => {
    expect(parseTimeString('14:30:45')).toEqual({ hours: 14, minutes: 30, seconds: 45 });
  });

  it('parses single-digit values', () => {
    expect(parseTimeString('9:5')).toEqual({ hours: 9, minutes: 5, seconds: 0 });
  });

  it('returns null for an empty string', () => {
    expect(parseTimeString('')).toBeNull();
  });

  it('returns null for invalid formats', () => {
    expect(parseTimeString('hello')).toBeNull();
    expect(parseTimeString('14')).toBeNull();
    expect(parseTimeString('14:60')).toBeNull(); // minutes out of range
    expect(parseTimeString('25:00')).toBeNull(); // hours out of range
    expect(parseTimeString('-1:00')).toBeNull(); // negative
  });
});

describe('formatTimeString', () => {
  it('formats as HH:MM', () => {
    expect(formatTimeString({ hours: 14, minutes: 30, seconds: 0 })).toBe('14:30');
  });

  it('formats as HH:MM:SS when seconds requested', () => {
    expect(formatTimeString({ hours: 14, minutes: 30, seconds: 45 }, true)).toBe('14:30:45');
  });

  it('pads single digits with a leading zero', () => {
    expect(formatTimeString({ hours: 9, minutes: 5, seconds: 0 })).toBe('09:05');
  });
});

describe('to12Hour / to24Hour', () => {
  it('converts 0 to 12 AM', () => {
    expect(to12Hour(0)).toEqual({ hours12: 12, period: 'AM' });
  });

  it('converts 1 to 1 AM', () => {
    expect(to12Hour(1)).toEqual({ hours12: 1, period: 'AM' });
  });

  it('converts 12 to 12 PM', () => {
    expect(to12Hour(12)).toEqual({ hours12: 12, period: 'PM' });
  });

  it('converts 13 to 1 PM', () => {
    expect(to12Hour(13)).toEqual({ hours12: 1, period: 'PM' });
  });

  it('converts 23 to 11 PM', () => {
    expect(to12Hour(23)).toEqual({ hours12: 11, period: 'PM' });
  });

  it('to24Hour performs the inverse conversion', () => {
    expect(to24Hour(12, 'AM')).toBe(0);
    expect(to24Hour(1, 'AM')).toBe(1);
    expect(to24Hour(11, 'AM')).toBe(11);
    expect(to24Hour(12, 'PM')).toBe(12);
    expect(to24Hour(1, 'PM')).toBe(13);
    expect(to24Hour(11, 'PM')).toBe(23);
  });

  it('round-trips every hour through to12Hour and to24Hour', () => {
    for (let h = 0; h < 24; h++) {
      const { hours12, period } = to12Hour(h);
      expect(to24Hour(hours12, period)).toBe(h);
    }
  });

  it('to12Hour rejects out-of-range and non-integer inputs', () => {
    expect(() => to12Hour(24)).toThrow(RangeError);
    expect(() => to12Hour(25)).toThrow(RangeError);
    expect(() => to12Hour(-1)).toThrow(RangeError);
    expect(() => to12Hour(1.5)).toThrow(RangeError);
    expect(() => to12Hour(NaN)).toThrow(RangeError);
  });

  it('to24Hour rejects out-of-range and non-integer inputs', () => {
    // hours12 = 0 is *not* a valid 12-hour value (midnight is 12 AM, not 0 AM).
    expect(() => to24Hour(0, 'AM')).toThrow(RangeError);
    expect(() => to24Hour(13, 'PM')).toThrow(RangeError);
    expect(() => to24Hour(-1, 'AM')).toThrow(RangeError);
    expect(() => to24Hour(1.5, 'AM')).toThrow(RangeError);
    expect(() => to24Hour(NaN, 'PM')).toThrow(RangeError);
  });
});

describe('generateHours', () => {
  it('returns 0-23 for 24-hour clock', () => {
    const hours = generateHours('24h');
    expect(hours).toHaveLength(24);
    expect(hours[0]).toBe(0);
    expect(hours[23]).toBe(23);
  });

  it('returns 1-12 for 12-hour clock', () => {
    const hours = generateHours('12h');
    expect(hours).toHaveLength(12);
    expect(hours[0]).toBe(1);
    expect(hours[11]).toBe(12);
  });
});

describe('generateMinutes', () => {
  it('returns every minute 0-59 when step is 1', () => {
    const minutes = generateMinutes(1);
    expect(minutes).toHaveLength(60);
    expect(minutes[0]).toBe(0);
    expect(minutes[59]).toBe(59);
  });

  it('returns [0, 15, 30, 45] when step is 15', () => {
    expect(generateMinutes(15)).toEqual([0, 15, 30, 45]);
  });

  it('returns 12 entries when step is 5', () => {
    expect(generateMinutes(5)).toEqual([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
  });

  it('returns [0, 30] when step is 30', () => {
    expect(generateMinutes(30)).toEqual([0, 30]);
  });

  it('returns [0, 45] when step is 45 (quarter-and-three-quarters)', () => {
    expect(generateMinutes(45)).toEqual([0, 45]);
  });

  it('returns [0] when step is 60 (on-the-hour only)', () => {
    expect(generateMinutes(60)).toEqual([0]);
  });

  it('returns 30 entries when step is 2', () => {
    const result = generateMinutes(2);
    expect(result).toHaveLength(30);
    expect(result[0]).toBe(0);
    expect(result[29]).toBe(58);
  });

  it('returns [0, 7, 14, 21, 28, 35, 42, 49, 56] when step is 7 (uneven divisor)', () => {
    expect(generateMinutes(7)).toEqual([0, 7, 14, 21, 28, 35, 42, 49, 56]);
  });

  it('throws on invalid step values', () => {
    expect(() => generateMinutes(0)).toThrow();
    expect(() => generateMinutes(61)).toThrow();
    expect(() => generateMinutes(-1)).toThrow();
  });
});

describe('isSameTime', () => {
  it('returns true for identical times', () => {
    expect(
      isSameTime({ hours: 14, minutes: 30, seconds: 0 }, { hours: 14, minutes: 30, seconds: 0 }),
    ).toBe(true);
  });

  it('returns false when seconds differ', () => {
    expect(
      isSameTime({ hours: 14, minutes: 30, seconds: 0 }, { hours: 14, minutes: 30, seconds: 1 }),
    ).toBe(false);
  });
});

describe('formatTimeFromISO', () => {
  it('formats as HH:mm', () => {
    expect(formatTimeFromISO('2026-01-15T14:30:00.000Z', 'HH:mm')).toBe('14:30');
  });

  it('formats as HH:mm:ss', () => {
    expect(formatTimeFromISO('2026-01-15T14:30:45.000Z', 'HH:mm:ss')).toBe('14:30:45');
  });

  it('formats as h:mm a using the 12-hour clock', () => {
    expect(formatTimeFromISO('2026-01-15T14:30:00.000Z', 'h:mm a')).toBe('2:30 PM');
    expect(formatTimeFromISO('2026-01-15T00:30:00.000Z', 'h:mm a')).toBe('12:30 AM');
    expect(formatTimeFromISO('2026-01-15T12:30:00.000Z', 'h:mm a')).toBe('12:30 PM');
  });

  it('formats as h:mm:ss a', () => {
    expect(formatTimeFromISO('2026-01-15T14:30:45.000Z', 'h:mm:ss a')).toBe('2:30:45 PM');
  });
});
