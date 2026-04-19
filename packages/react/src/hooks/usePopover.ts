import { useEffect, useRef } from 'react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
} from '@floating-ui/react';
import type { Placement } from '@floating-ui/react';

export interface UsePopoverOptions {
  isOpen: boolean;
  close: () => void;
  referenceRef: React.RefObject<HTMLElement | null>;
  placement?: Placement;
}

/**
 * Shared popover behavior: Floating UI positioning, outside-click detection,
 * Escape key handling, and focus restoration on close.
 *
 * Extracted to eliminate duplication between DatePicker.Popover and RangePicker.Popover.
 * Follows the pattern used by Radix UI's usePopover and Ark UI's dismissable layer.
 */
export function usePopover({ isOpen, close, referenceRef, placement = 'bottom-start' }: UsePopoverOptions) {
  const floatingRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const { refs, floatingStyles } = useFloating({
    open: isOpen,
    placement,
    middleware: [offset(4), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  // Wire the context's referenceRef into Floating UI
  useEffect(() => {
    if (referenceRef.current) {
      refs.setReference(referenceRef.current);
    }
  }, [referenceRef, refs, isOpen]);

  // Focus restoration: restore focus to the previous element on close.
  // Skip restoration to the reference element itself (Input auto-opens on
  // focus, which would immediately reopen the popover).
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    } else if (previousFocusRef.current) {
      const el = previousFocusRef.current;
      previousFocusRef.current = null;
      if (el !== referenceRef.current && typeof el.focus === 'function') {
        el.focus({ preventScroll: true });
      }
    }
  }, [isOpen, referenceRef]);

  // Detect outside clicks
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      const floating = floatingRef.current;
      const reference = referenceRef.current;
      const target = e.target as Node;
      if (floating && !floating.contains(target) && (!reference || !reference.contains(target))) {
        close();
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
  }, [isOpen, close, referenceRef]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        close();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close]);

  const setFloatingRef = (node: HTMLDivElement | null) => {
    floatingRef.current = node;
    refs.setFloating(node);
  };

  return { floatingStyles, setFloatingRef };
}
