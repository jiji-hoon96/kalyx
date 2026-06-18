import { describe, it, expect, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useWeekPicker } from './useWeekPicker.js';

// 2026-04-15 is a Wednesday.
const WED_APR_15 = '2026-04-15T00:00:00.000Z';

describe('useWeekPicker', () => {
  it('starts empty and supports controlled value', () => {
    expect(renderHook(() => useWeekPicker()).result.current.value).toEqual({
      start: null,
      end: null,
    });
    const controlled = { start: '2026-04-12T00:00:00.000Z', end: '2026-04-18T23:59:59.999Z' };
    expect(renderHook(() => useWeekPicker({ value: controlled })).result.current.value).toEqual(
      controlled,
    );
  });

  it('selectWeek commits the whole week (Sun..Sat) containing the day and closes', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useWeekPicker({ onChange }));
    act(() => result.current.open());
    act(() => result.current.selectWeek(WED_APR_15));
    expect(result.current.value).toEqual({
      start: '2026-04-12T00:00:00.000Z',
      end: '2026-04-18T23:59:59.999Z',
    });
    expect(onChange).toHaveBeenCalledWith({
      start: '2026-04-12T00:00:00.000Z',
      end: '2026-04-18T23:59:59.999Z',
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('honours weekStartsOn=1 (Mon..Sun)', () => {
    const { result } = renderHook(() => useWeekPicker({ weekStartsOn: 1 }));
    act(() => result.current.selectWeek(WED_APR_15));
    expect(result.current.value.start).toBe('2026-04-13T00:00:00.000Z'); // Monday
  });

  it('exposes a calendar grid and navigates months', () => {
    const { result } = renderHook(() =>
      useWeekPicker({ defaultValue: { start: WED_APR_15, end: WED_APR_15 } }),
    );
    expect(result.current.calendar.length).toBeGreaterThanOrEqual(4);
    const before = result.current.viewMonth;
    act(() => result.current.nextMonth());
    expect(result.current.viewMonth).not.toBe(before);
  });
});
