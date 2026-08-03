import { useCallback } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { calendarDayFromInstant } from '@kalyx/core';
import type { ISODateString } from '@kalyx/core';
import { useDatePickerContext } from '../../context/DatePickerContext.js';

/** Predefined single-date preset keys. Pass a custom ISO via `date` for anything else. */
export type DatePickerPresetKey =
  | 'today'
  | 'tomorrow'
  | 'yesterday'
  | 'startOfMonth'
  | 'endOfMonth'
  | 'startOfYear';

export interface DatePickerPresetsClassNames {
  root?: string;
  preset?: string;
  presetActive?: string;
}

export interface DatePickerPresetsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  classNames?: DatePickerPresetsClassNames;
  children?: ReactNode;
}

/**
 * DatePicker.Presets — Container wrapping preset buttons.
 *
 * @example
 * ```tsx
 * <DatePicker.Presets>
 *   <DatePicker.Preset value="today">Today</DatePicker.Preset>
 *   <DatePicker.Preset value="tomorrow">Tomorrow</DatePicker.Preset>
 * </DatePicker.Presets>
 * ```
 */
export function DatePickerPresets({ classNames, children, ...props }: DatePickerPresetsProps) {
  const ctx = useDatePickerContext('DatePicker.Presets');
  return (
    <div role="group" aria-label={ctx.labels.popoverLabel} className={classNames?.root} {...props}>
      {children}
    </div>
  );
}

type PresetAdapter = {
  addDays: (iso: string, n: number) => string;
  startOfMonth: (iso: string) => string;
  endOfMonth: (iso: string) => string;
  startOfDay: (iso: string, timezone?: string) => string;
  addMonths: (iso: string, n: number) => string;
  getMonth: (iso: string) => number;
};

function resolveDatePreset(
  key: DatePickerPresetKey,
  today: ISODateString,
  adapter: PresetAdapter,
): ISODateString {
  switch (key) {
    case 'today':
      return today;
    case 'tomorrow':
      return adapter.addDays(today, 1);
    case 'yesterday':
      return adapter.addDays(today, -1);
    case 'startOfMonth':
      return adapter.startOfMonth(today);
    case 'endOfMonth':
      return adapter.startOfDay(adapter.endOfMonth(today));
    case 'startOfYear': {
      const currentMonth = adapter.getMonth(today);
      return adapter.startOfMonth(adapter.addMonths(today, -currentMonth));
    }
  }
}

export interface DatePickerPresetProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'value'> {
  /** Predefined preset key; omit when passing `date` directly */
  value?: DatePickerPresetKey;
  /** Pass an ISO date directly (alternative to `value`) */
  date?: ISODateString;
  children: ReactNode;
  className?: string;
}

/**
 * DatePicker.Preset — One-click preset button to select a specific date.
 *
 * Pass either `value` (a preset key) or `date` (a direct ISO string).
 *
 * @example
 * ```tsx
 * <DatePicker.Preset value="today">Today</DatePicker.Preset>
 * <DatePicker.Preset date="2026-01-01T00:00:00.000Z">New Year's</DatePicker.Preset>
 * ```
 */
export function DatePickerPreset({
  value: presetKey,
  date: directDate,
  children,
  onClick,
  ...props
}: DatePickerPresetProps) {
  const ctx = useDatePickerContext('DatePicker.Preset');

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (ctx.isDisabled || ctx.isReadOnly) return;

      let resolved: ISODateString;
      if (directDate) {
        resolved = ctx.displayTimezone
          ? calendarDayFromInstant(directDate, ctx.displayTimezone)
          : directDate;
      } else if (presetKey) {
        const today = ctx.adapter.today(ctx.displayTimezone);
        resolved = resolveDatePreset(
          presetKey,
          ctx.displayTimezone ? calendarDayFromInstant(today, ctx.displayTimezone) : today,
          ctx.adapter,
        );
      } else {
        return;
      }

      ctx.selectDate(resolved);
      onClick?.(e);
    },
    [ctx, presetKey, directDate, onClick],
  );

  // Active when the preset's resolved date equals the current value (same civil day, tz-aware).
  const isActive = (() => {
    if (!ctx.value) return false;
    let target: ISODateString;
    if (directDate) {
      target = directDate;
    } else if (presetKey) {
      target = resolveDatePreset(presetKey, ctx.adapter.today(ctx.displayTimezone), ctx.adapter);
    } else {
      return false;
    }
    return ctx.adapter.isSameDay(ctx.value, target, ctx.displayTimezone);
  })();

  // role="option" is invalid outside role="listbox"/role="combobox"; the parent
  // <DatePicker.Presets> is role="group". Use a regular button with aria-pressed
  // so the active state is announced as a toggle.
  return (
    <button
      type="button"
      aria-pressed={isActive}
      data-active={isActive || undefined}
      disabled={ctx.isDisabled}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}
