import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDatePicker } from './useDatePicker.js';
import { useRangePicker } from './useRangePicker.js';
import { useWeekPicker } from './useWeekPicker.js';
import { useDateTimePicker } from './useDateTimePicker.js';
import { useMonthPicker } from './useMonthPicker.js';
import { useYearPicker } from './useYearPicker.js';

/**
 * A headless consumer re-renders for reasons the hook knows nothing about —
 * a sibling input, a parent store update, a route transition. None of those
 * change the calendar, so the derived grid must survive them by reference.
 *
 * Two separate defects broke this. The grid-building hooks rebuilt their 42-cell
 * grid on every render because `getCalendarDays` was called bare. And every hook
 * defaulted `disabled` to a fresh `[]`, so the memos that did exist
 * (`useMonthPicker.months`, `useYearPicker.years`) listed a dependency that was
 * a new array each render and therefore never hit.
 */
describe('derived grids survive a no-op rerender', () => {
  const VALUE = '2026-04-15T00:00:00.000Z';
  // Hoisted deliberately. A controlled consumer that inlines `{ start, end }` in
  // JSX hands the hook a new object every render, so the grid genuinely changes
  // input and no memo can help. That is the consumer's identity to stabilize,
  // not the hook's — the same caveat applies to RangePicker.Calendar.
  const RANGE = { start: VALUE, end: null };

  it.each([
    ['useDatePicker', () => useDatePicker({ value: VALUE })],
    ['useRangePicker', () => useRangePicker({ value: RANGE })],
    ['useWeekPicker', () => useWeekPicker({ value: VALUE })],
    ['useDateTimePicker', () => useDateTimePicker({ value: VALUE })],
  ] as const)('%s keeps the same calendar reference', (_name, hook) => {
    const { result, rerender } = renderHook(hook);
    const first = result.current.calendar;
    rerender();
    expect(result.current.calendar).toBe(first);
  });

  it('useMonthPicker keeps the same months reference', () => {
    const { result, rerender } = renderHook(() => useMonthPicker({ value: VALUE }));
    const first = result.current.months;
    rerender();
    expect(result.current.months).toBe(first);
  });

  it('useYearPicker keeps the same years reference', () => {
    const { result, rerender } = renderHook(() => useYearPicker({ value: VALUE }));
    const first = result.current.years;
    rerender();
    expect(result.current.years).toBe(first);
  });
});
