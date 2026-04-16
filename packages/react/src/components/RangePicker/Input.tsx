import { forwardRef, useCallback } from 'react';
import type { InputHTMLAttributes } from 'react';
import { useRangePickerContext } from '../../context/RangePickerContext.js';

export type RangeInputPart = 'start' | 'end';

export interface RangePickerInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  /** Which part this input represents (start | end) */
  part: RangeInputPart;
  /** Date display format (defaults to parent's displayFormat) */
  format?: string;
}

/**
 * RangePicker.Input — Separate input for start/end dates.
 * Use one with `part="start"` and another with `part="end"`.
 */
export const RangePickerInput = forwardRef<HTMLInputElement, RangePickerInputProps>(
  function RangePickerInput(
    { part, format: formatProp, onClick, onKeyDown, ...props },
    ref,
  ) {
    const ctx = useRangePickerContext('RangePicker.Input');
    const displayFormat = formatProp ?? ctx.displayFormat;

    const value = ctx.value[part];
    const displayValue = value ? ctx.adapter.format(value, displayFormat) : '';

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLInputElement>) => {
        if (!ctx.isOpen) ctx.open();
        onClick?.(e);
      },
      [ctx, onClick],
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
        ref={(node) => {
          // Use the first Input (start) as the reference
          if (part === 'start' && node) ctx.referenceRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
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
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        data-part={part}
        {...props}
      />
    );
  },
);
