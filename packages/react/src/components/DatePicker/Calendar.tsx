import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { HTMLAttributes } from 'react';
import {
  getCalendarDays,
  isDateDisabled,
  getWeekdayNames,
  formatMonthYear,
  formatFullDate,
} from '@kalyx/core';
import type { CalendarDay } from '@kalyx/core';
import { useDatePickerContext } from '../../context/DatePickerContext.js';

export interface DatePickerCalendarClassNames {
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
  weekdayHeader?: string;
}

export interface DatePickerCalendarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  classNames?: DatePickerCalendarClassNames;
  /** Called when the title ("January 2026") is clicked. Useful for switching to Month/Year views. */
  onTitleClick?: () => void;
}

/** Safe wrapper for formatFullDate — falls back to ISO string on error */
function safeFormatFullDate(iso: string, locale: string): string {
  try {
    return formatFullDate(iso, locale);
  } catch {
    return iso;
  }
}

/** Visually-hidden style for screen-reader-only content */
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

export function DatePickerCalendar({
  classNames,
  onTitleClick,
  ...props
}: DatePickerCalendarProps) {
  const ctx = useDatePickerContext('DatePicker.Calendar');
  const gridRef = useRef<HTMLTableElement>(null);
  const [announcement, setAnnouncement] = useState('');

  const { adapter, viewMonth, focusedDate, weekStartsOn, disabled, locale, displayTimezone } = ctx;
  // Memoized — weekday header tuples only change when locale or week start changes.
  const weekdays = useMemo(() => getWeekdayNames(locale, weekStartsOn), [locale, weekStartsOn]);

  // Recompute cell flags with a timezone-aware today/selected matcher when displayTimezone is set.
  // The grid iteration stays in UTC — only the `isSelected` / `isToday` highlighting shifts.
  // Memoized so the 42-cell grid isn't rebuilt on unrelated re-renders (parent state, etc.).
  const weeks = useMemo(
    () =>
      getCalendarDays(viewMonth, adapter, {
        weekStartsOn,
        selected: ctx.value,
        focusedDate,
        disabled,
        timezone: displayTimezone,
      }),
    [viewMonth, adapter, weekStartsOn, ctx.value, focusedDate, disabled, displayTimezone],
  );

  const year = adapter.getYear(viewMonth);
  const month = adapter.getMonth(viewMonth);
  const title = formatMonthYear(year, month, locale);

  // Move focus to the focused day cell. `preventScroll` avoids the page
  // jumping when the calendar mounts below an input/trigger that's already
  // scrolled into view.
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

  const handleDayClick = useCallback(
    (day: CalendarDay) => {
      if (day.isDisabled) return;
      ctx.selectDate(day.isoString);
      setAnnouncement(safeFormatFullDate(day.isoString, locale));
    },
    [ctx, locale],
  );

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
          if (e.shiftKey) {
            newFocused = adapter.addYears(focusedDate, -1);
          } else {
            newFocused = adapter.addMonths(focusedDate, -1);
          }
          break;
        case 'PageDown':
          if (e.shiftKey) {
            newFocused = adapter.addYears(focusedDate, 1);
          } else {
            newFocused = adapter.addMonths(focusedDate, 1);
          }
          break;
        case 'Home':
          newFocused = adapter.startOfWeek(focusedDate, weekStartsOn);
          break;
        case 'End':
          newFocused = adapter.endOfWeek(focusedDate, weekStartsOn);
          // endOfWeek returns 23:59:59; normalize to start of day
          newFocused = adapter.startOfDay(newFocused);
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

        // WAI-ARIA grid pattern: disabled cells should be skipped during keyboard
        // navigation. Keep stepping in the original direction until we land on an
        // enabled day, capped at 42 attempts (one full grid) to avoid infinite loops
        // when every day in range is disabled.
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
        if (attempts >= 42) {
          // No reachable enabled date in this direction — leave focus where it was.
          return;
        }

        ctx.setFocusedDate(newFocused);

        // Update the view when focus moves outside the current view month
        if (!adapter.isSameMonth(newFocused, viewMonth)) {
          ctx.setViewMonth(newFocused);
        }
      }
    },
    [adapter, focusedDate, viewMonth, weekStartsOn, disabled, ctx],
  );

  return (
    <div className={classNames?.root} {...props}>
      <div className={classNames?.header}>
        <button
          type="button"
          className={classNames?.navButton}
          onClick={() => navigateMonth(-1)}
          aria-label={ctx.labels.prevMonth}
        >
          &lt;
        </button>
        {onTitleClick ? (
          <button
            type="button"
            className={classNames?.title}
            onClick={onTitleClick}
            aria-live="polite"
          >
            {title}
          </button>
        ) : (
          <span className={classNames?.title} aria-live="polite">
            {title}
          </span>
        )}
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
                    day.isSelected && classNames?.daySelected,
                    day.isToday && classNames?.dayToday,
                    day.isDisabled && classNames?.dayDisabled,
                    !day.isCurrentMonth && classNames?.dayOutsideMonth,
                  ]
                    .filter(Boolean)
                    .join(' ') || undefined;

                return (
                  <td
                    key={day.isoString}
                    role="gridcell"
                    aria-selected={day.isSelected || undefined}
                    aria-disabled={day.isDisabled || undefined}
                    aria-current={day.isToday ? 'date' : undefined}
                    className={classNames?.gridCell}
                  >
                    <button
                      type="button"
                      tabIndex={day.isFocused ? 0 : -1}
                      disabled={day.isDisabled}
                      data-focused={day.isFocused || undefined}
                      data-selected={day.isSelected || undefined}
                      data-today={day.isToday || undefined}
                      data-outside-month={!day.isCurrentMonth || undefined}
                      className={dayClasses}
                      onClick={() => handleDayClick(day)}
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
