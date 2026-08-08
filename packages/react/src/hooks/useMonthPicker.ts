import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { civilMidnightFromUtcDay, getMonthName } from '@kalyx/core';
import type { DateAdapter, DisabledRule, ISODateString } from '@kalyx/core';
import { getDefaultAdapter, resolveAdapter } from '../internal/defaultAdapter.js';
import { isRangeFullyDisabled } from '../components/_shared/grid-keyboard.js';
import { usableDate } from '../internal/usableDate.js';

export interface UseMonthPickerOptions {
  /** Selected month (controlled mode), stored as the month-start ISO string */
  value?: ISODateString | null;
  /** Initial month (uncontrolled mode) */
  defaultValue?: ISODateString;
  /** Callback fired when the month changes (month-start ISO, or null) */
  onChange?: (value: ISODateString | null) => void;
  /** Rules that mark months as disabled (a month is disabled only when fully excluded) */
  disabled?: DisabledRule[];
  /** Date adapter */
  adapter?: DateAdapter;
  /** IANA timezone for display (see MonthPickerRoot#displayTimezone) */
  displayTimezone?: string;
  /** BCP 47 locale for month names */
  locale?: string;
}

/** A single cell in the 12-month grid. */
export interface MonthCell {
  /** Month-start ISO string (UTC) */
  isoString: ISODateString;
  /** Zero-based month index (0 = January) */
  monthIndex: number;
  /** Localized month name */
  label: string;
  isSelected: boolean;
  isCurrent: boolean;
  isDisabled: boolean;
}

export interface UseMonthPickerReturn {
  value: ISODateString | null;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  /** Commit a month (pass a cell's `isoString`) */
  selectMonth: (iso: ISODateString) => void;
  /** Year currently displayed in the grid */
  viewYear: number;
  /** Move to the previous year */
  previousYear: () => void;
  /** Move to the next year */
  nextYear: () => void;
  /** The 12 month cells for `viewYear` */
  months: MonthCell[];
  pickerId: string;
  adapter: DateAdapter;
}

/**
 * Headless MonthPicker state for fully custom UIs. DOM-free (preserves the
 * React Native seam) — it exposes the 12-month grid and navigation; the
 * consumer renders and wires focus/keyboard.
 *
 * @example
 * ```tsx
 * const { months, viewYear, nextYear, selectMonth } = useMonthPicker({ onChange: save });
 * ```
 */
export function useMonthPicker(options: UseMonthPickerOptions = {}): UseMonthPickerReturn {
  const {
    value: controlledValue,
    defaultValue,
    onChange,
    disabled = [],
    adapter: adapterProp,
    displayTimezone,
    locale = 'en-US',
  } = options;

  const adapter = resolveAdapter(adapterProp, getDefaultAdapter(), 'useMonthPicker');
  const pickerId = useId();
  const isControlled = useRef(controlledValue !== undefined).current;

  const [uncontrolledValue, setUncontrolledValue] = useState<ISODateString | null>(
    defaultValue ?? null,
  );
  const currentValue = isControlled ? (controlledValue ?? null) : uncontrolledValue;

  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<ISODateString>(
    () => usableDate(currentValue, adapter) ?? adapter.today(displayTimezone),
  );

  // SSR-safe "today": null on the server / during hydration, resolved after mount.
  const [today, setToday] = useState<ISODateString | null>(null);
  useEffect(() => {
    setToday(adapter.today(displayTimezone));
  }, [adapter, displayTimezone]);

  const viewYear = adapter.getYear(viewMonth);

  const selectMonth = useCallback(
    (iso: ISODateString) => {
      if (!usableDate(iso, adapter)) return;
      // Same predicate the grid uses for `isDisabled`, so a cell the grid renders
      // as unselectable cannot be committed programmatically either. Deliberately
      // not `isDateDisabled`: a month is disabled only when *fully* excluded, so a
      // day-granular rule must not block the month.
      if (isRangeFullyDisabled(iso, adapter.addMonths(iso, 1), disabled, adapter, displayTimezone))
        return;
      const normalized = displayTimezone ? civilMidnightFromUtcDay(iso, displayTimezone) : iso;
      if (!isControlled) setUncontrolledValue(normalized);
      onChange?.(normalized);
      setIsOpen(false);
    },
    [isControlled, onChange, displayTimezone, disabled, adapter],
  );

  const open = useCallback(() => {
    setIsOpen(true);
    setViewMonth(usableDate(currentValue, adapter) ?? adapter.today(displayTimezone));
  }, [currentValue, adapter, displayTimezone]);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((o) => !o), []);

  const previousYear = useCallback(() => setViewMonth((m) => adapter.addYears(m, -1)), [adapter]);
  const nextYear = useCallback(() => setViewMonth((m) => adapter.addYears(m, 1)), [adapter]);

  const [selectedYear, selectedMonth] = useMemo(() => {
    if (!currentValue) return [null, null] as const;
    try {
      const [y, m] = adapter
        .format(currentValue, 'yyyy-MM', displayTimezone)
        .split('-')
        .map(Number);
      return [y!, m! - 1] as const;
    } catch {
      return [null, null] as const;
    }
  }, [currentValue, adapter, displayTimezone]);

  const todayYear = today !== null ? adapter.getYear(today) : -1;
  const todayMonth = today !== null ? adapter.getMonth(today) : -1;

  const months = useMemo<MonthCell[]>(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const isoString = new Date(Date.UTC(viewYear, i, 1)).toISOString();
        return {
          isoString,
          monthIndex: i,
          label: getMonthName(i, locale),
          isSelected: selectedYear === viewYear && selectedMonth === i,
          isCurrent: todayYear === viewYear && todayMonth === i,
          isDisabled: isRangeFullyDisabled(
            isoString,
            adapter.addMonths(isoString, 1),
            disabled,
            adapter,
            displayTimezone,
          ),
        };
      }),
    [
      viewYear,
      locale,
      selectedYear,
      selectedMonth,
      todayYear,
      todayMonth,
      disabled,
      adapter,
      displayTimezone,
    ],
  );

  return {
    value: currentValue,
    isOpen,
    open,
    close,
    toggle,
    selectMonth,
    viewYear,
    previousYear,
    nextYear,
    months,
    pickerId,
    adapter,
  };
}
