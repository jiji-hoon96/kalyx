import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { getCalendarDays, getISOWeekNumber, minDate, maxDate } from '../utils/calendar.js';
import { normalizeISO, parseInputValue } from '../utils/date.js';
import { DateFnsAdapter } from '@kalyx/adapter-date-fns';
import type { WeekStartsOn } from '../types.js';

// Property-based hardening of the calendar-grid + date-parsing layer, the
// second leg of the "timezone -> calendar -> date" sweep (timezone.property
// covers the first). Invariants must hold across thousands of months, zones,
// and week-start configs where example tests only pin a handful.

const adapter = DateFnsAdapter;

const monthAnchor = () =>
  fc
    .record({ year: fc.integer({ min: 1970, max: 2060 }), month: fc.integer({ min: 1, max: 12 }) })
    .map(
      ({ year, month }) =>
        `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-01T00:00:00.000Z`,
    );

const weekStart = () => fc.integer({ min: 0, max: 6 });

const isoInstant = () =>
  fc
    .date({
      min: new Date('1970-01-01T00:00:00.000Z'),
      max: new Date('2060-01-01T00:00:00.000Z'),
      noInvalidDate: true,
    })
    .map((d) => d.toISOString());

const dateOnly = () =>
  fc
    .record({
      year: fc.integer({ min: 1970, max: 2060 }),
      month: fc.integer({ min: 1, max: 12 }),
      day: fc.integer({ min: 1, max: 28 }),
    })
    .map(
      ({ year, month, day }) =>
        `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    );

const daysInMonth = (year: number, month: number) =>
  new Date(Date.UTC(year, month, 0)).getUTCDate();

const RUNS = { numRuns: 300 };

describe('getCalendarDays invariants (property-based)', () => {
  it('produces 4-6 weeks of exactly 7 consecutive days starting on weekStartsOn', () => {
    fc.assert(
      fc.property(monthAnchor(), weekStart(), (monthISO, ws) => {
        const grid = getCalendarDays(monthISO, adapter, { weekStartsOn: ws as WeekStartsOn });
        expect(grid.length).toBeGreaterThanOrEqual(4);
        expect(grid.length).toBeLessThanOrEqual(6);
        for (const week of grid) expect(week).toHaveLength(7);

        const flat = grid.flat();
        expect(adapter.getDay(flat[0].isoString)).toBe(ws);
        for (let i = 1; i < flat.length; i++) {
          expect(adapter.addDays(flat[i - 1].isoString, 1)).toBe(flat[i].isoString);
        }
      }),
      RUNS,
    );
  });

  it('marks exactly the target month as isCurrentMonth', () => {
    fc.assert(
      fc.property(monthAnchor(), weekStart(), (monthISO, ws) => {
        const flat = getCalendarDays(monthISO, adapter, {
          weekStartsOn: ws as WeekStartsOn,
        }).flat();
        const inMonth = flat.filter((d) => d.isCurrentMonth);
        const year = Number(monthISO.slice(0, 4));
        const month = Number(monthISO.slice(5, 7));
        expect(inMonth.length).toBe(daysInMonth(year, month));
        for (const d of inMonth) {
          expect(d.isoString.slice(0, 7)).toBe(monthISO.slice(0, 7));
        }
      }),
      RUNS,
    );
  });

  it('renders exactly 6 weeks (42 cells) when fixedWeeks is set', () => {
    fc.assert(
      fc.property(monthAnchor(), weekStart(), (monthISO, ws) => {
        const grid = getCalendarDays(monthISO, adapter, {
          weekStartsOn: ws as WeekStartsOn,
          fixedWeeks: true,
        });
        expect(grid).toHaveLength(6);
        expect(grid.flat()).toHaveLength(42);
      }),
      RUNS,
    );
  });
});

describe('getISOWeekNumber invariants (property-based)', () => {
  it('always returns a week in 1..53', () => {
    fc.assert(
      fc.property(isoInstant(), (iso) => {
        const wk = getISOWeekNumber(iso);
        expect(wk).toBeGreaterThanOrEqual(1);
        expect(wk).toBeLessThanOrEqual(53);
      }),
      RUNS,
    );
  });

  it('is constant across the seven days Mon..Sun of one ISO week', () => {
    fc.assert(
      fc.property(isoInstant(), (iso) => {
        const monday = adapter.startOfWeek(iso, 1); // ISO weeks start Monday
        const wk = getISOWeekNumber(monday);
        for (let i = 0; i < 7; i++) {
          expect(getISOWeekNumber(adapter.addDays(monday, i))).toBe(wk);
        }
      }),
      RUNS,
    );
  });
});

describe('minDate / maxDate invariants (property-based)', () => {
  it('partition the inputs and order them (min <= max, commutative)', () => {
    fc.assert(
      fc.property(isoInstant(), isoInstant(), (a, b) => {
        const lo = minDate(a, b, adapter);
        const hi = maxDate(a, b, adapter);
        expect(new Set([lo, hi])).toEqual(new Set([a, b]));
        expect(adapter.isAfter(lo, hi)).toBe(false);
        expect(minDate(a, b, adapter)).toBe(minDate(b, a, adapter));
        expect(maxDate(a, b, adapter)).toBe(maxDate(b, a, adapter));
      }),
      RUNS,
    );
  });
});

describe('normalizeISO / parseInputValue invariants (property-based)', () => {
  it('normalizeISO is idempotent over arbitrary strings', () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        expect(normalizeISO(normalizeISO(s))).toBe(normalizeISO(s));
      }),
      RUNS,
    );
  });

  it('normalizeISO expands a date-only string to a valid UTC midnight instant', () => {
    fc.assert(
      fc.property(dateOnly(), (ds) => {
        const n = normalizeISO(ds);
        expect(n).toBe(`${ds}T00:00:00.000Z`);
        expect(adapter.isValid(n)).toBe(true);
      }),
      RUNS,
    );
  });

  it('parseInputValue accepts the dashed, slashed, and 8-digit forms identically', () => {
    fc.assert(
      fc.property(dateOnly(), (ds) => {
        const expected = normalizeISO(ds);
        expect(parseInputValue(ds, adapter)).toBe(expected);
        expect(parseInputValue(ds.replace(/-/g, '/'), adapter)).toBe(expected);
        expect(parseInputValue(ds.replace(/-/g, ''), adapter)).toBe(expected);
      }),
      RUNS,
    );
  });
});

describe('Europe/London month navigation across the 2026-03-29 DST boundary (T-R1)', () => {
  it('keeps grid day iteration continuous across spring-forward', () => {
    const flat = getCalendarDays('2026-03-15T00:00:00.000Z', adapter, {
      weekStartsOn: 1,
      timezone: 'Europe/London',
    }).flat();
    const idx = flat.findIndex((d) => d.isoString.startsWith('2026-03-29'));
    expect(idx).toBeGreaterThan(0);
    expect(flat[idx - 1].isoString).toBe('2026-03-28T00:00:00.000Z');
    expect(flat[idx + 1].isoString).toBe('2026-03-30T00:00:00.000Z');
    // March keeps all 31 civil days regardless of the lost wall-clock hour.
    expect(flat.filter((d) => d.isCurrentMonth)).toHaveLength(31);
  });

  it('addMonths round-trips across the boundary month', () => {
    const april = adapter.addMonths('2026-03-01T00:00:00.000Z', 1);
    expect(april.startsWith('2026-04-01')).toBe(true);
    expect(adapter.addMonths(april, -1).startsWith('2026-03-01')).toBe(true);
  });
});
