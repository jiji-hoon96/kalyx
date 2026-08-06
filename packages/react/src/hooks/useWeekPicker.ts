import { useCallback, useId, useRef, useState } from 'react';
import {
  calendarDayFromInstant,
  civilMidnightFromUtcDay,
  getCalendarDays,
  isDateDisabled,
} from '@kalyx/core';
import type {
  CalendarGrid,
  DateAdapter,
  DateRange,
  DisabledRule,
  ISODateString,
  WeekStartsOn,
} from '@kalyx/core';
import { getDefaultAdapter, resolveAdapter } from '../internal/defaultAdapter.js';
import { resolveEnabledCalendarFocus, resolveMonthNavigation } from '../internal/calendarFocus.js';

const EMPTY_RANGE: DateRange = { start: null, end: null };

export interface UseWeekPickerOptions {
  /** Selected week as a range (controlled mode) */
  value?: DateRange;
  /** Initial week (uncontrolled mode) */
  defaultValue?: DateRange;
  /** Callback fired when the selected week changes */
  onChange?: (week: DateRange) => void;
  /** Rules that mark days as disabled */
  disabled?: DisabledRule[];
  /** Day the week starts on */
  weekStartsOn?: WeekStartsOn;
  /** Date adapter */
  adapter?: DateAdapter;
  /** IANA timezone for display (see WeekPickerRoot#displayTimezone) */
  displayTimezone?: string;
  /** Whether a clicked week follows calendar boundaries or the clicked day. */
  weekAnchor?: 'calendar' | 'clicked';
  /** Which endpoint a clicked anchored week represents. */
  selectingTarget?: 'start' | 'end';
}

export interface UseWeekPickerReturn {
  /** Currently selected week, as a `{ start, end }` range */
  value: DateRange;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  /** Commit the whole week containing the clicked day */
  selectWeek: (iso: ISODateString) => void;
  /** Month currently displayed */
  viewMonth: ISODateString;
  setViewMonth: (iso: ISODateString) => void;
  /** Currently focused calendar coordinate */
  focusedDate: ISODateString;
  setFocusedDate: (iso: ISODateString) => void;
  /** Calendar grid with the selected week highlighted as a range */
  calendar: CalendarGrid;
  previousMonth: () => void;
  nextMonth: () => void;
  pickerId: string;
  adapter: DateAdapter;
}

/**
 * Headless WeekPicker state for fully custom UIs. DOM-free (preserves the
 * React Native seam). A single `selectWeek` click commits the entire week
 * (`startOfWeek`..`endOfWeek`) containing the clicked day.
 *
 * @example
 * ```tsx
 * const { calendar, selectWeek, value } = useWeekPicker({ onChange: (w) => save(w.start) });
 * ```
 */
export function useWeekPicker(options: UseWeekPickerOptions = {}): UseWeekPickerReturn {
  const {
    value: controlledValue,
    defaultValue,
    onChange,
    disabled = [],
    weekStartsOn = 0,
    adapter: adapterProp,
    displayTimezone,
    weekAnchor = 'calendar',
    selectingTarget = 'start',
  } = options;

  const adapter = resolveAdapter(adapterProp, getDefaultAdapter(), 'useWeekPicker');
  const pickerId = useId();
  const isControlled = useRef(controlledValue !== undefined).current;

  const [uncontrolledValue, setUncontrolledValue] = useState<DateRange>(
    defaultValue ?? EMPTY_RANGE,
  );
  const currentValue = isControlled ? (controlledValue ?? EMPTY_RANGE) : uncontrolledValue;

  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<ISODateString>(() => {
    const target = currentValue.start ?? adapter.today(displayTimezone);
    return displayTimezone
      ? calendarDayFromInstant(target, displayTimezone)
      : adapter.startOfDay(target);
  });
  const [focusedDate, setFocusedDate] = useState<ISODateString>(() => {
    const target = currentValue.start ?? adapter.today(displayTimezone);
    return displayTimezone
      ? calendarDayFromInstant(target, displayTimezone)
      : adapter.startOfDay(target);
  });

  const selectWeek = useCallback(
    (iso: ISODateString) => {
      const coordinate = displayTimezone ? iso : adapter.startOfDay(iso);
      let weekStart: ISODateString;
      let weekEnd: ISODateString;
      if (weekAnchor === 'clicked') {
        weekStart = selectingTarget === 'end' ? adapter.addDays(coordinate, -6) : coordinate;
        weekEnd = selectingTarget === 'end' ? coordinate : adapter.addDays(coordinate, 6);
      } else {
        weekStart = adapter.startOfWeek(coordinate, weekStartsOn);
        const calendarWeekEnd = adapter.endOfWeek(coordinate, weekStartsOn);
        weekEnd = displayTimezone ? adapter.startOfDay(calendarWeekEnd) : calendarWeekEnd;
      }
      const week: DateRange = {
        start: displayTimezone ? civilMidnightFromUtcDay(weekStart, displayTimezone) : weekStart,
        end: displayTimezone ? civilMidnightFromUtcDay(weekEnd, displayTimezone) : weekEnd,
      };
      if (
        (week.start && isDateDisabled(week.start, disabled, adapter, displayTimezone)) ||
        (week.end && isDateDisabled(week.end, disabled, adapter, displayTimezone))
      ) {
        return;
      }
      if (!isControlled) setUncontrolledValue(week);
      onChange?.(week);
      setIsOpen(false);
    },
    [
      isControlled,
      onChange,
      displayTimezone,
      adapter,
      weekStartsOn,
      weekAnchor,
      selectingTarget,
      disabled,
    ],
  );

  const open = useCallback(() => {
    setIsOpen(true);
    const target = currentValue.start ?? adapter.today(displayTimezone);
    const coordinate = displayTimezone
      ? calendarDayFromInstant(target, displayTimezone)
      : adapter.startOfDay(target);
    const focus = resolveEnabledCalendarFocus(coordinate, disabled, adapter, displayTimezone);
    setViewMonth(focus);
    setFocusedDate(focus);
  }, [currentValue.start, adapter, displayTimezone, disabled]);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [isOpen, open, close]);

  const previousMonth = useCallback(() => {
    setViewMonth((current) => {
      const next = resolveMonthNavigation(current, -1, disabled, adapter, displayTimezone);
      setFocusedDate(next.focusedDate);
      return next.viewMonth;
    });
  }, [adapter, disabled, displayTimezone]);
  const nextMonth = useCallback(() => {
    setViewMonth((current) => {
      const next = resolveMonthNavigation(current, 1, disabled, adapter, displayTimezone);
      setFocusedDate(next.focusedDate);
      return next.viewMonth;
    });
  }, [adapter, disabled, displayTimezone]);

  const calendar = getCalendarDays(viewMonth, adapter, {
    weekStartsOn,
    focusedDate: displayTimezone
      ? civilMidnightFromUtcDay(focusedDate, displayTimezone)
      : focusedDate,
    disabled,
    range: currentValue,
    timezone: displayTimezone,
  });

  return {
    value: currentValue,
    isOpen,
    open,
    close,
    toggle,
    selectWeek,
    viewMonth,
    setViewMonth,
    focusedDate,
    setFocusedDate,
    calendar,
    previousMonth,
    nextMonth,
    pickerId,
    adapter,
  };
}
