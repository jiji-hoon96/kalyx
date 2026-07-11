import { forwardRef, useCallback, useEffect, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { formatTimeString, parseTimeString } from '@kalyx/core';
import { useTimePickerContext } from '../../context/TimePickerContext.js';

export interface TimePickerInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type'
> {}

/**
 * TimePicker.Input — Text input for HH:MM or HH:MM:SS format.
 * Supports direct typing by the user.
 */
export const TimePickerInput = forwardRef<HTMLInputElement, TimePickerInputProps>(
  function TimePickerInput({ onBlur, onKeyDown, onClick, ...props }, ref) {
    const ctx = useTimePickerContext('TimePicker.Input');
    const [inputText, setInputText] = useState<string | null>(null);

    // Drop stale typed text when the value changes from outside (parent re-sets,
    // HourList/MinuteList click, AM/PM toggle) so the input reflects the new time
    // instead of holding the user's earlier half-typed string. Time inputs are
    // numeric — no IME composition to worry about.
    useEffect(() => {
      setInputText(null);
    }, [ctx.value]);

    const displayValue =
      inputText !== null ? inputText : formatTimeString(ctx.currentTime, ctx.withSeconds);

    const commitInput = useCallback(() => {
      if (inputText === null) return;
      const parsed = parseTimeString(inputText);
      if (parsed) {
        ctx.setTime(parsed);
      }
      setInputText(null);
    }, [inputText, ctx]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setInputText(e.target.value);
    }, []);

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        commitInput();
        onBlur?.(e);
      },
      [commitInput, onBlur],
    );

    // Open the optional popover when the input is clicked. No-op for inline usage
    // (no Popover mounted → isOpen stays false and nothing renders).
    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLInputElement>) => {
        if (!ctx.isOpen) ctx.open();
        onClick?.(e);
      },
      [ctx, onClick],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          commitInput();
        } else if (e.key === 'ArrowDown' && !ctx.isOpen) {
          e.preventDefault();
          ctx.open();
        } else if (e.key === 'Escape' && ctx.isOpen) {
          e.preventDefault();
          e.stopPropagation();
          ctx.close();
        }
        onKeyDown?.(e);
      },
      [commitInput, ctx, onKeyDown],
    );

    const listId = `${ctx.pickerId}-time`;

    return (
      <input
        ref={(node) => {
          ctx.referenceRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        type="text"
        role="combobox"
        inputMode="numeric"
        autoComplete="off"
        aria-label={ctx.labels.timeInput}
        aria-expanded={ctx.isOpen}
        aria-haspopup="dialog"
        aria-controls={ctx.isOpen ? listId : undefined}
        placeholder={ctx.withSeconds ? 'HH:MM:SS' : 'HH:MM'}
        value={displayValue}
        disabled={ctx.isDisabled || props.disabled}
        readOnly={ctx.isReadOnly}
        onChange={handleChange}
        onBlur={handleBlur}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  },
);

TimePickerInput.displayName = 'TimePicker.Input';
