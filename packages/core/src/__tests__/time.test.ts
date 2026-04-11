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
  it('시간을 변경한다 (UTC 기준)', () => {
    const result = setTime('2026-01-15T00:00:00.000Z', { hours: 14 });
    expect(result).toBe('2026-01-15T14:00:00.000Z');
  });

  it('분을 변경한다', () => {
    const result = setTime('2026-01-15T14:00:00.000Z', { minutes: 30 });
    expect(result).toBe('2026-01-15T14:30:00.000Z');
  });

  it('초를 변경한다', () => {
    const result = setTime('2026-01-15T14:30:00.000Z', { seconds: 45 });
    expect(result).toBe('2026-01-15T14:30:45.000Z');
  });

  it('여러 부분을 동시에 변경한다', () => {
    const result = setTime('2026-01-15T00:00:00.000Z', {
      hours: 14,
      minutes: 30,
      seconds: 45,
    });
    expect(result).toBe('2026-01-15T14:30:45.000Z');
  });
});

describe('getTime', () => {
  it('ISO datetime에서 시간을 추출한다', () => {
    expect(getTime('2026-01-15T14:30:45.000Z')).toEqual({
      hours: 14,
      minutes: 30,
      seconds: 45,
    });
  });

  it('자정도 정확히 처리한다', () => {
    expect(getTime('2026-01-15T00:00:00.000Z')).toEqual({
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });
});

describe('parseTimeString', () => {
  it('HH:MM 형식을 파싱한다', () => {
    expect(parseTimeString('14:30')).toEqual({ hours: 14, minutes: 30, seconds: 0 });
  });

  it('HH:MM:SS 형식을 파싱한다', () => {
    expect(parseTimeString('14:30:45')).toEqual({ hours: 14, minutes: 30, seconds: 45 });
  });

  it('한 자리 숫자도 파싱한다', () => {
    expect(parseTimeString('9:5')).toEqual({ hours: 9, minutes: 5, seconds: 0 });
  });

  it('빈 문자열은 null', () => {
    expect(parseTimeString('')).toBeNull();
  });

  it('잘못된 형식은 null', () => {
    expect(parseTimeString('hello')).toBeNull();
    expect(parseTimeString('14')).toBeNull();
    expect(parseTimeString('14:60')).toBeNull(); // 분 범위 초과
    expect(parseTimeString('25:00')).toBeNull(); // 시 범위 초과
    expect(parseTimeString('-1:00')).toBeNull(); // 음수
  });
});

describe('formatTimeString', () => {
  it('HH:MM 포맷', () => {
    expect(formatTimeString({ hours: 14, minutes: 30, seconds: 0 })).toBe('14:30');
  });

  it('HH:MM:SS 포맷', () => {
    expect(formatTimeString({ hours: 14, minutes: 30, seconds: 45 }, true)).toBe('14:30:45');
  });

  it('한 자리 숫자는 0으로 패딩', () => {
    expect(formatTimeString({ hours: 9, minutes: 5, seconds: 0 })).toBe('09:05');
  });
});

describe('to12Hour / to24Hour', () => {
  it('0시 → 12 AM', () => {
    expect(to12Hour(0)).toEqual({ hours12: 12, period: 'AM' });
  });

  it('1시 → 1 AM', () => {
    expect(to12Hour(1)).toEqual({ hours12: 1, period: 'AM' });
  });

  it('12시 → 12 PM', () => {
    expect(to12Hour(12)).toEqual({ hours12: 12, period: 'PM' });
  });

  it('13시 → 1 PM', () => {
    expect(to12Hour(13)).toEqual({ hours12: 1, period: 'PM' });
  });

  it('23시 → 11 PM', () => {
    expect(to12Hour(23)).toEqual({ hours12: 11, period: 'PM' });
  });

  it('to24Hour 역변환', () => {
    expect(to24Hour(12, 'AM')).toBe(0);
    expect(to24Hour(1, 'AM')).toBe(1);
    expect(to24Hour(11, 'AM')).toBe(11);
    expect(to24Hour(12, 'PM')).toBe(12);
    expect(to24Hour(1, 'PM')).toBe(13);
    expect(to24Hour(11, 'PM')).toBe(23);
  });

  it('round-trip 변환', () => {
    for (let h = 0; h < 24; h++) {
      const { hours12, period } = to12Hour(h);
      expect(to24Hour(hours12, period)).toBe(h);
    }
  });
});

describe('generateHours', () => {
  it('24시간제: 0-23', () => {
    const hours = generateHours('24h');
    expect(hours).toHaveLength(24);
    expect(hours[0]).toBe(0);
    expect(hours[23]).toBe(23);
  });

  it('12시간제: 1-12', () => {
    const hours = generateHours('12h');
    expect(hours).toHaveLength(12);
    expect(hours[0]).toBe(1);
    expect(hours[11]).toBe(12);
  });
});

describe('generateMinutes', () => {
  it('step=1: 0-59 모든 분', () => {
    const minutes = generateMinutes(1);
    expect(minutes).toHaveLength(60);
    expect(minutes[0]).toBe(0);
    expect(minutes[59]).toBe(59);
  });

  it('step=15: [0, 15, 30, 45]', () => {
    expect(generateMinutes(15)).toEqual([0, 15, 30, 45]);
  });

  it('step=5: [0, 5, ..., 55]', () => {
    expect(generateMinutes(5)).toEqual([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
  });

  it('step=30: [0, 30]', () => {
    expect(generateMinutes(30)).toEqual([0, 30]);
  });

  it('잘못된 step은 에러', () => {
    expect(() => generateMinutes(0)).toThrow();
    expect(() => generateMinutes(61)).toThrow();
  });
});

describe('isSameTime', () => {
  it('완전히 같은 시간', () => {
    expect(
      isSameTime(
        { hours: 14, minutes: 30, seconds: 0 },
        { hours: 14, minutes: 30, seconds: 0 },
      ),
    ).toBe(true);
  });

  it('초가 다르면 false', () => {
    expect(
      isSameTime(
        { hours: 14, minutes: 30, seconds: 0 },
        { hours: 14, minutes: 30, seconds: 1 },
      ),
    ).toBe(false);
  });
});

describe('formatTimeFromISO', () => {
  it('HH:mm', () => {
    expect(formatTimeFromISO('2026-01-15T14:30:00.000Z', 'HH:mm')).toBe('14:30');
  });

  it('HH:mm:ss', () => {
    expect(formatTimeFromISO('2026-01-15T14:30:45.000Z', 'HH:mm:ss')).toBe('14:30:45');
  });

  it('h:mm a (12시간제)', () => {
    expect(formatTimeFromISO('2026-01-15T14:30:00.000Z', 'h:mm a')).toBe('2:30 PM');
    expect(formatTimeFromISO('2026-01-15T00:30:00.000Z', 'h:mm a')).toBe('12:30 AM');
    expect(formatTimeFromISO('2026-01-15T12:30:00.000Z', 'h:mm a')).toBe('12:30 PM');
  });

  it('h:mm:ss a', () => {
    expect(formatTimeFromISO('2026-01-15T14:30:45.000Z', 'h:mm:ss a')).toBe('2:30:45 PM');
  });
});
