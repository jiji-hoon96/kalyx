import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { getWeekdayNames, getWeekStartForLocale, getMonthName } from '../utils/locale.js';

// Property-based hardening of the Intl-backed locale layer. Intl output itself
// is engine-dependent, so these assert only the *structural* invariants the
// callers rely on — count, ordering, non-emptiness, and the 0|1 codomain — over
// a spread of real BCP-47 tags rather than pinning one locale's exact strings.

const localeTag = () =>
  fc.constantFrom(
    'en-US',
    'en-GB',
    'ko-KR',
    'ja-JP',
    'de-DE',
    'fr-FR',
    'es-ES',
    'zh-CN',
    'ar-SA',
    'he-IL',
    'ru-RU',
    'pt-BR',
  );

const weekStart = () => fc.constantFrom<0 | 1>(0, 1);

describe('getWeekdayNames structure (property-based)', () => {
  it('always returns exactly 7 entries with non-empty short/full names', () => {
    fc.assert(
      fc.property(localeTag(), weekStart(), (locale, ws) => {
        const days = getWeekdayNames(locale, ws);
        expect(days).toHaveLength(7);
        for (const d of days) {
          expect(d.short.length).toBeGreaterThan(0);
          expect(d.full.length).toBeGreaterThan(0);
        }
      }),
    );
  });

  it('weekStartsOn=1 is the Sunday-first order rotated left by one', () => {
    fc.assert(
      fc.property(localeTag(), (locale) => {
        const sundayFirst = getWeekdayNames(locale, 0);
        const mondayFirst = getWeekdayNames(locale, 1);
        // Monday-first = [Mon..Sat, Sun] = sundayFirst[1..6] + sundayFirst[0].
        const rotated = [...sundayFirst.slice(1), sundayFirst[0]];
        expect(mondayFirst).toEqual(rotated);
      }),
    );
  });

  it('the two orderings are permutations of the same 7 names', () => {
    fc.assert(
      fc.property(localeTag(), (locale) => {
        const a = getWeekdayNames(locale, 0)
          .map((d) => d.full)
          .sort();
        const b = getWeekdayNames(locale, 1)
          .map((d) => d.full)
          .sort();
        expect(a).toEqual(b);
      }),
    );
  });
});

describe('getWeekStartForLocale codomain (property-based)', () => {
  it('always returns 0 or 1, for both known tags and arbitrary strings', () => {
    fc.assert(
      fc.property(fc.oneof(localeTag(), fc.string()), (locale) => {
        const result = getWeekStartForLocale(locale);
        expect(result === 0 || result === 1).toBe(true);
      }),
    );
  });

  it('is deterministic per locale (stable across repeated calls / cache)', () => {
    fc.assert(
      fc.property(localeTag(), (locale) => {
        expect(getWeekStartForLocale(locale)).toBe(getWeekStartForLocale(locale));
      }),
    );
  });
});

describe('getMonthName structure (property-based)', () => {
  it('returns a non-empty name for every month 0..11', () => {
    fc.assert(
      fc.property(localeTag(), fc.integer({ min: 0, max: 11 }), (locale, month) => {
        expect(getMonthName(month, locale).length).toBeGreaterThan(0);
      }),
    );
  });
});
