import { useCallback, useEffect, useRef } from 'react';
import { useFloating, autoUpdate, offset, flip, shift } from '@floating-ui/react';
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
export function usePopover({
  isOpen,
  close,
  referenceRef,
  placement = 'bottom-start',
}: UsePopoverOptions) {
  const floatingRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const { refs, floatingStyles, isPositioned } = useFloating({
    open: isOpen,
    placement,
    middleware: [offset(4), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  // Wire the context's referenceRef into Floating UI as a fallback for cases
  // where the popover mounts before reference is updated. The ref callback in
  // setFloatingRef below handles the common synchronous case.
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

  // Focus-out: when the user tabs out of the popover (and out of the reference
  // element), close the popover. This isn't a focus *trap* — keyboard users can
  // still leave with Tab — but it follows the Radix/Ark pattern of closing the
  // overlay when focus leaves so it doesn't dangle while the user is elsewhere.
  useEffect(() => {
    if (!isOpen) return;

    function handleFocusOut(e: FocusEvent) {
      // `relatedTarget` is the element receiving focus. If it's null (focus left
      // the document), or if it's outside both the floating layer and reference,
      // close.
      const next = e.relatedTarget as Node | null;
      const floating = floatingRef.current;
      const reference = referenceRef.current;
      if (!next) return; // focus moved to body — leave popover alone
      const insideFloating = floating?.contains(next) ?? false;
      const insideReference = reference?.contains(next) ?? false;
      if (!insideFloating && !insideReference) {
        close();
      }
    }

    // `focusout` bubbles, so attach to the floating root once it's mounted.
    const node = floatingRef.current;
    if (!node) return;
    node.addEventListener('focusout', handleFocusOut);
    return () => node.removeEventListener('focusout', handleFocusOut);
  }, [isOpen, close, referenceRef]);

  // Set floating + reference together when the popover mounts. The reference
  // is already attached via Input/Trigger's ref callback by the time the
  // popover renders, so calling setReference here means Floating UI has both
  // elements before paint — eliminating the unpositioned first-frame flash.
  const setFloatingRef = useCallback(
    (node: HTMLDivElement | null) => {
      floatingRef.current = node;
      refs.setFloating(node);
      if (node && referenceRef.current) {
        refs.setReference(referenceRef.current);
      }
    },
    [refs, referenceRef],
  );

  return { floatingStyles, setFloatingRef, isPositioned };
}
