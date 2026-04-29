import { useCallback, useId, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { DateFnsAdapter, DEFAULT_RANGEPICKER_LABELS, civilMidnightFromUtcDay } from '@kalyx/core';
import type {
  DateAdapter,
  DateRange,
  DisabledRule,
  ISODateString,
  RangePickerLabels,
  WeekStartsOn,
} from '@kalyx/core';
import { RangePickerContext } from '../../context/RangePickerContext.js';
import type {
  RangePickerContextValue,
  RangeSelectingTarget,
} from '../../context/RangePickerContext.js';
import { useChangeEffect } from '../../hooks/useChangeEffect.js';

const EMPTY_RANGE: DateRange = { start: null, end: null };

/**
 * Props for the RangePicker Root component.
 *
 * @example
 * ```tsx
 * <RangePicker value={range} onChange={setRange}>
 *   <RangePicker.Input part="start" />
 *   <RangePicker.Input part="end" />
 *   <RangePicker.Popover>
 *     <RangePicker.Calendar />
 *   </RangePicker.Popover>
 * </RangePicker>
 * ```
 */
export interface RangePickerRootProps {
  /** Selected range (controlled). `{ start, end }` with ISO strings or null. */
  value?: DateRange;
  /** Initial range (uncontrolled) */
  defaultValue?: DateRange;
  /** Callback fired when the range changes */
  onChange?: (range: DateRange) => void;
  /** Callback fired when the popover open state changes */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Callback fired when the calendar view navigates to a different month.
   * The value is the ISO string of the first day of the newly-visible month (UTC).
   */
  onCalendarNavigate?: (viewMonth: ISODateString) => void;
  /** Disabled rules */
  disabled?: DisabledRule[] | boolean;
  /** Read-only */
  readOnly?: boolean;
  /** Week start day */
  weekStartsOn?: WeekStartsOn;
  /** Date display format */
  displayFormat?: string;
  /** BCP 47 locale */
  locale?: string;
  /**
   * IANA timezone for display (e.g., "Asia/Seoul"). When set, inputs format in this zone,
   * calendar highlighting uses civil-day comparison in this zone, and selected start/end are
   * emitted as civil midnight of the clicked day in this zone (UTC-ISO form).
   */
  displayTimezone?: string;
  /** Date adapter */
  adapter?: DateAdapter;
  /** Override ARIA labels (defaults to English) */
  labels?: Partial<RangePickerLabels>;
  /** Child components */
  children: ReactNode;
}

export function RangePickerRoot({
  value: controlledValue,
  defaultValue,
  onChange,
  onOpenChange,
  onCalendarNavigate,
  disabled = false,
  readOnly = false,
  weekStartsOn = 0,
  displayFormat = 'yyyy-MM-dd',
  locale = 'en-US',
  displayTimezone,
  adapter = DateFnsAdapter,
  labels: labelsProp,
  children,
}: RangePickerRootProps) {
  const pickerId = useId();
  const isControlled = useRef(controlledValue !== undefined).current;
  const referenceRef = useRef<HTMLElement | null>(null);

  // Internal state for uncontrolled mode
  const [uncontrolledValue, setUncontrolledValue] = useState<DateRange>(
    defaultValue ?? EMPTY_RANGE,
  );

  const currentValue = isControlled ? (controlledValue ?? EMPTY_RANGE) : uncontrolledValue;

  const [isOpen, setIsOpen] = useState(false);

  // Which part to select next (start first, then end)
  const [selectingTarget, setSelectingTarget] = useState<RangeSelectingTarget>('start');

  const [hoverDate, setHoverDate] = useState<ISODateString | null>(null);

  // Lazy initializers — see DatePicker/Root.tsx for the SSR/hydration rationale.
  const [viewMonth, setViewMonth] = useState<ISODateString>(
    () => currentValue.start ?? adapter.today(displayTimezone),
  );

  const [focusedDate, setFocusedDate] = useState<ISODateString>(
    () => currentValue.start ?? adapter.today(displayTimezone),
  );

  useChangeEffect(isOpen, onOpenChange);
  const viewMonthStart = useMemo(() => adapter.startOfMonth(viewMonth), [viewMonth, adapter]);
  useChangeEffect(viewMonthStart, onCalendarNavigate);

  const mergedLabels = useMemo(
    () => ({ ...DEFAULT_RANGEPICKER_LABELS, ...labelsProp }),
    [labelsProp],
  );

  const isDisabled = typeof disabled === 'boolean' ? disabled : false;
  const disabledRules: DisabledRule[] = useMemo(
    () => (Array.isArray(disabled) ? disabled : []),
    [disabled],
  );

  const setRange = useCallback(
    (range: DateRange) => {
      if (isDisabled || readOnly) return;
      if (!isControlled) {
        setUncontrolledValue(range);
      }
      onChange?.(range);
    },
    [isControlled, isDisabled, readOnly, onChange],
  );

  /**
   * Single-date click handler.
   * - selectingTarget === 'start' -> pick start, switch target to 'end'
   * - selectingTarget === 'end' -> pick end (swap if before start), switch target to 'start', close
   */
  const selectDate = useCallback(
    (iso: ISODateString) => {
      if (isDisabled || readOnly) return;

      // Normalize UTC-grid ISOs to civil-midnight-in-tz before storing (see DatePicker.Root).
      const normalized = displayTimezone ? civilMidnightFromUtcDay(iso, displayTimezone) : iso;

      if (selectingTarget === 'start') {
        const newRange: DateRange = { start: normalized, end: null };
        setRange(newRange);
        setSelectingTarget('end');
        setHoverDate(null);
      } else {
        const start = currentValue.start;
        if (!start) {
          // Safety: if start is missing, treat this click as start
          setRange({ start: normalized, end: null });
          setSelectingTarget('end');
          return;
        }

        let newRange: DateRange;
        if (adapter.isBefore(normalized, start)) {
          // Swap if the clicked end is earlier than start
          newRange = { start: normalized, end: start };
        } else {
          newRange = { start, end: normalized };
        }

        setRange(newRange);
        setSelectingTarget('start');
        setHoverDate(null);
        setIsOpen(false);
      }
    },
    [isDisabled, readOnly, selectingTarget, currentValue.start, adapter, setRange, displayTimezone],
  );

  const open = useCallback(() => {
    if (isDisabled || readOnly) return;
    setIsOpen(true);
    const target = currentValue.start ?? adapter.today(displayTimezone);
    setViewMonth(target);
    setFocusedDate(target);
    // If the range is complete, restart; otherwise preserve current state
    if (currentValue.start && currentValue.end) {
      setSelectingTarget('start');
    }
  }, [isDisabled, readOnly, currentValue, adapter, displayTimezone]);

  const close = useCallback(() => {
    setIsOpen(false);
    setHoverDate(null);
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [isOpen, open, close]);

  const contextValue: RangePickerContextValue = useMemo(
    () => ({
      referenceRef,
      value: currentValue,
      setRange,
      selectDate,
      selectingTarget,
      hoverDate,
      setHoverDate,
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
      labels: mergedLabels,
    }),
    [
      currentValue,
      setRange,
      selectDate,
      selectingTarget,
      hoverDate,
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
      mergedLabels,
    ],
  );

  return <RangePickerContext.Provider value={contextValue}>{children}</RangePickerContext.Provider>;
}
