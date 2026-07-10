import type { HTMLAttributes, ReactNode } from 'react';
import { useTimePickerContext } from '../../context/TimePickerContext.js';
import { usePopover } from '../../hooks/usePopover.js';

export interface TimePickerPopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  children?: ReactNode;
}

/**
 * TimePicker.Popover — optional floating container for the Hour/Minute/AmPm controls.
 *
 * TimePicker can be used two ways:
 * - Inline (no Popover): the Hour/Minute lists are always visible.
 * - Popover: wrap the controls in `TimePicker.Popover` so they only appear after
 *   the user opens the picker (click / ArrowDown on `TimePicker.Input`).
 *
 * Mirrors DatePicker.Popover — same Floating UI positioning, outside-click,
 * Escape, and focus restoration via the shared `usePopover` hook.
 */
export function TimePickerPopover({ children, ...props }: TimePickerPopoverProps) {
  const ctx = useTimePickerContext('TimePicker.Popover');
  const listId = `${ctx.pickerId}-time`;

  const { floatingStyles, setFloatingRef, isPositioned } = usePopover({
    isOpen: ctx.isOpen,
    close: ctx.close,
    referenceRef: ctx.referenceRef,
  });

  if (!ctx.isOpen) return null;

  const { style: userStyle, ...rest } = props;

  return (
    <div
      ref={setFloatingRef}
      id={listId}
      role="dialog"
      aria-label={ctx.labels.timeInput}
      aria-modal="false"
      {...rest}
      style={{
        ...userStyle,
        ...floatingStyles,
        visibility: isPositioned ? undefined : 'hidden',
      }}
    >
      {children}
    </div>
  );
}
