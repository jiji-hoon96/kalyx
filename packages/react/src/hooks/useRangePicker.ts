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
import type { RangeSelectingTarget } from '../context/RangePickerContext.js';
import { getDefaultAdapter, resolveAdapter } from '../internal/defaultAdapter.js';
import { resolveEnabledCalendarFocus } from '../internal/calendarFocus.js';

const EMPTY_RANGE: DateRange = { start: null, end: null };

export interface UseRangePickerOptions {
  /** Selected range (controlled mode) */
  value?: DateRange;
  /** Initial range (uncontrolled mode) */
  defaultValue?: DateRange;
  /** Callback fired when the range changes */
  onChange?: (range: DateRange) => void;
  /** Rules that mark days as disabled */
  disabled?: DisabledRule[];
  /** Day the week starts on */
  weekStartsOn?: WeekStartsOn;
  /** Date adapter */
  adapter?: DateAdapter;
  /** IANA timezone for display (see RangePickerRoot#displayTimezone) */
  displayTimezone?: string;
}

export interface UseRangePickerReturn {
  /** Currently selected range */
  value: DateRange;
  /** Which endpoint will be selected next */
  selectingTarget: RangeSelectingTarget;
  /** Handler for clicking a single date */
  selectDate: (iso: ISODateString) => void;
  /** Set the range directly */
  setRange: (range: DateRange) => void;
  /** Whether the popover is open */
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  /** Hovered date (for range preview) */
  hoverDate: ISODateString | null;
  setHoverDate: (iso: ISODateString | null) => void;
  /** Month currently displayed */
  viewMonth: ISODateString;
  setViewMonth: (iso: ISODateString) => void;
  /** Calendar grid */
  calendar: CalendarGrid;
  /** Currently focused date */
  focusedDate: ISODateString;
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
 * Hook that manages RangePicker state.
 * Use this when you want to build a fully custom UI without the built-in components.
 *
 * @example
 * ```tsx
 * function MyRangePicker() {
 *   const { value, calendar, selectDate, selectingTarget } = useRangePicker({
 *     onChange: (range) => console.log(range.start, range.end),
 *   });
 *   // selectingTarget === 'start' -> waiting for start date
 *   // selectingTarget === 'end'   -> waiting for end date
 * }
 * ```
 */
export function useRangePicker(options: UseRangePickerOptions = {}): UseRangePickerReturn {
  const {
    value: controlledValue,
    defaultValue,
    onChange,
    disabled = [],
    weekStartsOn = 0,
    adapter: adapterProp,
    displayTimezone,
  } = options;

  const adapter = resolveAdapter(adapterProp, getDefaultAdapter(), 'useRangePicker');
  const pickerId = useId();
  const isControlled = useRef(controlledValue !== undefined).current;

  const [uncontrolledValue, setUncontrolledValue] = useState<DateRange>(
    defaultValue ?? EMPTY_RANGE,
  );

  const currentValue = isControlled ? (controlledValue ?? EMPTY_RANGE) : uncontrolledValue;

  const [isOpen, setIsOpen] = useState(false);
  const [selectingTarget, setSelectingTarget] = useState<RangeSelectingTarget>('start');
  const [hoverDate, setHoverDate] = useState<ISODateString | null>(null);
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

  const setRange = useCallback(
    (range: DateRange) => {
      if (
        (range.start && isDateDisabled(range.start, disabled, adapter, displayTimezone)) ||
        (range.end && isDateDisabled(range.end, disabled, adapter, displayTimezone))
      ) {
        return false;
      }
      if (!isControlled) {
        setUncontrolledValue(range);
      }
      onChange?.(range);
      return true;
    },
    [isControlled, onChange, disabled, adapter, displayTimezone],
  );

  const selectDate = useCallback(
    (iso: ISODateString) => {
      const normalized = displayTimezone ? civilMidnightFromUtcDay(iso, displayTimezone) : iso;
      if (selectingTarget === 'start') {
        if (!setRange({ start: normalized, end: null })) return;
        setSelectingTarget('end');
        setHoverDate(null);
      } else {
        const start = currentValue.start;
        if (!start) {
          if (!setRange({ start: normalized, end: null })) return;
          setSelectingTarget('end');
          return;
        }

        const newRange: DateRange = adapter.isBefore(normalized, start)
          ? { start: normalized, end: start }
          : { start, end: normalized };

        if (!setRange(newRange)) return;
        setSelectingTarget('start');
        setHoverDate(null);
        setIsOpen(false);
      }
    },
    [selectingTarget, currentValue.start, adapter, setRange, displayTimezone],
  );

  const open = useCallback(() => {
    setIsOpen(true);
    const target = currentValue.start ?? adapter.today(displayTimezone);
    const coordinate = displayTimezone
      ? calendarDayFromInstant(target, displayTimezone)
      : adapter.startOfDay(target);
    setViewMonth(coordinate);
    setFocusedDate(resolveEnabledCalendarFocus(coordinate, disabled, adapter, displayTimezone));
    if (currentValue.start && currentValue.end) {
      setSelectingTarget('start');
    }
  }, [currentValue, adapter, displayTimezone, disabled]);

  const close = useCallback(() => {
    setIsOpen(false);
    setHoverDate(null);
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
    focusedDate: displayTimezone
      ? civilMidnightFromUtcDay(focusedDate, displayTimezone)
      : focusedDate,
    disabled,
    range: currentValue,
    rangeHover: hoverDate,
    timezone: displayTimezone,
  });

  return {
    value: currentValue,
    selectingTarget,
    selectDate,
    setRange,
    isOpen,
    open,
    close,
    toggle,
    hoverDate,
    setHoverDate,
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
