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
  /** 년 선택 시 콜백. 일반적으로 month 뷰로 전환한다. */
  onSelect?: () => void;
}

/**
 * DatePicker.YearGrid — 12년 단위 그리드에서 년도를 빠르게 선택.
 * MonthGrid 타이틀 클릭 → YearGrid 표시 → 년 클릭 → MonthGrid로 복귀.
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

  // 12년 단위 범위 (현재 년도를 포함하는 decade)
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
