import { useCallback, useEffect, useRef, useState } from 'react';
import type { HTMLAttributes } from 'react';
import { getCalendarDays, isDateDisabled, getWeekdayNames, formatMonthYear, formatFullDate } from '@kalyx/core';
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
  /** 타이틀("January 2026") 클릭 시 콜백. Month/Year 뷰 전환에 사용. */
  onTitleClick?: () => void;
}

/** 스크린리더 전용 숨김 스타일 */
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

export function DatePickerCalendar({ classNames, onTitleClick, ...props }: DatePickerCalendarProps) {
  const ctx = useDatePickerContext('DatePicker.Calendar');
  const gridRef = useRef<HTMLTableElement>(null);
  const [announcement, setAnnouncement] = useState('');

  const { adapter, viewMonth, focusedDate, weekStartsOn, disabled, locale } = ctx;
  const weekdays = getWeekdayNames(locale, weekStartsOn);

  const weeks = getCalendarDays(viewMonth, adapter, {
    weekStartsOn,
    selected: ctx.value,
    focusedDate,
    disabled,
  });

  const year = adapter.getYear(viewMonth);
  const month = adapter.getMonth(viewMonth);
  const title = formatMonthYear(year, month, locale);

  // 포커스된 날짜 셀에 포커스 이동
  useEffect(() => {
    if (!ctx.isOpen || !gridRef.current) return;
    const focusedButton = gridRef.current.querySelector<HTMLButtonElement>(
      '[data-focused="true"]',
    );
    focusedButton?.focus();
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
      setAnnouncement(formatFullDate(day.isoString, locale));
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
          // endOfWeek는 23:59:59 반환하므로 startOfDay로 정규화
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
        ctx.setFocusedDate(newFocused);

        // 포커스가 현재 뷰 월을 벗어나면 뷰도 업데이트
        if (!adapter.isSameMonth(newFocused, viewMonth)) {
          ctx.setViewMonth(newFocused);
        }
      }
    },
    [adapter, focusedDate, viewMonth, weekStartsOn, disabled, ctx],
  );

  return (
    <div className={classNames?.root} {...props}>
      {/* 헤더: 이전/다음 월 네비게이션 */}
      <div className={classNames?.header}>
        <button
          type="button"
          className={classNames?.navButton}
          onClick={() => navigateMonth(-1)}
          aria-label="이전 달"
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
          aria-label="다음 달"
        >
          &gt;
        </button>
      </div>

      {/* 캘린더 그리드 */}
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
                const dayClasses = [
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
                      aria-label={formatFullDate(day.isoString, locale)}
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

      {/* 스크린리더용 알림 */}
      <div role="status" aria-live="polite" aria-atomic="true" style={srOnly}>
        {announcement}
      </div>
    </div>
  );
}
