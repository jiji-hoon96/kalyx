import { useCallback, useId, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  DateFnsAdapter,
  DEFAULT_TIMEPICKER_LABELS,
  getTime,
  setTime as setTimeOnIso,
  getTimeInTimezone,
  setTimeInTimezone,
} from '@kalyx/core';
import type { ISODateString, TimePickerLabels, TimeValue } from '@kalyx/core';
import { TimePickerContext } from '../../context/TimePickerContext.js';
import type { TimePickerContextValue, TimePickerFormat } from '../../context/TimePickerContext.js';

/**
 * Props for the TimePicker Root component.
 *
 * @example
 * ```tsx
 * <TimePicker value={time} onChange={setTime} format="24h" step={15}>
 *   <TimePicker.Input />
 *   <TimePicker.HourList />
 *   <TimePicker.MinuteList />
 *   <TimePicker.AmPmToggle />
 * </TimePicker>
 * ```
 */
export interface TimePickerRootProps {
  /** Selected time (controlled, ISO 8601 UTC). The date portion is ignored; only the time is used. */
  value?: ISODateString | null;
  /** Initial time (uncontrolled) */
  defaultValue?: ISODateString;
  /** Callback fired when the time changes */
  onChange?: (value: ISODateString | null) => void;
  /** 12-hour or 24-hour mode */
  format?: TimePickerFormat;
  /** Minute step (e.g., 1, 5, 10, 15, 30) */
  step?: number;
  /** Whether to display seconds */
  withSeconds?: boolean;
  /**
   * IANA timezone used to interpret time. When set, the hour/minute controls read and write
   * the time as observed in this zone.
   */
  displayTimezone?: string;
  /** Whether entire picker is disabled */
  disabled?: boolean;
  /** Read-only */
  readOnly?: boolean;
  /**
   * Programmatic per-slot disable predicate. Returns `true` for any `(hours, minutes)` pair
   * that should be unselectable. Equivalent to react-datepicker's `filterTime`. Use cases:
   * business hours, lunch breaks, blackout slots. Hours are disabled only when the predicate
   * returns `true` for every step within the hour.
   */
  filterTime?: (hours: number, minutes: number) => boolean;
  /** Override ARIA labels (defaults to English) */
  labels?: Partial<TimePickerLabels>;
  /** Child components */
  children: ReactNode;
}

/** Fallback ISO used when value is null (today at 00:00:00 UTC) */
function getDefaultIso(): ISODateString {
  return DateFnsAdapter.today();
}

export function TimePickerRoot({
  value: controlledValue,
  defaultValue,
  onChange,
  format = '24h',
  step = 1,
  withSeconds = false,
  displayTimezone,
  disabled = false,
  readOnly = false,
  filterTime,
  labels: labelsProp,
  children,
}: TimePickerRootProps) {
  const pickerId = useId();
  const mergedLabels = useMemo(
    () => ({ ...DEFAULT_TIMEPICKER_LABELS, ...labelsProp }),
    [labelsProp],
  );
  const isControlled = useRef(controlledValue !== undefined).current;

  const [uncontrolledValue, setUncontrolledValue] = useState<ISODateString | null>(
    defaultValue ?? null,
  );

  const currentValue = isControlled ? (controlledValue ?? null) : uncontrolledValue;

  // Allow time selection even when value is null -> fallback
  const baseIso = currentValue ?? getDefaultIso();
  const currentTime = useMemo(
    () => (displayTimezone ? getTimeInTimezone(baseIso, displayTimezone) : getTime(baseIso)),
    [baseIso, displayTimezone],
  );

  const setTime = useCallback(
    (partial: Partial<TimeValue>) => {
      if (disabled || readOnly) return;
      const newIso = displayTimezone
        ? setTimeInTimezone(baseIso, partial, displayTimezone)
        : setTimeOnIso(baseIso, partial);
      if (!isControlled) {
        setUncontrolledValue(newIso);
      }
      onChange?.(newIso);
    },
    [disabled, readOnly, baseIso, isControlled, onChange, displayTimezone],
  );

  const contextValue: TimePickerContextValue = useMemo(
    () => ({
      value: currentValue,
      setTime,
      format,
      step,
      withSeconds,
      displayTimezone,
      isDisabled: disabled,
      isReadOnly: readOnly,
      currentTime,
      pickerId,
      labels: mergedLabels,
      filterTime,
    }),
    [
      currentValue,
      setTime,
      format,
      step,
      withSeconds,
      displayTimezone,
      disabled,
      readOnly,
      currentTime,
      pickerId,
      mergedLabels,
      filterTime,
    ],
  );

  return <TimePickerContext.Provider value={contextValue}>{children}</TimePickerContext.Provider>;
}
