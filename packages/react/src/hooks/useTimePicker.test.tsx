import { describe, it, expect, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useTimePicker } from './useTimePicker.js';

const ISO_00 = '2026-04-15T00:00:00.000Z';
const ISO_09_30 = '2026-04-15T09:30:00.000Z';
const ISO_13_45 = '2026-04-15T13:45:00.000Z';

describe('useTimePicker — controlled / uncontrolled', () => {
  it('starts with null value when no options are provided', () => {
    const { result } = renderHook(() => useTimePicker());
    expect(result.current.value).toBeNull();
  });

  it('uses defaultValue in uncontrolled mode', () => {
    const { result } = renderHook(() => useTimePicker({ defaultValue: ISO_09_30 }));
    expect(result.current.value).toBe(ISO_09_30);
    expect(result.current.currentTime).toEqual({ hours: 9, minutes: 30, seconds: 0 });
  });

  it('uses controlled value when provided', () => {
    const { result } = renderHook(() => useTimePicker({ value: ISO_13_45 }));
    expect(result.current.value).toBe(ISO_13_45);
  });

  it('does not update internal state in controlled mode', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useTimePicker({ value: ISO_09_30, onChange }));

    act(() => result.current.setHour(14));

    expect(result.current.value).toBe(ISO_09_30);
    expect(onChange).toHaveBeenCalled();
  });
});

describe('useTimePicker — setTime / setHour / setMinute / setSecond', () => {
  it('setTime merges partial values', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useTimePicker({ defaultValue: ISO_00, onChange }));

    act(() => result.current.setTime({ hours: 9 }));
    expect(result.current.currentTime.hours).toBe(9);

    act(() => result.current.setTime({ minutes: 30 }));
    expect(result.current.currentTime).toEqual({ hours: 9, minutes: 30, seconds: 0 });
  });

  it('setHour sets hour in 24h mode', () => {
    const { result } = renderHook(() => useTimePicker({ defaultValue: ISO_00, format: '24h' }));

    act(() => result.current.setHour(14));
    expect(result.current.currentTime.hours).toBe(14);
  });

  it('setMinute and setSecond update individually', () => {
    const { result } = renderHook(() => useTimePicker({ defaultValue: ISO_00 }));

    act(() => result.current.setMinute(45));
    expect(result.current.currentTime.minutes).toBe(45);

    act(() => result.current.setSecond(30));
    expect(result.current.currentTime.seconds).toBe(30);
  });
});

describe('useTimePicker — 12h mode', () => {
  it('exposes displayHour in 12h range (1-12)', () => {
    const { result: morning } = renderHook(() =>
      useTimePicker({ defaultValue: ISO_09_30, format: '12h' }),
    );
    expect(morning.current.displayHour).toBe(9);
    expect(morning.current.period).toBe('AM');

    const { result: afternoon } = renderHook(() =>
      useTimePicker({ defaultValue: ISO_13_45, format: '12h' }),
    );
    expect(afternoon.current.displayHour).toBe(1);
    expect(afternoon.current.period).toBe('PM');
  });

  it('setHour interprets input as 12h and stores 24h internally', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useTimePicker({ defaultValue: ISO_13_45, format: '12h', onChange }),
    );

    act(() => result.current.setHour(2));
    expect(result.current.currentTime.hours).toBe(14);
  });

  it('setPeriod switches AM/PM while preserving displayHour', () => {
    const { result } = renderHook(() => useTimePicker({ defaultValue: ISO_09_30, format: '12h' }));

    act(() => result.current.setPeriod('PM'));
    expect(result.current.currentTime.hours).toBe(21);
    expect(result.current.period).toBe('PM');
  });

  it('setPeriod is a no-op in 24h mode', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useTimePicker({ defaultValue: ISO_09_30, format: '24h', onChange }),
    );

    act(() => result.current.setPeriod('PM'));
    expect(result.current.currentTime.hours).toBe(9);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('useTimePicker — option lists', () => {
  it('generates 24 hours in 24h mode', () => {
    const { result } = renderHook(() => useTimePicker({ format: '24h' }));
    expect(result.current.availableHours).toHaveLength(24);
  });

  it('generates 12 hours in 12h mode', () => {
    const { result } = renderHook(() => useTimePicker({ format: '12h' }));
    expect(result.current.availableHours).toHaveLength(12);
  });

  it('filters minutes by step', () => {
    const { result } = renderHook(() => useTimePicker({ step: 15 }));
    expect(result.current.availableMinutes).toEqual([0, 15, 30, 45]);
  });

  it('returns 60 minutes when step is 1', () => {
    const { result } = renderHook(() => useTimePicker({ step: 1 }));
    expect(result.current.availableMinutes).toHaveLength(60);
  });
});

describe('useTimePicker — stable IDs', () => {
  it('produces a stable pickerId across renders', () => {
    const { result, rerender } = renderHook(() => useTimePicker());

    const firstId = result.current.pickerId;
    rerender();

    expect(result.current.pickerId).toBe(firstId);
  });
});

describe('useTimePicker — format behavior', () => {
  it('returns period=null in 24h mode', () => {
    const { result } = renderHook(() => useTimePicker({ defaultValue: ISO_13_45, format: '24h' }));
    expect(result.current.period).toBeNull();
  });

  it('reports displayHour equal to raw hour in 24h mode', () => {
    const { result } = renderHook(() => useTimePicker({ defaultValue: ISO_13_45, format: '24h' }));
    expect(result.current.displayHour).toBe(13);
  });
});

describe('useTimePicker — filterTime parity', () => {
  it('rejects a filtered final time without mutating uncontrolled state or calling onChange', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useTimePicker({
        defaultValue: '2026-01-15T05:30:00.000Z',
        displayTimezone: 'America/New_York',
        filterTime: (hours, minutes) => hours === 10 && minutes === 30,
        onChange,
      }),
    );

    act(() => result.current.setHour(10));

    expect(result.current.value).toBe('2026-01-15T05:30:00.000Z');
    expect(result.current.currentTime).toEqual({ hours: 0, minutes: 30, seconds: 0 });
    expect(onChange).not.toHaveBeenCalled();
  });
});
