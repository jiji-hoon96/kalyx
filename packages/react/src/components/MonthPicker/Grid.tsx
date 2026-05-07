import { useCallback, useEffect, useMemo, useState } from 'react';
import type { HTMLAttributes } from 'react';
import { getMonthName, type ISODateString } from '@kalyx/core';
import { useDatePickerContext } from '../../context/DatePickerContext.js';
import { isRangeFullyDisabled, useGridState } from '../_shared/grid-keyboard.js';

export interface MonthPickerGridClassNames {
  root?: string;
  header?: string;
  title?: string;
  navButton?: string;
  grid?: string;
  gridRow?: string;
  month?: string;
  monthSelected?: string;
  monthCurrent?: string;
  monthDisabled?: string;
}

export interface MonthPickerGridProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  classNames?: MonthPickerGridClassNames;
}

/**
 * MonthPicker.Grid — 12-month commit grid. Clicking a month selects it and closes the popover.
 *
 * Unlike `DatePicker.MonthGrid` (drilldown), this component commits the month selection
 * via `ctx.selectDate`, emitting the month-start ISO string.
 *
 * Disabled state: a month is marked unselectable when every day in it is
 * excluded by a `before`/`after` rule on the `disabled` prop. The cell is
 * rendered with `disabled` + `aria-disabled` + the `monthDisabled` className,
 * and keyboard navigation skips it.
 *
 * @example
 * ```tsx
 * <MonthPicker
 *   value={month}
 *   onChange={setMonth}
 *   disabled={[{ before: '2026-04-01T00:00:00.000Z' }]}
 * >
 *   <MonthPicker.Input />
 *   <MonthPicker.Popover>
 *     <MonthPicker.Grid />
 *   </MonthPicker.Popover>
 * </MonthPicker>
 * ```
 */
export function MonthPickerGrid({ classNames, ...props }: MonthPickerGridProps) {
  const ctx = useDatePickerContext('MonthPicker.Grid');
  const { adapter, viewMonth, locale, value, displayTimezone, labels, disabled } = ctx;

  const currentYear = adapter.getYear(viewMonth);

  // Extract the value's year and month in the display timezone so highlighting
  // remains correct when storage is civil-midnight-in-tz (UTC-ISO form).
  const [valueYear, valueMonthZeroBased] = useMemo(() => {
    if (!value) return [null, null] as const;
    try {
      const [y, m] = adapter.format(value, 'yyyy-MM', displayTimezone).split('-').map(Number);
      return [y!, m! - 1] as const;
    } catch {
      return [null, null] as const;
    }
  }, [value, adapter, displayTimezone]);

  // SSR-safe: today is null on server and during hydration, set after mount.
  const [today, setToday] = useState<ISODateString | null>(null);
  useEffect(() => {
    setToday(adapter.today(displayTimezone));
  }, [adapter, displayTimezone]);
  const todayYear = today !== null ? adapter.getYear(today) : -1;
  const todayMonth = today !== null ? adapter.getMonth(today) : -1;

  // A month is "fully disabled" only when every day in it is excluded by a
  // `before`/`after` rule. `date` and `dayOfWeek` rules can't disable a whole
  // month, so they're ignored here.
  const monthDisabledFlags = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const monthStart = new Date(Date.UTC(currentYear, i, 1)).toISOString();
        return isRangeFullyDisabled(monthStart, adapter.endOfMonth(monthStart), disabled, adapter);
      }),
    [currentYear, disabled, adapter],
  );

  const navigateYear = useCallback(
    (direction: number) => {
      ctx.setViewMonth(adapter.addYears(viewMonth, direction));
    },
    [adapter, viewMonth, ctx],
  );

  const handleMonthSelect = useCallback(
    (monthIndex: number) => {
      if (monthDisabledFlags[monthIndex]) return;
      const target = new Date(Date.UTC(currentYear, monthIndex, 1)).toISOString();
      ctx.selectDate(target);
    },
    [currentYear, ctx, monthDisabledFlags],
  );

  // Roving tabIndex: focus the selected cell on the value's year, else the
  // current month. Falls back to the first enabled cell when the natural
  // choice is itself disabled (a `disabled` HTML button can't receive DOM
  // focus, so without this fallback the auto-refocus useEffect would silently
  // no-op and the user would have nowhere to keyboard-navigate from).
  const naturalIndex =
    valueYear === currentYear && valueMonthZeroBased !== null
      ? valueMonthZeroBased
      : adapter.getMonth(viewMonth);
  const firstEnabled = monthDisabledFlags.findIndex((d) => !d);
  const initialIndex = monthDisabledFlags[naturalIndex]
    ? firstEnabled === -1
      ? naturalIndex
      : firstEnabled
    : naturalIndex;

  const { gridRef, focusedIndex, handleKeyDown } = useGridState({
    initialIndex,
    disabledFlags: monthDisabledFlags,
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
          aria-label={labels.prevYear}
        >
          &lt;
        </button>
        <span className={classNames?.title}>{currentYear}</span>
        <button
          type="button"
          className={classNames?.navButton}
          onClick={() => navigateYear(1)}
          aria-label={labels.nextYear}
        >
          &gt;
        </button>
      </div>

      <div
        ref={gridRef}
        role="grid"
        aria-label={`${currentYear} months`}
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
              const isSelected = valueYear === currentYear && valueMonthZeroBased === i;
              const isCurrent = todayYear === currentYear && todayMonth === i;
              const isFocused = i === focusedIndex;
              const isDisabled = monthDisabledFlags[i] ?? false;
              const cls =
                [
                  classNames?.month,
                  isSelected && classNames?.monthSelected,
                  isCurrent && classNames?.monthCurrent,
                  isDisabled && classNames?.monthDisabled,
                ]
                  .filter(Boolean)
                  .join(' ') || undefined;
              return (
                <button
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
                  onClick={() => handleMonthSelect(i)}
                >
                  {getMonthName(i, locale)}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
