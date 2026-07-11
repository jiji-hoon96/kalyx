import { createContext, useContext } from 'react';
import type { RefObject } from 'react';
import type {
  DateAdapter,
  DateRange,
  DisabledRule,
  ISODateString,
  RangePickerLabels,
  WeekStartsOn,
} from '@kalyx/core';
import type { Direction } from '../components/_shared/rtl.js';

/** Which part to select next (start | end) */
export type RangeSelectingTarget = 'start' | 'end';

export interface RangePickerContextValue {
  /** Floating UI reference element */
  referenceRef: RefObject<HTMLElement | null>;
  /** Currently selected range */
  value: DateRange;
  /** Update the entire range object */
  setRange: (range: DateRange) => void;
  /** Single-date click; automatically decides start/end */
  selectDate: (iso: ISODateString) => void;
  /** Which part gets selected next (start first, then end) */
  selectingTarget: RangeSelectingTarget;
  /**
   * Set which part (`'start'` | `'end'`) the next calendar click targets. Used by
   * the inputs so clicking the start vs. end field anchors selection accordingly
   * (e.g. WeekPicker: clicking "start" anchors the 7-day span forward from the
   * clicked day, clicking "end" anchors it backward).
   */
  setSelectingTarget: (target: RangeSelectingTarget) => void;
  /** Hovered date (for range preview) */
  hoverDate: ISODateString | null;
  setHoverDate: (iso: ISODateString | null) => void;
  /** Popover open state */
  isOpen: boolean;
  /** Open the popover. Pass a target to anchor the next selection to start/end. */
  open: (target?: RangeSelectingTarget) => void;
  close: () => void;
  toggle: () => void;
  /** Currently displayed month */
  viewMonth: ISODateString;
  setViewMonth: (iso: ISODateString) => void;
  /** Currently focused date in the calendar */
  focusedDate: ISODateString;
  setFocusedDate: (iso: ISODateString) => void;
  /** Date adapter */
  adapter: DateAdapter;
  /** Disabled rules */
  disabled: DisabledRule[];
  /** Week start day */
  weekStartsOn: WeekStartsOn;
  /** Date display format */
  displayFormat: string;
  /** BCP 47 locale */
  locale: string;
  /**
   * Layout direction ("ltr" | "rtl"). Defaults to "ltr". In "rtl" the calendar
   * grid swaps ArrowLeft/ArrowRight for keyboard navigation and the grid
   * element carries `dir="rtl"`.
   */
  dir: Direction;
  /** IANA timezone for display (see DatePickerContext#displayTimezone) */
  displayTimezone?: string;
  /** Whether entire picker is disabled */
  isDisabled: boolean;
  /** Read-only */
  isReadOnly: boolean;
  /** Unique ID */
  pickerId: string;
  /** ARIA labels */
  labels: RangePickerLabels;
  /**
   * Push a transient message to the picker's `role="status"` live region.
   * The live region lives on Root so it survives popover close/Calendar unmount
   * — without that, announcements set on the commit click are silenced before
   * screen readers can pick them up.
   */
  announce: (message: string) => void;
}

export const RangePickerContext = createContext<RangePickerContextValue | null>(null);

/**
 * Consume RangePickerContext.
 * Throws a clear error when called outside of RangePicker.Root.
 */
export function useRangePickerContext(componentName: string): RangePickerContextValue {
  const context = useContext(RangePickerContext);
  if (!context) {
    throw new Error(
      `[${componentName}] RangePicker.Root 내부에서 사용해야 합니다.\n\n` +
        '올바른 사용법:\n' +
        '  <RangePicker>\n' +
        `    <RangePicker.${componentName.replace('RangePicker.', '')} />\n` +
        '  </RangePicker>',
    );
  }
  return context;
}
