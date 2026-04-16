import { describe, it, expect } from 'vitest';
import { getCalendarDays, isDateDisabled, minDate, maxDate } from '../utils/calendar.js';
import { DateFnsAdapter } from '../adapters/date-fns.js';

const adapter = DateFnsAdapter;

describe('getCalendarDays — basic month grid', () => {
  it('builds the calendar for January 2026 correctly', () => {
    const weeks = getCalendarDays('2026-01-01T00:00:00.000Z', adapter);
    // January 2026 starts on Thursday (week starts on Sunday)
    expect(weeks.length).toBeGreaterThanOrEqual(4);
    expect(weeks.length).toBeLessThanOrEqual(6);

    for (const week of weeks) {
      expect(week).toHaveLength(7);
    }

    const currentMonthDays = weeks.flat().filter(d => d.isCurrentMonth);
    expect(currentMonthDays).toHaveLength(31);
  });

  it('returns 29 days for February 2024 (leap year)', () => {
    const weeks = getCalendarDays('2024-02-01T00:00:00.000Z', adapter);
    const currentMonthDays = weeks.flat().filter(d => d.isCurrentMonth);
    expect(currentMonthDays).toHaveLength(29);
    expect(currentMonthDays[28]!.dayNumber).toBe(29);
  });

  it('returns 28 days for February 2026 (non-leap year)', () => {
    const weeks = getCalendarDays('2026-02-01T00:00:00.000Z', adapter);
    const currentMonthDays = weeks.flat().filter(d => d.isCurrentMonth);
    expect(currentMonthDays).toHaveLength(28);
  });

  it('supports configuring the week to start on Monday', () => {
    const weeks = getCalendarDays('2026-01-01T00:00:00.000Z', adapter, {
      weekStartsOn: 1,
    });
    // First day of the first row must be Monday
    const firstDay = weeks[0]![0]!;
    expect(adapter.getDay(firstDay.isoString)).toBe(1);
  });

  it('flags the selected date correctly', () => {
    const selected = '2026-01-15T00:00:00.000Z';
    const weeks = getCalendarDays('2026-01-01T00:00:00.000Z', adapter, {
      selected,
    });
    const selectedDays = weeks.flat().filter(d => d.isSelected);
    expect(selectedDays).toHaveLength(1);
    expect(selectedDays[0]!.dayNumber).toBe(15);
  });

  it('flags today correctly', () => {
    const today = '2026-01-20T00:00:00.000Z';
    const weeks = getCalendarDays('2026-01-01T00:00:00.000Z', adapter, {
      today,
    });
    const todayDays = weeks.flat().filter(d => d.isToday);
    expect(todayDays).toHaveLength(1);
    expect(todayDays[0]!.dayNumber).toBe(20);
  });

  it('flags disabled dates correctly', () => {
    const weeks = getCalendarDays('2026-01-01T00:00:00.000Z', adapter, {
      disabled: [{ dayOfWeek: [0, 6] }],
    });
    const disabledDays = weeks.flat().filter(d => d.isDisabled && d.isCurrentMonth);
    expect(disabledDays.length).toBeGreaterThan(0);
    for (const d of disabledDays) {
      const dayOfWeek = adapter.getDay(d.isoString);
      expect([0, 6]).toContain(dayOfWeek);
    }
  });

  it('includes leading and trailing days from adjacent months', () => {
    const weeks = getCalendarDays('2026-01-01T00:00:00.000Z', adapter);
    const outsideDays = weeks.flat().filter(d => !d.isCurrentMonth);
    expect(outsideDays.length).toBeGreaterThan(0);
  });
});

describe('isDateDisabled — combined rules', () => {
  it('disables dates earlier than the before rule', () => {
    const rules = [{ before: '2026-01-10T00:00:00.000Z' as const }];
    expect(isDateDisabled('2026-01-09T00:00:00.000Z', rules, adapter)).toBe(true);
    expect(isDateDisabled('2026-01-10T00:00:00.000Z', rules, adapter)).toBe(false);
    expect(isDateDisabled('2026-01-11T00:00:00.000Z', rules, adapter)).toBe(false);
  });

  it('disables dates later than the after rule', () => {
    const rules = [{ after: '2026-01-20T00:00:00.000Z' as const }];
    expect(isDateDisabled('2026-01-21T00:00:00.000Z', rules, adapter)).toBe(true);
    expect(isDateDisabled('2026-01-20T00:00:00.000Z', rules, adapter)).toBe(false);
    expect(isDateDisabled('2026-01-19T00:00:00.000Z', rules, adapter)).toBe(false);
  });

  it('disables a specific date', () => {
    const rules = [{ date: '2026-01-15T00:00:00.000Z' as const }];
    expect(isDateDisabled('2026-01-15T00:00:00.000Z', rules, adapter)).toBe(true);
    expect(isDateDisabled('2026-01-14T00:00:00.000Z', rules, adapter)).toBe(false);
  });

  it('disables weekends via the dayOfWeek rule', () => {
    const rules = [{ dayOfWeek: [0, 6] }];
    // 2026-01-11 = Sunday
    expect(isDateDisabled('2026-01-11T00:00:00.000Z', rules, adapter)).toBe(true);
    // 2026-01-10 = Saturday
    expect(isDateDisabled('2026-01-10T00:00:00.000Z', rules, adapter)).toBe(true);
    // 2026-01-12 = Monday
    expect(isDateDisabled('2026-01-12T00:00:00.000Z', rules, adapter)).toBe(false);
  });

  it('applies multiple rules together', () => {
    const rules = [
      { before: '2026-01-10T00:00:00.000Z' as const },
      { date: '2026-01-15T00:00:00.000Z' as const },
      { dayOfWeek: [0] },
    ];
    expect(isDateDisabled('2026-01-09T00:00:00.000Z', rules, adapter)).toBe(true);
    expect(isDateDisabled('2026-01-15T00:00:00.000Z', rules, adapter)).toBe(true);
    expect(isDateDisabled('2026-01-11T00:00:00.000Z', rules, adapter)).toBe(true); // Sunday
    expect(isDateDisabled('2026-01-12T00:00:00.000Z', rules, adapter)).toBe(false); // Monday, within range
  });

  it('treats an empty rules array as all dates enabled', () => {
    expect(isDateDisabled('2026-01-15T00:00:00.000Z', [], adapter)).toBe(false);
  });
});

