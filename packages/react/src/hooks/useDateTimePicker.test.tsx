import { describe, it, expect, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useDateTimePicker } from './useDateTimePicker.js';

const APR_15_0930 = '2026-04-15T09:30:00.000Z';

describe('useDateTimePicker', () => {
  it('starts null and supports controlled value', () => {
    expect(renderHook(() => useDateTimePicker()).result.current.value).toBeNull();
    expect(renderHook(() => useDateTimePicker({ value: APR_15_0930 })).result.current.value).toBe(
      APR_15_0930,
    );
  });

  it('reads the time portion of the current value', () => {
    const { result } = renderHook(() => useDateTimePicker({ value: APR_15_0930 }));
    expect(result.current.currentTime).toEqual({ hours: 9, minutes: 30, seconds: 0 });
  });

  it('selectDate keeps the time and does NOT close the popover', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useDateTimePicker({ defaultValue: APR_15_0930, onChange }));
    act(() => result.current.open());
    act(() => result.current.selectDate('2026-04-20T00:00:00.000Z'));
    expect(onChange).toHaveBeenCalledWith('2026-04-20T09:30:00.000Z');
    expect(result.current.value).toBe('2026-04-20T09:30:00.000Z');
    expect(result.current.isOpen).toBe(true); // stays open for the time step
  });

  it('setTime keeps the date', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useDateTimePicker({ defaultValue: APR_15_0930, onChange }));
    act(() => result.current.setTime({ hours: 14 }));
    expect(result.current.value).toBe('2026-04-15T14:30:00.000Z');
  });

  it('clears via selectDate(null)', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useDateTimePicker({ defaultValue: APR_15_0930, onChange }));
    act(() => result.current.selectDate(null));
    expect(result.current.value).toBeNull();
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('exposes a calendar grid', () => {
    const { result } = renderHook(() => useDateTimePicker({ value: APR_15_0930 }));
    expect(result.current.calendar.length).toBeGreaterThanOrEqual(4);
    expect(result.current.calendar[0]).toHaveLength(7);
  });
});
