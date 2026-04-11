import { forwardRef, useCallback } from 'react';
import type { InputHTMLAttributes } from 'react';
import { useRangePickerContext } from '../../context/RangePickerContext.js';

export type RangeInputPart = 'start' | 'end';

export interface RangePickerInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  /** 어떤 부분의 입력인지 (start | end) */
  part: RangeInputPart;
  /** 날짜 표시 포맷 (기본: 부모의 displayFormat) */
  format?: string;
}

/**
 * RangePicker.Input — 시작일/종료일을 위한 별도 input.
 * `part="start"`와 `part="end"` 두 개를 함께 사용한다.
 */
export const RangePickerInput = forwardRef<HTMLInputElement, RangePickerInputProps>(
  function RangePickerInput({ part, format: formatProp, onFocus, onKeyDown, ...props }, ref) {
    const ctx = useRangePickerContext('RangePicker.Input');
    const displayFormat = formatProp ?? ctx.displayFormat;

    const value = ctx.value[part];
    const displayValue = value ? ctx.adapter.format(value, displayFormat) : '';

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
        aria-expanded={ctx.isOpen}
        aria-haspopup="dialog"
        aria-controls={ctx.isOpen ? calendarId : undefined}
        aria-autocomplete="none"
        aria-label={part === 'start' ? '시작일' : '종료일'}
        autoComplete="off"
        value={displayValue}
        disabled={ctx.isDisabled || props.disabled}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        data-part={part}
        {...props}
      />
    );
  },
);
