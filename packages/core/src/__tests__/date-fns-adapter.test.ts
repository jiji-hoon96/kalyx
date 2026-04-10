import { describe, it, expect } from 'vitest';
import { DateFnsAdapter } from '../adapters/date-fns.js';

const adapter = DateFnsAdapter;

describe('DateFnsAdapter', () => {
  describe('parse', () => {
    it('ISO datetime을 그대로 반환한다', () => {
      expect(adapter.parse('2026-01-15T00:00:00.000Z')).toBe('2026-01-15T00:00:00.000Z');
    });

    it('YYYY-MM-DD를 UTC 자정으로 정규화한다', () => {
      expect(adapter.parse('2026-01-15')).toBe('2026-01-15T00:00:00.000Z');
    });

    it('빈 문자열은 빈 문자열을 반환한다', () => {
      expect(adapter.parse('')).toBe('');
    });
  });

  describe('format', () => {
    it('ISO string을 지정된 포맷으로 변환한다', () => {
      expect(adapter.format('2026-01-15T00:00:00.000Z', 'yyyy-MM-dd')).toBe('2026-01-15');
    });

    it('시간 포맷도 동작한다', () => {
      expect(adapter.format('2026-01-15T14:30:00.000Z', 'HH:mm')).toBe('14:30');
    });
  });

  describe('addDays / addMonths / addYears', () => {
    it('하루를 더한다', () => {
      const result = adapter.addDays('2026-01-15T00:00:00.000Z', 1);
      expect(result).toContain('2026-01-16T');
    });

    it('하루를 뺀다', () => {
      const result = adapter.addDays('2026-01-15T00:00:00.000Z', -1);
      expect(result).toContain('2026-01-14T');
    });

    it('한 달을 더한다', () => {
      const result = adapter.addMonths('2026-01-15T00:00:00.000Z', 1);
      expect(result).toContain('2026-02-15T');
    });

    it('12월에서 다음 달 이동 시 다음 해 1월', () => {
      const result = adapter.addMonths('2026-12-15T00:00:00.000Z', 1);
      expect(result).toContain('2027-01-15T');
    });

    it('1월에서 이전 달 이동 시 이전 해 12월', () => {
      const result = adapter.addMonths('2026-01-15T00:00:00.000Z', -1);
      expect(result).toContain('2025-12-15T');
    });

    it('1년을 더한다', () => {
      const result = adapter.addYears('2026-01-15T00:00:00.000Z', 1);
      expect(result).toContain('2027-01-15T');
    });
  });

  describe('비교', () => {
    it('isBefore가 올바르게 동작한다', () => {
      expect(adapter.isBefore('2026-01-14T00:00:00.000Z', '2026-01-15T00:00:00.000Z')).toBe(true);
      expect(adapter.isBefore('2026-01-15T00:00:00.000Z', '2026-01-14T00:00:00.000Z')).toBe(false);
    });

    it('isAfter가 올바르게 동작한다', () => {
      expect(adapter.isAfter('2026-01-16T00:00:00.000Z', '2026-01-15T00:00:00.000Z')).toBe(true);
      expect(adapter.isAfter('2026-01-14T00:00:00.000Z', '2026-01-15T00:00:00.000Z')).toBe(false);
    });

    it('isSameDay가 올바르게 동작한다', () => {
      expect(adapter.isSameDay('2026-01-15T00:00:00.000Z', '2026-01-15T23:59:59.000Z')).toBe(true);
      expect(adapter.isSameDay('2026-01-15T00:00:00.000Z', '2026-01-16T00:00:00.000Z')).toBe(false);
    });

    it('isSameDay에 빈 값이 오면 false', () => {
      expect(adapter.isSameDay('', '2026-01-15T00:00:00.000Z')).toBe(false);
      expect(adapter.isSameDay('2026-01-15T00:00:00.000Z', '')).toBe(false);
    });

    it('isSameMonth가 올바르게 동작한다', () => {
      expect(adapter.isSameMonth('2026-01-01T00:00:00.000Z', '2026-01-31T00:00:00.000Z')).toBe(true);
      expect(adapter.isSameMonth('2026-01-01T00:00:00.000Z', '2026-02-01T00:00:00.000Z')).toBe(false);
    });
  });

  describe('경계', () => {
    it('startOfMonth', () => {
      expect(adapter.startOfMonth('2026-01-15T14:30:00.000Z')).toContain('2026-01-01T');
    });

    it('endOfMonth', () => {
      const result = adapter.endOfMonth('2026-01-15T00:00:00.000Z');
      expect(result).toContain('2026-01-31T');
    });

    it('startOfWeek (일요일 시작)', () => {
      // 2026-01-15 = 목요일 → 주 시작 = 2026-01-11 (일요일)
      const result = adapter.startOfWeek('2026-01-15T00:00:00.000Z', 0);
      expect(result).toContain('2026-01-11T');
    });

    it('startOfWeek (월요일 시작)', () => {
      // 2026-01-15 = 목요일 → 주 시작 = 2026-01-12 (월요일)
      const result = adapter.startOfWeek('2026-01-15T00:00:00.000Z', 1);
      expect(result).toContain('2026-01-12T');
    });
  });

  describe('isValid', () => {
    it('유효한 ISO 날짜', () => {
      expect(adapter.isValid('2026-01-15T00:00:00.000Z')).toBe(true);
    });

    it('유효한 YYYY-MM-DD', () => {
      expect(adapter.isValid('2026-01-15')).toBe(true);
    });

    it('빈 문자열은 무효', () => {
      expect(adapter.isValid('')).toBe(false);
    });

    it('잘못된 날짜는 무효', () => {
      expect(adapter.isValid('invalid-date')).toBe(false);
    });
  });

  describe('정보', () => {
    it('getYear / getMonth / getDate / getDay', () => {
      const iso = '2026-01-15T00:00:00.000Z';
      expect(adapter.getYear(iso)).toBe(2026);
      expect(adapter.getMonth(iso)).toBe(0); // 0-indexed
      expect(adapter.getDate(iso)).toBe(15);
      expect(adapter.getDay(iso)).toBe(4); // 목요일
    });
  });

  describe('윤년', () => {
    it('2024년 2월은 29일까지 있다', () => {
      expect(adapter.isValid('2024-02-29')).toBe(true);
      expect(adapter.getDate(adapter.endOfMonth('2024-02-01T00:00:00.000Z'))).toBe(29);
    });

    it('2026년 2월은 28일까지 있다', () => {
      expect(adapter.getDate(adapter.endOfMonth('2026-02-01T00:00:00.000Z'))).toBe(28);
    });
  });
});
