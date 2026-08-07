import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { civilMidnightFromUtcDay } from '@kalyx/core';
import type { DateAdapter, DisabledRule, ISODateString } from '@kalyx/core';
import type { Direction } from './rtl.js';

/**
 * A half-open range `[startInclusive, endExclusive)` is "fully disabled" when
 * every instant in it is excluded by a `before` or `after` rule. `date` and
 * `dayOfWeek` rules only disable individual days, so they never disable an
 * entire range.
 *
 * Used by `MonthPicker.Grid` / `YearPicker.Grid` and the matching headless hooks
 * to mark a whole month or year unselectable when min/max bounds rule it out —
 * both for the rendered `isDisabled` flag and for the commit guard, so the two
 * cannot disagree.
 *
 * @param endExclusive - Start of the *next* period, not this period's last
 *   millisecond.
 * @param timezone - When set, the range is interpreted as civil days in that
 *   zone rather than UTC coordinates.
 */
export function isRangeFullyDisabled(
  startInclusive: ISODateString,
  endExclusive: ISODateString,
  rules: DisabledRule[],
  adapter: DateAdapter,
  timezone?: string,
): boolean {
  // The range is half-open: [startInclusive, endExclusive). Callers pass the start
  // of the *next* period as the end rather than its last millisecond, so that the
  // timezone conversion below is a plain civil-midnight lookup on both ends
  // instead of day arithmetic on a `23:59:59.999` timestamp.
  //
  // With a timezone, the cell covers civil days in *that* zone, so both ends are
  // mapped to the instants those civil midnights correspond to. Comparing raw UTC
  // coordinates against a civil-midnight bound is what left a fully out-of-range
  // month enabled under large positive offsets: in Pacific/Kiritimati (+14) the
  // civil range sits ~14h earlier than its UTC coordinates suggest.
  const start = timezone ? civilMidnightFromUtcDay(startInclusive, timezone) : startInclusive;
  const end = timezone ? civilMidnightFromUtcDay(endExclusive, timezone) : endExclusive;

  for (const rule of rules) {
    // Every instant in [start, end) precedes `before` exactly when end <= before.
    if ('before' in rule && !adapter.isAfter(end, rule.before)) return true;
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
  /**
   * Layout direction. In "rtl" the physical ArrowLeft/ArrowRight (and the
   * disabled-cell skip step) are swapped so navigation follows visual layout.
   * Defaults to "ltr".
   */
  dir?: Direction;
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
  const {
    initialIndex,
    disabledFlags,
    onSelect,
    onPageUp,
    onPageDown,
    onEscape,
    dir = 'ltr',
  } = opts;
  const gridRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(initialIndex);

  const rtl = dir === 'rtl';

  const handleKeyDown = (e: KeyboardEvent) => {
    let next: number | null = null;
    let step = 1;
    switch (e.key) {
      case 'ArrowLeft':
        // RTL: physically-left is the next (higher-index) cell.
        next = rtl ? Math.min(11, focusedIndex + 1) : Math.max(0, focusedIndex - 1);
        step = rtl ? 1 : -1;
        break;
      case 'ArrowRight':
        next = rtl ? Math.max(0, focusedIndex - 1) : Math.min(11, focusedIndex + 1);
        step = rtl ? -1 : 1;
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
        // Stop the synthetic Escape from bubbling to a host modal/dialog.
        e.preventDefault();
        e.stopPropagation();
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
