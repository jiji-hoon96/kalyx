import { useCallback, useEffect, useState } from 'react';
import type { HTMLAttributes } from 'react';
import { getMonthName, type ISODateString } from '@kalyx/core';
import { useDatePickerContext } from '../../context/DatePickerContext.js';
import { useGridState } from '../_shared/grid-keyboard.js';

export interface DatePickerMonthGridClassNames {
  root?: string;
  header?: string;
  title?: string;
  navButton?: string;
  grid?: string;
  month?: string;
  monthSelected?: string;
  monthCurrent?: string;
}

export interface DatePickerMonthGridProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  classNames?: DatePickerMonthGridClassNames;
  /** Called when a month is selected. Typically used to switch back to the day view. */
  onSelect?: () => void;
  /** Called when the title (year) is clicked. Useful for switching to the year view. */
  onTitleClick?: () => void;
}

/**
 * DatePicker.MonthGrid — Quickly pick a month from a 12-month grid.
 * Click Calendar title -> MonthGrid -> click a month -> back to Calendar.
 *
 * @example
 * ```tsx
 * {view === 'months' && (
 *   <DatePicker.MonthGrid
 *     onSelect={() => setView('days')}
 *     onTitleClick={() => setView('years')}
 *   />
 * )}
 * ```
 */
export function DatePickerMonthGrid({
  classNames,
  onSelect,
  onTitleClick,
  ...props
}: DatePickerMonthGridProps) {
  const ctx = useDatePickerContext('DatePicker.MonthGrid');
  const { adapter, viewMonth, locale, displayTimezone } = ctx;

  const currentYear = adapter.getYear(viewMonth);
  const currentMonth = adapter.getMonth(viewMonth);
  // SSR-safe: today is null on server and during hydration, set after mount.
  // Avoids server/client clock-mismatch hydration warnings across day boundaries.
  const [today, setToday] = useState<ISODateString | null>(null);
  useEffect(() => {
    setToday(adapter.today(displayTimezone));
  }, [adapter, displayTimezone]);
  const todayMonth = today !== null ? adapter.getMonth(today) : -1;
  const todayYear = today !== null ? adapter.getYear(today) : -1;

  const navigateYear = useCallback(
    (direction: number) => {
      ctx.setViewMonth(adapter.addYears(viewMonth, direction));
    },
    [adapter, viewMonth, ctx],
  );

  const handleMonthSelect = useCallback(
    (monthIndex: number) => {
      const target = new Date(Date.UTC(currentYear, monthIndex, 1)).toISOString();
      ctx.setViewMonth(target);
      ctx.setFocusedDate(target);
      onSelect?.();
    },
    [currentYear, ctx, onSelect],
  );

  const { gridRef, focusedIndex, handleKeyDown } = useGridState({
    initialIndex: currentMonth,
    onSelect: handleMonthSelect,
    onPageUp: () => navigateYear(-1),
    onPageDown: () => navigateYear(1),
    onEscape: ctx.close,
  });

  return (
    <div className={classNames?.root} {...props}>
      <div className={classNames?.header}>
        <button
          type="button"
          className={classNames?.navButton}
          onClick={() => navigateYear(-1)}
          aria-label={ctx.labels.prevYear}
        >
          &lt;
        </button>
        {onTitleClick ? (
          <button type="button" className={classNames?.title} onClick={onTitleClick}>
            {currentYear}
          </button>
        ) : (
          <span className={classNames?.title}>{currentYear}</span>
        )}
        <button
          type="button"
          className={classNames?.navButton}
          onClick={() => navigateYear(1)}
          aria-label={ctx.labels.nextYear}
        >
          &gt;
        </button>
      </div>

      <div
        ref={gridRef}
        role="grid"
        aria-label={`${currentYear} months`}
        className={classNames?.grid}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}
        onKeyDown={handleKeyDown}
      >
        {Array.from({ length: 12 }, (_, i) => {
          const isSelected = i === currentMonth;
          const isCurrent = i === todayMonth && currentYear === todayYear;
          const isFocused = i === focusedIndex;
          const cls =
            [
              classNames?.month,
              isSelected && classNames?.monthSelected,
              isCurrent && classNames?.monthCurrent,
            ]
              .filter(Boolean)
              .join(' ') || undefined;

          return (
            <button
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
              onClick={() => handleMonthSelect(i)}
            >
              {getMonthName(i, locale)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
