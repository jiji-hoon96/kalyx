import { useCallback, useEffect, useRef, useState } from 'react';
import type { HTMLAttributes } from 'react';
import {
  getCalendarDays,
  isDateDisabled,
  getWeekdayNames,
  formatMonthYear,
  formatFullDate,
} from '@kalyx/core';
import type { CalendarDay, DateRange } from '@kalyx/core';
import { useRangePickerContext } from '../../context/RangePickerContext.js';

export interface RangePickerCalendarClassNames {
  root?: string;
  header?: string;
  title?: string;
  navButton?: string;
  grid?: string;
  gridRow?: string;
  gridCell?: string;
  day?: string;
  daySelected?: string;
  dayToday?: string;
  dayDisabled?: string;
  dayOutsideMonth?: string;
  dayRangeStart?: string;
  dayRangeEnd?: string;
  dayInRange?: string;
  weekdayHeader?: string;
}

/**
 * Selection mode for the calendar grid.
 * - `'range'` (default): RangePicker behavior — two clicks (start, end) commit a custom range.
 * - `'week'`: WeekPicker behavior — a single click commits the entire week containing the clicked day.
 */
export type RangePickerCalendarSelectionMode = 'range' | 'week';

export interface RangePickerCalendarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  classNames?: RangePickerCalendarClassNames;
  /** @default 'range' */
  selectionMode?: RangePickerCalendarSelectionMode;
}

/** Safe wrapper for formatFullDate — falls back to ISO string on error */
function safeFormatFullDate(iso: string, locale: string): string {
  try {
    return formatFullDate(iso, locale);
  } catch {
    return iso;
  }
}

const srOnly: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

