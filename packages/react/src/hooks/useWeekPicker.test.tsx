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

describe('useWeekPicker — timezone and constraint parity', () => {
  it('uses New York civil-day coordinates and emits civil-midnight week endpoints', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useWeekPicker({
        defaultValue: { start: '2026-01-15T05:00:00.000Z', end: '2026-01-15T05:00:00.000Z' },
        displayTimezone: 'America/New_York',
        weekStartsOn: 0,
        onChange,
      }),
    );

    expect(result.current.viewMonth).toBe('2026-01-15T00:00:00.000Z');
    expect(result.current.focusedDate).toBe('2026-01-15T00:00:00.000Z');

    act(() => result.current.open());
    act(() => result.current.selectWeek('2026-01-14T00:00:00.000Z'));

    expect(onChange).toHaveBeenCalledWith({
      start: '2026-01-11T05:00:00.000Z',
      end: '2026-01-17T05:00:00.000Z',
    });
  });

  it('preserves clicked-anchor direction after converting week endpoints', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useWeekPicker({
        displayTimezone: 'America/New_York',
        weekAnchor: 'clicked',
        selectingTarget: 'end',
        onChange,
      }),
    );

    act(() => result.current.selectWeek('2026-01-14T00:00:00.000Z'));

    expect(onChange).toHaveBeenCalledWith({
      start: '2026-01-08T05:00:00.000Z',
      end: '2026-01-14T05:00:00.000Z',
    });
  });

  it('rejects a week when either final endpoint is disabled', () => {
    const onChange = vi.fn();
    const initial = { start: '2026-01-04T05:00:00.000Z', end: '2026-01-10T05:00:00.000Z' };
    const { result } = renderHook(() =>
      useWeekPicker({
        defaultValue: initial,
        displayTimezone: 'America/New_York',
        disabled: [{ date: '2026-01-11T05:00:00.000Z' }],
        onChange,
      }),
    );

    act(() => result.current.open());
    act(() => result.current.selectWeek('2026-01-14T00:00:00.000Z'));

    expect(result.current.value).toEqual(initial);
    expect(result.current.isOpen).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('recenters zoned view and focus when toggle opens after navigation and a controlled value change', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useWeekPicker({ value, displayTimezone: 'America/New_York' }),
      {
        initialProps: {
          value: { start: '2026-01-15T05:00:00.000Z', end: '2026-01-17T05:00:00.000Z' },
        },
      },
    );

    act(() => result.current.nextMonth());
    rerender({ value: { start: '2026-03-15T05:00:00.000Z', end: '2026-03-21T04:00:00.000Z' } });
    act(() => result.current.toggle());

    expect(result.current.viewMonth).toBe('2026-03-15T00:00:00.000Z');
    expect(result.current.focusedDate).toBe('2026-03-15T00:00:00.000Z');
  });

  it('moves focusedDate into the month reached by navigation', () => {
    const { result } = renderHook(() =>
      useWeekPicker({
        defaultValue: { start: '2026-01-15T05:00:00.000Z', end: '2026-01-17T05:00:00.000Z' },
        displayTimezone: 'America/New_York',
      }),
    );

    act(() => result.current.nextMonth());

    expect(
      result.current.adapter.isSameMonth(result.current.focusedDate, result.current.viewMonth),
    ).toBe(true);
  });
});
