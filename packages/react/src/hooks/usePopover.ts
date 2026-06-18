import { useCallback, useEffect, useRef } from 'react';
import { useFloating, autoUpdate, offset, flip, shift } from '@floating-ui/react';
import type { Middleware, Placement } from '@floating-ui/react';

// Hoisted to module scope so it isn't reallocated on every render. Floating UI
// shallow-compares the middleware array, so a fresh array each render forced
// useless reposition cycles.
const POPOVER_MIDDLEWARE: Middleware[] = [offset(4), flip(), shift({ padding: 8 })];

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
    middleware: POPOVER_MIDDLEWARE,
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

  // Focus restoration on close — but only to recover focus that was actually
  // lost. The calendar grid auto-focuses the selected day on open, so the
  // captured element is usually a day button inside the popover; when the
  // popover unmounts that button detaches and the browser drops focus to
  // <body>. In that case we restore to the captured element if it's still
  // connected, otherwise to the reference control (the Input / Trigger) — the
  // correct keyboard recovery point per WAI-ARIA. Opening is bound to a pointer
  // click, not focus (see Input's handleClick), so this does NOT reopen.
  //
  // If focus already moved elsewhere (e.g. the user closed the popover by
  // clicking another field), `document.activeElement` is that element, not
  // <body>, and we leave it alone — stealing it back would be a regression.
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    } else if (previousFocusRef.current) {
      const captured = previousFocusRef.current;
      previousFocusRef.current = null;
      const active = document.activeElement;
      const focusWasLost = active === null || active === document.body;
      if (focusWasLost) {
        const target = captured.isConnected ? captured : referenceRef.current;
        if (target && typeof target.focus === 'function') {
          target.focus({ preventScroll: true });
        }
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
        // Consume the Escape so a host modal/dialog whose own Escape handler
        // also closes the modal doesn't close both on a single keypress.
        // Bubble-phase listener at document is too late to block React's
        // synthetic bubble — Input/Calendar React handlers cover that path.
        // This document-level call protects against other native listeners.
        e.preventDefault();
        e.stopPropagation();
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
