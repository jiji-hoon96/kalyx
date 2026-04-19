import type { HTMLAttributes, ReactNode } from 'react';
import { useRangePickerContext } from '../../context/RangePickerContext.js';
import { usePopover } from '../../hooks/usePopover.js';

export interface RangePickerPopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  children?: ReactNode;
}

export function RangePickerPopover({ children, ...props }: RangePickerPopoverProps) {
  const ctx = useRangePickerContext('RangePicker.Popover');
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
