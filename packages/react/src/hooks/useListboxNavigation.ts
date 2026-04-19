import { useCallback, useEffect, useRef } from 'react';
import type { KeyboardEvent, RefObject } from 'react';

export interface UseListboxNavigationOptions<T> {
  items: T[];
  onSelect: (item: T) => void;
  disabled?: boolean;
}

export interface UseListboxNavigationReturn<T> {
  listRef: RefObject<HTMLUListElement | null>;
  handleKeyDown: (e: KeyboardEvent<HTMLLIElement>, item: T) => void;
}

/**
 * Shared listbox keyboard navigation following WAI-ARIA Listbox pattern.
 * Used by TimePicker.HourList and TimePicker.MinuteList.
 *
 * Handles: ArrowUp/Down, Home/End, Enter/Space.
 * After navigation, focuses the newly selected option via requestAnimationFrame.
 */
export function useListboxNavigation<T>({
  items,
  onSelect,
  disabled = false,
}: UseListboxNavigationOptions<T>): UseListboxNavigationReturn<T> {
  const listRef = useRef<HTMLUListElement>(null);
  const rafIdRef = useRef<number>(0);

  // Cancel any pending rAF on unmount to avoid focusing a dead ref
  useEffect(() => {
    return () => cancelAnimationFrame(rafIdRef.current);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLLIElement>, item: T) => {
      if (disabled) return;
      const currentIndex = items.indexOf(item);

      let newIndex = -1;
      if (e.key === 'ArrowDown') {
        newIndex = Math.min(currentIndex + 1, items.length - 1);
      } else if (e.key === 'ArrowUp') {
        newIndex = Math.max(currentIndex - 1, 0);
      } else if (e.key === 'Home') {
        newIndex = 0;
      } else if (e.key === 'End') {
        newIndex = items.length - 1;
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(item);
        return;
      } else {
        return;
      }

      e.preventDefault();
      const target = items[newIndex];
      if (target !== undefined) {
        onSelect(target);
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = requestAnimationFrame(() => {
          const next = listRef.current?.querySelector<HTMLLIElement>(
            '[data-selected="true"]',
          );
          next?.focus();
        });
      }
    },
    [items, onSelect, disabled],
  );

  return { listRef, handleKeyDown };
}