export function RangePickerCalendar({
  classNames,
  selectionMode = 'range',
  ...props
}: RangePickerCalendarProps) {
  const ctx = useRangePickerContext('RangePicker.Calendar');
  const gridRef = useRef<HTMLTableElement>(null);
  const [announcement, setAnnouncement] = useState('');

  const {
    adapter,
    viewMonth,
    focusedDate,
    weekStartsOn,
    disabled,
    value,
    hoverDate,
    selectingTarget,
    displayTimezone,
  } = ctx;

  const { locale } = ctx;
  const weekdays = getWeekdayNames(locale, weekStartsOn);

  const weeks = getCalendarDays(viewMonth, adapter, {
    weekStartsOn,
    focusedDate,
    disabled,
    range: value,
    rangeHover: hoverDate,
    timezone: displayTimezone,
  });

  const year = adapter.getYear(viewMonth);
  const month = adapter.getMonth(viewMonth);
  const title = formatMonthYear(year, month, locale);

  useEffect(() => {
    if (!ctx.isOpen || !gridRef.current) return;
    const focusedButton = gridRef.current.querySelector<HTMLButtonElement>('[data-focused="true"]');
    focusedButton?.focus({ preventScroll: true });
  }, [focusedDate, ctx.isOpen]);

  const navigateMonth = useCallback(
    (direction: number) => {
      const newMonth = adapter.addMonths(viewMonth, direction);
      ctx.setViewMonth(newMonth);
      ctx.setFocusedDate(adapter.startOfMonth(newMonth));
      const y = adapter.getYear(newMonth);
      const m = adapter.getMonth(newMonth);
      setAnnouncement(formatMonthYear(y, m, locale));
    },
    [adapter, viewMonth, ctx, locale],
  );

  const commitDay = useCallback(
    (iso: string) => {
      if (selectionMode === 'week') {
        const weekStart = adapter.startOfWeek(iso, weekStartsOn);
        const weekEnd = adapter.startOfDay(adapter.endOfWeek(iso, weekStartsOn));
        const range: DateRange = { start: weekStart, end: weekEnd };
        ctx.setRange(range);
        ctx.close();
        setAnnouncement(
          `${safeFormatFullDate(weekStart, locale)} – ${safeFormatFullDate(weekEnd, locale)}`,
        );
      } else {
        ctx.selectDate(iso);
        setAnnouncement(safeFormatFullDate(iso, locale));
      }
    },
    [selectionMode, adapter, weekStartsOn, ctx, locale],
  );

  const handleDayClick = useCallback(
    (day: CalendarDay) => {
      if (day.isDisabled) return;
      commitDay(day.isoString);
    },
    [commitDay],
  );

  const handleDayMouseEnter = useCallback(
    (day: CalendarDay) => {
      // Week mode has no two-click flow and therefore no hover preview.
      if (selectionMode === 'week') return;
      if (selectingTarget === 'end' && value.start && !day.isDisabled) {
        ctx.setHoverDate(day.isoString);
      }
    },
    [selectionMode, selectingTarget, value.start, ctx],
  );

  const handleMouseLeave = useCallback(() => {
    ctx.setHoverDate(null);
  }, [ctx]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let newFocused: string | null = null;

      switch (e.key) {
        case 'ArrowLeft':
          newFocused = adapter.addDays(focusedDate, -1);
          break;
        case 'ArrowRight':
          newFocused = adapter.addDays(focusedDate, 1);
          break;
        case 'ArrowUp':
          newFocused = adapter.addDays(focusedDate, -7);
          break;
        case 'ArrowDown':
          newFocused = adapter.addDays(focusedDate, 7);
          break;
        case 'PageUp':
          newFocused = e.shiftKey
            ? adapter.addYears(focusedDate, -1)
            : adapter.addMonths(focusedDate, -1);
          break;
        case 'PageDown':
          newFocused = e.shiftKey
            ? adapter.addYears(focusedDate, 1)
            : adapter.addMonths(focusedDate, 1);
          break;
        case 'Home':
          newFocused = adapter.startOfWeek(focusedDate, weekStartsOn);
          break;
        case 'End':
          newFocused = adapter.startOfDay(adapter.endOfWeek(focusedDate, weekStartsOn));
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (!isDateDisabled(focusedDate, disabled, adapter)) {
            commitDay(focusedDate);
          }
          return;
        case 'Escape':
          ctx.close();
          return;
        default:
          return;
      }

      if (newFocused) {
        e.preventDefault();

        // WAI-ARIA grid pattern: skip disabled cells while keyboard-navigating.
        // Step in the original direction up to one full grid (42 cells) before giving up.
        const skipStep =
          e.key === 'ArrowLeft' ||
          e.key === 'ArrowUp' ||
          e.key === 'PageUp' ||
          e.key === 'Home'
            ? -1
            : 1;
        let attempts = 0;
        while (isDateDisabled(newFocused, disabled, adapter) && attempts < 42) {
          newFocused = adapter.addDays(newFocused, skipStep);
          attempts++;
        }
        if (attempts >= 42) return;

        ctx.setFocusedDate(newFocused);

        if (!adapter.isSameMonth(newFocused, viewMonth)) {
          ctx.setViewMonth(newFocused);
        }

        // Keep hover preview in sync while keyboard-navigating (range mode only)
        if (selectionMode === 'range' && selectingTarget === 'end' && value.start) {
          ctx.setHoverDate(newFocused);
        }
      }
    },
    [
      adapter,
      focusedDate,
      viewMonth,
      weekStartsOn,
      disabled,
      ctx,
      selectionMode,
      selectingTarget,
      value.start,
      commitDay,
    ],
  );

  return (
    <div className={classNames?.root} {...props} onMouseLeave={handleMouseLeave}>
      <div className={classNames?.header}>
        <button
          type="button"
          className={classNames?.navButton}
          onClick={() => navigateMonth(-1)}
          aria-label={ctx.labels.prevMonth}
        >
          &lt;
        </button>
        <span className={classNames?.title} aria-live="polite">
          {title}
        </span>
        <button
          type="button"
          className={classNames?.navButton}
          onClick={() => navigateMonth(1)}
          aria-label={ctx.labels.nextMonth}
        >
          &gt;
        </button>
      </div>

      <table
        ref={gridRef}
        role="grid"
        aria-label={title}
        aria-multiselectable="true"
        className={classNames?.grid}
        onKeyDown={handleKeyDown}
      >
        <thead>
          <tr role="row">
            {weekdays.map((day) => (
              <th
                key={day.short}
                role="columnheader"
                abbr={day.full}
                scope="col"
                className={classNames?.weekdayHeader}
              >
                {day.short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, weekIndex) => (
            <tr key={weekIndex} role="row" className={classNames?.gridRow}>
              {week.map((day) => {
                const dayClasses =
                  [
                    classNames?.day,
                    day.isRangeStart && classNames?.dayRangeStart,
                    day.isRangeEnd && classNames?.dayRangeEnd,
                    day.isInRange && classNames?.dayInRange,
                    day.isToday && classNames?.dayToday,
                    day.isDisabled && classNames?.dayDisabled,
                    !day.isCurrentMonth && classNames?.dayOutsideMonth,
                  ]
                    .filter(Boolean)
                    .join(' ') || undefined;

                const isSelected =
                  selectionMode === 'week'
                    ? day.isRangeStart || day.isRangeEnd || day.isInRange
                    : day.isRangeStart || day.isRangeEnd;

                return (
                  <td
                    key={day.isoString}
                    role="gridcell"
                    aria-selected={isSelected || undefined}
                    aria-disabled={day.isDisabled || undefined}
                    aria-current={day.isToday ? 'date' : undefined}
                    className={classNames?.gridCell}
                  >
                    <button
                      type="button"
                      tabIndex={day.isFocused ? 0 : -1}
                      disabled={day.isDisabled}
                      data-focused={day.isFocused || undefined}
                      data-range-start={day.isRangeStart || undefined}
                      data-range-end={day.isRangeEnd || undefined}
                      data-in-range={day.isInRange || undefined}
                      data-today={day.isToday || undefined}
                      data-outside-month={!day.isCurrentMonth || undefined}
                      className={dayClasses}
                      onClick={() => handleDayClick(day)}
                      onMouseEnter={() => handleDayMouseEnter(day)}
                      aria-label={safeFormatFullDate(day.isoString, locale)}
                    >
                      {day.dayNumber}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div role="status" aria-live="polite" aria-atomic="true" style={srOnly}>
        {announcement}
      </div>
    </div>
  );
}
