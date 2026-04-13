import { describe, it, expect } from 'vitest';
import {
  getMonthName,
  formatMonthYear,
  getWeekdayNames,
  formatFullDate,
} from '../utils/locale.js';

describe('getMonthName', () => {
  it('영어 (en-US)', () => {
    expect(getMonthName(0, 'en-US')).toBe('January');
    expect(getMonthName(11, 'en-US')).toBe('December');
  });

  it('한국어 (ko-KR)', () => {
    expect(getMonthName(0, 'ko-KR')).toBe('1월');
    expect(getMonthName(11, 'ko-KR')).toBe('12월');
  });

  it('일본어 (ja-JP)', () => {
    expect(getMonthName(0, 'ja-JP')).toBe('1月');
  });
});

describe('formatMonthYear', () => {
  it('영어', () => {
    expect(formatMonthYear(2026, 0, 'en-US')).toBe('January 2026');
  });

  it('한국어', () => {
    const result = formatMonthYear(2026, 0, 'ko-KR');
    expect(result).toContain('2026');
    expect(result).toContain('1월');
  });

  it('일본어', () => {
    const result = formatMonthYear(2026, 0, 'ja-JP');
    expect(result).toContain('2026');
    expect(result).toContain('1月');
  });
});

describe('getWeekdayNames', () => {
  it('영어 + 일요일 시작', () => {
    const days = getWeekdayNames('en-US', 0);
    expect(days).toHaveLength(7);
    // 일요일 시작
    expect(days[0]!.full).toBe('Sunday');
    expect(days[6]!.full).toBe('Saturday');
  });

  it('영어 + 월요일 시작', () => {
    const days = getWeekdayNames('en-US', 1);
    expect(days[0]!.full).toBe('Monday');
    expect(days[6]!.full).toBe('Sunday');
  });

  it('한국어', () => {
    const days = getWeekdayNames('ko-KR', 0);
    expect(days[0]!.full).toBe('일요일');
    expect(days[1]!.full).toBe('월요일');
  });

  it('일본어', () => {
    const days = getWeekdayNames('ja-JP', 0);
    expect(days[0]!.full).toBe('日曜日');
  });
});

describe('formatFullDate', () => {
  it('영어', () => {
    const result = formatFullDate('2026-01-15T00:00:00.000Z', 'en-US');
    expect(result).toContain('January');
    expect(result).toContain('15');
    expect(result).toContain('2026');
    expect(result).toContain('Thursday');
  });

  it('한국어', () => {
    const result = formatFullDate('2026-01-15T00:00:00.000Z', 'ko-KR');
    expect(result).toContain('2026');
    expect(result).toContain('1월');
    expect(result).toContain('15');
    expect(result).toContain('목요일');
  });
});
