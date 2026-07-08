import { useCallback, useEffect, useMemo, useState } from 'react';
import type { HTMLAttributes } from 'react';
import type { ISODateString } from '@kalyx/core';
import { useDatePickerContext } from '../../context/DatePickerContext.js';
import { isRangeFullyDisabled, useGridState } from '../_shared/grid-keyboard.js';

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
 * Disabled state: a year is marked unselectable when every day in it is
 * excluded by a `before`/`after` rule on the `disabled` prop. The cell is
 * rendered with `disabled` + `aria-disabled` + the `yearDisabled` className,
 * and keyboard navigation skips it.
 *
 * @example
 * ```tsx
 * <YearPicker
 *   value={year}
 *   onChange={setYear}
 *   disabled={[{ before: '2024-01-01T00:00:00.000Z' }]}
 * >
 *   <YearPicker.Input />
 *   <YearPicker.Popover>
 *     <YearPicker.Grid />
 *   </YearPicker.Popover>
 * </YearPicker>
 * ```
 */
export function YearPickerGrid({ classNames, ...props }: YearPickerGridProps) {
  const ctx = useDatePickerContext('YearPicker.Grid');
  const { adapter, viewMonth, value, displayTimezone, labels, disabled } = ctx;

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

  // SSR-safe: today is null on server and during hydration, set after mount.
  const [today, setToday] = useState<ISODateString | null>(null);
  useEffect(() => {
    setToday(adapter.today(displayTimezone));
  }, [adapter, displayTimezone]);
  const todayYear = today !== null ? adapter.getYear(today) : -1;

  // A year is "fully disabled" only when every day in it is excluded by a
  // `before`/`after` rule.
  const yearDisabledFlags = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const year = decadeStart + i;
        const yearStart = new Date(Date.UTC(year, 0, 1)).toISOString();
        const yearEnd = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)).toISOString();
        return isRangeFullyDisabled(yearStart, yearEnd, disabled, adapter);
      }),
    [decadeStart, disabled, adapter],
  );

  const navigateDecade = useCallback(
    (direction: number) => {
      ctx.setViewMonth(adapter.addYears(viewMonth, direction * 12));
    },
    [adapter, viewMonth, ctx],
  );

  const handleYearSelect = useCallback(
    (indexInDecade: number) => {
      if (yearDisabledFlags[indexInDecade]) return;
      const year = decadeStart + indexInDecade;
      const target = new Date(Date.UTC(year, 0, 1)).toISOString();
      ctx.selectDate(target);
    },
    [ctx, decadeStart, yearDisabledFlags],
  );

  // Roving tabIndex: focus the selected cell if the value falls in this
  // decade, otherwise focus the cell representing the current viewMonth's
  // year. Falls back to the first enabled cell when the natural choice is
  // disabled (a `disabled` HTML button can't receive DOM focus, so without
  // this fallback the auto-refocus useEffect would silently no-op).
  const naturalIndex =
    valueYear !== null && valueYear >= decadeStart && valueYear <= decadeStart + 11
      ? valueYear - decadeStart
      : currentYear - decadeStart;
  const firstEnabled = yearDisabledFlags.findIndex((d) => !d);
  const initialIndex = yearDisabledFlags[naturalIndex]
    ? firstEnabled === -1
      ? naturalIndex
      : firstEnabled
    : naturalIndex;

  const { gridRef, focusedIndex, handleKeyDown } = useGridState({
    initialIndex,
    disabledFlags: yearDisabledFlags,
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
        ref={gridRef}
        role="grid"
        aria-label={rangeLabel}
        dir={ctx.dir}
        className={classNames?.grid}
        onKeyDown={handleKeyDown}
      >
        {Array.from({ length: 4 }, (_, rowIndex) => (
          <div
            key={rowIndex}
            role="row"
            className={classNames?.gridRow}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}
          >
            {Array.from({ length: 3 }, (_, col) => {
              const i = rowIndex * 3 + col;
              const year = decadeStart + i;
              const isSelected = year === valueYear;
              const isCurrent = year === todayYear;
              const isFocused = i === focusedIndex;
              const isDisabled = yearDisabledFlags[i] ?? false;
              const cls =
                [
                  classNames?.year,
                  isSelected && classNames?.yearSelected,
                  isCurrent && classNames?.yearCurrent,
                  isDisabled && classNames?.yearDisabled,
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
                  disabled={isDisabled}
                  aria-selected={isSelected || undefined}
                  aria-disabled={isDisabled || undefined}
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
        ))}
      </div>
    </div>
  );
}
