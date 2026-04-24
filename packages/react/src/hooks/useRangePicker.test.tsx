import { describe, it, expect, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useRangePicker } from './useRangePicker.js';

const ISO_APR_10 = '2026-04-10T00:00:00.000Z';
const ISO_APR_15 = '2026-04-15T00:00:00.000Z';
const ISO_APR_20 = '2026-04-20T00:00:00.000Z';
const EMPTY = { start: null, end: null };

describe('useRangePicker — controlled / uncontrolled', () => {
  it('starts with an empty range when no values are provided', () => {
    const { result } = renderHook(() => useRangePicker());
    expect(result.current.value).toEqual(EMPTY);
  });

  it('uses defaultValue in uncontrolled mode', () => {
    const { result } = renderHook(() =>
      useRangePicker({ defaultValue: { start: ISO_APR_10, end: ISO_APR_20 } }),
    );
    expect(result.current.value).toEqual({ start: ISO_APR_10, end: ISO_APR_20 });
  });

  it('uses controlled value when provided', () => {
    const { result } = renderHook(() =>
      useRangePicker({ value: { start: ISO_APR_10, end: ISO_APR_20 } }),
    );
    expect(result.current.value).toEqual({ start: ISO_APR_10, end: ISO_APR_20 });
  });
});

describe('useRangePicker — selection flow', () => {
  it('first click sets start, second click sets end', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useRangePicker({ onChange }));

    act(() => result.current.selectDate(ISO_APR_10));
    expect(result.current.value).toEqual({ start: ISO_APR_10, end: null });
    expect(result.current.selectingTarget).toBe('end');

    act(() => result.current.selectDate(ISO_APR_20));
    expect(result.current.value).toEqual({ start: ISO_APR_10, end: ISO_APR_20 });
    expect(result.current.selectingTarget).toBe('start');

    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('swaps start/end when the second click is before the first', () => {
    const { result } = renderHook(() => useRangePicker());

    act(() => result.current.selectDate(ISO_APR_20));
    act(() => result.current.selectDate(ISO_APR_10));

    expect(result.current.value).toEqual({ start: ISO_APR_10, end: ISO_APR_20 });
  });

  it('closes popover after completing a range', () => {
    const { result } = renderHook(() => useRangePicker());

    act(() => result.current.open());
    act(() => result.current.selectDate(ISO_APR_10));
    act(() => result.current.selectDate(ISO_APR_20));

    expect(result.current.isOpen).toBe(false);
  });

  it('setRange replaces the entire range atomically', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useRangePicker({ onChange }));

    act(() => result.current.setRange({ start: ISO_APR_10, end: ISO_APR_20 }));

    expect(result.current.value).toEqual({ start: ISO_APR_10, end: ISO_APR_20 });
    expect(onChange).toHaveBeenCalledWith({ start: ISO_APR_10, end: ISO_APR_20 });
  });

  it('selecting "end" without a prior "start" sets start instead', () => {
    const { result } = renderHook(() => useRangePicker());

    act(() => {
      result.current.setRange({ start: null, end: null });
    });
    act(() => {
      (result.current as unknown as { selectingTarget: 'start' | 'end' }).selectingTarget = 'end';
    });
    act(() => result.current.selectDate(ISO_APR_15));

    expect(result.current.value.start).toBe(ISO_APR_15);
  });
});

describe('useRangePicker — hover preview', () => {
  it('setHoverDate updates hoverDate', () => {
    const { result } = renderHook(() => useRangePicker());

    act(() => result.current.setHoverDate(ISO_APR_15));
    expect(result.current.hoverDate).toBe(ISO_APR_15);

    act(() => result.current.setHoverDate(null));
    expect(result.current.hoverDate).toBeNull();
  });

  it('clears hoverDate on close()', () => {
    const { result } = renderHook(() => useRangePicker());

    act(() => result.current.open());
    act(() => result.current.setHoverDate(ISO_APR_15));
    act(() => result.current.close());

    expect(result.current.hoverDate).toBeNull();
  });
});

describe('useRangePicker — calendar grid', () => {
  it('marks isRangeStart / isRangeEnd / isInRange correctly', () => {
    const { result } = renderHook(() =>
      useRangePicker({ defaultValue: { start: ISO_APR_10, end: ISO_APR_20 } }),
    );

    const days = result.current.calendar.flat();

    const start = days.find((d) => d.isoString === ISO_APR_10);
    const end = days.find((d) => d.isoString === ISO_APR_20);
    const middle = days.find((d) => d.isoString === ISO_APR_15);

    expect(start?.isRangeStart).toBe(true);
    expect(end?.isRangeEnd).toBe(true);
    expect(middle?.isInRange).toBe(true);
  });

  it('respects disabled rules', () => {
    const { result } = renderHook(() => useRangePicker({ disabled: [{ dayOfWeek: [0, 6] }] }));

    const weekend = result.current.calendar
      .flat()
      .find((d) => d.isoString === '2026-04-04T00:00:00.000Z');
    expect(weekend?.isDisabled).toBe(true);
  });
});

describe('useRangePicker — open behavior', () => {
  it('resets selectingTarget to "start" when opening with a completed range', () => {
    const { result } = renderHook(() =>
      useRangePicker({ defaultValue: { start: ISO_APR_10, end: ISO_APR_20 } }),
    );

    act(() => result.current.open());

    expect(result.current.selectingTarget).toBe('start');
    expect(result.current.isOpen).toBe(true);
  });

  it('toggle flips isOpen', () => {
    const { result } = renderHook(() => useRangePicker());

    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(false);
  });
});

describe('useRangePicker — navigation', () => {
  it('previousMonth / nextMonth shift viewMonth by one month', () => {
    const { result } = renderHook(() =>
      useRangePicker({ defaultValue: { start: ISO_APR_15, end: null } }),
    );

    const initial = result.current.viewMonth;

    act(() => result.current.nextMonth());
    expect(
      result.current.adapter.isSameMonth(
        result.current.viewMonth,
        result.current.adapter.addMonths(initial, 1),
      ),
    ).toBe(true);

    act(() => result.current.previousMonth());
    act(() => result.current.previousMonth());
    expect(
      result.current.adapter.isSameMonth(
        result.current.viewMonth,
        result.current.adapter.addMonths(initial, -1),
      ),
    ).toBe(true);
  });
});
