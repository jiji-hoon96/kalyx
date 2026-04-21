import { useEffect, useRef } from 'react';

/**
 * Fires `callback` when `value` changes (reference-identity), but not on mount.
 * Stores the callback in a ref so changing its identity does not re-trigger the effect.
 *
 * Internal utility — not exported from the package public API.
 */
export function useChangeEffect<T>(
  value: T,
  callback: ((value: T) => void) | undefined,
): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const prevRef = useRef(value);
  useEffect(() => {
    if (prevRef.current !== value) {
      prevRef.current = value;
      callbackRef.current?.(value);
    }
  }, [value]);
}
