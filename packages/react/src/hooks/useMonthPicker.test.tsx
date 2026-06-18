import { describe, it, expect, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
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

  it('toggles open state', () => {
    const { result } = renderHook(() => useMonthPicker());
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(false);
  });
});
