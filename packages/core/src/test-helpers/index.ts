import type { DateAdapter } from '../types.js';

/**
 * The single matcher the conformance suite needs. Structurally satisfied by
 * Vitest's / Jest's `expect`, so the suite stays framework-agnostic — the host
 * project injects its own `describe` / `it` / `expect`.
 */
export interface ConformanceExpect {
  (actual: unknown): { toBe(expected: unknown): void };
}

/** Test-framework primitives the conformance suite registers tests through. */
export interface ConformanceTestDeps {
  describe: (name: string, fn: () => void) => void;
  it: (name: string, fn: () => void) => void;
  expect: ConformanceExpect;
}

/**
 * Executable definition of the {@link DateAdapter} contract. Every adapter
 * (`@kalyx/adapter-date-fns`, and future dayjs/luxon/Temporal adapters) should
 * run this against its implementation to prove it satisfies the same UTC /
 * ISO-8601 semantics `@kalyx/core` relies on.
 *
 * Framework-agnostic: pass your runner's primitives in.
 *
 * @example
 * ```ts
 * import { describe, it, expect } from 'vitest';
 * import { runAdapterConformanceTests } from '@kalyx/core/test-helpers';
 * import { DateFnsAdapter } from '@kalyx/adapter-date-fns';
 *
 * runAdapterConformanceTests(DateFnsAdapter, { describe, it, expect });
 * ```
 */
