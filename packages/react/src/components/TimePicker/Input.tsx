import { forwardRef, useCallback, useState } from 'react';
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
  function TimePickerInput({ onBlur, onKeyDown, ...props }, ref) {
    const ctx = useTimePickerContext('TimePicker.Input');
    const [inputText, setInputText] = useState<string | null>(null);

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

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          commitInput();
        }
        onKeyDown?.(e);
      },
      [commitInput, onKeyDown],
    );

    return (
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        aria-label={ctx.labels.timeInput}
        placeholder={ctx.withSeconds ? 'HH:MM:SS' : 'HH:MM'}
        value={displayValue}
        disabled={ctx.isDisabled || props.disabled}
        readOnly={ctx.isReadOnly}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  },
);
