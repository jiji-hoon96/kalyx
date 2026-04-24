import { forwardRef, useCallback, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { parseInputValue } from '@kalyx/core';
import { useDatePickerContext } from '../../context/DatePickerContext.js';

export interface DatePickerInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type'
> {
  /** Date display format (defaults to parent's displayFormat) */
  format?: string;
}

export const DatePickerInput = forwardRef<HTMLInputElement, DatePickerInputProps>(
  function DatePickerInput({ format: formatProp, onClick, onBlur, onKeyDown, ...props }, ref) {
    const ctx = useDatePickerContext('DatePicker.Input');
    const displayFormat = formatProp ?? ctx.displayFormat;

    // Text currently being edited (edit mode)
    const [inputText, setInputText] = useState<string | null>(null);

    let formattedValue = '';
    if (ctx.value) {
      try {
        formattedValue = ctx.adapter.format(ctx.value, displayFormat, ctx.displayTimezone);
      } catch {
        formattedValue = ctx.value;
      }
    }
    const displayValue = inputText !== null ? inputText : formattedValue;

    // Open on an explicit pointer click, not on focus — tabbing between form
    // fields should not pop the calendar open, and restoring focus after a
    // selection would otherwise loop us back to open.
    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLInputElement>) => {
        if (!ctx.isOpen) ctx.open();
        onClick?.(e);
      },
      [ctx, onClick],
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        if (inputText !== null) {
          const parsed = parseInputValue(inputText, ctx.adapter);
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

        const parsed = parseInputValue(text, ctx.adapter);
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
            const parsed = parseInputValue(inputText, ctx.adapter);
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
        onClick={handleClick}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  },
);
