import { useCallback, useId, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  calendarDayFromInstant,
  DEFAULT_DATEPICKER_LABELS,
  civilMidnightFromUtcDay,
  getWeekStartForLocale,
  isDateDisabled,
} from '@kalyx/core';
import type {
  DateAdapter,
  DatePickerLabels,
  DisabledRule,
  ISODateString,
  WeekStartsOn,
} from '@kalyx/core';
import { DatePickerContext } from '../../context/DatePickerContext.js';
import type { DatePickerContextValue } from '../../context/DatePickerContext.js';
import type { Direction } from '../_shared/rtl.js';
import { useChangeEffect } from '../../hooks/useChangeEffect.js';
import { getDefaultAdapter, resolveAdapter } from '../../internal/defaultAdapter.js';
import { SR_ONLY } from '../../internal/srOnly.js';

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
  /** BCP 47 locale (e.g., "en-US", "ko-KR", "ja-JP") */
  locale?: string;
  /**
   * Layout direction: "ltr" (default) or "rtl". In "rtl" the calendar grid
   * swaps ArrowLeft/ArrowRight so keyboard navigation follows the visual
   * layout (WAI-ARIA grid pattern), and the grid element carries `dir="rtl"`.
   * Pair with the corresponding writing-direction on your own container for a
   * fully mirrored layout.
   */
  dir?: Direction;
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
  onOpenChange,
  onCalendarNavigate,
  disabled = false,
  readOnly = false,
  weekStartsOn: weekStartsOnProp,
  displayFormat = 'yyyy-MM-dd',
  locale = 'en-US',
  dir = 'ltr',
  displayTimezone,
  adapter: adapterProp,
  labels: labelsProp,
  children,
}: DatePickerRootProps) {
  const adapter = resolveAdapter(adapterProp, getDefaultAdapter(), 'DatePicker');
  const pickerId = useId();
  const isControlled = useRef(controlledValue !== undefined).current;
  const referenceRef = useRef<HTMLElement | null>(null);

  // Internal state for uncontrolled mode
  const [uncontrolledValue, setUncontrolledValue] = useState<ISODateString | null>(
    defaultValue ?? null,
  );

  const currentValue = isControlled ? (controlledValue ?? null) : uncontrolledValue;

  const [isOpen, setIsOpen] = useState(false);

  // Lazy initializers: today() is only computed once per mount instead of on every
  // render. Avoids redundant Date allocations and makes the SSR/hydration contract
  // explicit — neither server nor client re-evaluates the fallback after first render.
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

  const mergedLabels = useMemo(
    () => ({ ...DEFAULT_DATEPICKER_LABELS, ...labelsProp }),
    [labelsProp],
  );

  // Infer weekStartsOn from locale when the consumer doesn't pin it; explicit prop wins.
  const weekStartsOn = weekStartsOnProp ?? getWeekStartForLocale(locale);

  // Live-region announcement (mounted on Root so it survives Calendar unmount).
  const [announcement, setAnnouncement] = useState('');
  const announce = useCallback((message: string) => setAnnouncement(message), []);

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

      if (normalized && isDateDisabled(normalized, disabledRules, adapter, displayTimezone)) {
        return;
      }

      if (!isControlled) {
        setUncontrolledValue(normalized);
      }
      onChange?.(normalized);

      // Close the popover after selection
      setIsOpen(false);
    },
    [isControlled, isDisabled, readOnly, onChange, displayTimezone, disabledRules, adapter],
  );

  const open = useCallback(() => {
    if (isDisabled || readOnly) return;
    setIsOpen(true);
    // Reset the view to the current value or today when opening
    const target = currentValue ?? adapter.today(displayTimezone);
    const calendarTarget = displayTimezone
      ? calendarDayFromInstant(target, displayTimezone)
      : adapter.startOfDay(target);
    setViewMonth(calendarTarget);
    setFocusedDate(calendarTarget);
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
      dir,
      displayTimezone,
      isDisabled,
      isReadOnly: readOnly,
      pickerId,
      labels: mergedLabels,
      announce,
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
      dir,
      displayTimezone,
      isDisabled,
      readOnly,
      pickerId,
      mergedLabels,
      announce,
    ],
  );

  return (
    <DatePickerContext.Provider value={contextValue}>
      {children}
      <div role="status" aria-live="polite" aria-atomic="true" style={SR_ONLY}>
        {announcement}
      </div>
    </DatePickerContext.Provider>
  );
}
