import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { parseInputValue } from '@kalyx/core';
import { useDatePickerContext } from '../../context/DatePickerContext.js';
import { usableDate } from '../../internal/usableDate.js';

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

/**
 * DatePicker.Input — Combobox-style text input wired to the DatePicker context.
 *
 * Accepts free-form date typing (parsed via the active adapter), opens the popover
 * on click / `ArrowDown`, and commits typed values on `Enter` / blur.
 */
export const DatePickerInput = forwardRef<HTMLInputElement, DatePickerInputProps>(
  function DatePickerInput(
    { format: formatProp, name, onClick, onBlur, onKeyDown, ...props },
    ref,
  ) {
    const ctx = useDatePickerContext('DatePicker.Input');
    const displayFormat = formatProp ?? ctx.displayFormat;

    // Text currently being edited (edit mode)
    const [inputText, setInputText] = useState<string | null>(null);
    // IME (composition) state — non-Latin scripts like Korean/Japanese/Chinese fire
    // change events for in-progress composition characters. Parsing those mid-stream
    // throws away the user's input. Defer parsing until composition completes.
    const isComposingRef = useRef(false);

    // Drop stale typed text when the value changes from outside (parent re-sets,
    // calendar selection, preset click, etc.) so the input doesn't keep displaying
    // an old half-typed string while the source-of-truth has already moved.
    // Skip during IME composition so we don't wipe an in-flight character.
    useEffect(() => {
      if (isComposingRef.current) return;
      setInputText(null);
    }, [ctx.value]);

    // A malformed value is data (a stale row, a half-typed form field), so show it back
    // verbatim rather than formatting it. The validity check has to come first: adapters
    // build the output from `getUTCFullYear()` and friends, which yield "NaN-NaN-NaN" on an
    // unparseable string instead of throwing, so the catch below never sees those.
    let formattedValue = '';
    if (ctx.value) {
      try {
        formattedValue = usableDate(ctx.value, ctx.adapter)
          ? ctx.adapter.format(ctx.value, displayFormat, ctx.displayTimezone)
          : ctx.value;
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

    // Single commit path used by blur / change / compositionend / Enter.
    // Returns true when a value was committed (parsed or null).
    const commitText = useCallback(
      (text: string): boolean => {
        if (!text) {
          ctx.selectDate(null);
          setInputText(null);
          return true;
        }
        const parsed = parseInputValue(text, ctx.adapter);
        if (parsed) {
          ctx.selectDate(parsed);
          setInputText(null);
          return true;
        }
        return false;
      },
      [ctx],
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        if (inputText !== null) {
          commitText(inputText);
          setInputText(null);
        }
        onBlur?.(e);
      },
      [inputText, commitText, onBlur],
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        setInputText(text);
        // Don't try to parse partial IME composition output (e.g. "ㅇ" before
        // the full Korean syllable is committed). The compositionend handler
        // will parse the final committed value.
        if (isComposingRef.current) return;
        commitText(text);
      },
      [commitText],
    );

    const handleCompositionStart = useCallback(() => {
      isComposingRef.current = true;
    }, []);

    const handleCompositionEnd = useCallback(
      (e: React.CompositionEvent<HTMLInputElement>) => {
        isComposingRef.current = false;
        commitText((e.target as HTMLInputElement).value);
      },
      [commitText],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
          if (ctx.isOpen) {
            // Stop the synthetic Escape from bubbling to a host modal/dialog
            // whose own Escape handler would otherwise also close.
            e.preventDefault();
            e.stopPropagation();
          }
          ctx.close();
        } else if (e.key === 'Enter') {
          // Block form submission while the calendar is open. Otherwise an Enter
          // intended to commit a typed date (or simply navigate inside the popover)
          // bubbles up and submits the surrounding <form>, which surprised users.
          if (ctx.isOpen) e.preventDefault();
          if (inputText !== null) {
            commitText(inputText);
          } else if (ctx.isOpen) {
            // No typed text but the popover is open — commit the calendar's
            // currently focused day so Enter "just works" even when focus
            // never made it from the input to the day button (notably WebKit).
            ctx.selectDate(ctx.focusedDate);
          }
        } else if (e.key === 'ArrowDown' && !ctx.isOpen) {
          e.preventDefault();
          ctx.open();
        }
        onKeyDown?.(e);
      },
      [ctx, inputText, commitText, onKeyDown],
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

DatePickerInput.displayName = 'DatePicker.Input';
