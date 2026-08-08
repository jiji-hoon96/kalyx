import { forwardRef, useCallback } from 'react';
import type { InputHTMLAttributes } from 'react';
import { useRangePickerContext } from '../../context/RangePickerContext.js';
import { usableDate } from '../../internal/usableDate.js';

export type RangeInputPart = 'start' | 'end';

export interface RangePickerInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type'
> {
  /** Which part this input represents (start | end) */
  part: RangeInputPart;
  /** Date display format (defaults to parent's displayFormat) */
  format?: string;
  /** Form field name for a hidden input containing this endpoint's ISO value. */
  name?: string;
}

/**
 * RangePicker.Input — Separate input for start/end dates.
 *
 * Use one with `part="start"` and another with `part="end"`. Currently `readOnly`
 * because keyboard parsing of two inputs into a single range is ambiguous; users
 * select via the calendar.
 */
export const RangePickerInput = forwardRef<HTMLInputElement, RangePickerInputProps>(
  function RangePickerInput({ part, format: formatProp, name, onClick, onKeyDown, ...props }, ref) {
    const ctx = useRangePickerContext('RangePicker.Input');
    const displayFormat = formatProp ?? ctx.displayFormat;

    const value = ctx.value[part];
    // Adapters render an unparseable value as "NaN-NaN-NaN" rather than throwing, so the
    // validity check has to gate the format call — the catch alone would not see it.
    let displayValue = '';
    if (value) {
      try {
        displayValue = usableDate(value, ctx.adapter)
          ? ctx.adapter.format(value, displayFormat, ctx.displayTimezone)
          : value;
      } catch {
        displayValue = value;
      }
    }

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLInputElement>) => {
        // Anchor the next selection to the clicked field: clicking the start
        // input targets 'start', the end input targets 'end'. Week selection uses
        // this to decide whether the clicked day anchors the span forward (start)
        // or backward (end).
        if (ctx.isOpen) {
          ctx.setSelectingTarget(part);
        } else {
          ctx.open(part);
        }
        onClick?.(e);
      },
      [ctx, part, onClick],
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
          aria-label={part === 'start' ? ctx.labels.startInput : ctx.labels.endInput}
          autoComplete="off"
          value={displayValue}
          disabled={ctx.isDisabled || props.disabled}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          data-part={part}
          {...props}
        />
        {name ? <input type="hidden" name={name} value={value ?? ''} /> : null}
      </>
    );
  },
);

RangePickerInput.displayName = 'RangePicker.Input';
