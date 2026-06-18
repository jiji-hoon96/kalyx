import { useCallback, useId, useRef, useState } from 'react';
import { civilMidnightFromUtcDay, getCalendarDays } from '@kalyx/core';
import type {
  CalendarGrid,
  DateAdapter,
  DateRange,
  DisabledRule,
  ISODateString,
  WeekStartsOn,
} from '@kalyx/core';
import { getDefaultAdapter, resolveAdapter } from '../internal/defaultAdapter.js';

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
  } = options;

  const adapter = resolveAdapter(adapterProp, getDefaultAdapter(), 'useWeekPicker');
  const pickerId = useId();
  const isControlled = useRef(controlledValue !== undefined).current;

  const [uncontrolledValue, setUncontrolledValue] = useState<DateRange>(
    defaultValue ?? EMPTY_RANGE,
  );
  const currentValue = isControlled ? (controlledValue ?? EMPTY_RANGE) : uncontrolledValue;

  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<ISODateString>(
    () => currentValue.start ?? adapter.today(displayTimezone),
  );

  const selectWeek = useCallback(
    (iso: ISODateString) => {
      const normalized = displayTimezone ? civilMidnightFromUtcDay(iso, displayTimezone) : iso;
      const week: DateRange = {
        start: adapter.startOfWeek(normalized, weekStartsOn),
        end: adapter.endOfWeek(normalized, weekStartsOn),
      };
      if (!isControlled) setUncontrolledValue(week);
      onChange?.(week);
      setIsOpen(false);
    },
    [isControlled, onChange, displayTimezone, adapter, weekStartsOn],
  );

  const open = useCallback(() => {
    setIsOpen(true);
    setViewMonth(currentValue.start ?? adapter.today(displayTimezone));
  }, [currentValue.start, adapter, displayTimezone]);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((o) => !o), []);

  const previousMonth = useCallback(() => setViewMonth((m) => adapter.addMonths(m, -1)), [adapter]);
  const nextMonth = useCallback(() => setViewMonth((m) => adapter.addMonths(m, 1)), [adapter]);

  const calendar = getCalendarDays(viewMonth, adapter, {
    weekStartsOn,
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
    calendar,
    previousMonth,
    nextMonth,
    pickerId,
    adapter,
  };
}
