import { DateFnsAdapter } from '@kalyx/adapter-date-fns';
import type { DisabledRule } from '@kalyx/core';
import { describe, expect, it } from 'vitest';
import { resolveEnabledCalendarFocus } from './calendarFocus.js';

const A = DateFnsAdapter;
const day = (iso: string) => `${iso}T00:00:00.000Z`;

/** Disables every day of February 2026 and nothing else. */
const FEBRUARY_BLACKOUT: DisabledRule[] = [{ filter: (iso: string) => iso.startsWith('2026-02') }];
/** Sundays and Mondays. February 2026 starts on a Sunday, so Feb 3 is the first enabled day. */
const SUNDAYS_AND_MONDAYS: DisabledRule[] = [{ dayOfWeek: [0, 1] }];

describe('resolveEnabledCalendarFocus', () => {
  it('returns the coordinate untouched when it is already enabled', () => {
    expect(resolveEnabledCalendarFocus(day('2026-02-10'), [], A)).toBe(day('2026-02-10'));
  });

  describe("searchDirection: 'backward'", () => {
    it('picks the first enabled day inside the target month when the month is only partly disabled', () => {
      // Same answer 'forward' gives: navigating in either direction should land on
      // the same day when the month itself has an enabled day.
      expect(
        resolveEnabledCalendarFocus(
          day('2026-02-01'),
          SUNDAYS_AND_MONDAYS,
          A,
          undefined,
          'backward',
        ),
      ).toBe(day('2026-02-03'));
    });

    it('walks into the earlier month when the whole target month is disabled', () => {
      // Regression: 'forward' walked past the month the user came from, so the
      // "previous month" button became a permanent dead end.
      expect(
        resolveEnabledCalendarFocus(day('2026-02-01'), FEBRUARY_BLACKOUT, A, undefined, 'backward'),
      ).toBe(day('2026-01-31'));
    });

    it('keeps walking backward across several fully disabled months', () => {
      const janAndFebBlackout: DisabledRule[] = [
        { filter: (iso: string) => iso.startsWith('2026-01') || iso.startsWith('2026-02') },
      ];
      expect(
        resolveEnabledCalendarFocus(day('2026-02-01'), janAndFebBlackout, A, undefined, 'backward'),
      ).toBe(day('2025-12-31'));
    });

    it('falls back to the coordinate when nothing is enabled within a year', () => {
      const everything: DisabledRule[] = [{ filter: () => true }];
      expect(
        resolveEnabledCalendarFocus(day('2026-02-01'), everything, A, undefined, 'backward'),
      ).toBe(day('2026-02-01'));
    });
  });

  describe("searchDirection: 'forward'", () => {
    it('walks into the later month when the whole target month is disabled', () => {
      expect(
        resolveEnabledCalendarFocus(day('2026-02-01'), FEBRUARY_BLACKOUT, A, undefined, 'forward'),
      ).toBe(day('2026-03-01'));
    });

    it('never walks backward out of the target month', () => {
      expect(
        resolveEnabledCalendarFocus(
          day('2026-02-01'),
          SUNDAYS_AND_MONDAYS,
          A,
          undefined,
          'forward',
        ),
      ).toBe(day('2026-02-03'));
    });
  });

  describe("searchDirection: 'nearest' (default, used when opening)", () => {
    it('may reach backward for the closest enabled day', () => {
      expect(resolveEnabledCalendarFocus(day('2026-02-01'), SUNDAYS_AND_MONDAYS, A)).toBe(
        day('2026-01-31'),
      );
    });
  });
});
