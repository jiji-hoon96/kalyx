import { forwardRef, useCallback } from 'react';
import type { InputHTMLAttributes } from 'react';
import { formatTimeString, getTime } from '@kalyx/core';
import { useDatePickerContext } from '../../context/DatePickerContext.js';

export interface DateTimePickerInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {}

/**
 * DateTimePicker.Input — 날짜와 시간을 결합한 형식으로 표시.
 * 예: "2026-01-15 14:30"
 *
 * v0.3에서는 readOnly로 동작한다 (Calendar/TimePicker로 선택).
 * 직접 타이핑 파싱은 v0.4에서 지원 예정.
 */
export const DateTimePickerInput = forwardRef<HTMLInputElement, DateTimePickerInputProps>(
  function DateTimePickerInput({ onFocus, onKeyDown, ...props }, ref) {
    const ctx = useDatePickerContext('DateTimePicker.Input');

    // 날짜 부분 (yyyy-MM-dd) + 시간 부분 (HH:mm) 결합
    const displayValue = ctx.value
      ? `${ctx.adapter.format(ctx.value, 'yyyy-MM-dd')} ${formatTimeString(getTime(ctx.value))}`
      : '';

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        ctx.open();
        onFocus?.(e);
      },
      [ctx, onFocus],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
          ctx.close();
        } else if (e.key === 'ArrowDown' && !ctx.isOpen) {
          e.preventDefault();
          ctx.open();
        }
        onKeyDown?.(e);
      },
      [ctx, onKeyDown],
    );

    const calendarId = `${ctx.pickerId}-calendar`;

    return (
      <input
        ref={ref}
        type="text"
        role="combobox"
        readOnly
        aria-label="날짜 및 시간"
        aria-expanded={ctx.isOpen}
        aria-haspopup="dialog"
        aria-controls={ctx.isOpen ? calendarId : undefined}
        aria-autocomplete="none"
        autoComplete="off"
        value={displayValue}
        disabled={ctx.isDisabled || props.disabled}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  },
);
