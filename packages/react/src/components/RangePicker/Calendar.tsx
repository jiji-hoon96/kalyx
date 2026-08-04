import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { HTMLAttributes } from 'react';
import {
  getCalendarDays,
  calendarDayFromInstant,
  civilMidnightFromUtcDay,
  getISOWeekNumber,
  isDateDisabled,
  getWeekdayNames,
  formatMonthYear,
  formatFullDate,
} from '@kalyx/core';
import type { CalendarDay, DateRange } from '@kalyx/core';
import { useRangePickerContext } from '../../context/RangePickerContext.js';
import { resolveEnabledCalendarFocus } from '../../internal/calendarFocus.js';
import { horizontalDayStep, isBackwardKey } from '../_shared/rtl.js';

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
  /** Header cell at the top of the week-number column. Rendered only when `showWeekNumber` is set. */
  weekNumberHeader?: string;
  /** Each row's week-number cell. Rendered only when `showWeekNumber` is set. */
  weekNumber?: string;
}

/**
 * Selection mode for the calendar grid.
 * - `'range'` (default): RangePicker behavior — two clicks (start, end) commit a custom range.
 * - `'week'`: WeekPicker behavior — a single click commits the entire week containing the clicked day.
 */
export type RangePickerCalendarSelectionMode = 'range' | 'week';

/**
 * How the selected week is anchored when `selectionMode="week"`.
 * - `'calendar'` (default): the calendar week containing the clicked day, aligned
 *   to `weekStartsOn` (e.g. Sunday–Saturday for en-US).
 * - `'clicked'`: a rolling 7-day span that *starts* on the clicked day
 *   (clicked day … clicked day + 6), regardless of `weekStartsOn`.
 */
export type RangePickerWeekAnchor = 'calendar' | 'clicked';

export interface RangePickerCalendarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  classNames?: RangePickerCalendarClassNames;
  /** @default 'range' */
  selectionMode?: RangePickerCalendarSelectionMode;
  /**
   * When `selectionMode="week"`, controls how the 7-day span is derived from the
   * clicked day. @default 'calendar'
   */
  weekAnchor?: RangePickerWeekAnchor;
  /**
   * Render an ISO 8601 week-number column on the left of the grid (1–53).
   * The column is a `<th scope="row">`; it doesn't participate in the WAI-ARIA grid
   * data region, so keyboard navigation across the date cells is unaffected.
   */
  showWeekNumber?: boolean;
  /**
   * Always render 6 weeks (42 cells), even when the month fits in 4 or 5 rows.
   */
  fixedWeeks?: boolean;
}

/** Safe wrapper for formatFullDate — falls back to ISO string on error */
function safeFormatFullDate(iso: string, locale: string): string {
  try {
    return formatFullDate(iso, locale);
  } catch {
    return iso;
  }
}

