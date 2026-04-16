import { useCallback, useId, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { getTime, setTime as setTimeOnIso } from '@kalyx/core';
import type { ISODateString, TimeValue } from '@kalyx/core';
import { TimePickerContext } from '../../context/TimePickerContext.js';
import type {
  TimePickerContextValue,
  TimePickerFormat,
} from '../../context/TimePickerContext.js';

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
  /** Whether entire picker is disabled */
  disabled?: boolean;
  /** Read-only */
  readOnly?: boolean;
  /** Child components */
  children: ReactNode;
}

/** Fallback ISO used when value is null (today at 00:00:00 UTC) */
function getDefaultIso(): ISODateString {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  ).toISOString();
}

export function TimePickerRoot({
  value: controlledValue,
  defaultValue,
  onChange,
  format = '24h',
  step = 1,
  withSeconds = false,
  disabled = false,
  readOnly = false,
  children,
}: TimePickerRootProps) {
  const pickerId = useId();
  const isControlled = useRef(controlledValue !== undefined).current;

  const [uncontrolledValue, setUncontrolledValue] = useState<ISODateString | null>(
    defaultValue ?? null,
  );

  const currentValue = isControlled ? (controlledValue ?? null) : uncontrolledValue;

  // Allow time selection even when value is null -> fallback
  const baseIso = currentValue ?? getDefaultIso();
  const currentTime = useMemo(() => getTime(baseIso), [baseIso]);

  const setTime = useCallback(
    (partial: Partial<TimeValue>) => {
      if (disabled || readOnly) return;
      const newIso = setTimeOnIso(baseIso, partial);
      if (!isControlled) {
        setUncontrolledValue(newIso);
      }
      onChange?.(newIso);
    },
    [disabled, readOnly, baseIso, isControlled, onChange],
  );

  const contextValue: TimePickerContextValue = useMemo(
    () => ({
      value: currentValue,
      setTime,
      format,
      step,
      withSeconds,
      isDisabled: disabled,
      isReadOnly: readOnly,
      currentTime,
      pickerId,
    }),
    [currentValue, setTime, format, step, withSeconds, disabled, readOnly, currentTime, pickerId],
  );

  return (
    <TimePickerContext.Provider value={contextValue}>
      {children}
    </TimePickerContext.Provider>
  );
}
