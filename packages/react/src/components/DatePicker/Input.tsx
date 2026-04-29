import { forwardRef, useCallback, useRef, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { parseInputValue } from '@kalyx/core';
import { useDatePickerContext } from '../../context/DatePickerContext.js';

export interface DatePickerInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type'
> {
  /** Date display format (defaults to parent's displayFormat) */
  format?: string;
  /**
   * Form field name. When set, a hidden `<input type="hidden" name={name} value={ISO}>`
   * is rendered alongside the visible input so the value participates in native form
   * submission (and integrates with `react-hook-form` Controller-less flows).
   */
  name?: string;
}

export const DatePickerInput = forwardRef<HTMLInputElement, DatePickerInputProps>(
  function DatePickerInput({ format: formatProp, name, onClick, onBlur, onKeyDown, ...props }, ref) {
    const ctx = useDatePickerContext('DatePicker.Input');
    const displayFormat = formatProp ?? ctx.displayFormat;

    // Text currently being edited (edit mode)
    const [inputText, setInputText] = useState<string | null>(null);
    // IME (composition) state — non-Latin scripts like Korean/Japanese/Chinese fire
    // change events for in-progress composition characters. Parsing those mid-stream
    // throws away the user's input. Defer parsing until composition completes.
    const isComposingRef = useRef(false);

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

        // Don't try to parse partial IME composition output (e.g. "ㅇ" before
        // the full Korean syllable is committed). The compositionend handler
        // will parse the final committed value.
        if (isComposingRef.current) return;

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

    const handleCompositionStart = useCallback(() => {
      isComposingRef.current = true;
    }, []);

    const handleCompositionEnd = useCallback(
      (e: React.CompositionEvent<HTMLInputElement>) => {
        isComposingRef.current = false;
        // Re-parse with the final committed text once composition ends.
        const text = (e.target as HTMLInputElement).value;
        if (!text) return;
        const parsed = parseInputValue(text, ctx.adapter);
        if (parsed) {
          ctx.selectDate(parsed);
          setInputText(null);
        }
      },
      [ctx],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
          ctx.close();
        } else if (e.key === 'Enter') {
          // Block form submission while the calendar is open. Otherwise an Enter
          // intended to commit a typed date (or simply navigate inside the popover)
          // bubbles up and submits the surrounding <form>, which surprised users.
          if (ctx.isOpen) {
            e.preventDefault();
          }
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
      <>
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
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          {...props}
        />
        {/* Hidden field for native form submission. Skipped when no `name` is set
            so we don't leak an empty field into the form data unintentionally. */}
        {name ? <input type="hidden" name={name} value={ctx.value ?? ''} /> : null}
      </>
    );
  },
);
