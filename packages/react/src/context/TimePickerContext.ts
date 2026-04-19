import { createContext, useContext } from 'react';
import type { ISODateString, TimePickerLabels, TimeValue } from '@kalyx/core';

export type TimePickerFormat = '12h' | '24h';

export interface TimePickerContextValue {
  /** Currently selected ISO datetime (only the time portion is meaningful) */
  value: ISODateString | null;
  /** Update only the time portion (TimeValue) */
  setTime: (partial: Partial<TimeValue>) => void;
  /** 12-hour or 24-hour mode */
  format: TimePickerFormat;
  /** Minute step (e.g., 15 -> 0, 15, 30, 45) */
  step: number;
  /** Whether to display seconds */
  withSeconds: boolean;
  /** Whether entire picker is disabled */
  isDisabled: boolean;
  /** Read-only */
  isReadOnly: boolean;
  /** Current time (TimeValue) */
  currentTime: TimeValue;
  /** Unique ID */
  pickerId: string;
  /** ARIA labels */
  labels: TimePickerLabels;
}

export const TimePickerContext = createContext<TimePickerContextValue | null>(null);

/**
 * Consume TimePickerContext.
 * Throws a clear error when called outside of TimePicker.Root.
 */
export function useTimePickerContext(componentName: string): TimePickerContextValue {
  const context = useContext(TimePickerContext);
  if (!context) {
    throw new Error(
      `[${componentName}] TimePicker.Root 내부에서 사용해야 합니다.\n\n` +
        '올바른 사용법:\n' +
        '  <TimePicker>\n' +
        `    <TimePicker.${componentName.replace('TimePicker.', '')} />\n` +
        '  </TimePicker>',
    );
  }
  return context;
}
