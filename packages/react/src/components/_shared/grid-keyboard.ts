import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

export interface UseGridStateOptions {
  /** Initial focused-cell index (0..11). */
  initialIndex: number;
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
 * - Auto-refocus on focusedIndex change. (All four grids use stable index
 *   keys, so DOM nodes persist across page nav and DOM focus is preserved
 *   without an extra dependency.)
 */
export function useGridState(opts: UseGridStateOptions) {
  const { initialIndex, onSelect, onPageUp, onPageDown, onEscape } = opts;
  const gridRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(initialIndex);

  const handleKeyDown = (e: KeyboardEvent) => {
    let next: number | null = null;
    switch (e.key) {
      case 'ArrowLeft':
        next = Math.max(0, focusedIndex - 1);
        break;
      case 'ArrowRight':
        next = Math.min(11, focusedIndex + 1);
        break;
      case 'ArrowUp':
        next = Math.max(0, focusedIndex - 3);
        break;
      case 'ArrowDown':
        next = Math.min(11, focusedIndex + 3);
        break;
      case 'Home':
        next = focusedIndex - (focusedIndex % 3);
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
    if (next !== focusedIndex) setFocusedIndex(next);
  };

  useEffect(() => {
    const btn = gridRef.current?.querySelector<HTMLButtonElement>('[data-focused="true"]');
    btn?.focus({ preventScroll: true });
  }, [focusedIndex]);

  return { gridRef, focusedIndex, handleKeyDown };
}
