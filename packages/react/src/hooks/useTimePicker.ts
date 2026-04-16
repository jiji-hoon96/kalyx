import { useCallback, useId, useMemo, useRef, useState } from 'react';
import {
  generateHours,
  generateMinutes,
  getTime,
  setTime as setTimeOnIso,
  to12Hour,
  to24Hour,
} from '@kalyx/core';
import type { ISODateString, TimeValue } from '@kalyx/core';
import type { TimePickerFormat } from '../context/TimePickerContext.js';

export interface UseTimePickerOptions {
  /** Selected time (controlled mode) */
  value?: ISODateString | null;
  /** Initial time (uncontrolled mode) */
  defaultValue?: ISODateString;
  /** Callback fired when the time changes */
  onChange?: (value: ISODateString | null) => void;
  /** 12h or 24h format */
  format?: TimePickerFormat;
  /** Minute step */
  step?: number;
  /** Whether seconds are shown */
  withSeconds?: boolean;
}

export interface UseTimePickerReturn {
  /** Current ISO datetime value */
  value: ISODateString | null;
  /** Current time (TimeValue) */
  currentTime: TimeValue;
  /** Update part of the time */
  setTime: (partial: Partial<TimeValue>) => void;
  /** Set the hour directly (1-12 in 12h mode, 0-23 in 24h mode) */
  setHour: (hour: number) => void;
  /** Set the minute */
  setMinute: (minute: number) => void;
  /** Set the second */
  setSecond: (second: number) => void;
  /** Change AM/PM (12h mode only) */
  setPeriod: (period: 'AM' | 'PM') => void;
  /** Available hour list */
  availableHours: number[];
  /** Available minute list (respects step) */
  availableMinutes: number[];
  /** 12h or 24h mode */
  format: TimePickerFormat;
  /** Hour value for display (1-12 in 12h mode) */
  displayHour: number;
  /** Current AM/PM (12h mode only, null in 24h) */
  period: 'AM' | 'PM' | null;
  /** Unique ID */
  pickerId: string;
}

function getDefaultIso(): ISODateString {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  ).toISOString();
}

/**
 * Hook that manages TimePicker state.
 * Use this when you want to build a fully custom UI without the built-in components.
 *
 * @example
 * ```tsx
 * function MyTimePicker() {
 *   const {
 *     currentTime, displayHour, period,
 *     availableHours, availableMinutes,
 *     setHour, setMinute, setPeriod,
 *   } = useTimePicker({ format: '12h', step: 15 });
 *   // displayHour = 1-12, period = "AM" | "PM"
 *   // availableMinutes = [0, 15, 30, 45]
 * }
 * ```
 */
export function useTimePicker(options: UseTimePickerOptions = {}): UseTimePickerReturn {
  const {
    value: controlledValue,
    defaultValue,
    onChange,
    format = '24h',
    step = 1,
  } = options;

  const pickerId = useId();
  const isControlled = useRef(controlledValue !== undefined).current;

  const [uncontrolledValue, setUncontrolledValue] = useState<ISODateString | null>(
    defaultValue ?? null,
  );

  const currentValue = isControlled ? (controlledValue ?? null) : uncontrolledValue;
  const baseIso = currentValue ?? getDefaultIso();
  const currentTime = useMemo(() => getTime(baseIso), [baseIso]);

  const setTime = useCallback(
    (partial: Partial<TimeValue>) => {
      const newIso = setTimeOnIso(baseIso, partial);
      if (!isControlled) {
        setUncontrolledValue(newIso);
      }
      onChange?.(newIso);
    },
    [baseIso, isControlled, onChange],
  );

  const period = format === '12h' ? to12Hour(currentTime.hours).period : null;
  const displayHour =
    format === '12h' ? to12Hour(currentTime.hours).hours12 : currentTime.hours;

  const setHour = useCallback(
    (hour: number) => {
      const hours24 = format === '12h' && period ? to24Hour(hour, period) : hour;
      setTime({ hours: hours24 });
    },
    [format, period, setTime],
  );

  const setMinute = useCallback(
    (minute: number) => setTime({ minutes: minute }),
    [setTime],
  );

  const setSecond = useCallback(
    (second: number) => setTime({ seconds: second }),
    [setTime],
  );

  const setPeriod = useCallback(
    (newPeriod: 'AM' | 'PM') => {
      if (format !== '12h') return;
      const newHours24 = to24Hour(displayHour, newPeriod);
      setTime({ hours: newHours24 });
    },
    [format, displayHour, setTime],
  );

  return {
    value: currentValue,
    currentTime,
    setTime,
    setHour,
    setMinute,
    setSecond,
    setPeriod,
    availableHours: generateHours(format),
    availableMinutes: generateMinutes(step),
    format,
    displayHour,
    period,
    pickerId,
  };
}
