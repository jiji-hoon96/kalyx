import { useCallback, useMemo } from 'react';
import type { HTMLAttributes } from 'react';
import { generateMinutes } from '@kalyx/core';
import { useTimePickerContext } from '../../context/TimePickerContext.js';
import { useListboxNavigation } from '../../hooks/useListboxNavigation.js';

export interface TimePickerMinuteListClassNames {
  root?: string;
  option?: string;
  optionSelected?: string;
}

export interface TimePickerMinuteListProps extends Omit<
  HTMLAttributes<HTMLUListElement>,
  'role' | 'children'
> {
  classNames?: TimePickerMinuteListClassNames;
}

/**
 * TimePicker.MinuteList — `role="listbox"` pattern for minute selection.
 * The displayed minutes depend on the `step` prop (e.g., step=15 -> [0, 15, 30, 45]).
 */
export function TimePickerMinuteList({ classNames, ...props }: TimePickerMinuteListProps) {
  const ctx = useTimePickerContext('TimePicker.MinuteList');
  const { step, currentTime, isDisabled, isReadOnly, filterTime } = ctx;

  // Stable across renders unless `step` changes — useListboxNavigation
  // identity-compares its `items` array internally.
  const minutes = useMemo(() => generateMinutes(step), [step]);

  const isMinuteDisabled = useCallback(
    (minute: number) => {
      if (!filterTime) return false;
      return filterTime(currentTime.hours, minute);
    },
    [filterTime, currentTime.hours],
  );

  const handleSelect = useCallback(
    (minute: number) => {
      if (isDisabled || isReadOnly) return;
      if (isMinuteDisabled(minute)) return;
      ctx.setTime({ minutes: minute });
    },
    [ctx, isDisabled, isReadOnly, isMinuteDisabled],
  );

  const { listRef, handleKeyDown } = useListboxNavigation({
    items: minutes,
    onSelect: handleSelect,
    disabled: isDisabled || isReadOnly,
  });

  return (
    <ul
      ref={listRef}
      role="listbox"
      aria-label={ctx.labels.minuteList}
      aria-disabled={isDisabled || undefined}
      className={classNames?.root}
      {...props}
    >
      {minutes.map((minute) => {
        const isSelected = minute === currentTime.minutes;
        const isMinuteFullyDisabled = isMinuteDisabled(minute);
        const optionClass =
          [classNames?.option, isSelected && classNames?.optionSelected]
            .filter(Boolean)
            .join(' ') || undefined;

        return (
          <li
            key={minute}
            role="option"
            aria-selected={isSelected}
            aria-disabled={isDisabled || isMinuteFullyDisabled || undefined}
            aria-label={ctx.labels.minuteOption(minute)}
            data-selected={isSelected || undefined}
            tabIndex={isSelected ? 0 : -1}
            className={optionClass}
            onClick={() => handleSelect(minute)}
            onKeyDown={(e) => handleKeyDown(e, minute)}
          >
            {String(minute).padStart(2, '0')}
          </li>
        );
      })}
    </ul>
  );
}