export function runAdapterConformanceTests(adapter: DateAdapter, deps: ConformanceTestDeps): void {
  const { describe, it, expect } = deps;

  describe('DateAdapter conformance', () => {
    describe('parse', () => {
      it('expands a date-only string to UTC midnight', () => {
        expect(adapter.parse('2026-01-15')).toBe('2026-01-15T00:00:00.000Z');
      });
      it('returns an empty string for empty input', () => {
        expect(adapter.parse('')).toBe('');
      });
    });

    describe('format', () => {
      it('formats in UTC with yyyy-MM-dd HH:mm:ss tokens', () => {
        expect(adapter.format('2026-01-15T08:30:45.000Z', 'yyyy-MM-dd HH:mm:ss')).toBe(
          '2026-01-15 08:30:45',
        );
      });
      it('formats in the given IANA timezone', () => {
        // 08:30 UTC is 17:30 in Asia/Seoul (+9)
        expect(adapter.format('2026-01-15T08:30:00.000Z', 'yyyy-MM-dd HH:mm', 'Asia/Seoul')).toBe(
          '2026-01-15 17:30',
        );
      });
    });

    describe('addDays / addMonths / addYears', () => {
      it('adds and subtracts days across a month boundary', () => {
        expect(adapter.addDays('2026-01-31T00:00:00.000Z', 1)).toBe('2026-02-01T00:00:00.000Z');
        expect(adapter.addDays('2026-02-01T00:00:00.000Z', -1)).toBe('2026-01-31T00:00:00.000Z');
      });
      it('clamps addMonths onto a shorter target month', () => {
        // Jan 31 + 1 month → Feb 28 (2026 is not a leap year)
        expect(adapter.addMonths('2026-01-31T00:00:00.000Z', 1)).toBe('2026-02-28T00:00:00.000Z');
      });
      it('clamps addYears off a leap day', () => {
        expect(adapter.addYears('2024-02-29T00:00:00.000Z', 1)).toBe('2025-02-28T00:00:00.000Z');
      });
    });

    describe('isBefore / isAfter', () => {
      it('orders two instants and is false at equality', () => {
        expect(adapter.isBefore('2026-01-10T00:00:00.000Z', '2026-01-11T00:00:00.000Z')).toBe(true);
        expect(adapter.isAfter('2026-01-11T00:00:00.000Z', '2026-01-10T00:00:00.000Z')).toBe(true);
        expect(adapter.isBefore('2026-01-10T00:00:00.000Z', '2026-01-10T00:00:00.000Z')).toBe(
          false,
        );
        expect(adapter.isAfter('2026-01-10T00:00:00.000Z', '2026-01-10T00:00:00.000Z')).toBe(false);
      });
    });

    describe('isSameDay / isSameMonth', () => {
      it('compares the UTC civil day', () => {
        expect(adapter.isSameDay('2026-01-15T00:00:00.000Z', '2026-01-15T23:59:59.000Z')).toBe(
          true,
        );
        expect(adapter.isSameDay('2026-01-15T00:00:00.000Z', '2026-01-16T00:00:00.000Z')).toBe(
          false,
        );
      });
      it('compares the civil day in a timezone when given one', () => {
        // 18:00 and 20:00 UTC are both Jan 16 in Asia/Seoul (+9)
        expect(
          adapter.isSameDay('2026-01-15T18:00:00.000Z', '2026-01-15T20:00:00.000Z', 'Asia/Seoul'),
        ).toBe(true);
        // Same UTC day, but 14:00 vs 16:00 UTC straddle the Seoul midnight boundary
        expect(
          adapter.isSameDay('2026-01-15T14:00:00.000Z', '2026-01-15T16:00:00.000Z', 'Asia/Seoul'),
        ).toBe(false);
      });
      it('compares the UTC year and month', () => {
        expect(adapter.isSameMonth('2026-01-01T00:00:00.000Z', '2026-01-31T00:00:00.000Z')).toBe(
          true,
        );
        expect(adapter.isSameMonth('2026-01-31T00:00:00.000Z', '2026-02-01T00:00:00.000Z')).toBe(
          false,
        );
      });
    });

    describe('startOfDay / startOfMonth / endOfMonth', () => {
      it('truncates to UTC midnight', () => {
        expect(adapter.startOfDay('2026-01-15T08:30:00.000Z')).toBe('2026-01-15T00:00:00.000Z');
      });
      it('truncates to civil midnight in a timezone', () => {
        // Jan 15 18:00 UTC = Jan 16 03:00 Seoul → Seoul midnight = Jan 15 15:00 UTC
        expect(adapter.startOfDay('2026-01-15T18:00:00.000Z', 'Asia/Seoul')).toBe(
          '2026-01-15T15:00:00.000Z',
        );
      });
      it('returns the first instant of the month and the last of the month', () => {
        expect(adapter.startOfMonth('2026-01-15T08:00:00.000Z')).toBe('2026-01-01T00:00:00.000Z');
        // Feb 2026 has 28 days
        expect(adapter.endOfMonth('2026-02-15T00:00:00.000Z')).toBe('2026-02-28T23:59:59.999Z');
      });
    });

    describe('startOfWeek / endOfWeek', () => {
      it('honours weekStartsOn (Jan 15 2026 is a Thursday)', () => {
        expect(adapter.startOfWeek('2026-01-15T00:00:00.000Z', 0)).toBe('2026-01-11T00:00:00.000Z');
        expect(adapter.startOfWeek('2026-01-15T00:00:00.000Z', 1)).toBe('2026-01-12T00:00:00.000Z');
        expect(adapter.endOfWeek('2026-01-15T00:00:00.000Z', 0)).toBe('2026-01-17T23:59:59.999Z');
      });
    });

    describe('getYear / getMonth / getDate / getDay', () => {
      it('reads UTC fields (month 0-based, day 0=Sunday)', () => {
        const iso = '2026-01-15T08:00:00.000Z'; // Thursday
        expect(adapter.getYear(iso)).toBe(2026);
        expect(adapter.getMonth(iso)).toBe(0);
        expect(adapter.getDate(iso)).toBe(15);
        expect(adapter.getDay(iso)).toBe(4);
      });
    });

    describe('isValid', () => {
      it('accepts a real date and rejects empty / garbage', () => {
        expect(adapter.isValid('2026-01-15')).toBe(true);
        expect(adapter.isValid('')).toBe(false);
        expect(adapter.isValid('not-a-date')).toBe(false);
      });
    });

    describe('now / today', () => {
      it('today() is the UTC midnight of now()', () => {
        expect(adapter.isValid(adapter.now())).toBe(true);
        // today() must be the start-of-day of the current instant.
        expect(adapter.today()).toBe(adapter.startOfDay(adapter.now()));
        // …and therefore a UTC-midnight ISO string.
        expect(adapter.today().endsWith('T00:00:00.000Z')).toBe(true);
      });
    });
  });
}
