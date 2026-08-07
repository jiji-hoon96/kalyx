import { describe, it, expect, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { civilMidnightFromUtcDay } from '@kalyx/core';
import { useMonthPicker } from './useMonthPicker.js';

const APR_2026 = '2026-04-15T00:00:00.000Z';

describe('useMonthPicker', () => {
  it('is null by default and honours defaultValue / controlled value', () => {
    expect(renderHook(() => useMonthPicker()).result.current.value).toBeNull();
    expect(renderHook(() => useMonthPicker({ defaultValue: APR_2026 })).result.current.value).toBe(
      APR_2026,
    );
    expect(renderHook(() => useMonthPicker({ value: APR_2026 })).result.current.value).toBe(
      APR_2026,
    );
  });

  it('exposes a 12-month grid for the viewed year with the value selected', () => {
    const { result } = renderHook(() => useMonthPicker({ value: APR_2026 }));
    expect(result.current.viewYear).toBe(2026);
    expect(result.current.months).toHaveLength(12);
    expect(result.current.months[0].label).toBe('January');
    expect(result.current.months[0].isoString).toBe('2026-01-01T00:00:00.000Z');
    // April (index 3) is selected
    expect(result.current.months[3].isSelected).toBe(true);
    expect(result.current.months[5].isSelected).toBe(false);
  });

  it('commits a month as the month-start ISO and closes', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useMonthPicker({ defaultValue: APR_2026, onChange }));
    act(() => result.current.open());
    act(() => result.current.selectMonth(result.current.months[5].isoString));
    expect(onChange).toHaveBeenCalledWith('2026-06-01T00:00:00.000Z');
    expect(result.current.value).toBe('2026-06-01T00:00:00.000Z');
    expect(result.current.isOpen).toBe(false);
  });

  it('navigates by year', () => {
    const { result } = renderHook(() => useMonthPicker({ value: APR_2026 }));
    act(() => result.current.nextYear());
    expect(result.current.viewYear).toBe(2027);
    act(() => result.current.previousYear());
    act(() => result.current.previousYear());
    expect(result.current.viewYear).toBe(2025);
  });

  it('marks a month fully excluded by a before-rule as disabled', () => {
    const { result } = renderHook(() =>
      useMonthPicker({ value: APR_2026, disabled: [{ before: '2026-04-01T00:00:00.000Z' }] }),
    );
    // Jan–Mar 2026 are entirely before the bound → disabled; April is not.
    expect(result.current.months[2].isDisabled).toBe(true);
    expect(result.current.months[3].isDisabled).toBe(false);
  });

  it('refuses to commit a month the grid reports as disabled', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useMonthPicker({
        value: APR_2026,
        onChange,
        disabled: [{ before: '2026-04-01T00:00:00.000Z' }],
      }),
    );
    act(() => result.current.open());
    // March 2026 is entirely before the bound — the grid marks it disabled.
    expect(result.current.months[2].isDisabled).toBe(true);

    act(() => result.current.selectMonth(result.current.months[2].isoString));

    expect(onChange).not.toHaveBeenCalled();
    expect(result.current.value).toBe(APR_2026);
    expect(result.current.isOpen).toBe(true);
  });

  it('still commits a month that is only partially disabled', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useMonthPicker({
        defaultValue: APR_2026,
        onChange,
        // The rule lands exactly on the coordinate the grid commits for June
        // (2026-06-01), so `isDateDisabled` would refuse it. A single-day rule
        // never disables a whole month, so the grid still renders June as
        // selectable — and the commit guard must agree rather than being
        // stricter. This is what makes the test discriminate between
        // `isRangeFullyDisabled` (correct) and `isDateDisabled` (too strict).
        disabled: [{ date: '2026-06-01T00:00:00.000Z' }, { dayOfWeek: [0, 1, 6] }],
      }),
    );
    act(() => result.current.open());
    expect(result.current.months[5].isDisabled).toBe(false);

    act(() => result.current.selectMonth(result.current.months[5].isoString));

    expect(onChange).toHaveBeenCalledWith('2026-06-01T00:00:00.000Z');
    expect(result.current.value).toBe('2026-06-01T00:00:00.000Z');
  });

  // Reproduction of record from the #193 review: under a large positive offset the
  // cell's civil range sits ~14h earlier than its UTC coordinates, so comparing raw
  // UTC coordinates against a civil-midnight bound left a fully out-of-range month
  // enabled — and therefore committable. Asserted for both offset signs because the
  // negative case passed by accident before the fix.
  it.each([
    ['Pacific/Kiritimati', 'a +14 zone'],
    ['Pacific/Niue', 'a -11 zone'],
  ])('respects a displayTimezone-aware bound in %s (%s)', (zone) => {
    const onChange = vi.fn();
    const bound = civilMidnightFromUtcDay('2026-01-01T00:00:00.000Z', zone);
    const { result } = renderHook(() =>
      useMonthPicker({
        defaultValue: '2026-03-01T00:00:00.000Z',
        onChange,
        displayTimezone: zone,
        disabled: [{ before: bound }],
      }),
    );
    act(() => result.current.previousYear());
    // December 2025 is entirely before civil Jan 1 in that zone.
    expect(result.current.months[11].isDisabled).toBe(true);

    act(() => result.current.selectMonth(result.current.months[11].isoString));
    expect(onChange).not.toHaveBeenCalled();

    // January 2026 opens exactly at the bound, so it must stay selectable.
    act(() => result.current.nextYear());
    expect(result.current.months[0].isDisabled).toBe(false);
  });

  it('toggles open state', () => {
    const { result } = renderHook(() => useMonthPicker());
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(false);
  });
});
