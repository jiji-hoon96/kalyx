import { describe, it, expect } from 'vitest';
import { normalizeISO, parseInputValue, getOrderedWeekdays } from '../utils/date.js';
import { DateFnsAdapter } from '../adapters/date-fns.js';

const adapter = DateFnsAdapter;

describe('normalizeISO', () => {
  it('YYYY-MM-DD를 UTC 자정으로 변환한다', () => {
    expect(normalizeISO('2026-01-15')).toBe('2026-01-15T00:00:00.000Z');
  });

  it('ISO datetime은 그대로 반환한다', () => {
    expect(normalizeISO('2026-01-15T14:30:00.000Z')).toBe('2026-01-15T14:30:00.000Z');
  });

  it('빈 문자열은 빈 문자열을 반환한다', () => {
    expect(normalizeISO('')).toBe('');
  });
});

describe('parseInputValue', () => {
  it('yyyy-MM-dd 형식을 파싱한다', () => {
    expect(parseInputValue('2026-01-15', 'yyyy-MM-dd', adapter)).toBe('2026-01-15T00:00:00.000Z');
  });

  it('yyyy/MM/dd 형식을 파싱한다 (슬래시 → 하이픈 변환)', () => {
    expect(parseInputValue('2026/01/15', 'yyyy-MM-dd', adapter)).toBe('2026-01-15T00:00:00.000Z');
  });

  it('8자리 숫자를 파싱한다', () => {
    expect(parseInputValue('20260115', 'yyyy-MM-dd', adapter)).toBe('2026-01-15T00:00:00.000Z');
  });

  it('빈 입력은 null을 반환한다', () => {
    expect(parseInputValue('', 'yyyy-MM-dd', adapter)).toBeNull();
    expect(parseInputValue('   ', 'yyyy-MM-dd', adapter)).toBeNull();
  });

  it('잘못된 입력은 null을 반환한다', () => {
    expect(parseInputValue('hello', 'yyyy-MM-dd', adapter)).toBeNull();
    expect(parseInputValue('2026-13-45', 'yyyy-MM-dd', adapter)).toBeNull();
  });
});

describe('getOrderedWeekdays', () => {
  it('일요일 시작 (기본)', () => {
    const days = getOrderedWeekdays(0);
    expect(days[0]!.short).toBe('Su');
    expect(days[6]!.short).toBe('Sa');
  });

  it('월요일 시작', () => {
    const days = getOrderedWeekdays(1);
    expect(days[0]!.short).toBe('Mo');
    expect(days[6]!.short).toBe('Su');
  });
});
