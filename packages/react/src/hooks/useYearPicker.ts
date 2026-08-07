import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { civilMidnightFromUtcDay } from '@kalyx/core';
import type { DateAdapter, DisabledRule, ISODateString } from '@kalyx/core';
import { getDefaultAdapter, resolveAdapter } from '../internal/defaultAdapter.js';
import { isRangeFullyDisabled } from '../components/_shared/grid-keyboard.js';

export interface UseYearPickerOptions {
  /** Selected year (controlled mode), stored as the year-start ISO string */
  value?: ISODateString | null;
  /** Initial year (uncontrolled mode) */
  defaultValue?: ISODateString;
  /** Callback fired when the year changes (year-start ISO, or null) */
  onChange?: (value: ISODateString | null) => void;
  /** Rules that mark years as disabled (a year is disabled only when fully excluded) */
  disabled?: DisabledRule[];
  /** Date adapter */
  adapter?: DateAdapter;
  /** IANA timezone for display (see YearPickerRoot#displayTimezone) */
  displayTimezone?: string;
}

/** A single cell in the 12-year decade grid. */
export interface YearCell {
  /** Year-start ISO string (Jan 1, UTC midnight) */
  isoString: ISODateString;
  year: number;
  isSelected: boolean;
  isCurrent: boolean;
  isDisabled: boolean;
}

export interface UseYearPickerReturn {
  value: ISODateString | null;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  /** Commit a year (pass a cell's `isoString`) */
  selectYear: (iso: ISODateString) => void;
  /** First year of the displayed 12-year decade block */
  decadeStart: number;
  /** Move to the previous decade block */
  previousDecade: () => void;
  /** Move to the next decade block */
  nextDecade: () => void;
  /** The 12 year cells for the current decade block */
  years: YearCell[];
  pickerId: string;
  adapter: DateAdapter;
}

/**
 * Headless YearPicker state for fully custom UIs. DOM-free (preserves the
 * React Native seam) — exposes the 12-year decade grid and navigation.
 *
 * @example
 * ```tsx
 * const { years, decadeStart, nextDecade, selectYear } = useYearPicker({ onChange: save });
 * ```
 */
export function useYearPicker(options: UseYearPickerOptions = {}): UseYearPickerReturn {
  const {
    value: controlledValue,
    defaultValue,
    onChange,
    disabled = [],
    adapter: adapterProp,
    displayTimezone,
  } = options;

  const adapter = resolveAdapter(adapterProp, getDefaultAdapter(), 'useYearPicker');
  const pickerId = useId();
  const isControlled = useRef(controlledValue !== undefined).current;

  const [uncontrolledValue, setUncontrolledValue] = useState<ISODateString | null>(
    defaultValue ?? null,
  );
  const currentValue = isControlled ? (controlledValue ?? null) : uncontrolledValue;

  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<ISODateString>(
    () => currentValue ?? adapter.today(displayTimezone),
  );

  const [today, setToday] = useState<ISODateString | null>(null);
  useEffect(() => {
    setToday(adapter.today(displayTimezone));
  }, [adapter, displayTimezone]);

  const currentYear = adapter.getYear(viewMonth);
  const decadeStart = currentYear - (currentYear % 12);

  const selectYear = useCallback(
    (iso: ISODateString) => {
      // Same predicate the grid uses for `isDisabled`, so a cell the grid renders
      // as unselectable cannot be committed programmatically either. Deliberately
      // not `isDateDisabled`: a year is disabled only when *fully* excluded, so a
      // day-granular rule must not block the year.
      const nextYearStart = new Date(Date.UTC(adapter.getYear(iso) + 1, 0, 1)).toISOString();
      if (isRangeFullyDisabled(iso, nextYearStart, disabled, adapter, displayTimezone)) return;
      const normalized = displayTimezone ? civilMidnightFromUtcDay(iso, displayTimezone) : iso;
      if (!isControlled) setUncontrolledValue(normalized);
      onChange?.(normalized);
      setIsOpen(false);
    },
    [isControlled, onChange, displayTimezone, disabled, adapter],
  );

  const open = useCallback(() => {
    setIsOpen(true);
    setViewMonth(currentValue ?? adapter.today(displayTimezone));
  }, [currentValue, adapter, displayTimezone]);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((o) => !o), []);

  const previousDecade = useCallback(
    () => setViewMonth((m) => adapter.addYears(m, -12)),
    [adapter],
  );
  const nextDecade = useCallback(() => setViewMonth((m) => adapter.addYears(m, 12)), [adapter]);

  const selectedYear = useMemo(() => {
    if (!currentValue) return null;
    try {
      return Number(adapter.format(currentValue, 'yyyy', displayTimezone));
    } catch {
      return null;
    }
  }, [currentValue, adapter, displayTimezone]);

  const todayYear = today !== null ? adapter.getYear(today) : -1;

  const years = useMemo<YearCell[]>(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const year = decadeStart + i;
        const isoString = new Date(Date.UTC(year, 0, 1)).toISOString();
        const nextYearStart = new Date(Date.UTC(year + 1, 0, 1)).toISOString();
        return {
          isoString,
          year,
          isSelected: year === selectedYear,
          isCurrent: year === todayYear,
          isDisabled: isRangeFullyDisabled(
            isoString,
            nextYearStart,
            disabled,
            adapter,
            displayTimezone,
          ),
        };
      }),
    [decadeStart, selectedYear, todayYear, disabled, adapter, displayTimezone],
  );

  return {
    value: currentValue,
    isOpen,
    open,
    close,
    toggle,
    selectYear,
    decadeStart,
    previousDecade,
    nextDecade,
    years,
    pickerId,
    adapter,
  };
}
