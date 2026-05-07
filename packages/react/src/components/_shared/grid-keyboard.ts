import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { DateAdapter, DisabledRule, ISODateString } from '@kalyx/core';

/**
 * A range of dates `[start, end]` is "fully disabled" when every day in it is
 * excluded by a `before` or `after` rule. `date` and `dayOfWeek` rules only
 * disable individual days, so they never disable an entire range.
 *
 * Used by `MonthPicker.Grid` and `YearPicker.Grid` to mark a whole month or
 * year unselectable when min/max bounds rule it out.
 */
export function isRangeFullyDisabled(
  start: ISODateString,
  end: ISODateString,
  rules: DisabledRule[],
  adapter: DateAdapter,
): boolean {
  for (const rule of rules) {
    if ('before' in rule && adapter.isBefore(end, rule.before)) return true;
    if ('after' in rule && adapter.isAfter(start, rule.after)) return true;
  }
  return false;
}

export interface UseGridStateOptions {
  /** Initial focused-cell index (0..11). */
  initialIndex: number;
  /**
   * Per-cell disabled flags (length 12). When provided, keyboard navigation
   * skips cells where the flag is true; if no enabled cell remains in the
   * travel direction, focus is left where it was.
   */
  disabledFlags?: boolean[];
  /** Enter / Space — receives the focused index. */
  onSelect: (index: number) => void;
  /** PageUp — typically navigates to the previous frame (year/decade). */
  onPageUp: () => void;
  /** PageDown — typically navigates to the next frame. */
  onPageDown: () => void;
  /** Escape — typically closes the popover. */
  onEscape: () => void;
}

/**
 * Shared WAI-ARIA grid keyboard handler + roving-focus state for the four 3×4
 * picker grids (`DatePicker.MonthGrid` / `YearGrid`, `MonthPicker.Grid`,
 * `YearPicker.Grid`).
 *
 * - Arrow keys: ±1 column / ±3 rows, clamped to grid bounds.
 * - Home / End: row-first / row-last cell.
 * - PageUp / PageDown: delegated to caller (year/decade navigation).
 * - Enter / Space: delegated commit/drilldown.
 * - Disabled cells (when `disabledFlags` is provided) are skipped in the
 *   original travel direction.
 * - Auto-refocus on focusedIndex change. (All four grids use stable index
 *   keys, so DOM nodes persist across page nav and DOM focus is preserved
 *   without an extra dependency.)
 */
export function useGridState(opts: UseGridStateOptions) {
  const { initialIndex, disabledFlags, onSelect, onPageUp, onPageDown, onEscape } = opts;
  const gridRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(initialIndex);

  const handleKeyDown = (e: KeyboardEvent) => {
    let next: number | null = null;
    let step = 1;
    switch (e.key) {
      case 'ArrowLeft':
        next = Math.max(0, focusedIndex - 1);
        step = -1;
        break;
      case 'ArrowRight':
        next = Math.min(11, focusedIndex + 1);
        break;
      case 'ArrowUp':
        next = Math.max(0, focusedIndex - 3);
        step = -1;
        break;
      case 'ArrowDown':
        next = Math.min(11, focusedIndex + 3);
        break;
      case 'Home':
        next = focusedIndex - (focusedIndex % 3);
        step = -1;
        break;
      case 'End':
        next = focusedIndex - (focusedIndex % 3) + 2;
        break;
      case 'PageUp':
        e.preventDefault();
        onPageUp();
        return;
      case 'PageDown':
        e.preventDefault();
        onPageDown();
        return;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect(focusedIndex);
        return;
      case 'Escape':
        onEscape();
        return;
      default:
        return;
    }
    if (next === null) return;
    e.preventDefault();

    if (disabledFlags) {
      let attempts = 0;
      while (next >= 0 && next < 12 && disabledFlags[next] && attempts < 12) {
        next += step;
        attempts++;
      }
      if (next < 0 || next >= 12 || disabledFlags[next]) return;
    }
    if (next !== focusedIndex) setFocusedIndex(next);
  };

  // Re-anchor focus when the cell at `focusedIndex` has become disabled
  // (e.g. after the consumer navigated to a year where the same column is now
  // out of range). A `disabled` HTML button can't receive DOM focus, so
  // without this we'd land focus on nothing and the user would lose keyboard
  // navigation.
  useEffect(() => {
    if (!disabledFlags || !disabledFlags[focusedIndex]) return;
    const firstEnabled = disabledFlags.findIndex((d) => !d);
    if (firstEnabled !== -1 && firstEnabled !== focusedIndex) {
      setFocusedIndex(firstEnabled);
    }
  }, [disabledFlags, focusedIndex]);

  useEffect(() => {
    const btn = gridRef.current?.querySelector<HTMLButtonElement>('[data-focused="true"]');
    btn?.focus({ preventScroll: true });
  }, [focusedIndex]);

  return { gridRef, focusedIndex, handleKeyDown };
}