describe('minDate / maxDate', () => {
  it('returns the earlier date from minDate', () => {
    expect(
      minDate('2026-01-15T00:00:00.000Z', '2026-01-20T00:00:00.000Z', adapter),
    ).toBe('2026-01-15T00:00:00.000Z');
  });

  it('returns the later date from maxDate', () => {
    expect(
      maxDate('2026-01-15T00:00:00.000Z', '2026-01-20T00:00:00.000Z', adapter),
    ).toBe('2026-01-20T00:00:00.000Z');
  });
});

describe('getCalendarDays — range handling', () => {
  it('leaves every range flag false when no range is provided', () => {
    const weeks = getCalendarDays('2026-01-01T00:00:00.000Z', adapter);
    const allDays = weeks.flat();
    for (const day of allDays) {
      expect(day.isRangeStart).toBe(false);
      expect(day.isRangeEnd).toBe(false);
      expect(day.isInRange).toBe(false);
    }
  });

  it('marks start, in-range, and end correctly when both bounds are set', () => {
    const weeks = getCalendarDays('2026-01-01T00:00:00.000Z', adapter, {
      range: {
        start: '2026-01-10T00:00:00.000Z',
        end: '2026-01-15T00:00:00.000Z',
      },
    });
    const allDays = weeks.flat();

    const start = allDays.find(d => d.dayNumber === 10 && d.isCurrentMonth);
    const middle = allDays.find(d => d.dayNumber === 12 && d.isCurrentMonth);
    const end = allDays.find(d => d.dayNumber === 15 && d.isCurrentMonth);
    const outside = allDays.find(d => d.dayNumber === 20 && d.isCurrentMonth);

    expect(start?.isRangeStart).toBe(true);
    expect(start?.isRangeEnd).toBe(false);
    expect(start?.isInRange).toBe(false);

    expect(middle?.isRangeStart).toBe(false);
    expect(middle?.isRangeEnd).toBe(false);
    expect(middle?.isInRange).toBe(true);

    expect(end?.isRangeStart).toBe(false);
    expect(end?.isRangeEnd).toBe(true);
    expect(end?.isInRange).toBe(false);

    expect(outside?.isRangeStart).toBe(false);
    expect(outside?.isRangeEnd).toBe(false);
    expect(outside?.isInRange).toBe(false);
  });

  it('auto-sorts when start comes after end', () => {
    const weeks = getCalendarDays('2026-01-01T00:00:00.000Z', adapter, {
      range: {
        start: '2026-01-15T00:00:00.000Z',
        end: '2026-01-10T00:00:00.000Z',
      },
    });
    const allDays = weeks.flat();
    const day10 = allDays.find(d => d.dayNumber === 10 && d.isCurrentMonth);
    const day15 = allDays.find(d => d.dayNumber === 15 && d.isCurrentMonth);

    expect(day10?.isRangeStart).toBe(true);
    expect(day15?.isRangeEnd).toBe(true);
  });

  it('shows a preview range when only start is set and hover is provided', () => {
    const weeks = getCalendarDays('2026-01-01T00:00:00.000Z', adapter, {
      range: { start: '2026-01-10T00:00:00.000Z', end: null },
      rangeHover: '2026-01-15T00:00:00.000Z',
    });
    const allDays = weeks.flat();
    const day12 = allDays.find(d => d.dayNumber === 12 && d.isCurrentMonth);
    expect(day12?.isInRange).toBe(true);
  });

  it('uses hover as the preview start when hover precedes the anchored start', () => {
    const weeks = getCalendarDays('2026-01-01T00:00:00.000Z', adapter, {
      range: { start: '2026-01-15T00:00:00.000Z', end: null },
      rangeHover: '2026-01-10T00:00:00.000Z',
    });
    const allDays = weeks.flat();
    const day12 = allDays.find(d => d.dayNumber === 12 && d.isCurrentMonth);
    expect(day12?.isInRange).toBe(true);
  });

  it('handles range start equal to end (single date)', () => {
    const weeks = getCalendarDays('2026-01-01T00:00:00.000Z', adapter, {
      range: {
        start: '2026-01-15T00:00:00.000Z',
        end: '2026-01-15T00:00:00.000Z',
      },
    });
    const allDays = weeks.flat();
    const day15 = allDays.find(d => d.dayNumber === 15 && d.isCurrentMonth);
    expect(day15?.isRangeStart).toBe(true);
    expect(day15?.isRangeEnd).toBe(true);
    expect(day15?.isInRange).toBe(false);
  });
});
