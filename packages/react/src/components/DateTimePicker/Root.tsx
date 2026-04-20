import { useCallback, useId, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  DateFnsAdapter,
  DEFAULT_DATEPICKER_LABELS,
  DEFAULT_TIMEPICKER_LABELS,
  getTime,
  setTime as setTimeOnIso,
  getTimeInTimezone,
  setTimeInTimezone,
  civilMidnightFromUtcDay,
} from '@kalyx/core';
import type {
  DateAdapter,
  DateTimePickerLabels,
  DisabledRule,
  ISODateString,
  TimeValue,
  WeekStartsOn,
} from '@kalyx/core';
import { DatePickerContext } from '../../context/DatePickerContext.js';
import type { DatePickerContextValue } from '../../context/DatePickerContext.js';
import { TimePickerContext } from '../../context/TimePickerContext.js';
import type {
  TimePickerContextValue,
  TimePickerFormat,
} from '../../context/TimePickerContext.js';

/**
 * Props for the DateTimePicker Root component.
 * Internally provides both DatePickerContext and TimePickerContext (context bridging).
 *
 * @example
 * ```tsx
 * <DateTimePicker value={dt} onChange={setDt} format="24h" step={15}>
 *   <DateTimePicker.Input />
 *   <DateTimePicker.Popover>
 *     <DateTimePicker.Calendar />
 *     <DateTimePicker.HourList />
 *     <DateTimePicker.MinuteList />
 *   </DateTimePicker.Popover>
 * </DateTimePicker>
 * ```
 */
export interface DateTimePickerRootProps {
  /** Selected datetime (controlled, ISO 8601 UTC). Includes both date and time. */
  value?: ISODateString | null;
  /** Initial datetime (uncontrolled) */
  defaultValue?: ISODateString;
  /** Callback fired when the datetime changes */
  onChange?: (value: ISODateString | null) => void;
  /** 12-hour or 24-hour mode */
  format?: TimePickerFormat;
  /** Minute step (e.g., 1, 5, 15, 30) */
  step?: number;
  /** Disabled rules (applied to dates) */
  disabled?: DisabledRule[] | boolean;
  /** Read-only */
  readOnly?: boolean;
  /** Week start day */
  weekStartsOn?: WeekStartsOn;
  /** Date+time display format (for Input) */
  displayFormat?: string;
  /** BCP 47 locale */
  locale?: string;
  /**
   * IANA timezone used for display (e.g., "Asia/Seoul"). When set, Calendar highlights match
   * civil days in this zone, TimePicker reads/writes the time in this zone, and the Input
   * formats the combined date+time in this zone.
   */
  displayTimezone?: string;
  /** Date adapter */
  adapter?: DateAdapter;
  /** Override ARIA labels (defaults to English) */
  labels?: Partial<DateTimePickerLabels>;
  /** Child components */
  children: ReactNode;
}

/** Fallback ISO used when value is null (today at 00:00:00 UTC) */
function getDefaultIso(): ISODateString {
  return DateFnsAdapter.today();
}

/**
 * DateTimePicker.Root — Combined DatePicker + TimePicker component.
 *
 * Manages a single ISO datetime as the source of truth while providing both
 * DatePickerContext and TimePickerContext internally. This lets existing
 * components such as DatePicker.Calendar and TimePicker.HourList be reused as-is.
 *
 * Key behavior:
 * - Clicking a day in Calendar -> changes only the date, preserves the time, keeps popover open
 * - Changing time in TimePicker -> changes only the time, preserves the date
 * - Escape / outside click -> close the popover (commit)
 */
