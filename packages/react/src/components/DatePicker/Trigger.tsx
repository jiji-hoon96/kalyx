import { forwardRef, useCallback } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useDatePickerContext } from '../../context/DatePickerContext.js';

export interface DatePickerTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  children?: ReactNode;
}

export const DatePickerTrigger = forwardRef<HTMLButtonElement, DatePickerTriggerProps>(
  function DatePickerTrigger({ onClick, children, ...props }, ref) {
    const ctx = useDatePickerContext('DatePicker.Trigger');

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        ctx.toggle();
        onClick?.(e);
      },
      [ctx, onClick],
    );

    const calendarId = `${ctx.pickerId}-calendar`;

    return (
      <button
        ref={ref}
        type="button"
        tabIndex={0}
        aria-label={ctx.isOpen ? '캘린더 닫기' : '캘린더 열기'}
        aria-expanded={ctx.isOpen}
        aria-controls={ctx.isOpen ? calendarId : undefined}
        disabled={ctx.isDisabled || props.disabled}
        onClick={handleClick}
        {...props}
      >
        {children ?? (
          <svg
            aria-hidden="true"
            focusable="false"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 1v2M11 1v2M1 6h14M3 3h10a2 2 0 012 2v8a2 2 0 01-2 2H3a2 2 0 01-2-2V5a2 2 0 012-2z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    );
  },
);
