import { useCallback } from 'react';
import type { HTMLAttributes } from 'react';
import { getMonthName } from '@kalyx/core';
import { useDatePickerContext } from '../../context/DatePickerContext.js';

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
  const { adapter, viewMonth, locale } = ctx;

  const currentYear = adapter.getYear(viewMonth);
  const currentMonth = adapter.getMonth(viewMonth);
  const todayMonth = adapter.getMonth(adapter.today());
  const todayYear = adapter.getYear(adapter.today());

  const navigateYear = useCallback(
    (direction: number) => {
      const newDate = adapter.addYears(viewMonth, direction);
      ctx.setViewMonth(newDate);
    },
    [adapter, viewMonth, ctx],
  );

  const handleMonthSelect = useCallback(
    (monthIndex: number) => {
      // Set viewMonth to the first day of the selected month in the current year
      const target = new Date(Date.UTC(currentYear, monthIndex, 1)).toISOString();
      ctx.setViewMonth(target);
      ctx.setFocusedDate(target);
      onSelect?.();
    },
    [currentYear, ctx, onSelect],
  );

  const months = Array.from({ length: 12 }, (_, i) => ({
    index: i,
    name: getMonthName(i, locale),
    isSelected: i === currentMonth,
    isCurrent: i === todayMonth && currentYear === todayYear,
  }));

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
          <button
            type="button"
            className={classNames?.title}
            onClick={onTitleClick}
          >
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
        role="grid"
        aria-label={`${currentYear} months`}
        className={classNames?.grid}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}
      >
        {months.map((m) => {
          const monthClass = [
            classNames?.month,
            m.isSelected && classNames?.monthSelected,
            m.isCurrent && classNames?.monthCurrent,
          ]
            .filter(Boolean)
            .join(' ') || undefined;

          return (
            <button
              key={m.index}
              type="button"
              role="gridcell"
              aria-selected={m.isSelected || undefined}
              aria-current={m.isCurrent ? 'date' : undefined}
              data-selected={m.isSelected || undefined}
              data-current={m.isCurrent || undefined}
              className={monthClass}
              onClick={() => handleMonthSelect(m.index)}
            >
              {m.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
