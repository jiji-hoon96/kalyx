import { useCallback, useMemo } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import type { ISODateString } from '@kalyx/core';
import { useDatePickerContext } from '../../context/DatePickerContext.js';

export interface DateTimePickerPresetsClassNames {
  root?: string;
  preset?: string;
  presetActive?: string;
}

export interface DateTimePickerPresetsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  classNames?: DateTimePickerPresetsClassNames;
  children?: ReactNode;
}

/**
 * DateTimePicker.Presets — container that groups one-click datetime presets.
 * Place {@link DateTimePickerPreset} buttons inside.
 *
 * @example
 * ```tsx
 * <DateTimePicker.Presets>
 *   <DateTimePicker.Preset value="2026-01-15T09:00:00.000Z">Mon 9 AM</DateTimePicker.Preset>
 * </DateTimePicker.Presets>
 * ```
 */
export function DateTimePickerPresets({
  classNames,
  children,
  ...props
}: DateTimePickerPresetsProps) {
  // DatePickerLabels has no presets label (it's a RangePicker concept), so default
  // a sensible group label here. Consumers can override via the spread `aria-label`.
  return (
    <div role="group" aria-label="Date and time presets" className={classNames?.root} {...props}>
      {children}
    </div>
  );
}

export interface DateTimePickerPresetProps extends Omit<
  HTMLAttributes<HTMLButtonElement>,
  'value'
> {
  /** Full datetime (ISO 8601 UTC) to commit when clicked — includes both date and time. */
  value: ISODateString;
  children: ReactNode;
  className?: string;
}

/**
 * DateTimePicker.Preset — one-click button that commits a full datetime (date + time).
 *
 * Unlike `DateTimePicker.Calendar` (which preserves the existing time) this sets both the
 * date and time portions atomically, so a preset like "tomorrow 9 AM" lands exactly.
 *
 * @example
 * ```tsx
 * <DateTimePicker.Preset value="2026-01-16T09:00:00.000Z">Tomorrow 9 AM</DateTimePicker.Preset>
 * ```
 */
export function DateTimePickerPreset({
  value,
  children,
  onClick,
  ...props
}: DateTimePickerPresetProps) {
  const ctx = useDatePickerContext('DateTimePicker.Preset');

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (ctx.isDisabled || ctx.isReadOnly) return;
      // selectDateTime is only present on DateTimePicker.Root; fall back to selectDate
      // (date-only) if a Preset is somehow mounted under a plain DatePicker.
      (ctx.selectDateTime ?? ctx.selectDate)(value);
      ctx.close();
      onClick?.(e);
    },
    [ctx, value, onClick],
  );

  const isActive = useMemo(
    () => ctx.value != null && ctx.adapter.isSameDay(ctx.value, value) && ctx.value === value,
    [ctx.value, ctx.adapter, value],
  );

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
