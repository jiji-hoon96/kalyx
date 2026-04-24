import { describe, it, expect } from 'vitest';
import { getMonthName, formatMonthYear, getWeekdayNames, formatFullDate } from '../utils/locale.js';

describe('getMonthName', () => {
  it('returns English month names (en-US)', () => {
    expect(getMonthName(0, 'en-US')).toBe('January');
    expect(getMonthName(11, 'en-US')).toBe('December');
  });

  it('returns Korean month names (ko-KR)', () => {
    expect(getMonthName(0, 'ko-KR')).toBe('1월');
    expect(getMonthName(11, 'ko-KR')).toBe('12월');
  });

  it('returns Japanese month names (ja-JP)', () => {
    expect(getMonthName(0, 'ja-JP')).toBe('1月');
  });
});

describe('formatMonthYear', () => {
  it('formats month and year in English', () => {
    expect(formatMonthYear(2026, 0, 'en-US')).toBe('January 2026');
  });

  it('formats month and year in Korean', () => {
    const result = formatMonthYear(2026, 0, 'ko-KR');
    expect(result).toContain('2026');
    expect(result).toContain('1월');
  });

  it('formats month and year in Japanese', () => {
    const result = formatMonthYear(2026, 0, 'ja-JP');
    expect(result).toContain('2026');
    expect(result).toContain('1月');
  });
});

describe('getWeekdayNames', () => {
  it('returns English weekday names starting on Sunday', () => {
    const days = getWeekdayNames('en-US', 0);
    expect(days).toHaveLength(7);
    expect(days[0]!.full).toBe('Sunday');
    expect(days[6]!.full).toBe('Saturday');
  });

  it('returns English weekday names starting on Monday', () => {
    const days = getWeekdayNames('en-US', 1);
    expect(days[0]!.full).toBe('Monday');
    expect(days[6]!.full).toBe('Sunday');
  });

  it('returns Korean weekday names', () => {
    const days = getWeekdayNames('ko-KR', 0);
    expect(days[0]!.full).toBe('일요일');
    expect(days[1]!.full).toBe('월요일');
  });

  it('returns Japanese weekday names', () => {
    const days = getWeekdayNames('ja-JP', 0);
    expect(days[0]!.full).toBe('日曜日');
  });
});

describe('formatFullDate', () => {
  it('formats a full date in English', () => {
    const result = formatFullDate('2026-01-15T00:00:00.000Z', 'en-US');
    expect(result).toContain('January');
    expect(result).toContain('15');
    expect(result).toContain('2026');
    expect(result).toContain('Thursday');
  });

  it('formats a full date in Korean', () => {
    const result = formatFullDate('2026-01-15T00:00:00.000Z', 'ko-KR');
    expect(result).toContain('2026');
    expect(result).toContain('1월');
    expect(result).toContain('15');
    expect(result).toContain('목요일');
  });
});
