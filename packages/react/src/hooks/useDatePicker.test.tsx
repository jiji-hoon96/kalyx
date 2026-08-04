import { describe, it, expect, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useDatePicker } from './useDatePicker.js';

const ISO_2026_04_15 = '2026-04-15T00:00:00.000Z';
const ISO_2026_04_16 = '2026-04-16T00:00:00.000Z';

describe('useDatePicker — controlled / uncontrolled', () => {
  it('returns null value when neither value nor defaultValue is provided', () => {
    const { result } = renderHook(() => useDatePicker());
    expect(result.current.value).toBeNull();
  });

  it('uses defaultValue in uncontrolled mode', () => {
    const { result } = renderHook(() => useDatePicker({ defaultValue: ISO_2026_04_15 }));
    expect(result.current.value).toBe(ISO_2026_04_15);
  });

  it('uses controlled value when provided', () => {
    const { result } = renderHook(() => useDatePicker({ value: ISO_2026_04_15 }));
    expect(result.current.value).toBe(ISO_2026_04_15);
  });

  it('updates internal state on selectDate in uncontrolled mode', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useDatePicker({ onChange }));

    act(() => result.current.selectDate(ISO_2026_04_15));

    expect(result.current.value).toBe(ISO_2026_04_15);
    expect(onChange).toHaveBeenCalledWith(ISO_2026_04_15);
  });

  it('does not update internal state on selectDate in controlled mode', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useDatePicker({ value: ISO_2026_04_15, onChange }));

    act(() => result.current.selectDate(ISO_2026_04_16));

    expect(result.current.value).toBe(ISO_2026_04_15);
    expect(onChange).toHaveBeenCalledWith(ISO_2026_04_16);
  });

  it('accepts null via selectDate to clear the value', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useDatePicker({ defaultValue: ISO_2026_04_15, onChange }));

    act(() => result.current.selectDate(null));

    expect(result.current.value).toBeNull();
    expect(onChange).toHaveBeenCalledWith(null);
  });
});

describe('useDatePicker — popover state', () => {
  it('starts closed', () => {
    const { result } = renderHook(() => useDatePicker());
    expect(result.current.isOpen).toBe(false);
  });

  it('opens via open() and closes via close()', () => {
    const { result } = renderHook(() => useDatePicker());

    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });

  it('toggle flips isOpen', () => {
    const { result } = renderHook(() => useDatePicker());

    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(false);
  });

  it('closes popover after selectDate', () => {
    const { result } = renderHook(() => useDatePicker());

    act(() => result.current.open());
    act(() => result.current.selectDate(ISO_2026_04_15));

    expect(result.current.isOpen).toBe(false);
  });

  it('focuses current value (or today) when opening', () => {
    const { result } = renderHook(() => useDatePicker({ defaultValue: ISO_2026_04_15 }));

    act(() => result.current.open());

    expect(result.current.focusedDate).toBe(ISO_2026_04_15);
    expect(result.current.viewMonth).toBe(ISO_2026_04_15);
  });
});

describe('useDatePicker — navigation', () => {
  it('previousMonth moves viewMonth back one month', () => {
    const { result } = renderHook(() => useDatePicker({ defaultValue: ISO_2026_04_15 }));

    const initialMonth = result.current.viewMonth;

    act(() => result.current.previousMonth());

    const previous = result.current.adapter.addMonths(initialMonth, -1);
    expect(result.current.adapter.isSameMonth(result.current.viewMonth, previous)).toBe(true);
  });

  it('nextMonth moves viewMonth forward one month', () => {
    const { result } = renderHook(() => useDatePicker({ defaultValue: ISO_2026_04_15 }));

    const initialMonth = result.current.viewMonth;

    act(() => result.current.nextMonth());

    const next = result.current.adapter.addMonths(initialMonth, 1);
    expect(result.current.adapter.isSameMonth(result.current.viewMonth, next)).toBe(true);
  });

  it('setViewMonth updates viewMonth directly', () => {
    const { result } = renderHook(() => useDatePicker());

    act(() => result.current.setViewMonth(ISO_2026_04_15));

    expect(result.current.adapter.isSameMonth(result.current.viewMonth, ISO_2026_04_15)).toBe(true);
  });

  it('setFocusedDate updates focusedDate directly', () => {
    const { result } = renderHook(() => useDatePicker());

    act(() => result.current.setFocusedDate(ISO_2026_04_16));

    expect(result.current.focusedDate).toBe(ISO_2026_04_16);
  });
});

