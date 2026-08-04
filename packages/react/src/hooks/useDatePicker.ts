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
  DisabledRule,
  ISODateString,
  WeekStartsOn,
} from '@kalyx/core';
import { getDefaultAdapter, resolveAdapter } from '../internal/defaultAdapter.js';
import { resolveEnabledCalendarFocus } from '../internal/calendarFocus.js';

export interface UseDatePickerOptions {
  /** Selected date (controlled mode) */
  value?: ISODateString | null;
  /** Initial date (uncontrolled mode) */
  defaultValue?: ISODateString;
  /** Callback fired when the date changes */
  onChange?: (value: ISODateString | null) => void;
  /** Rules that mark days as disabled */
  disabled?: DisabledRule[];
  /** Day the week starts on */
  weekStartsOn?: WeekStartsOn;
  /** Date adapter */
  adapter?: DateAdapter;
  /** IANA timezone for display (see DatePickerRoot#displayTimezone) */
  displayTimezone?: string;
}

export interface UseDatePickerReturn {
  /** Currently selected date (ISO string) */
  value: ISODateString | null;
  /** Whether the popover is open */
  isOpen: boolean;
  /** Open the popover */
  open: () => void;
  /** Close the popover */
  close: () => void;
  /** Toggle the popover */
  toggle: () => void;
  /** Select a date */
  selectDate: (iso: ISODateString | null) => void;
  /** Month currently displayed (ISO string) */
  viewMonth: ISODateString;
  /** Change the displayed month */
  setViewMonth: (iso: ISODateString) => void;
  /** Calendar grid data */
  calendar: CalendarGrid;
  /** Currently focused date */
  focusedDate: ISODateString;
  /** Update the focused date */
  setFocusedDate: (iso: ISODateString) => void;
  /** Move to the previous month */
  previousMonth: () => void;
  /** Move to the next month */
  nextMonth: () => void;
  /** Unique ID */
  pickerId: string;
  /** Date adapter */
  adapter: DateAdapter;
}

/**
 * Hook that manages DatePicker state.
 * Use this when you want to implement a fully custom UI without the built-in components.
 *
 * @example
 * ```tsx
 * function MyDatePicker() {
 *   const { value, isOpen, calendar, open, selectDate } = useDatePicker({
 *     onChange: (iso) => console.log(iso),
 *   });
 *   // ... custom rendering
 * }
 * ```
 */
export function useDatePicker(options: UseDatePickerOptions = {}): UseDatePickerReturn {
  const {
    value: controlledValue,
    defaultValue,
    onChange,
    disabled = [],
    weekStartsOn = 0,
    adapter: adapterProp,
    displayTimezone,
  } = options;

  const adapter = resolveAdapter(adapterProp, getDefaultAdapter(), 'useDatePicker');
  const pickerId = useId();
  const isControlled = useRef(controlledValue !== undefined).current;

  const [uncontrolledValue, setUncontrolledValue] = useState<ISODateString | null>(
    defaultValue ?? null,
  );

  const currentValue = isControlled ? (controlledValue ?? null) : uncontrolledValue;

  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<ISODateString>(() => {
    const target = currentValue ?? adapter.today(displayTimezone);
    return displayTimezone
      ? calendarDayFromInstant(target, displayTimezone)
      : adapter.startOfDay(target);
  });
  const [focusedDate, setFocusedDate] = useState<ISODateString>(() => {
    const target = currentValue ?? adapter.today(displayTimezone);
    return displayTimezone
      ? calendarDayFromInstant(target, displayTimezone)
      : adapter.startOfDay(target);
  });

  const selectDate = useCallback(
    (iso: ISODateString | null) => {
      const normalized =
        iso && displayTimezone ? civilMidnightFromUtcDay(iso, displayTimezone) : iso;
      if (normalized && isDateDisabled(normalized, disabled, adapter, displayTimezone)) return;
      if (!isControlled) {
        setUncontrolledValue(normalized);
      }
      onChange?.(normalized);
      setIsOpen(false);
    },
    [isControlled, onChange, displayTimezone, disabled, adapter],
  );

  const open = useCallback(() => {
    setIsOpen(true);
    const target = currentValue ?? adapter.today(displayTimezone);
    const coordinate = displayTimezone
      ? calendarDayFromInstant(target, displayTimezone)
      : adapter.startOfDay(target);
    setViewMonth(coordinate);
    setFocusedDate(resolveEnabledCalendarFocus(coordinate, disabled, adapter, displayTimezone));
  }, [currentValue, adapter, displayTimezone, disabled]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [isOpen, open, close]);

  const previousMonth = useCallback(() => {
    const newMonth = adapter.addMonths(viewMonth, -1);
    setViewMonth(newMonth);
    setFocusedDate(adapter.startOfMonth(newMonth));
  }, [adapter, viewMonth]);

  const nextMonth = useCallback(() => {
    const newMonth = adapter.addMonths(viewMonth, 1);
    setViewMonth(newMonth);
    setFocusedDate(adapter.startOfMonth(newMonth));
  }, [adapter, viewMonth]);

  const calendar = getCalendarDays(viewMonth, adapter, {
    weekStartsOn,
    selected: currentValue,
    focusedDate: displayTimezone
      ? civilMidnightFromUtcDay(focusedDate, displayTimezone)
      : focusedDate,
    disabled,
    timezone: displayTimezone,
  });

  return {
    value: currentValue,
    isOpen,
    open,
    close,
    toggle,
    selectDate,
    viewMonth,
    setViewMonth,
    calendar,
    focusedDate,
    setFocusedDate,
    previousMonth,
    nextMonth,
    pickerId,
    adapter,
  };
}
