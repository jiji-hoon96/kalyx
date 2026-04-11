import { useCallback, useRef } from 'react';
import type { HTMLAttributes, KeyboardEvent } from 'react';
import { generateMinutes } from '@kalyx/core';
import { useTimePickerContext } from '../../context/TimePickerContext.js';

export interface TimePickerMinuteListClassNames {
  root?: string;
  option?: string;
  optionSelected?: string;
}

export interface TimePickerMinuteListProps
  extends Omit<HTMLAttributes<HTMLUListElement>, 'role' | 'children'> {
  classNames?: TimePickerMinuteListClassNames;
}

/**
 * TimePicker.MinuteList — `role="listbox"` 패턴의 분 선택 리스트.
 * step prop에 따라 표시되는 분이 결정된다 (예: step=15 → [0, 15, 30, 45]).
 */
export function TimePickerMinuteList({ classNames, ...props }: TimePickerMinuteListProps) {
  const ctx = useTimePickerContext('TimePicker.MinuteList');
  const { step, currentTime, isDisabled, isReadOnly } = ctx;
  const listRef = useRef<HTMLUListElement>(null);

  const minutes = generateMinutes(step);

  const handleSelect = useCallback(
    (minute: number) => {
      if (isDisabled || isReadOnly) return;
      ctx.setTime({ minutes: minute });
    },
    [ctx, isDisabled, isReadOnly],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLLIElement>, minute: number) => {
      if (isDisabled || isReadOnly) return;
      const currentIndex = minutes.indexOf(minute);

      let newIndex = -1;
      if (e.key === 'ArrowDown') {
        newIndex = Math.min(currentIndex + 1, minutes.length - 1);
      } else if (e.key === 'ArrowUp') {
        newIndex = Math.max(currentIndex - 1, 0);
      } else if (e.key === 'Home') {
        newIndex = 0;
      } else if (e.key === 'End') {
        newIndex = minutes.length - 1;
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSelect(minute);
        return;
      } else {
        return;
      }

      e.preventDefault();
      const target = minutes[newIndex];
      if (target !== undefined) {
        handleSelect(target);
        requestAnimationFrame(() => {
          const next = listRef.current?.querySelector<HTMLLIElement>(
            '[data-selected="true"]',
          );
          next?.focus();
        });
      }
    },
    [minutes, handleSelect, isDisabled, isReadOnly],
  );

  return (
    <ul
      ref={listRef}
      role="listbox"
      aria-label="분"
      aria-disabled={isDisabled || undefined}
      className={classNames?.root}
      {...props}
    >
      {minutes.map((minute) => {
        const isSelected = minute === currentTime.minutes;
        const optionClass =
          [classNames?.option, isSelected && classNames?.optionSelected]
            .filter(Boolean)
            .join(' ') || undefined;

        return (
          <li
            key={minute}
            role="option"
            aria-selected={isSelected}
            aria-disabled={isDisabled || undefined}
            aria-label={`${minute}분`}
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
