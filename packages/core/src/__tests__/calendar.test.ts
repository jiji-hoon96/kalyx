import { describe, it, expect } from 'vitest';
import {
  getCalendarDays,
  getISOWeekNumber,
  isDateDisabled,
  minDate,
  maxDate,
} from '../utils/calendar.js';
import { DateFnsAdapter } from '@kalyx/adapter-date-fns';

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

    const currentMonthDays = weeks.flat().filter((d) => d.isCurrentMonth);
    expect(currentMonthDays).toHaveLength(31);
  });

  it('returns 29 days for February 2024 (leap year)', () => {
    const weeks = getCalendarDays('2024-02-01T00:00:00.000Z', adapter);
    const currentMonthDays = weeks.flat().filter((d) => d.isCurrentMonth);
    expect(currentMonthDays).toHaveLength(29);
    expect(currentMonthDays[28]!.dayNumber).toBe(29);
  });

  it('returns 28 days for February 2026 (non-leap year)', () => {
    const weeks = getCalendarDays('2026-02-01T00:00:00.000Z', adapter);
    const currentMonthDays = weeks.flat().filter((d) => d.isCurrentMonth);
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
    const selectedDays = weeks.flat().filter((d) => d.isSelected);
    expect(selectedDays).toHaveLength(1);
    expect(selectedDays[0]!.dayNumber).toBe(15);
  });

  it('flags today correctly', () => {
    const today = '2026-01-20T00:00:00.000Z';
    const weeks = getCalendarDays('2026-01-01T00:00:00.000Z', adapter, {
      today,
    });
    const todayDays = weeks.flat().filter((d) => d.isToday);
    expect(todayDays).toHaveLength(1);
    expect(todayDays[0]!.dayNumber).toBe(20);
  });

  it('flags disabled dates correctly', () => {
    const weeks = getCalendarDays('2026-01-01T00:00:00.000Z', adapter, {
      disabled: [{ dayOfWeek: [0, 6] }],
    });
    const disabledDays = weeks.flat().filter((d) => d.isDisabled && d.isCurrentMonth);
    expect(disabledDays.length).toBeGreaterThan(0);
    for (const d of disabledDays) {
      const dayOfWeek = adapter.getDay(d.isoString);
      expect([0, 6]).toContain(dayOfWeek);
    }
  });

  it('includes leading and trailing days from adjacent months', () => {
    const weeks = getCalendarDays('2026-01-01T00:00:00.000Z', adapter);
    const outsideDays = weeks.flat().filter((d) => !d.isCurrentMonth);
    expect(outsideDays.length).toBeGreaterThan(0);
  });

  it('returns 4–6 weeks depending on the month', () => {
    // February 2026 (28 days, Sun start) fits in 5 weeks
    const feb2026 = getCalendarDays('2026-02-01T00:00:00.000Z', adapter);
    expect(feb2026.length).toBeGreaterThanOrEqual(4);
    expect(feb2026.length).toBeLessThanOrEqual(5);
  });

  it('always emits 6 weeks when fixedWeeks is true', () => {
    const fixed = getCalendarDays('2026-02-01T00:00:00.000Z', adapter, { fixedWeeks: true });
    expect(fixed).toHaveLength(6);
    for (const week of fixed) {
      expect(week).toHaveLength(7);
    }
  });

  it('fixedWeeks=true keeps total cell count at 42 even for short months', () => {
    const fixed = getCalendarDays('2026-02-01T00:00:00.000Z', adapter, { fixedWeeks: true });
    const totalCells = fixed.flat().length;
    expect(totalCells).toBe(42);
  });
});

