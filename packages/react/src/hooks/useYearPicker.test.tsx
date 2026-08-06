import { describe, it, expect, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useYearPicker } from './useYearPicker.js';

const YEAR_2026 = '2026-01-01T00:00:00.000Z';

describe('useYearPicker', () => {
  it('is null by default and honours defaultValue / controlled value', () => {
    expect(renderHook(() => useYearPicker()).result.current.value).toBeNull();
    expect(renderHook(() => useYearPicker({ value: YEAR_2026 })).result.current.value).toBe(
      YEAR_2026,
    );
  });

  it('exposes a 12-year decade block with the value selected', () => {
    const { result } = renderHook(() => useYearPicker({ value: YEAR_2026 }));
    // 2026 % 12 === 10, so the decade block starts at 2016.
    expect(result.current.decadeStart).toBe(2016);
    expect(result.current.years).toHaveLength(12);
    expect(result.current.years[0].year).toBe(2016);
    expect(result.current.years[10].year).toBe(2026);
    expect(result.current.years[10].isSelected).toBe(true);
  });

  it('commits a year as the year-start ISO and closes', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useYearPicker({ defaultValue: YEAR_2026, onChange }));
    act(() => result.current.open());
    act(() => result.current.selectYear(result.current.years[0].isoString));
    expect(onChange).toHaveBeenCalledWith('2016-01-01T00:00:00.000Z');
    expect(result.current.value).toBe('2016-01-01T00:00:00.000Z');
    expect(result.current.isOpen).toBe(false);
  });

  it('navigates by decade block', () => {
    const { result } = renderHook(() => useYearPicker({ value: YEAR_2026 }));
    act(() => result.current.nextDecade());
    expect(result.current.decadeStart).toBe(2028);
    act(() => result.current.previousDecade());
    act(() => result.current.previousDecade());
    expect(result.current.decadeStart).toBe(2004);
  });

  it('marks a year fully excluded by a before-rule as disabled', () => {
    const { result } = renderHook(() =>
      useYearPicker({ value: YEAR_2026, disabled: [{ before: '2020-01-01T00:00:00.000Z' }] }),
    );
    // 2016..2019 are entirely before the bound → disabled; 2020 is not.
    expect(result.current.years[3].year).toBe(2019);
    expect(result.current.years[3].isDisabled).toBe(true);
    expect(result.current.years[4].year).toBe(2020);
    expect(result.current.years[4].isDisabled).toBe(false);
  });

  it('refuses to commit a year the grid reports as disabled', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useYearPicker({
        value: YEAR_2026,
        onChange,
        disabled: [{ before: '2020-01-01T00:00:00.000Z' }],
      }),
    );
    act(() => result.current.open());
    expect(result.current.years[3].isDisabled).toBe(true);

    act(() => result.current.selectYear(result.current.years[3].isoString));

    expect(onChange).not.toHaveBeenCalled();
    expect(result.current.value).toBe(YEAR_2026);
    expect(result.current.isOpen).toBe(true);
  });

  it('still commits a year that is only partially disabled', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useYearPicker({
        value: YEAR_2026,
        onChange,
        // Day-granular rules never disable a whole year, so the grid keeps 2020
        // selectable — the commit guard must agree rather than being stricter.
        disabled: [{ date: '2020-06-10T00:00:00.000Z' }, { dayOfWeek: [0, 6] }],
      }),
    );
    act(() => result.current.open());
    expect(result.current.years[4].isDisabled).toBe(false);

    act(() => result.current.selectYear(result.current.years[4].isoString));

    expect(onChange).toHaveBeenCalledWith(result.current.years[4].isoString);
    expect(result.current.isOpen).toBe(false);
  });
});