export function RangePickerCalendar({
  classNames,
  selectionMode = 'range',
  weekAnchor = 'calendar',
  showWeekNumber = false,
  fixedWeeks = false,
  ...props
}: RangePickerCalendarProps) {
  const ctx = useRangePickerContext('RangePicker.Calendar');
  const gridRef = useRef<HTMLTableElement>(null);

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
  const dir = ctx.dir;
  // Memoized — see DatePicker/Calendar.tsx for the rationale.
  const weekdays = useMemo(() => getWeekdayNames(locale, weekStartsOn), [locale, weekStartsOn]);

  const weeks = useMemo(
    () =>
      getCalendarDays(viewMonth, adapter, {
        weekStartsOn,
        focusedDate:
          displayTimezone && focusedDate
            ? civilMidnightFromUtcDay(focusedDate, displayTimezone)
            : focusedDate,
        disabled,
        range: value,
        rangeHover: hoverDate,
        timezone: displayTimezone,
        fixedWeeks,
      }),
    [
      viewMonth,
      adapter,
      weekStartsOn,
      focusedDate,
      disabled,
      value,
      hoverDate,
      displayTimezone,
      fixedWeeks,
    ],
  );

  // ISO week number anchored to the row's Thursday — see DatePicker/Calendar.tsx for rationale.
  const thursdayIndex = weekStartsOn === 0 ? 4 : 3;

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
      const monthStart = adapter.startOfMonth(newMonth);
      ctx.setViewMonth(newMonth);
      ctx.setFocusedDate(
        resolveEnabledCalendarFocus(monthStart, disabled, adapter, displayTimezone),
      );
      const y = adapter.getYear(newMonth);
      const m = adapter.getMonth(newMonth);
      ctx.announce(formatMonthYear(y, m, locale));
    },
    [adapter, viewMonth, ctx, locale, disabled, displayTimezone],
  );

  const commitDay = useCallback(
    (iso: string) => {
      if (selectionMode === 'week') {
        let weekStart: string;
        let weekEnd: string;
        if (weekAnchor === 'clicked') {
          // Rolling 7-day span anchored to the clicked day. The active input
          // decides the direction: clicking while targeting 'end' makes the
          // clicked day the END (span goes backward 6 days); otherwise it's the
          // START (span goes forward 6 days).
          if (selectingTarget === 'end') {
            weekEnd = adapter.startOfDay(iso);
            weekStart = adapter.startOfDay(adapter.addDays(weekEnd, -6));
          } else {
            weekStart = adapter.startOfDay(iso);
            weekEnd = adapter.startOfDay(adapter.addDays(weekStart, 6));
          }
        } else {
          // 'calendar': the weekStartsOn-aligned week around the clicked day.
          weekStart = adapter.startOfWeek(iso, weekStartsOn);
          weekEnd = adapter.startOfDay(adapter.endOfWeek(iso, weekStartsOn));
        }
        const range: DateRange = {
          start: displayTimezone ? civilMidnightFromUtcDay(weekStart, displayTimezone) : weekStart,
          end: displayTimezone ? civilMidnightFromUtcDay(weekEnd, displayTimezone) : weekEnd,
        };
        if (ctx.setRange(range)) {
          ctx.close();
          ctx.announce(
            `${ctx.labels.rangeSelected}: ${safeFormatFullDate(weekStart, locale)} – ${safeFormatFullDate(weekEnd, locale)}`,
          );
        }
      } else {
        // Capture selectingTarget BEFORE selectDate flips it so we can announce
        // the right state. "start" click prompts for the end; "end" click closes
        // the range and announces the full span.
        const wasPickingStart = selectingTarget === 'start';
        const previousStart = value.start;
        if (!ctx.selectDate(iso)) return;
        const formatted = safeFormatFullDate(iso, locale);
        if (wasPickingStart) {
          ctx.announce(`${formatted}. ${ctx.labels.selectingEnd}`);
        } else if (previousStart) {
          // Mirror the swap-if-before logic from RangePickerRoot.selectDate so the
          // announcement matches what will be committed.
          const selectedValue = displayTimezone
            ? civilMidnightFromUtcDay(iso, displayTimezone)
            : iso;
          const previousStartCoordinate = displayTimezone
            ? calendarDayFromInstant(previousStart, displayTimezone)
            : previousStart;
          const [start, end] = adapter.isBefore(selectedValue, previousStart)
            ? [iso, previousStartCoordinate]
            : [previousStartCoordinate, iso];
          ctx.announce(
            `${ctx.labels.rangeSelected}: ${safeFormatFullDate(start, locale)} – ${safeFormatFullDate(end, locale)}`,
          );
        } else {
          // Safety: no previous start (e.g. preset cleared mid-flow) — fall back
          // to a simple per-day announcement so the user still hears something.
          ctx.announce(formatted);
        }
      }
    },
    [
      selectionMode,
      weekAnchor,
      adapter,
      weekStartsOn,
      ctx,
      locale,
      selectingTarget,
      value.start,
      displayTimezone,
    ],
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

      // RTL swaps the physical ArrowLeft/ArrowRight (WAI-ARIA grid follows visual
      // layout). See _shared/rtl.ts.
      const hStep = horizontalDayStep(e.key, dir);
      if (hStep !== null) {
        newFocused = adapter.addDays(focusedDate, hStep);
      } else {
        switch (e.key) {
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
            const focusedValue = displayTimezone
              ? civilMidnightFromUtcDay(focusedDate, displayTimezone)
              : focusedDate;
            if (!isDateDisabled(focusedValue, disabled, adapter, displayTimezone)) {
              commitDay(focusedDate);
            }
            return;
          case 'Escape':
            // Stop the synthetic Escape from bubbling to a host modal/dialog.
            e.preventDefault();
            e.stopPropagation();
            ctx.close();
            return;
          default:
            return;
        }
      }

      if (newFocused) {
        e.preventDefault();

        // WAI-ARIA grid pattern: skip disabled cells while keyboard-navigating.
        // Step in the original direction up to one full grid (42 cells) before giving up.
        const skipStep = isBackwardKey(e.key, dir) ? -1 : 1;
        let attempts = 0;
        while (
          isDateDisabled(
            displayTimezone ? civilMidnightFromUtcDay(newFocused, displayTimezone) : newFocused,
            disabled,
            adapter,
            displayTimezone,
          ) &&
          attempts < 42
        ) {
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
      dir,
      displayTimezone,
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

      {/* aria-multiselectable intentionally omitted: a date range is one selection
          (two endpoints), not multi-select. */}
      <table
        ref={gridRef}
        role="grid"
        aria-label={title}
        aria-rowcount={weeks.length + 1}
        aria-colcount={7}
        dir={dir}
        className={classNames?.grid}
        onKeyDown={handleKeyDown}
      >
        <thead>
          <tr role="row" aria-rowindex={1}>
            {showWeekNumber ? (
              <th scope="col" aria-hidden="true" className={classNames?.weekNumberHeader}>
                #
              </th>
            ) : null}
            {weekdays.map((day, colIndex) => (
              <th
                key={day.short}
                role="columnheader"
                abbr={day.full}
                scope="col"
                aria-colindex={colIndex + 1}
                className={classNames?.weekdayHeader}
              >
                {day.short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, weekIndex) => (
            <tr
              key={weekIndex}
              role="row"
              aria-rowindex={weekIndex + 2}
              className={classNames?.gridRow}
            >
              {showWeekNumber ? (
                <th
                  scope="row"
                  aria-hidden="true"
                  className={classNames?.weekNumber}
                  data-week-number
                >
                  {getISOWeekNumber(week[thursdayIndex]!.isoString)}
                </th>
              ) : null}
              {week.map((day, colIndex) => {
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
                    aria-colindex={colIndex + 1}
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
    </div>
  );
}
