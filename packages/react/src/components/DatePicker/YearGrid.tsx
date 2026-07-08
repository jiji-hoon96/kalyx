import { useCallback, useEffect, useState } from 'react';
import type { HTMLAttributes } from 'react';
import type { ISODateString } from '@kalyx/core';
import { useDatePickerContext } from '../../context/DatePickerContext.js';
import { useGridState } from '../_shared/grid-keyboard.js';

export interface DatePickerYearGridClassNames {
  root?: string;
  header?: string;
  title?: string;
  navButton?: string;
  grid?: string;
  year?: string;
  yearSelected?: string;
  yearCurrent?: string;
}

export interface DatePickerYearGridProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  classNames?: DatePickerYearGridClassNames;
  /** Called when a year is selected. Typically used to switch back to the month view. */
  onSelect?: () => void;
}

/**
 * DatePicker.YearGrid — Quickly pick a year from a 12-year grid.
 * Click MonthGrid title -> YearGrid -> click a year -> back to MonthGrid.
 *
 * @example
 * ```tsx
 * {view === 'years' && (
 *   <DatePicker.YearGrid onSelect={() => setView('months')} />
 * )}
 * ```
 */
export function DatePickerYearGrid({ classNames, onSelect, ...props }: DatePickerYearGridProps) {
  const ctx = useDatePickerContext('DatePicker.YearGrid');
  const { adapter, viewMonth, displayTimezone } = ctx;

  const currentYear = adapter.getYear(viewMonth);
  // SSR-safe: today is null on server and during hydration, set after mount.
  const [today, setToday] = useState<ISODateString | null>(null);
  useEffect(() => {
    setToday(adapter.today(displayTimezone));
  }, [adapter, displayTimezone]);
  const todayYear = today !== null ? adapter.getYear(today) : -1;

  // 12-year range (decade block containing the current year)
  const decadeStart = currentYear - (currentYear % 12);

  const navigateDecade = useCallback(
    (direction: number) => {
      ctx.setViewMonth(adapter.addYears(viewMonth, direction * 12));
    },
    [adapter, viewMonth, ctx],
  );

  const handleYearSelect = useCallback(
    (indexInDecade: number) => {
      const year = decadeStart + indexInDecade;
      const currentMonth = adapter.getMonth(viewMonth);
      const target = new Date(Date.UTC(year, currentMonth, 1)).toISOString();
      ctx.setViewMonth(target);
      ctx.setFocusedDate(target);
      onSelect?.();
    },
    [adapter, viewMonth, ctx, onSelect, decadeStart],
  );

  const { gridRef, focusedIndex, handleKeyDown } = useGridState({
    initialIndex: currentYear - decadeStart,
    onSelect: handleYearSelect,
    onPageUp: () => navigateDecade(-1),
    onPageDown: () => navigateDecade(1),
    onEscape: ctx.close,
    dir: ctx.dir,
  });

  const rangeLabel = `${decadeStart}–${decadeStart + 11}`;

  return (
    <div className={classNames?.root} {...props}>
      <div className={classNames?.header}>
        <button
          type="button"
          className={classNames?.navButton}
          onClick={() => navigateDecade(-1)}
          aria-label={ctx.labels.prevDecade}
        >
          &lt;
        </button>
        <span className={classNames?.title}>{rangeLabel}</span>
        <button
          type="button"
          className={classNames?.navButton}
          onClick={() => navigateDecade(1)}
          aria-label={ctx.labels.nextDecade}
        >
          &gt;
        </button>
      </div>

      <div
        ref={gridRef}
        role="grid"
        aria-label={rangeLabel}
        dir={ctx.dir}
        className={classNames?.grid}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}
        onKeyDown={handleKeyDown}
      >
        {Array.from({ length: 12 }, (_, i) => {
          const year = decadeStart + i;
          const isSelected = year === currentYear;
          const isCurrent = year === todayYear;
          const isFocused = i === focusedIndex;
          const cls =
            [
              classNames?.year,
              isSelected && classNames?.yearSelected,
              isCurrent && classNames?.yearCurrent,
            ]
              .filter(Boolean)
              .join(' ') || undefined;
          return (
            <button
              // Stable index key keeps the DOM node mounted across decade
              // navigation so focus on the same-position cell persists.
              key={i}
              type="button"
              role="gridcell"
              tabIndex={isFocused ? 0 : -1}
              aria-selected={isSelected || undefined}
              aria-current={isCurrent ? 'date' : undefined}
              data-selected={isSelected || undefined}
              data-current={isCurrent || undefined}
              data-focused={isFocused || undefined}
              className={cls}
              onClick={() => handleYearSelect(i)}
            >
              {year}
            </button>
          );
        })}
      </div>
    </div>
  );
}
