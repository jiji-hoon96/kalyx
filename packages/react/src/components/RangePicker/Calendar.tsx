import { useCallback, useEffect, useRef, useState } from 'react';
import type { HTMLAttributes } from 'react';
import { getCalendarDays, isDateDisabled, getWeekdayNames, formatMonthYear, formatFullDate } from '@kalyx/core';
import type { CalendarDay } from '@kalyx/core';
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

export interface RangePickerCalendarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  classNames?: RangePickerCalendarClassNames;
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

export function RangePickerCalendar({ classNames, ...props }: RangePickerCalendarProps) {
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
    const focusedButton = gridRef.current.querySelector<HTMLButtonElement>(
      '[data-focused="true"]',
    );
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

  const handleDayClick = useCallback(
    (day: CalendarDay) => {
      if (day.isDisabled) return;
      ctx.selectDate(day.isoString);
      setAnnouncement(safeFormatFullDate(day.isoString, locale));
    },
    [ctx, locale],
  );

  const handleDayMouseEnter = useCallback(
    (day: CalendarDay) => {
      if (selectingTarget === 'end' && value.start && !day.isDisabled) {
        ctx.setHoverDate(day.isoString);
      }
    },
    [selectingTarget, value.start, ctx],
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
            ctx.selectDate(focusedDate);
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
        ctx.setFocusedDate(newFocused);

        if (!adapter.isSameMonth(newFocused, viewMonth)) {
          ctx.setViewMonth(newFocused);
        }

        // Keep hover preview in sync while keyboard-navigating
        if (selectingTarget === 'end' && value.start) {
          ctx.setHoverDate(newFocused);
        }
      }
    },
    [adapter, focusedDate, viewMonth, weekStartsOn, disabled, ctx, selectingTarget, value.start],
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
                const dayClasses = [
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

                const isSelected = day.isRangeStart || day.isRangeEnd;

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
