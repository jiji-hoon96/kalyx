import { useCallback, useId, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  calendarDayFromInstant,
  DEFAULT_DATEPICKER_LABELS,
  DEFAULT_TIMEPICKER_LABELS,
  getTime,
  setTime as setTimeOnIso,
  getTimeInTimezone,
  setTimeInTimezone,
  civilMidnightFromUtcDay,
  isDateDisabled,
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
import type { Direction } from '../_shared/rtl.js';
import { TimePickerContext } from '../../context/TimePickerContext.js';
import type { TimePickerContextValue, TimePickerFormat } from '../../context/TimePickerContext.js';
import { useChangeEffect } from '../../hooks/useChangeEffect.js';
import { resolveEnabledCalendarFocus } from '../../internal/calendarFocus.js';
import { getDefaultAdapter, resolveAdapter } from '../../internal/defaultAdapter.js';
import { SR_ONLY } from '../../internal/srOnly.js';

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
  /** Callback fired when the popover open state changes */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Callback fired when the calendar view navigates to a different month.
   * The value is the ISO string of the first day of the newly-visible month (UTC).
   */
  onCalendarNavigate?: (viewMonth: ISODateString) => void;
  /** 12-hour or 24-hour mode */
  format?: TimePickerFormat;
  /** Minute step (e.g., 1, 5, 15, 30) */
  step?: number;
  /** Whether to display seconds in the time controls */
  withSeconds?: boolean;
  /**
   * Programmatic per-slot disable predicate for the time controls. Returns `true` for any
   * `(hours, minutes)` pair that should be unselectable — same polarity as MUI X's
   * `shouldDisableTime`, and the **inverse** of react-datepicker's `filterTime`. Always
   * receives 24-hour values.
   */
  filterTime?: (hours: number, minutes: number) => boolean;
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
   * Layout direction: "ltr" (default) or "rtl". Forwarded to the calendar grid,
   * which swaps ArrowLeft/ArrowRight for RTL keyboard navigation.
   */
  dir?: Direction;
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
  onOpenChange,
  onCalendarNavigate,
  format = '24h',
  step = 1,
  withSeconds = false,
  filterTime,
  disabled = false,
  readOnly = false,
  weekStartsOn = 0,
  displayFormat = 'yyyy-MM-dd HH:mm',
  locale = 'en-US',
  dir = 'ltr',
  displayTimezone,
  adapter: adapterProp,
  labels: labelsProp,
  children,
}: DateTimePickerRootProps) {
  const adapter = resolveAdapter(adapterProp, getDefaultAdapter(), 'DateTimePicker');
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

  // Live-region announcement (mounted on Root so it survives Calendar unmount).
  const [announcement, setAnnouncement] = useState('');
  const announce = useCallback((message: string) => setAnnouncement(message), []);
  // Lazy initializers — see DatePicker/Root.tsx for the SSR/hydration rationale.
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

  useChangeEffect(isOpen, onOpenChange);
  const viewMonthStart = useMemo(() => adapter.startOfMonth(viewMonth), [viewMonth, adapter]);
  useChangeEffect(viewMonthStart, onCalendarNavigate);

  const isDisabled = typeof disabled === 'boolean' ? disabled : false;
  const disabledRules: DisabledRule[] = useMemo(
    () => (Array.isArray(disabled) ? disabled : []),
    [disabled],
  );

  // When value is null, use a stable {0,0,0} fallback for hydration safety —
  // avoid invoking adapter.today() during render to keep server/client output deterministic.
  const currentTime: TimeValue = useMemo(() => {
    if (!currentValue) return { hours: 0, minutes: 0, seconds: 0 };
    return displayTimezone
      ? getTimeInTimezone(currentValue, displayTimezone)
      : getTime(currentValue);
  }, [currentValue, displayTimezone]);

  const updateValue = useCallback(
    (next: ISODateString | null): boolean => {
      if (isDisabled || readOnly) return false;
      if (next) {
        if (isDateDisabled(next, disabledRules, adapter, displayTimezone)) return false;
        const finalTime = displayTimezone
          ? getTimeInTimezone(next, displayTimezone)
          : getTime(next);
        if (filterTime?.(finalTime.hours, finalTime.minutes)) return false;
      }
      if (!isControlled) {
        setUncontrolledValue(next);
      }
      onChange?.(next);
      return true;
    },
    [
      isControlled,
      isDisabled,
      readOnly,
      disabledRules,
      adapter,
      displayTimezone,
      filterTime,
      onChange,
    ],
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
      const merged = displayTimezone
        ? setTimeInTimezone(normalizedDate, currentTime, displayTimezone)
        : setTimeOnIso(normalizedDate, currentTime);
      updateValue(merged);
    },
    [currentTime, updateValue, displayTimezone],
  );

  /**
   * Change the time while preserving the date portion.
   */
  const setTime = useCallback(
    (partial: Partial<TimeValue>) => {
      // If no date yet, start from today at midnight (tz-aware). today() is resolved at
      // event time (not during render) so SSR hydration output stays stable.
      const base = currentValue ?? adapter.today(displayTimezone);
      const merged = displayTimezone
        ? setTimeInTimezone(base, partial, displayTimezone)
        : setTimeOnIso(base, partial);
      updateValue(merged);
    },
    [currentValue, updateValue, displayTimezone, adapter],
  );

  /**
   * Commit a full datetime (date + time) atomically. Used by DateTimePicker.Presets,
   * where a preset carries both portions and must not race the time-preserving selectDate.
   */
  const selectDateTime = useCallback(
    (iso: ISODateString | null): boolean => {
      // A preset ISO is already a UTC instant; when a display timezone is set the
      // value is interpreted/displayed there, so no civil-midnight remapping is needed.
      return updateValue(iso);
    },
    [updateValue],
  );

  const open = useCallback(() => {
    if (isDisabled || readOnly) return;
    setIsOpen(true);
    const target = currentValue ?? adapter.today(displayTimezone);
    const calendarTarget = displayTimezone
      ? calendarDayFromInstant(target, displayTimezone)
      : adapter.startOfDay(target);
    setViewMonth(calendarTarget);
    setFocusedDate(
      resolveEnabledCalendarFocus(calendarTarget, disabledRules, adapter, displayTimezone),
    );
  }, [isDisabled, readOnly, currentValue, adapter, displayTimezone, disabledRules]);

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
      selectDateTime,
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
      dir,
      displayTimezone,
      isDisabled,
      isReadOnly: readOnly,
      pickerId,
      labels: mergedDateLabels,
      announce,
    }),
    [
      currentValue,
      selectDate,
      selectDateTime,
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
      dir,
      displayTimezone,
      isDisabled,
      readOnly,
      pickerId,
      mergedDateLabels,
      announce,
    ],
  );

  // TimePickerContext (for reusing HourList, MinuteList, AmPmToggle)
  const timeContext: TimePickerContextValue = useMemo(
    () => ({
      value: currentValue,
      setTime,
      format,
      locale,
      step,
      withSeconds,
      displayTimezone,
      isDisabled,
      isReadOnly: readOnly,
      currentTime,
      pickerId,
      labels: mergedTimeLabels,
      filterTime,
      // DateTimePicker renders the time lists inside its own (date) popover, so
      // the TimePicker-level popover is effectively always "open". open/close
      // reuse the shared popover controls; TimePicker.Popover isn't used here.
      isOpen: true,
      open,
      close,
      referenceRef,
    }),
    [
      currentValue,
      setTime,
      format,
      locale,
      step,
      withSeconds,
      displayTimezone,
      isDisabled,
      readOnly,
      currentTime,
      pickerId,
      mergedTimeLabels,
      filterTime,
      open,
      close,
    ],
  );

  return (
    <DatePickerContext.Provider value={dateContext}>
      <TimePickerContext.Provider value={timeContext}>{children}</TimePickerContext.Provider>
      <div role="status" aria-live="polite" aria-atomic="true" style={SR_ONLY}>
        {announcement}
      </div>
    </DatePickerContext.Provider>
  );
}
