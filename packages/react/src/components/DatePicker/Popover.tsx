import { useEffect, useRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
} from '@floating-ui/react';
import { useDatePickerContext } from '../../context/DatePickerContext.js';

export interface DatePickerPopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  children?: ReactNode;
}

export function DatePickerPopover({ children, ...props }: DatePickerPopoverProps) {
  const ctx = useDatePickerContext('DatePicker.Popover');
  const calendarId = `${ctx.pickerId}-calendar`;
  const floatingRef = useRef<HTMLDivElement | null>(null);

  const { refs, floatingStyles } = useFloating({
    open: ctx.isOpen,
    placement: 'bottom-start',
    middleware: [offset(4), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  // Wire the context's referenceRef into Floating UI
  useEffect(() => {
    if (ctx.referenceRef.current) {
      refs.setReference(ctx.referenceRef.current);
    }
  }, [ctx.referenceRef, refs, ctx.isOpen]);

  // Focus restoration: restore focus to the previous element on close.
  // We use preventScroll so closing the popover doesn't yank the page back
  // to the trigger/input; and we skip restoration to the reference element
  // itself (Input auto-opens on focus, which would immediately reopen us).
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (ctx.isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    } else if (previousFocusRef.current) {
      const el = previousFocusRef.current;
      previousFocusRef.current = null;
      if (el !== ctx.referenceRef.current && typeof el.focus === 'function') {
        el.focus({ preventScroll: true });
      }
    }
  }, [ctx.isOpen, ctx.referenceRef]);

  // Detect outside clicks
  useEffect(() => {
    if (!ctx.isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      const floating = floatingRef.current;
      const reference = ctx.referenceRef.current;
      const target = e.target as Node;
      if (floating && !floating.contains(target) && (!reference || !reference.contains(target))) {
        ctx.close();
      }
    }

    // Register on next tick to skip the current click event
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ctx.isOpen, ctx]);

  useEffect(() => {
    if (!ctx.isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        ctx.close();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [ctx.isOpen, ctx]);

  if (!ctx.isOpen) return null;

  return (
    <div
      ref={(node) => {
        floatingRef.current = node;
        refs.setFloating(node);
      }}
      id={calendarId}
      role="dialog"
      aria-label="날짜 선택"
      aria-modal="false"
      style={floatingStyles}
      {...props}
    >
      {children}
    </div>
  );
}
