import { useCallback, useId, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { DateFnsAdapter, DEFAULT_DATEPICKER_LABELS, civilMidnightFromUtcDay } from '@kalyx/core';
import type { DateAdapter, DatePickerLabels, DisabledRule, ISODateString, WeekStartsOn } from '@kalyx/core';
import { DatePickerContext } from '../../context/DatePickerContext.js';
import type { DatePickerContextValue } from '../../context/DatePickerContext.js';

/**
 * Props for the DatePicker Root component.
 *
 * @example Controlled
 * ```tsx
 * <DatePicker value={date} onChange={setDate}>
 *   <DatePicker.Input />
 *   <DatePicker.Popover>
 *     <DatePicker.Calendar />
 *   </DatePicker.Popover>
 * </DatePicker>
 * ```
 *
 * @example Uncontrolled
 * ```tsx
 * <DatePicker defaultValue="2026-01-15T00:00:00.000Z">
 *   <DatePicker.Input />
 * </DatePicker>
 * ```
 */
export interface DatePickerRootProps {
  /** Selected date (controlled, ISO 8601 UTC). `null` means empty. */
  value?: ISODateString | null;
  /** Initial date (uncontrolled) */
  defaultValue?: ISODateString;
  /** Callback fired when the date changes */
  onChange?: (value: ISODateString | null) => void;
  /** Disabled rules */
  disabled?: DisabledRule[] | boolean;
  /** Read-only */
  readOnly?: boolean;
  /** Week start day */
  weekStartsOn?: WeekStartsOn;
  /** Date display format */
  displayFormat?: string;
  /** BCP 47 locale (e.g., "en-US", "ko-KR", "ja-JP") */
  locale?: string;
  /**
   * IANA timezone used for display and selection semantics (e.g., "Asia/Seoul").
   * When set, the Input formats the value in this zone, Calendar highlights the matching civil
   * day, and selecting a date emits the civil midnight of that day (UTC-ISO form).
   */
  displayTimezone?: string;
  /** Date adapter */
  adapter?: DateAdapter;
  /** Override ARIA labels (defaults to English) */
  labels?: Partial<DatePickerLabels>;
  /** Child components */
  children: ReactNode;
}

export function DatePickerRoot({
  value: controlledValue,
  defaultValue,
  onChange,
  disabled = false,
  readOnly = false,
  weekStartsOn = 0,
  displayFormat = 'yyyy-MM-dd',
  locale = 'en-US',
  displayTimezone,
  adapter = DateFnsAdapter,
  labels: labelsProp,
  children,
}: DatePickerRootProps) {
  const pickerId = useId();
  const isControlled = useRef(controlledValue !== undefined).current;
  const referenceRef = useRef<HTMLElement | null>(null);

  // Internal state for uncontrolled mode
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

  const mergedLabels = useMemo(
    () => ({ ...DEFAULT_DATEPICKER_LABELS, ...labelsProp }),
    [labelsProp],
  );

  const isDisabled = typeof disabled === 'boolean' ? disabled : false;
  const disabledRules: DisabledRule[] = useMemo(
    () => (Array.isArray(disabled) ? disabled : []),
    [disabled],
  );

  const selectDate = useCallback(
    (iso: ISODateString | null) => {
      if (isDisabled || readOnly) return;

      // The grid emits UTC-midnight ISO strings. When displayTimezone is set, map those to the
      // civil midnight of the same calendar day in that zone — otherwise "picking Jan 15 in KST"
      // would save Jan 14 15:00 UTC shifted incorrectly.
      const normalized =
        iso && displayTimezone ? civilMidnightFromUtcDay(iso, displayTimezone) : iso;

      if (!isControlled) {
        setUncontrolledValue(normalized);
      }
      onChange?.(normalized);

      // Close the popover after selection
      setIsOpen(false);
    },
    [isControlled, isDisabled, readOnly, onChange, displayTimezone],
  );

  const open = useCallback(() => {
    if (isDisabled || readOnly) return;
    setIsOpen(true);
    // Reset the view to the current value or today when opening
    const target = currentValue ?? adapter.today(displayTimezone);
    setViewMonth(target);
    setFocusedDate(target);
  }, [isDisabled, readOnly, currentValue, adapter, displayTimezone]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  const contextValue: DatePickerContextValue = useMemo(
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
      labels: mergedLabels,
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
      mergedLabels,
    ],
  );

  return (
    <DatePickerContext.Provider value={contextValue}>
      {children}
    </DatePickerContext.Provider>
  );
}
