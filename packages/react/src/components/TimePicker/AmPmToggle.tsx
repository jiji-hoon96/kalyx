import { useCallback, useRef } from 'react';
import type { HTMLAttributes, KeyboardEvent } from 'react';
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
 *
 * Implements the WAI-ARIA radiogroup pattern: only the checked radio is in the
 * tab order; ArrowLeft/Right/Up/Down + Home/End move selection between radios.
 */
export function TimePickerAmPmToggle({ classNames, ...props }: TimePickerAmPmToggleProps) {
  const ctx = useTimePickerContext('TimePicker.AmPmToggle');
  const amRef = useRef<HTMLButtonElement | null>(null);
  const pmRef = useRef<HTMLButtonElement | null>(null);

  const setPeriod = useCallback(
    (newPeriod: 'AM' | 'PM') => {
      if (ctx.isDisabled || ctx.isReadOnly) return;
      const { hours12 } = to12Hour(ctx.currentTime.hours);
      const newHours24 = to24Hour(hours12, newPeriod);
      ctx.setTime({ hours: newHours24 });
    },
    [ctx],
  );

  if (ctx.format !== '12h') return null;

  const { period } = to12Hour(ctx.currentTime.hours);

  const focusOther = (target: 'AM' | 'PM') => {
    (target === 'AM' ? amRef : pmRef).current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, target: 'AM' | 'PM') => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowUp': {
        e.preventDefault();
        const next: 'AM' | 'PM' = target === 'AM' ? 'PM' : 'AM';
        setPeriod(next);
        focusOther(next);
        break;
      }
      case 'Home': {
        e.preventDefault();
        setPeriod('AM');
        focusOther('AM');
        break;
      }
      case 'End': {
        e.preventDefault();
        setPeriod('PM');
        focusOther('PM');
        break;
      }
      case ' ':
      case 'Enter': {
        e.preventDefault();
        setPeriod(target);
        break;
      }
      default:
        break;
    }
  };

  const renderButton = (target: 'AM' | 'PM') => {
    const isSelected = period === target;
    const optionClass =
      [classNames?.option, isSelected && classNames?.optionSelected].filter(Boolean).join(' ') ||
      undefined;

    return (
      <button
        ref={target === 'AM' ? amRef : pmRef}
        type="button"
        role="radio"
        aria-checked={isSelected}
        tabIndex={isSelected ? 0 : -1}
        data-selected={isSelected || undefined}
        disabled={ctx.isDisabled}
        className={optionClass}
        onClick={() => setPeriod(target)}
        onKeyDown={(e) => handleKeyDown(e, target)}
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
