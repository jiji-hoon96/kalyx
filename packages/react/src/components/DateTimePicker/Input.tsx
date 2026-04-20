import { forwardRef, useCallback } from 'react';
import type { InputHTMLAttributes } from 'react';
import { formatTimeString, getTime, getTimeInTimezone } from '@kalyx/core';
import { useDatePickerContext } from '../../context/DatePickerContext.js';

export interface DateTimePickerInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {}

/**
 * DateTimePicker.Input — Displays date and time combined.
 * Example: "2026-01-15 14:30"
 *
 * In v0.3 the input is read-only (use Calendar/TimePicker to select).
 * Direct-typing parsing is planned for v0.4.
 */
export const DateTimePickerInput = forwardRef<HTMLInputElement, DateTimePickerInputProps>(
  function DateTimePickerInput({ onClick, onKeyDown, ...props }, ref) {
    const ctx = useDatePickerContext('DateTimePicker.Input');

    // Combine the date portion (yyyy-MM-dd) and the time portion (HH:mm)
    let displayValue = '';
    if (ctx.value) {
      try {
        const datePart = ctx.adapter.format(ctx.value, 'yyyy-MM-dd', ctx.displayTimezone);
        const time = ctx.displayTimezone
          ? getTimeInTimezone(ctx.value, ctx.displayTimezone)
          : getTime(ctx.value);
        displayValue = `${datePart} ${formatTimeString(time)}`;
      } catch {
        displayValue = ctx.value;
      }
    }

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
          ctx.referenceRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        type="text"
        role="combobox"
        readOnly
        aria-label={ctx.labels.dateTimeInput ?? 'Date and time'}

        aria-expanded={ctx.isOpen}
        aria-haspopup="dialog"
        aria-controls={ctx.isOpen ? calendarId : undefined}
        aria-autocomplete="none"
        autoComplete="off"
        value={displayValue}
        disabled={ctx.isDisabled || props.disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  },
);