export function DateTimePickerRoot({
  value: controlledValue,
  defaultValue,
  onChange,
  format = '24h',
  step = 1,
  disabled = false,
  readOnly = false,
  weekStartsOn = 0,
  displayFormat = 'yyyy-MM-dd HH:mm',
  locale = 'en-US',
  displayTimezone,
  adapter = DateFnsAdapter,
  labels: labelsProp,
  children,
}: DateTimePickerRootProps) {
  const pickerId = useId();
  const mergedDateLabels = useMemo(
    () => ({ ...DEFAULT_DATEPICKER_LABELS, ...labelsProp }),
    [labelsProp],
  );
  const mergedTimeLabels = useMemo(
    () => ({ ...DEFAULT_TIMEPICKER_LABELS, ...labelsProp }),
    [labelsProp],
  );
  const isControlled = useRef(controlledValue !== undefined).current;
  const referenceRef = useRef<HTMLElement | null>(null);

  const [uncontrolledValue, setUncontrolledValue] = useState<ISODateString | null>(
    defaultValue ?? null,
  );

  const currentValue = isControlled ? (controlledValue ?? null) : uncontrolledValue;

  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<ISODateString>(
    currentValue ?? adapter.today(displayTimezone),
  );
  const [focusedDate, setFocusedDate] = useState<ISODateString>(
    currentValue ?? adapter.today(displayTimezone),
  );

  const isDisabled = typeof disabled === 'boolean' ? disabled : false;
  const disabledRules: DisabledRule[] = useMemo(
    () => (Array.isArray(disabled) ? disabled : []),
    [disabled],
  );

  // When value is null, use a fallback for time extraction
  const baseIso = currentValue ?? getDefaultIso();
  const currentTime: TimeValue = useMemo(
    () => (displayTimezone ? getTimeInTimezone(baseIso, displayTimezone) : getTime(baseIso)),
    [baseIso, displayTimezone],
  );

  const updateValue = useCallback(
    (next: ISODateString | null) => {
      if (isDisabled || readOnly) return;
      if (!isControlled) {
        setUncontrolledValue(next);
      }
      onChange?.(next);
    },
    [isControlled, isDisabled, readOnly, onChange],
  );

  /**
   * Select a date while preserving the time portion.
   * Unlike DatePicker.Root, this does not automatically close the popover.
   */
  const selectDate = useCallback(
    (newDateIso: ISODateString | null) => {
      if (newDateIso === null) {
        updateValue(null);
        return;
      }
      // Map UTC-grid ISO to civil-midnight in display timezone when set
      const normalizedDate = displayTimezone
        ? civilMidnightFromUtcDay(newDateIso, displayTimezone)
        : newDateIso;
      // Preserve the current time portion (tz-aware when applicable)
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

  /**
   * Change the time while preserving the date portion.
   */
  const setTime = useCallback(
    (partial: Partial<TimeValue>) => {
      // If no date yet, start from today at midnight (tz-aware)
      const base = currentValue ?? getDefaultIso();
      const merged = displayTimezone
        ? setTimeInTimezone(base, partial, displayTimezone)
        : setTimeOnIso(base, partial);
      updateValue(merged);
    },
    [currentValue, updateValue, displayTimezone],
  );

  const open = useCallback(() => {
    if (isDisabled || readOnly) return;
    setIsOpen(true);
    const target = currentValue ?? adapter.today(displayTimezone);
    setViewMonth(target);
    setFocusedDate(target);
  }, [isDisabled, readOnly, currentValue, adapter, displayTimezone]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [isOpen, open, close]);

  // DatePickerContext (for reusing Calendar and Popover)
  const dateContext: DatePickerContextValue = useMemo(
    () => ({
      referenceRef,
      value: currentValue,
      selectDate,
      isOpen,
      open,
      close,
      toggle,
      viewMonth,
      setViewMonth,
      focusedDate,
      setFocusedDate,
      adapter,
      disabled: disabledRules,
      weekStartsOn,
      displayFormat,
      locale,
      displayTimezone,
      isDisabled,
      isReadOnly: readOnly,
      pickerId,
      labels: mergedDateLabels,
    }),
    [
      currentValue,
      selectDate,
      isOpen,
      open,
      close,
      toggle,
      viewMonth,
      focusedDate,
      adapter,
      disabledRules,
      weekStartsOn,
      displayFormat,
      locale,
      displayTimezone,
      isDisabled,
      readOnly,
      pickerId,
      mergedDateLabels,
    ],
  );

  // TimePickerContext (for reusing HourList, MinuteList, AmPmToggle)
  const timeContext: TimePickerContextValue = useMemo(
    () => ({
      value: currentValue,
      setTime,
      format,
      step,
      withSeconds: false,
      displayTimezone,
      isDisabled,
      isReadOnly: readOnly,
      currentTime,
      pickerId,
      labels: mergedTimeLabels,
    }),
    [currentValue, setTime, format, step, displayTimezone, isDisabled, readOnly, currentTime, pickerId, mergedTimeLabels],
  );

  return (
    <DatePickerContext.Provider value={dateContext}>
      <TimePickerContext.Provider value={timeContext}>
        {children}
      </TimePickerContext.Provider>
    </DatePickerContext.Provider>
  );
}
