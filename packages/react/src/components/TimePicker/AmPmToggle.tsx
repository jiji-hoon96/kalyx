import { useCallback } from 'react';
import type { HTMLAttributes } from 'react';
import { to12Hour, to24Hour } from '@kalyx/core';
import { useTimePickerContext } from '../../context/TimePickerContext.js';

export interface TimePickerAmPmToggleClassNames {
  root?: string;
  option?: string;
  optionSelected?: string;
}

export interface TimePickerAmPmToggleProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'role' | 'children'
> {
  classNames?: TimePickerAmPmToggleClassNames;
}

/**
 * TimePicker.AmPmToggle — AM/PM toggle shown only in 12-hour mode.
 * Returns null in 24-hour mode.
 */
export function TimePickerAmPmToggle({ classNames, ...props }: TimePickerAmPmToggleProps) {
  const ctx = useTimePickerContext('TimePicker.AmPmToggle');

  if (ctx.format !== '12h') return null;

  const { period, hours12 } = to12Hour(ctx.currentTime.hours);

  const setPeriod = useCallback(
    (newPeriod: 'AM' | 'PM') => {
      if (ctx.isDisabled || ctx.isReadOnly) return;
      const newHours24 = to24Hour(hours12, newPeriod);
      ctx.setTime({ hours: newHours24 });
    },
    [hours12, ctx],
  );

  const renderButton = (target: 'AM' | 'PM') => {
    const isSelected = period === target;
    const optionClass =
      [classNames?.option, isSelected && classNames?.optionSelected].filter(Boolean).join(' ') ||
      undefined;

    return (
      <button
        type="button"
        role="radio"
        aria-checked={isSelected}
        data-selected={isSelected || undefined}
        disabled={ctx.isDisabled}
        className={optionClass}
        onClick={() => setPeriod(target)}
      >
        {target}
      </button>
    );
  };

  return (
    <div
      role="radiogroup"
      aria-label={ctx.labels.amPmToggle}
      className={classNames?.root}
      {...props}
    >
      {renderButton('AM')}
      {renderButton('PM')}
    </div>
  );
}
