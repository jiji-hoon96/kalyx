import { forwardRef, useCallback, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { parseInputValue } from '@kalyx/core';
import { useDatePickerContext } from '../../context/DatePickerContext.js';

export interface DatePickerInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  /** Date display format (defaults to parent's displayFormat) */
  format?: string;
}

export const DatePickerInput = forwardRef<HTMLInputElement, DatePickerInputProps>(
  function DatePickerInput({ format: formatProp, onFocus, onBlur, onKeyDown, ...props }, ref) {
    const ctx = useDatePickerContext('DatePicker.Input');
    const displayFormat = formatProp ?? ctx.displayFormat;

    // Text currently being edited (edit mode)
    const [inputText, setInputText] = useState<string | null>(null);

    const displayValue =
      inputText !== null
        ? inputText
        : ctx.value
          ? ctx.adapter.format(ctx.value, displayFormat)
          : '';

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        ctx.open();
        onFocus?.(e);
      },
      [ctx, onFocus],
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        if (inputText !== null) {
          const parsed = parseInputValue(inputText, displayFormat, ctx.adapter);
          if (parsed) {
            ctx.selectDate(parsed);
          }
          setInputText(null);
        }
        onBlur?.(e);
      },
      [inputText, displayFormat, ctx, onBlur],
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        setInputText(text);

        if (!text) {
          ctx.selectDate(null);
          setInputText(null);
          return;
        }

        const parsed = parseInputValue(text, displayFormat, ctx.adapter);
        if (parsed) {
          ctx.selectDate(parsed);
          setInputText(null);
        }
      },
      [displayFormat, ctx],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
          ctx.close();
        } else if (e.key === 'Enter') {
          if (inputText !== null) {
            const parsed = parseInputValue(inputText, displayFormat, ctx.adapter);
            if (parsed) {
              ctx.selectDate(parsed);
              setInputText(null);
            }
          }
        } else if (e.key === 'ArrowDown' && !ctx.isOpen) {
          e.preventDefault();
          ctx.open();
        }
        onKeyDown?.(e);
      },
      [ctx, inputText, displayFormat, onKeyDown],
    );

    const calendarId = `${ctx.pickerId}-calendar`;

    return (
      <input
        ref={(node) => {
          // Register as Floating UI reference
          ctx.referenceRef.current = node;
          // Forward the ref
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        type="text"
        role="combobox"
        aria-expanded={ctx.isOpen}
        aria-haspopup="dialog"
        aria-controls={ctx.isOpen ? calendarId : undefined}
        aria-autocomplete="none"
        autoComplete="off"
        value={displayValue}
        disabled={ctx.isDisabled || props.disabled}
        readOnly={ctx.isReadOnly}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  },
);
