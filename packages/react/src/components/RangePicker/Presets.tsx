import { useCallback } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import type { DateRange, ISODateString } from '@kalyx/core';
import { useRangePickerContext } from '../../context/RangePickerContext.js';

/** Predefined preset keys. Custom ranges are also supported. */
export type PresetKey =
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'thisWeek'
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisYear';

export interface RangePickerPresetsClassNames {
  root?: string;
  preset?: string;
  presetActive?: string;
}

export interface RangePickerPresetsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  classNames?: RangePickerPresetsClassNames;
  children?: ReactNode;
}

/**
 * RangePicker.Presets — Container that wraps preset buttons.
 * Place `RangePicker.Preset` buttons inside.
 *
 * @example
 * ```tsx
 * <RangePicker.Presets>
 *   <RangePicker.Preset value="last7days">Last 7 days</RangePicker.Preset>
 *   <RangePicker.Preset value="thisMonth">This month</RangePicker.Preset>
 * </RangePicker.Presets>
 * ```
 */
export function RangePickerPresets({ classNames, children, ...props }: RangePickerPresetsProps) {
  const ctx = useRangePickerContext('RangePicker.Presets');
  return (
    <div role="group" aria-label={ctx.labels.presetsGroup} className={classNames?.root} {...props}>
      {children}
    </div>
  );
}

export interface RangePickerPresetProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'value'> {
  /** Predefined preset key; omit when passing `range` directly */
  value?: PresetKey;
  /** Pass a range directly (alternative to `value`) */
  range?: DateRange;
  children: ReactNode;
  className?: string;
}

/**
 * Resolve a predefined preset key into an actual DateRange.
 */
function resolvePreset(
  key: PresetKey,
  today: ISODateString,
  adapter: {
    addDays: (iso: string, n: number) => string;
    addMonths: (iso: string, n: number) => string;
    addYears: (iso: string, n: number) => string;
    startOfMonth: (iso: string) => string;
    endOfMonth: (iso: string) => string;
    startOfWeek: (iso: string, weekStartsOn?: 0 | 1) => string;
    endOfWeek: (iso: string, weekStartsOn?: 0 | 1) => string;
    startOfDay: (iso: string) => string;
  },
): DateRange {
  switch (key) {
    case 'today':
      return { start: today, end: today };
    case 'yesterday': {
      const yesterday = adapter.addDays(today, -1);
      return { start: yesterday, end: yesterday };
    }
    case 'last7days':
      return { start: adapter.addDays(today, -6), end: today };
    case 'last30days':
      return { start: adapter.addDays(today, -29), end: today };
    case 'thisWeek':
      return {
        start: adapter.startOfDay(adapter.startOfWeek(today)),
        end: adapter.startOfDay(adapter.endOfWeek(today)),
      };
    case 'lastWeek': {
      const prevWeek = adapter.addDays(today, -7);
      return {
        start: adapter.startOfDay(adapter.startOfWeek(prevWeek)),
        end: adapter.startOfDay(adapter.endOfWeek(prevWeek)),
      };
    }
    case 'thisMonth':
      return {
        start: adapter.startOfMonth(today),
        end: adapter.startOfDay(adapter.endOfMonth(today)),
      };
    case 'lastMonth': {
      const prevMonth = adapter.addMonths(today, -1);
      return {
        start: adapter.startOfMonth(prevMonth),
        end: adapter.startOfDay(adapter.endOfMonth(prevMonth)),
      };
    }
    case 'thisYear': {
      // Navigate back to January of the current year
      const currentMonth = new Date(today).getUTCMonth();
      const yearStart = adapter.startOfMonth(adapter.addMonths(today, -currentMonth));
      return { start: yearStart, end: today };
    }
  }
}

/**
 * RangePicker.Preset — One-click preset button to select a date range.
 *
 * Pass either `value` (a preset key) or `range` (a direct range).
 *
 * @example
 * ```tsx
 * <RangePicker.Preset value="last7days">Last 7 days</RangePicker.Preset>
 * <RangePicker.Preset range={{ start: "2026-01-01T...", end: "2026-03-31T..." }}>
 *   Q1 2026
 * </RangePicker.Preset>
 * ```
 */
export function RangePickerPreset({
  value: presetKey,
  range: directRange,
  children,
  onClick,
  ...props
}: RangePickerPresetProps) {
  const ctx = useRangePickerContext('RangePicker.Preset');

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (ctx.isDisabled || ctx.isReadOnly) return;

      let resolved: DateRange;
      if (directRange) {
        resolved = directRange;
      } else if (presetKey) {
        resolved = resolvePreset(presetKey, ctx.adapter.today(), ctx.adapter);
      } else {
        return;
      }

      ctx.setRange(resolved);
      ctx.close();
      onClick?.(e);
    },
    [ctx, presetKey, directRange, onClick],
  );

  // Determine whether the currently selected range matches this preset
  const isActive = (() => {
    if (!ctx.value.start || !ctx.value.end) return false;
    let target: DateRange;
    if (directRange) {
      target = directRange;
    } else if (presetKey) {
      target = resolvePreset(presetKey, ctx.adapter.today(), ctx.adapter);
    } else {
      return false;
    }
    return (
      target.start !== null &&
      target.end !== null &&
      ctx.adapter.isSameDay(ctx.value.start, target.start) &&
      ctx.adapter.isSameDay(ctx.value.end, target.end)
    );
  })();

  return (
    <button
      type="button"
      role="option"
      aria-selected={isActive}
      data-active={isActive || undefined}
      disabled={ctx.isDisabled}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}
