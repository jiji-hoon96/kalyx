import { useCallback, useMemo } from 'react';
import type { HTMLAttributes } from 'react';
import { useDatePickerContext } from '../../context/DatePickerContext.js';

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
export function DatePickerYearGrid({
  classNames,
  onSelect,
  ...props
}: DatePickerYearGridProps) {
  const ctx = useDatePickerContext('DatePicker.YearGrid');
  const { adapter, viewMonth } = ctx;

  const currentYear = adapter.getYear(viewMonth);
  const todayYear = adapter.getYear(adapter.today());

  // 12-year range (decade block containing the current year)
  const decadeStart = currentYear - (currentYear % 12);

  const navigateDecade = useCallback(
    (direction: number) => {
      const newDate = adapter.addYears(viewMonth, direction * 12);
      ctx.setViewMonth(newDate);
    },
    [adapter, viewMonth, ctx],
  );

  const handleYearSelect = useCallback(
    (year: number) => {
      const currentMonth = adapter.getMonth(viewMonth);
      const target = new Date(Date.UTC(year, currentMonth, 1)).toISOString();
      ctx.setViewMonth(target);
      ctx.setFocusedDate(target);
      onSelect?.();
    },
    [adapter, viewMonth, ctx, onSelect],
  );

  const years = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const year = decadeStart + i;
        return {
          value: year,
          isSelected: year === currentYear,
          isCurrent: year === todayYear,
        };
      }),
    [decadeStart, currentYear, todayYear],
  );

  const rangeLabel = `${decadeStart}–${decadeStart + 11}`;

  return (
    <div className={classNames?.root} {...props}>
      <div className={classNames?.header}>
        <button
          type="button"
          className={classNames?.navButton}
          onClick={() => navigateDecade(-1)}
          aria-label="이전 12년"
        >
          &lt;
        </button>
        <span className={classNames?.title}>{rangeLabel}</span>
        <button
          type="button"
          className={classNames?.navButton}
          onClick={() => navigateDecade(1)}
          aria-label="다음 12년"
        >
          &gt;
        </button>
      </div>

      <div
        role="grid"
        aria-label={rangeLabel}
        className={classNames?.grid}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}
      >
        {years.map((y) => {
          const yearClass = [
            classNames?.year,
            y.isSelected && classNames?.yearSelected,
            y.isCurrent && classNames?.yearCurrent,
          ]
            .filter(Boolean)
            .join(' ') || undefined;

          return (
            <button
              key={y.value}
              type="button"
              role="gridcell"
              aria-selected={y.isSelected || undefined}
              aria-current={y.isCurrent ? 'date' : undefined}
              data-selected={y.isSelected || undefined}
              data-current={y.isCurrent || undefined}
              className={yearClass}
              onClick={() => handleYearSelect(y.value)}
            >
              {y.value}
            </button>
          );
        })}
      </div>
    </div>
  );
}
