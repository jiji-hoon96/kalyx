import type { DisabledRule } from '@kalyx/core';

/**
 * Stable identity for "no disabled rules".
 *
 * Hooks default their `disabled` option to this instead of a fresh `[]`. A literal
 * default is a new array on every render, so any `useMemo` / `useCallback` listing
 * `disabled` as a dependency misses on every render for the common case where the
 * consumer passes no rules at all — the memo then costs its bookkeeping and returns
 * nothing. `useMonthPicker.months` and `useYearPicker.years` shipped exactly that.
 *
 * @internal
 */
export const NO_DISABLED_RULES: DisabledRule[] = [];