describe('useDatePicker — calendar grid', () => {
  it('returns a grid of 7-day weeks covering the month', () => {
    const { result } = renderHook(() => useDatePicker({ defaultValue: ISO_2026_04_15 }));

    expect(result.current.calendar.length).toBeGreaterThanOrEqual(4);
    expect(result.current.calendar.length).toBeLessThanOrEqual(6);
    result.current.calendar.forEach((week) => {
      expect(week).toHaveLength(7);
    });
  });

  it('marks the selected value in the grid', () => {
    const { result } = renderHook(() => useDatePicker({ defaultValue: ISO_2026_04_15 }));

    const selected = result.current.calendar.flat().filter((d) => d.isSelected);
    expect(selected).toHaveLength(1);
    expect(selected[0].isoString).toBe(ISO_2026_04_15);
  });

  it('respects disabled rules', () => {
    const { result } = renderHook(() =>
      useDatePicker({
        defaultValue: ISO_2026_04_15,
        disabled: [{ date: ISO_2026_04_16 }],
      }),
    );

    const disabled = result.current.calendar.flat().find((d) => d.isoString === ISO_2026_04_16);
    expect(disabled?.isDisabled).toBe(true);
  });

  it('respects weekStartsOn=1 (Monday)', () => {
    const { result } = renderHook(() =>
      useDatePicker({ defaultValue: ISO_2026_04_15, weekStartsOn: 1 }),
    );

    const firstDayOfFirstWeek = result.current.calendar[0][0];
    const dayOfWeek = result.current.adapter.getDay(firstDayOfFirstWeek.isoString);
    expect(dayOfWeek).toBe(1);
  });
});

describe('useDatePicker — stable IDs', () => {
  it('produces a stable pickerId across renders', () => {
    const { result, rerender } = renderHook(() => useDatePicker());

    const firstId = result.current.pickerId;
    rerender();

    expect(result.current.pickerId).toBe(firstId);
  });
});

describe('useDatePicker — timezone and constraint parity', () => {
  it('opens with an enabled focus coordinate when the controlled value is disabled', () => {
    const { result } = renderHook(() =>
      useDatePicker({
        value: '2026-01-17T00:00:00.000Z',
        disabled: [{ dayOfWeek: [0, 6] }],
      }),
    );

    act(() => result.current.open());

    expect(result.current.focusedDate).toBe('2026-01-01T00:00:00.000Z');
  });

  it.each([
    {
      name: 'Seoul',
      timezone: 'Asia/Seoul',
      value: '2025-12-31T15:00:00.000Z',
      coordinate: '2026-01-01T00:00:00.000Z',
    },
    {
      name: 'New York',
      timezone: 'America/New_York',
      value: '2026-01-15T05:00:00.000Z',
      coordinate: '2026-01-15T00:00:00.000Z',
    },
  ])(
    'uses $name civil-day coordinates for initial and opened view/focus',
    ({ timezone, value, coordinate }) => {
      const { result } = renderHook(() =>
        useDatePicker({ defaultValue: value, displayTimezone: timezone }),
      );

      expect(result.current.viewMonth).toBe(coordinate);
      expect(result.current.focusedDate).toBe(coordinate);

      act(() => result.current.open());

      expect(result.current.viewMonth).toBe(coordinate);
      expect(result.current.focusedDate).toBe(coordinate);
    },
  );

  it.each([
    { name: 'exact date', rule: { date: '2026-01-15T05:00:00.000Z' } },
    { name: 'day of week', rule: { dayOfWeek: [4] } },
    { name: 'before instant', rule: { before: '2026-01-15T06:00:00.000Z' } },
    { name: 'after instant', rule: { after: '2026-01-15T04:00:00.000Z' } },
    { name: 'filter', rule: { filter: (iso: string) => iso === '2026-01-15T05:00:00.000Z' } },
  ])('rejects a $name rule at the final mutation boundary', ({ rule }) => {
    const onChange = vi.fn();
    const initial = '2026-01-14T05:00:00.000Z';
    const { result } = renderHook(() =>
      useDatePicker({
        defaultValue: initial,
        displayTimezone: 'America/New_York',
        disabled: [rule],
        onChange,
      }),
    );

    act(() => result.current.open());
    act(() => result.current.selectDate('2026-01-15T00:00:00.000Z'));

    expect(result.current.value).toBe(initial);
    expect(result.current.isOpen).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
  });
});
