import { useCallback } from 'react';
import type { HTMLAttributes } from 'react';
import { generateHours, to12Hour, to24Hour } from '@kalyx/core';
import { useTimePickerContext } from '../../context/TimePickerContext.js';
import { useListboxNavigation } from '../../hooks/useListboxNavigation.js';

export interface TimePickerHourListClassNames {
  root?: string;
  option?: string;
  optionSelected?: string;
}

export interface TimePickerHourListProps
  extends Omit<HTMLAttributes<HTMLUListElement>, 'role' | 'children'> {
  classNames?: TimePickerHourListClassNames;
}

/**
 * TimePicker.HourList — `role="listbox"` pattern for hour selection.
 * Renders differently depending on 12h/24h mode.
 *
 * ARIA-standard listbox: the <li role="option"> element itself is interactive.
 * Keyboard: ArrowUp/ArrowDown to navigate, Enter/Space to select.
 */
export function TimePickerHourList({ classNames, ...props }: TimePickerHourListProps) {
  const ctx = useTimePickerContext('TimePicker.HourList');
  const { format, currentTime, isDisabled, isReadOnly } = ctx;

  const hours = generateHours(format);

  const selectedHourDisplay =
    format === '12h' ? to12Hour(currentTime.hours).hours12 : currentTime.hours;

  const currentPeriod = format === '12h' ? to12Hour(currentTime.hours).period : null;

  const handleSelect = useCallback(
    (hourDisplay: number) => {
      if (isDisabled || isReadOnly) return;
      const hours24 =
        format === '12h' && currentPeriod
          ? to24Hour(hourDisplay, currentPeriod)
          : hourDisplay;
      ctx.setTime({ hours: hours24 });
    },
    [format, currentPeriod, ctx, isDisabled, isReadOnly],
  );

  const { listRef, handleKeyDown } = useListboxNavigation({
    items: hours,
    onSelect: handleSelect,
    disabled: isDisabled || isReadOnly,
  });

  return (
    <ul
      ref={listRef}
      role="listbox"
      aria-label="시"
      aria-disabled={isDisabled || undefined}
      className={classNames?.root}
      {...props}
    >
      {hours.map((hour) => {
        const isSelected = hour === selectedHourDisplay;
        const optionClass =
          [classNames?.option, isSelected && classNames?.optionSelected]
            .filter(Boolean)
            .join(' ') || undefined;

        return (
          <li
            key={hour}
            role="option"
            aria-selected={isSelected}
            aria-disabled={isDisabled || undefined}
            aria-label={`${hour}시`}
            data-selected={isSelected || undefined}
            tabIndex={isSelected ? 0 : -1}
            className={optionClass}
            onClick={() => handleSelect(hour)}
            onKeyDown={(e) => handleKeyDown(e, hour)}
          >
            {String(hour).padStart(2, '0')}
          </li>
        );
      })}
    </ul>
  );
}
