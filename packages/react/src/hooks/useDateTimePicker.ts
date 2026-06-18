import { useCallback, useId, useMemo, useRef, useState } from 'react';
import {
  civilMidnightFromUtcDay,
  getCalendarDays,
  getTime,
  getTimeInTimezone,
  setTime as setTimeOnIso,
  setTimeInTimezone,
} from '@kalyx/core';
import type {
  CalendarGrid,
  DateAdapter,
  DisabledRule,
  ISODateString,
  TimeValue,
  WeekStartsOn,
} from '@kalyx/core';
import { getDefaultAdapter, resolveAdapter } from '../internal/defaultAdapter.js';

export interface UseDateTimePickerOptions {
  /** Selected datetime (controlled, ISO 8601 UTC — date and time) */
  value?: ISODateString | null;
  /** Initial datetime (uncontrolled mode) */
  defaultValue?: ISODateString;
  /** Callback fired when the datetime changes */
  onChange?: (value: ISODateString | null) => void;
  /** Rules that mark days as disabled */
  disabled?: DisabledRule[];
  /** Day the week starts on */
  weekStartsOn?: WeekStartsOn;
  /** Date adapter */
  adapter?: DateAdapter;
  /** IANA timezone for display (see DateTimePickerRoot#displayTimezone) */
  displayTimezone?: string;
}

export interface UseDateTimePickerReturn {
  value: ISODateString | null;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  /** Select a date while preserving the current time (does not close the popover) */
  selectDate: (iso: ISODateString | null) => void;
  /** Change the time while preserving the date */
  setTime: (partial: Partial<TimeValue>) => void;
  /** The time portion of the current value, in the display timezone when set */
  currentTime: TimeValue;
  /** Month currently displayed */
  viewMonth: ISODateString;
  setViewMonth: (iso: ISODateString) => void;
  /** Calendar grid */
  calendar: CalendarGrid;
  focusedDate: ISODateString;
  setFocusedDate: (iso: ISODateString) => void;
  previousMonth: () => void;
  nextMonth: () => void;
  pickerId: string;
  adapter: DateAdapter;
}

/**
 * Headless DateTimePicker state for fully custom UIs. DOM-free (preserves the
 * React Native seam). Mirrors `DateTimePicker.Root`: selecting a date keeps the
 * time, setting the time keeps the date, and the popover stays open on date
 * selection so the user can also pick a time.
 *
 * @example
 * ```tsx
 * const { calendar, selectDate, setTime, currentTime } = useDateTimePicker({ onChange: save });
 * ```
 */
export function useDateTimePicker(options: UseDateTimePickerOptions = {}): UseDateTimePickerReturn {
  const {
    value: controlledValue,
    defaultValue,
    onChange,
    disabled = [],
    weekStartsOn = 0,
    adapter: adapterProp,
    displayTimezone,
  } = options;

  const adapter = resolveAdapter(adapterProp, getDefaultAdapter(), 'useDateTimePicker');
  const pickerId = useId();
  const isControlled = useRef(controlledValue !== undefined).current;

  const [uncontrolledValue, setUncontrolledValue] = useState<ISODateString | null>(
    defaultValue ?? null,
  );
  const currentValue = isControlled ? (controlledValue ?? null) : uncontrolledValue;

  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<ISODateString>(
    () => currentValue ?? adapter.today(displayTimezone),
  );
  const [focusedDate, setFocusedDate] = useState<ISODateString>(
    () => currentValue ?? adapter.today(displayTimezone),
  );

  // Stable {0,0,0} fallback when null keeps SSR/hydration output deterministic.
  const currentTime: TimeValue = useMemo(() => {
    if (!currentValue) return { hours: 0, minutes: 0, seconds: 0 };
    return displayTimezone
      ? getTimeInTimezone(currentValue, displayTimezone)
      : getTime(currentValue);
  }, [currentValue, displayTimezone]);

  const updateValue = useCallback(
    (next: ISODateString | null) => {
      if (!isControlled) setUncontrolledValue(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  const selectDate = useCallback(
    (iso: ISODateString | null) => {
      if (iso === null) {
        updateValue(null);
        return;
      }
      const normalizedDate = displayTimezone ? civilMidnightFromUtcDay(iso, displayTimezone) : iso;
      const time = currentValue
        ? displayTimezone
          ? getTimeInTimezone(currentValue, displayTimezone)
          : getTime(currentValue)
        : currentTime;
      const merged = displayTimezone
        ? setTimeInTimezone(normalizedDate, time, displayTimezone)
        : setTimeOnIso(normalizedDate, time);
      updateValue(merged);
    },
    [currentValue, currentTime, updateValue, displayTimezone],
  );

  const setTime = useCallback(
    (partial: Partial<TimeValue>) => {
      const base = currentValue ?? adapter.today(displayTimezone);
      const merged = displayTimezone
        ? setTimeInTimezone(base, partial, displayTimezone)
        : setTimeOnIso(base, partial);
      updateValue(merged);
    },
    [currentValue, updateValue, displayTimezone, adapter],
  );

  const open = useCallback(() => {
    setIsOpen(true);
    const target = currentValue ?? adapter.today(displayTimezone);
    setViewMonth(target);
    setFocusedDate(target);
  }, [currentValue, adapter, displayTimezone]);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((o) => !o), []);

  const previousMonth = useCallback(() => {
    setViewMonth((m) => {
      const next = adapter.addMonths(m, -1);
      setFocusedDate(adapter.startOfMonth(next));
      return next;
    });
  }, [adapter]);
  const nextMonth = useCallback(() => {
    setViewMonth((m) => {
      const next = adapter.addMonths(m, 1);
      setFocusedDate(adapter.startOfMonth(next));
      return next;
    });
  }, [adapter]);

  const calendar = getCalendarDays(viewMonth, adapter, {
    weekStartsOn,
    selected: currentValue,
    focusedDate,
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
    setTime,
    currentTime,
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
