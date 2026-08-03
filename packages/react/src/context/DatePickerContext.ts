import { createContext, useContext } from 'react';
import type { RefObject } from 'react';
import type {
  DateAdapter,
  DatePickerLabels,
  DisabledRule,
  ISODateString,
  WeekStartsOn,
} from '@kalyx/core';
import type { Direction } from '../components/_shared/rtl.js';

export interface DatePickerContextValue {
  /** Floating UI reference element (set by Input/Trigger, read by Popover) */
  referenceRef: RefObject<HTMLElement | null>;
  /** Currently selected date (ISO 8601 UTC) */
  value: ISODateString | null;
  /** Date selection handler */
  selectDate: (iso: ISODateString | null) => void;
  /**
   * Apply a full datetime (date + time) in a single update. Only provided by
   * DateTimePicker.Root — undefined for plain DatePicker. Used by
   * DateTimePicker.Presets so a preset like "today 09:00" commits both portions
   * atomically instead of racing `selectDate` (time-preserving) with `setTime`.
   * Returns whether the Root accepted the commit so callers only apply follow-up
   * effects such as closing the popover after a successful transition.
   */
  selectDateTime?: (iso: ISODateString | null) => boolean;
  /** Popover open state */
  isOpen: boolean;
  /** Open the popover */
  open: () => void;
  /** Close the popover */
  close: () => void;
  /** Toggle the popover */
  toggle: () => void;
  /** Currently displayed month (ISO string) */
  viewMonth: ISODateString;
  /** Change the displayed month */
  setViewMonth: (iso: ISODateString) => void;
  /** Currently focused date in the calendar */
  focusedDate: ISODateString;
  /** Change the focused date */
  setFocusedDate: (iso: ISODateString) => void;
  /** Date adapter */
  adapter: DateAdapter;
  /** Disabled rules */
  disabled: DisabledRule[];
  /** Week start day */
  weekStartsOn: WeekStartsOn;
  /** Date display format */
  displayFormat: string;
  /** BCP 47 locale (e.g., "en-US", "ko-KR") */
  locale: string;
  /**
   * Layout direction ("ltr" | "rtl"). Defaults to "ltr". In "rtl" the calendar
   * grid swaps ArrowLeft/ArrowRight so keyboard navigation follows the visual
   * (physical) layout per the WAI-ARIA grid pattern, and the grid element
   * carries `dir="rtl"` so consumers can style it.
   */
  dir: Direction;
  /**
   * IANA timezone for display (e.g., "Asia/Seoul"). When set, the Input formats the value in
   * this zone, Calendar highlights the matching civil day, and selecting a date emits the civil
   * midnight of that day in the zone (UTC-ISO form).
   */
  displayTimezone?: string;
  /** Whether entire picker is disabled */
  isDisabled: boolean;
  /** Read-only */
  isReadOnly: boolean;
  /** Unique ID (useId-based) */
  pickerId: string;
  /** ARIA labels */
  labels: DatePickerLabels;
  /**
   * Push a screen-reader announcement into the Root-level live region. Provided by
   * DatePicker/DateTimePicker Root so month navigation and date selection are announced
   * even though the live region lives on Root (and thus survives Calendar unmount) —
   * parity with RangePickerContext.announce.
   */
  announce: (message: string) => void;
}

export const DatePickerContext = createContext<DatePickerContextValue | null>(null);

/**
 * Consume DatePickerContext.
 * Throws a clear error when called outside of DatePicker.Root.
 */
export function useDatePickerContext(componentName: string): DatePickerContextValue {
  const context = useContext(DatePickerContext);
  if (!context) {
    throw new Error(
      `[${componentName}] DatePicker.Root 내부에서 사용해야 합니다.\n\n` +
        '올바른 사용법:\n' +
        '  <DatePicker>\n' +
        `    <DatePicker.${componentName.replace('DatePicker.', '')} />\n` +
        '  </DatePicker>',
    );
  }
  return context;
}
