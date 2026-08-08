import { forwardRef, useCallback } from 'react';
import type { InputHTMLAttributes } from 'react';
import { formatTimeString, getTime, getTimeInTimezone } from '@kalyx/core';
import { useDatePickerContext } from '../../context/DatePickerContext.js';
import { usableDate } from '../../internal/usableDate.js';

export interface DateTimePickerInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type'
> {
  /** Form field name for a hidden input containing the selected ISO value. */
  name?: string;
}

/**
 * DateTimePicker.Input — Displays date and time combined.
 * Example: "2026-01-15 14:30"
 *
 * The input is read-only — use Calendar/TimePicker sub-components to select values.
 */
export const DateTimePickerInput = forwardRef<HTMLInputElement, DateTimePickerInputProps>(
  function DateTimePickerInput({ name, onClick, onKeyDown, ...props }, ref) {
    const ctx = useDatePickerContext('DateTimePicker.Input');

    // Combine the date portion (yyyy-MM-dd) and the time portion (HH:mm)
    // Adapters render an unparseable value as "NaN-NaN-NaN" rather than throwing, so the
    // validity check has to gate the format call — the catch alone would not see it.
    let displayValue = '';
    if (ctx.value && !usableDate(ctx.value, ctx.adapter)) {
      displayValue = ctx.value;
    } else if (ctx.value) {
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
          if (ctx.isOpen) {
            // Stop the synthetic Escape from bubbling to a host modal/dialog.
            e.preventDefault();
            e.stopPropagation();
          }
          ctx.close();
        } else if (e.key === 'Enter' && ctx.isOpen) {
          // Don't submit the surrounding form when the calendar is open.
          e.preventDefault();
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
      <>
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
        {name ? <input type="hidden" name={name} value={ctx.value ?? ''} /> : null}
      </>
    );
  },
);

DateTimePickerInput.displayName = 'DateTimePicker.Input';