describe('getISOWeekNumber', () => {
  // ISO 8601 week semantics: weeks start Monday; week 1 is the week containing
  // the year's first Thursday (equivalently, the week containing Jan 4).
  it('returns 1 for Jan 1 2026 (Thursday, in ISO week 1 of 2026)', () => {
    expect(getISOWeekNumber('2026-01-01T00:00:00.000Z')).toBe(1);
  });

  it('returns 53 for Dec 28 2026 (last full ISO week of 2026)', () => {
    expect(getISOWeekNumber('2026-12-28T00:00:00.000Z')).toBe(53);
  });

  it('returns 52 of the prior year for Jan 1 2023 (Sunday, anchored to 2022-W52)', () => {
    // Jan 1 2023 is a Sunday; the Thursday of its week is Dec 29 2022 → ISO week 52 of 2022
    expect(getISOWeekNumber('2023-01-01T00:00:00.000Z')).toBe(52);
  });

  it('returns 1 for Jan 4 of any year (Jan 4 is always in ISO week 1)', () => {
    expect(getISOWeekNumber('2024-01-04T00:00:00.000Z')).toBe(1);
    expect(getISOWeekNumber('2025-01-04T00:00:00.000Z')).toBe(1);
    expect(getISOWeekNumber('2026-01-04T00:00:00.000Z')).toBe(1);
  });

  it('handles the Feb 29 leap-day edge', () => {
    // Feb 29 2024 is a Thursday → ISO week 9 of 2024
    expect(getISOWeekNumber('2024-02-29T00:00:00.000Z')).toBe(9);
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

  it('compares before/after as pure UTC instants, not display-tz midnights (T-G1)', () => {
    // The {before}/{after} rules route through adapter.isBefore/isAfter, which
    // are raw instant comparisons (parseISO). isDateDisabled takes NO timezone
    // argument, so the boundary is the literal UTC instant — never the civil
    // midnight of any display timezone. This locks that documented semantics.
    const before = [{ before: '2026-06-17T00:00:00.000Z' as const }];

    // An instant strictly before the boundary → disabled.
    expect(isDateDisabled('2026-06-16T23:00:00.000Z', before, adapter)).toBe(true);
    // The boundary instant itself (equal) → NOT before → enabled.
    expect(isDateDisabled('2026-06-17T00:00:00.000Z', before, adapter)).toBe(false);
    // An instant after the boundary → enabled.
    expect(isDateDisabled('2026-06-17T01:00:00.000Z', before, adapter)).toBe(false);

    // Symmetric check for {after}: boundary is exclusive on the equal instant.
    const after = [{ after: '2026-06-17T00:00:00.000Z' as const }];
    expect(isDateDisabled('2026-06-17T01:00:00.000Z', after, adapter)).toBe(true);
    expect(isDateDisabled('2026-06-17T00:00:00.000Z', after, adapter)).toBe(false);
    expect(isDateDisabled('2026-06-16T23:00:00.000Z', after, adapter)).toBe(false);
  });

  it('honors a programmatic filter rule', () => {
    const holidays = new Set(['2026-01-01T00:00:00.000Z', '2026-12-25T00:00:00.000Z']);
    const rules = [{ filter: (iso: string) => holidays.has(iso) }];
    expect(isDateDisabled('2026-01-01T00:00:00.000Z', rules, adapter)).toBe(true);
    expect(isDateDisabled('2026-12-25T00:00:00.000Z', rules, adapter)).toBe(true);
    expect(isDateDisabled('2026-01-02T00:00:00.000Z', rules, adapter)).toBe(false);
  });

  it('combines filter with other rules (any match disables)', () => {
    const rules = [{ dayOfWeek: [0, 6] }, { filter: (iso: string) => iso.startsWith('2026-07') }];
    // 2026-07-15 = Wednesday — passes dayOfWeek, caught by filter
    expect(isDateDisabled('2026-07-15T00:00:00.000Z', rules, adapter)).toBe(true);
    // 2026-01-11 = Sunday — caught by dayOfWeek
    expect(isDateDisabled('2026-01-11T00:00:00.000Z', rules, adapter)).toBe(true);
    // 2026-01-12 = Monday, not July — neither rule matches
    expect(isDateDisabled('2026-01-12T00:00:00.000Z', rules, adapter)).toBe(false);
  });

  it('flags filter-disabled cells in the calendar grid', () => {
    // Disable every odd day of the month
    const weeks = getCalendarDays('2026-01-01T00:00:00.000Z', adapter, {
      disabled: [{ filter: (iso) => adapter.getDate(iso) % 2 === 1 }],
    });
    const currentMonthDays = weeks.flat().filter((d) => d.isCurrentMonth);
    for (const day of currentMonthDays) {
      if (day.dayNumber % 2 === 1) {
        expect(day.isDisabled).toBe(true);
      } else {
        expect(day.isDisabled).toBe(false);
      }
    }
  });
});

describe('minDate / maxDate', () => {
  it('returns the earlier date from minDate', () => {
    expect(minDate('2026-01-15T00:00:00.000Z', '2026-01-20T00:00:00.000Z', adapter)).toBe(
      '2026-01-15T00:00:00.000Z',
    );
  });

  it('returns the later date from maxDate', () => {
    expect(maxDate('2026-01-15T00:00:00.000Z', '2026-01-20T00:00:00.000Z', adapter)).toBe(
      '2026-01-20T00:00:00.000Z',
    );
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

    const start = allDays.find((d) => d.dayNumber === 10 && d.isCurrentMonth);
    const middle = allDays.find((d) => d.dayNumber === 12 && d.isCurrentMonth);
    const end = allDays.find((d) => d.dayNumber === 15 && d.isCurrentMonth);
    const outside = allDays.find((d) => d.dayNumber === 20 && d.isCurrentMonth);

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
    const day10 = allDays.find((d) => d.dayNumber === 10 && d.isCurrentMonth);
    const day15 = allDays.find((d) => d.dayNumber === 15 && d.isCurrentMonth);

    expect(day10?.isRangeStart).toBe(true);
    expect(day15?.isRangeEnd).toBe(true);
  });

  it('shows a preview range when only start is set and hover is provided', () => {
    const weeks = getCalendarDays('2026-01-01T00:00:00.000Z', adapter, {
      range: { start: '2026-01-10T00:00:00.000Z', end: null },
      rangeHover: '2026-01-15T00:00:00.000Z',
    });
    const allDays = weeks.flat();
    const day12 = allDays.find((d) => d.dayNumber === 12 && d.isCurrentMonth);
    expect(day12?.isInRange).toBe(true);
  });

  it('uses hover as the preview start when hover precedes the anchored start', () => {
    const weeks = getCalendarDays('2026-01-01T00:00:00.000Z', adapter, {
      range: { start: '2026-01-15T00:00:00.000Z', end: null },
      rangeHover: '2026-01-10T00:00:00.000Z',
    });
    const allDays = weeks.flat();
    const day12 = allDays.find((d) => d.dayNumber === 12 && d.isCurrentMonth);
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
    const day15 = allDays.find((d) => d.dayNumber === 15 && d.isCurrentMonth);
    expect(day15?.isRangeStart).toBe(true);
    expect(day15?.isRangeEnd).toBe(true);
    expect(day15?.isInRange).toBe(false);
  });
});

describe('isDateDisabled — {date} rule honors displayTimezone (M-4)', () => {
  it('matches a {date} rule by civil day in the given timezone', () => {
    // Grid cells iterate in UTC midnight; the picker emits civil-midnight-in-tz for
    // selections. A {date} rule supplied in that same civil form must still disable the
    // matching grid cell when a timezone is active.
    const gridCell = '2026-01-15T00:00:00.000Z'; // Asia/Seoul: Jan 15 09:00
    const rule = { date: '2026-01-14T15:00:00.000Z' }; // Asia/Seoul: Jan 15 00:00 (same civil day)
    expect(isDateDisabled(gridCell, [rule], adapter, 'Asia/Seoul')).toBe(true);
  });

  it('still compares by UTC day when no timezone is given (unchanged)', () => {
    const gridCell = '2026-01-15T00:00:00.000Z';
    const rule = { date: '2026-01-14T15:00:00.000Z' };
    expect(isDateDisabled(gridCell, [rule], adapter)).toBe(false);
    expect(
      isDateDisabled('2026-01-15T00:00:00.000Z', [{ date: '2026-01-15T00:00:00.000Z' }], adapter),
    ).toBe(true);
  });
});
