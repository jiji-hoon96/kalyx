import { useCallback, useMemo } from 'react';
import type { HTMLAttributes } from 'react';
import { useDatePickerContext } from '../../context/DatePickerContext.js';

export interface YearPickerGridClassNames {
  root?: string;
  header?: string;
  title?: string;
  navButton?: string;
  grid?: string;
  gridRow?: string;
  year?: string;
  yearSelected?: string;
  yearCurrent?: string;
  yearDisabled?: string;
}

export interface YearPickerGridProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  classNames?: YearPickerGridClassNames;
}

/**
 * YearPicker.Grid — 12-year decade commit grid. Clicking a year selects it and closes the popover.
 *
 * Unlike `DatePicker.YearGrid` (drilldown), this component commits the year selection via
 * `ctx.selectDate`, emitting the year-start ISO string (Jan 1 at UTC midnight).
 *
 * @example
 * ```tsx
 * <YearPicker value={year} onChange={setYear}>
 *   <YearPicker.Input />
 *   <YearPicker.Popover>
 *     <YearPicker.Grid />
 *   </YearPicker.Popover>
 * </YearPicker>
 * ```
 */
export function YearPickerGrid({ classNames, ...props }: YearPickerGridProps) {
  const ctx = useDatePickerContext('YearPicker.Grid');
  const { adapter, viewMonth, value, displayTimezone, labels } = ctx;

  const currentYear = adapter.getYear(viewMonth);

  // Decade block containing the currently viewed year (12-year range)
  const decadeStart = currentYear - (currentYear % 12);

  // Extract the value's year in the display timezone so highlighting is timezone-aware.
  const valueYear = useMemo(() => {
    if (!value) return null;
    try {
      return Number(adapter.format(value, 'yyyy', displayTimezone));
    } catch {
      return null;
    }
  }, [value, adapter, displayTimezone]);

  const todayYear = adapter.getYear(adapter.today(displayTimezone));

  const navigateDecade = useCallback(
    (direction: number) => {
      ctx.setViewMonth(adapter.addYears(viewMonth, direction * 12));
    },
    [adapter, viewMonth, ctx],
  );

  const handleYearSelect = useCallback(
    (year: number) => {
      const target = new Date(Date.UTC(year, 0, 1)).toISOString();
      ctx.selectDate(target);
    },
    [ctx],
  );

  const years = Array.from({ length: 12 }, (_, i) => {
    const year = decadeStart + i;
    return {
      value: year,
      isSelected: year === valueYear,
      isCurrent: year === todayYear,
    };
  });

  const rangeLabel = `${decadeStart}–${decadeStart + 11}`;

  return (
    <div className={classNames?.root} {...props}>
      <div className={classNames?.header}>
        <button
          type="button"
          className={classNames?.navButton}
          onClick={() => navigateDecade(-1)}
          aria-label={labels.prevDecade}
        >
          &lt;
        </button>
        <span className={classNames?.title}>{rangeLabel}</span>
        <button
          type="button"
          className={classNames?.navButton}
          onClick={() => navigateDecade(1)}
          aria-label={labels.nextDecade}
        >
          &gt;
        </button>
      </div>

      <div
        role="grid"
        aria-label={rangeLabel}
        className={classNames?.grid}
      >
        {Array.from({ length: 4 }, (_, rowIndex) => (
          <div
            key={rowIndex}
            role="row"
            className={classNames?.gridRow}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}
          >
            {years.slice(rowIndex * 3, rowIndex * 3 + 3).map((y) => {
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
        ))}
      </div>
    </div>
  );
}
