import type { HTMLAttributes, ReactNode } from 'react';
import { useDatePickerContext } from '../../context/DatePickerContext.js';
import { usePopover } from '../../hooks/usePopover.js';

export interface DatePickerPopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  children?: ReactNode;
}

export function DatePickerPopover({ children, ...props }: DatePickerPopoverProps) {
  const ctx = useDatePickerContext('DatePicker.Popover');
  const calendarId = `${ctx.pickerId}-calendar`;

  const { floatingStyles, setFloatingRef } = usePopover({
    isOpen: ctx.isOpen,
    close: ctx.close,
    referenceRef: ctx.referenceRef,
  });

  if (!ctx.isOpen) return null;

  return (
    <div
      ref={setFloatingRef}
      id={calendarId}
      role="dialog"
      aria-label={ctx.labels.popoverLabel}
      aria-modal="false"
      style={floatingStyles}
      {...props}
    >
      {children}
    </div>
  );
}
