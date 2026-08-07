import { describe, expect, it } from 'vitest';
import { civilMidnightFromUtcDay } from '@kalyx/core';
import { DateFnsAdapter as adapter } from '@kalyx/adapter-date-fns';
import { isRangeFullyDisabled } from './grid-keyboard.js';

// A month/year cell is "fully disabled" only when a before/after bound excludes
// every instant in it. The range is half-open: [startInclusive, endExclusive).
const DEC_2025 = '2025-12-01T00:00:00.000Z';
const JAN_2026 = '2026-01-01T00:00:00.000Z';
const FEB_2026 = '2026-02-01T00:00:00.000Z';

describe('isRangeFullyDisabled — UTC semantics (no timezone)', () => {
  // Locks the path every existing user without `displayTimezone` rides. The
  // timezone support below is layered on top of this, and must not shift it.
  it('disables a month whose exclusive end is exactly the bound', () => {
    expect(isRangeFullyDisabled(DEC_2025, JAN_2026, [{ before: JAN_2026 }], adapter)).toBe(true);
  });

  it('keeps a month enabled when the bound falls one millisecond inside it', () => {
    const justInside = '2025-12-31T23:59:59.999Z';
    expect(isRangeFullyDisabled(DEC_2025, JAN_2026, [{ before: justInside }], adapter)).toBe(false);
  });

  it('keeps the month containing the bound enabled', () => {
    expect(
      isRangeFullyDisabled(JAN_2026, FEB_2026, [{ before: '2026-01-15T00:00:00.000Z' }], adapter),
    ).toBe(false);
  });

  it('mirrors the rules for `after`', () => {
    // February starts after Jan 31, so an `after: Jan 31` bound excludes all of it.
    expect(
      isRangeFullyDisabled(
        FEB_2026,
        '2026-03-01T00:00:00.000Z',
        [{ after: '2026-01-31T00:00:00.000Z' }],
        adapter,
      ),
    ).toBe(true);
    // January itself starts before the bound, so it survives.
    expect(
      isRangeFullyDisabled(JAN_2026, FEB_2026, [{ after: '2026-01-31T00:00:00.000Z' }], adapter),
    ).toBe(false);
  });

  it('ignores day-granular rules — they never exclude a whole period', () => {
    expect(
      isRangeFullyDisabled(
        DEC_2025,
        JAN_2026,
        [{ date: DEC_2025 }, { dayOfWeek: [0, 1, 2, 3, 4, 5, 6] }],
        adapter,
      ),
    ).toBe(false);
  });
});

describe('isRangeFullyDisabled — displayTimezone', () => {
  // Reproduction of record, from the #193 review. Under a large positive offset
  // the cell's civil range sits ~14h earlier than its UTC coordinates, so
  // comparing UTC coordinates against a civil-midnight bound left December 2025
  // enabled even though every instant in it precedes the bound.
  it('disables a period that is entirely before the bound in a +14 zone', () => {
    const zone = 'Pacific/Kiritimati';
    const bound = civilMidnightFromUtcDay(JAN_2026, zone); // 2025-12-31T10:00:00.000Z

    expect(isRangeFullyDisabled(DEC_2025, JAN_2026, [{ before: bound }], adapter, zone)).toBe(true);
  });

  it('disables a period that is entirely before the bound in a -11 zone', () => {
    // The opposite sign shifts the boundary the other way; a fix that only
    // satisfies the positive case skews this one.
    const zone = 'Pacific/Niue';
    const bound = civilMidnightFromUtcDay(JAN_2026, zone);

    expect(isRangeFullyDisabled(DEC_2025, JAN_2026, [{ before: bound }], adapter, zone)).toBe(true);
  });

  it.each(['Pacific/Kiritimati', 'Pacific/Niue', 'Asia/Seoul', 'America/New_York', 'UTC'])(
    'keeps the period containing the bound enabled in %s',
    (zone) => {
      const bound = civilMidnightFromUtcDay('2025-12-15T00:00:00.000Z', zone);
      expect(isRangeFullyDisabled(DEC_2025, JAN_2026, [{ before: bound }], adapter, zone)).toBe(
        false,
      );
    },
  );

  it.each(['Pacific/Kiritimati', 'Pacific/Niue', 'Asia/Seoul', 'America/New_York'])(
    'does not disable the period immediately after the bound in %s',
    (zone) => {
      // January must survive a bound at its own civil start — the bound is
      // inclusive of the period it opens.
      const bound = civilMidnightFromUtcDay(JAN_2026, zone);
      expect(isRangeFullyDisabled(JAN_2026, FEB_2026, [{ before: bound }], adapter, zone)).toBe(
        false,
      );
    },
  );

  it('mirrors `after` across both offset signs', () => {
    for (const zone of ['Pacific/Kiritimati', 'Pacific/Niue']) {
      const bound = civilMidnightFromUtcDay('2026-01-31T00:00:00.000Z', zone);
      // February is wholly after Jan 31 in that zone.
      expect(
        isRangeFullyDisabled(
          FEB_2026,
          '2026-03-01T00:00:00.000Z',
          [{ after: bound }],
          adapter,
          zone,
        ),
      ).toBe(true);
      // January contains the bound, so it is not wholly after it.
      expect(isRangeFullyDisabled(JAN_2026, FEB_2026, [{ after: bound }], adapter, zone)).toBe(
        false,
      );
    }
  });
});
