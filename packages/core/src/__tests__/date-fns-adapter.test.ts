import { describe, it, expect } from 'vitest';
import { DateFnsAdapter } from '../adapters/date-fns.js';

const adapter = DateFnsAdapter;

describe('DateFnsAdapter', () => {
  describe('parse', () => {
    it('returns an ISO datetime unchanged', () => {
      expect(adapter.parse('2026-01-15T00:00:00.000Z')).toBe('2026-01-15T00:00:00.000Z');
    });

    it('normalizes YYYY-MM-DD to UTC midnight', () => {
      expect(adapter.parse('2026-01-15')).toBe('2026-01-15T00:00:00.000Z');
    });

    it('returns an empty string for empty input', () => {
      expect(adapter.parse('')).toBe('');
    });
  });

  describe('format', () => {
    it('formats an ISO string using the given pattern', () => {
      expect(adapter.format('2026-01-15T00:00:00.000Z', 'yyyy-MM-dd')).toBe('2026-01-15');
    });

    it('formats time tokens correctly', () => {
      expect(adapter.format('2026-01-15T14:30:00.000Z', 'HH:mm')).toBe('14:30');
    });
  });

  describe('addDays / addMonths / addYears', () => {
    it('adds one day', () => {
      const result = adapter.addDays('2026-01-15T00:00:00.000Z', 1);
      expect(result).toContain('2026-01-16T');
    });

    it('subtracts one day', () => {
      const result = adapter.addDays('2026-01-15T00:00:00.000Z', -1);
      expect(result).toContain('2026-01-14T');
    });

    it('adds one month', () => {
      const result = adapter.addMonths('2026-01-15T00:00:00.000Z', 1);
      expect(result).toContain('2026-02-15T');
    });

    it('rolls forward from December to next year January', () => {
      const result = adapter.addMonths('2026-12-15T00:00:00.000Z', 1);
      expect(result).toContain('2027-01-15T');
    });

    it('rolls backward from January to previous year December', () => {
      const result = adapter.addMonths('2026-01-15T00:00:00.000Z', -1);
      expect(result).toContain('2025-12-15T');
    });

    it('adds one year', () => {
      const result = adapter.addYears('2026-01-15T00:00:00.000Z', 1);
      expect(result).toContain('2027-01-15T');
    });
  });

  describe('comparisons', () => {
    it('isBefore returns true only for earlier dates', () => {
      expect(adapter.isBefore('2026-01-14T00:00:00.000Z', '2026-01-15T00:00:00.000Z')).toBe(true);
      expect(adapter.isBefore('2026-01-15T00:00:00.000Z', '2026-01-14T00:00:00.000Z')).toBe(false);
    });

    it('isAfter returns true only for later dates', () => {
      expect(adapter.isAfter('2026-01-16T00:00:00.000Z', '2026-01-15T00:00:00.000Z')).toBe(true);
      expect(adapter.isAfter('2026-01-14T00:00:00.000Z', '2026-01-15T00:00:00.000Z')).toBe(false);
    });

    it('isSameDay ignores time-of-day', () => {
      expect(adapter.isSameDay('2026-01-15T00:00:00.000Z', '2026-01-15T23:59:59.000Z')).toBe(true);
      expect(adapter.isSameDay('2026-01-15T00:00:00.000Z', '2026-01-16T00:00:00.000Z')).toBe(false);
    });

    it('isSameDay returns false when either value is empty', () => {
      expect(adapter.isSameDay('', '2026-01-15T00:00:00.000Z')).toBe(false);
      expect(adapter.isSameDay('2026-01-15T00:00:00.000Z', '')).toBe(false);
    });

    it('isSameMonth matches dates in the same month', () => {
      expect(adapter.isSameMonth('2026-01-01T00:00:00.000Z', '2026-01-31T00:00:00.000Z')).toBe(
        true,
      );
      expect(adapter.isSameMonth('2026-01-01T00:00:00.000Z', '2026-02-01T00:00:00.000Z')).toBe(
        false,
      );
    });
  });

  describe('boundaries', () => {
    it('startOfMonth returns the first of the month', () => {
      expect(adapter.startOfMonth('2026-01-15T14:30:00.000Z')).toContain('2026-01-01T');
    });

    it('endOfMonth returns the last day of the month', () => {
      const result = adapter.endOfMonth('2026-01-15T00:00:00.000Z');
      expect(result).toContain('2026-01-31T');
    });

    it('startOfWeek returns the Sunday for week-starts-Sunday', () => {
      // 2026-01-15 = Thursday → week start = 2026-01-11 (Sunday)
      const result = adapter.startOfWeek('2026-01-15T00:00:00.000Z', 0);
      expect(result).toContain('2026-01-11T');
    });

    it('startOfWeek returns the Monday for week-starts-Monday', () => {
      // 2026-01-15 = Thursday → week start = 2026-01-12 (Monday)
      const result = adapter.startOfWeek('2026-01-15T00:00:00.000Z', 1);
      expect(result).toContain('2026-01-12T');
    });
  });

  describe('isValid', () => {
    it('accepts a valid ISO datetime', () => {
      expect(adapter.isValid('2026-01-15T00:00:00.000Z')).toBe(true);
    });

    it('accepts a valid YYYY-MM-DD', () => {
      expect(adapter.isValid('2026-01-15')).toBe(true);
    });

    it('rejects an empty string', () => {
      expect(adapter.isValid('')).toBe(false);
    });

    it('rejects an invalid date string', () => {
      expect(adapter.isValid('invalid-date')).toBe(false);
    });
  });

  describe('field accessors', () => {
    it('exposes year / month / date / day correctly', () => {
      const iso = '2026-01-15T00:00:00.000Z';
      expect(adapter.getYear(iso)).toBe(2026);
      expect(adapter.getMonth(iso)).toBe(0); // 0-indexed
      expect(adapter.getDate(iso)).toBe(15);
      expect(adapter.getDay(iso)).toBe(4); // Thursday
    });
  });

  describe('leap year', () => {
    it('gives February 2024 29 days', () => {
      expect(adapter.isValid('2024-02-29')).toBe(true);
      expect(adapter.getDate(adapter.endOfMonth('2024-02-01T00:00:00.000Z'))).toBe(29);
    });

    it('gives February 2026 28 days', () => {
      expect(adapter.getDate(adapter.endOfMonth('2026-02-01T00:00:00.000Z'))).toBe(28);
    });
  });

  describe('timezone parameter (displayTimezone)', () => {
    it('format honours the requested timezone', () => {
      // 2026-01-15 00:00 UTC = 2026-01-15 09:00 KST
      expect(adapter.format('2026-01-15T00:00:00.000Z', 'yyyy-MM-dd HH:mm', 'Asia/Seoul')).toBe(
        '2026-01-15 09:00',
      );
      // 2026-01-15 00:00 UTC = 2026-01-14 19:00 EST
      expect(
        adapter.format('2026-01-15T00:00:00.000Z', 'yyyy-MM-dd HH:mm', 'America/New_York'),
      ).toBe('2026-01-14 19:00');
    });

    it('isSameDay treats instants straddling UTC midnight as one civil day in Asia/Seoul', () => {
      // 2026-01-15T22:00Z = 2026-01-16 07:00 KST (next day)
      // 2026-01-15T12:00Z = 2026-01-15 21:00 KST (same day)
      expect(
        adapter.isSameDay('2026-01-15T12:00:00.000Z', '2026-01-15T22:00:00.000Z', 'Asia/Seoul'),
      ).toBe(false);
      expect(
        adapter.isSameDay('2026-01-15T00:00:00.000Z', '2026-01-15T14:00:00.000Z', 'Asia/Seoul'),
      ).toBe(true);
    });

    it('startOfDay returns civil-midnight in timezone (across DST)', () => {
      // EST before spring-forward
      expect(adapter.startOfDay('2026-01-15T12:00:00.000Z', 'America/New_York')).toBe(
        '2026-01-15T05:00:00.000Z',
      );
      // EDT after spring-forward
      expect(adapter.startOfDay('2026-07-15T12:00:00.000Z', 'America/New_York')).toBe(
        '2026-07-15T04:00:00.000Z',
      );
    });

    it('today without timezone matches UTC midnight shape', () => {
      expect(adapter.today()).toMatch(/T00:00:00\.000Z$/);
    });

    it('omitted timezone falls back to UTC semantics', () => {
      // No timezone → legacy UTC path
      expect(adapter.format('2026-01-15T00:00:00.000Z', 'yyyy-MM-dd')).toBe('2026-01-15');
      expect(adapter.isSameDay('2026-01-15T00:00:00.000Z', '2026-01-15T23:59:59.000Z')).toBe(true);
      expect(adapter.startOfDay('2026-01-15T14:30:00.000Z')).toBe('2026-01-15T00:00:00.000Z');
    });
  });
});
