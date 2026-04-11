import { useCallback, useRef } from 'react';
import type { HTMLAttributes, KeyboardEvent } from 'react';
import { generateHours, to12Hour, to24Hour } from '@kalyx/core';
import { useTimePickerContext } from '../../context/TimePickerContext.js';

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
 * TimePicker.HourList — `role="listbox"` 패턴의 시간 선택 리스트.
 * 12h/24h 모드에 따라 다르게 렌더링.
 *
 * ARIA 표준 listbox: <li role="option">이 직접 인터랙티브 요소.
 * 키보드: ↑/↓로 이동, Enter/Space로 선택.
 */
export function TimePickerHourList({ classNames, ...props }: TimePickerHourListProps) {
  const ctx = useTimePickerContext('TimePicker.HourList');
  const { format, currentTime, isDisabled, isReadOnly } = ctx;
  const listRef = useRef<HTMLUListElement>(null);

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

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLLIElement>, hour: number) => {
      if (isDisabled || isReadOnly) return;
      const currentIndex = hours.indexOf(hour);

      let newIndex = -1;
      if (e.key === 'ArrowDown') {
        newIndex = Math.min(currentIndex + 1, hours.length - 1);
      } else if (e.key === 'ArrowUp') {
        newIndex = Math.max(currentIndex - 1, 0);
      } else if (e.key === 'Home') {
        newIndex = 0;
      } else if (e.key === 'End') {
        newIndex = hours.length - 1;
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSelect(hour);
        return;
      } else {
        return;
      }

      e.preventDefault();
      const targetHour = hours[newIndex];
      if (targetHour !== undefined) {
        handleSelect(targetHour);
        // 다음 렌더에서 새 selected 옵션에 포커스 이동
        requestAnimationFrame(() => {
          const next = listRef.current?.querySelector<HTMLLIElement>(
            '[data-selected="true"]',
          );
          next?.focus();
        });
      }
    },
    [hours, handleSelect, isDisabled, isReadOnly],
  );

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
