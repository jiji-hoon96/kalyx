import { describe, it, expect } from 'vitest';
import { getCalendarDays, isDateDisabled } from '../utils/calendar.js';
import { DateFnsAdapter } from '../adapters/date-fns.js';

const adapter = DateFnsAdapter;

describe('getCalendarDays', () => {
  it('2026년 1월의 달력을 올바르게 생성한다', () => {
    const weeks = getCalendarDays('2026-01-01T00:00:00.000Z', adapter);
    // 1월은 목요일 시작 (일요일 기준 주 시작)
    expect(weeks.length).toBeGreaterThanOrEqual(4);
    expect(weeks.length).toBeLessThanOrEqual(6);

    // 모든 주는 7일
    for (const week of weeks) {
      expect(week).toHaveLength(7);
    }

    // 현재 달에 속하는 날짜가 31개
    const currentMonthDays = weeks.flat().filter(d => d.isCurrentMonth);
    expect(currentMonthDays).toHaveLength(31);
  });

  it('윤년 2024년 2월은 29일까지 있다', () => {
    const weeks = getCalendarDays('2024-02-01T00:00:00.000Z', adapter);
    const currentMonthDays = weeks.flat().filter(d => d.isCurrentMonth);
    expect(currentMonthDays).toHaveLength(29);
    expect(currentMonthDays[28]!.dayNumber).toBe(29);
  });

  it('비윤년 2026년 2월은 28일까지 있다', () => {
    const weeks = getCalendarDays('2026-02-01T00:00:00.000Z', adapter);
    const currentMonthDays = weeks.flat().filter(d => d.isCurrentMonth);
    expect(currentMonthDays).toHaveLength(28);
  });

  it('주 시작을 월요일로 설정할 수 있다', () => {
    const weeks = getCalendarDays('2026-01-01T00:00:00.000Z', adapter, {
      weekStartsOn: 1,
    });
    // 첫째 주의 첫 날은 월요일이어야 한다
    const firstDay = weeks[0]![0]!;
    expect(adapter.getDay(firstDay.isoString)).toBe(1); // 월요일
  });

  it('선택된 날짜가 올바르게 표시된다', () => {
    const selected = '2026-01-15T00:00:00.000Z';
    const weeks = getCalendarDays('2026-01-01T00:00:00.000Z', adapter, {
      selected,
    });
    const selectedDays = weeks.flat().filter(d => d.isSelected);
    expect(selectedDays).toHaveLength(1);
    expect(selectedDays[0]!.dayNumber).toBe(15);
  });

  it('오늘 날짜가 올바르게 표시된다', () => {
    const today = '2026-01-20T00:00:00.000Z';
    const weeks = getCalendarDays('2026-01-01T00:00:00.000Z', adapter, {
      today,
    });
    const todayDays = weeks.flat().filter(d => d.isToday);
    expect(todayDays).toHaveLength(1);
    expect(todayDays[0]!.dayNumber).toBe(20);
  });

  it('비활성화 날짜가 올바르게 표시된다', () => {
    const weeks = getCalendarDays('2026-01-01T00:00:00.000Z', adapter, {
      disabled: [{ dayOfWeek: [0, 6] }],
    });
    const disabledDays = weeks.flat().filter(d => d.isDisabled && d.isCurrentMonth);
    // 1월의 주말 수 확인
    expect(disabledDays.length).toBeGreaterThan(0);
    for (const d of disabledDays) {
      const dayOfWeek = adapter.getDay(d.isoString);
      expect([0, 6]).toContain(dayOfWeek);
    }
  });

  it('이전/다음 달의 날짜가 포함된다', () => {
    const weeks = getCalendarDays('2026-01-01T00:00:00.000Z', adapter);
    const outsideDays = weeks.flat().filter(d => !d.isCurrentMonth);
    expect(outsideDays.length).toBeGreaterThan(0);
  });
});

describe('isDateDisabled', () => {
  it('before 규칙: 이전 날짜는 disabled', () => {
    const rules = [{ before: '2026-01-10T00:00:00.000Z' as const }];
    expect(isDateDisabled('2026-01-09T00:00:00.000Z', rules, adapter)).toBe(true);
    expect(isDateDisabled('2026-01-10T00:00:00.000Z', rules, adapter)).toBe(false);
    expect(isDateDisabled('2026-01-11T00:00:00.000Z', rules, adapter)).toBe(false);
  });

  it('after 규칙: 이후 날짜는 disabled', () => {
    const rules = [{ after: '2026-01-20T00:00:00.000Z' as const }];
    expect(isDateDisabled('2026-01-21T00:00:00.000Z', rules, adapter)).toBe(true);
    expect(isDateDisabled('2026-01-20T00:00:00.000Z', rules, adapter)).toBe(false);
    expect(isDateDisabled('2026-01-19T00:00:00.000Z', rules, adapter)).toBe(false);
  });

  it('특정 날짜는 disabled', () => {
    const rules = [{ date: '2026-01-15T00:00:00.000Z' as const }];
    expect(isDateDisabled('2026-01-15T00:00:00.000Z', rules, adapter)).toBe(true);
    expect(isDateDisabled('2026-01-14T00:00:00.000Z', rules, adapter)).toBe(false);
  });

  it('dayOfWeek 규칙: 주말은 disabled', () => {
    const rules = [{ dayOfWeek: [0, 6] }];
    // 2026-01-11 = 일요일
    expect(isDateDisabled('2026-01-11T00:00:00.000Z', rules, adapter)).toBe(true);
    // 2026-01-10 = 토요일
    expect(isDateDisabled('2026-01-10T00:00:00.000Z', rules, adapter)).toBe(true);
    // 2026-01-12 = 월요일
    expect(isDateDisabled('2026-01-12T00:00:00.000Z', rules, adapter)).toBe(false);
  });

  it('복합 규칙이 동작한다', () => {
    const rules = [
      { before: '2026-01-10T00:00:00.000Z' as const },
      { date: '2026-01-15T00:00:00.000Z' as const },
      { dayOfWeek: [0] },
    ];
    expect(isDateDisabled('2026-01-09T00:00:00.000Z', rules, adapter)).toBe(true);
    expect(isDateDisabled('2026-01-15T00:00:00.000Z', rules, adapter)).toBe(true);
    expect(isDateDisabled('2026-01-11T00:00:00.000Z', rules, adapter)).toBe(true); // 일요일
    expect(isDateDisabled('2026-01-12T00:00:00.000Z', rules, adapter)).toBe(false); // 월요일, 범위 내
  });

  it('빈 규칙 배열이면 모든 날짜가 enabled', () => {
    expect(isDateDisabled('2026-01-15T00:00:00.000Z', [], adapter)).toBe(false);
  });
});
