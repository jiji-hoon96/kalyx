import { useCallback, useId, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  DEFAULT_TIMEPICKER_LABELS,
  getTime,
  setTime as setTimeOnIso,
  getTimeInTimezone,
  setTimeInTimezone,
} from '@kalyx/core';
import type { DateAdapter, ISODateString, TimePickerLabels, TimeValue } from '@kalyx/core';
import { TimePickerContext } from '../../context/TimePickerContext.js';
import type { TimePickerContextValue, TimePickerFormat } from '../../context/TimePickerContext.js';
import { getDefaultAdapter, resolveAdapter } from '../../internal/defaultAdapter.js';

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
   * that should be unselectable — same polarity as MUI X's `shouldDisableTime`, and the
   * **inverse** of react-datepicker's `filterTime` (which returns `true` to *keep* a slot).
   * Use cases: business hours, lunch breaks, blackout slots. Hours are disabled only when the
   * predicate returns `true` for every step within the hour. Always receives 24-hour values.
   */
  filterTime?: (hours: number, minutes: number) => boolean;
  /**
   * Date adapter. Only used when the controlled `value` is `null` to derive
   * "today" as the base for the first time edit. The main `@kalyx/react` entry
   * auto-injects `DateFnsAdapter`; on `@kalyx/react/headless` you must pass one.
   */
  adapter?: DateAdapter;
  /** Override ARIA labels (defaults to English) */
  labels?: Partial<TimePickerLabels>;
  /** Child components */
  children: ReactNode;
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
  adapter: adapterProp,
  labels: labelsProp,
  children,
}: TimePickerRootProps) {
  const adapter = resolveAdapter(adapterProp, getDefaultAdapter(), 'TimePicker');
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

  // SSR-safe: when value is null, fall back to a deterministic {0,0,0} so server
  // and client render the same markup. `today()` is only resolved at event time.
  const currentTime = useMemo(() => {
    if (!currentValue) return { hours: 0, minutes: 0, seconds: 0 };
    return displayTimezone
      ? getTimeInTimezone(currentValue, displayTimezone)
      : getTime(currentValue);
  }, [currentValue, displayTimezone]);

  const setTime = useCallback(
    (partial: Partial<TimeValue>) => {
      if (disabled || readOnly) return;
      const base = currentValue ?? adapter.today(displayTimezone);
      const newIso = displayTimezone
        ? setTimeInTimezone(base, partial, displayTimezone)
        : setTimeOnIso(base, partial);
      if (!isControlled) {
        setUncontrolledValue(newIso);
      }
      onChange?.(newIso);
    },
    [disabled, readOnly, currentValue, displayTimezone, isControlled, onChange, adapter],
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
