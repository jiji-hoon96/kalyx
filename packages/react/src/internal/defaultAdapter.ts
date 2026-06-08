import type { DateAdapter } from '@kalyx/core';

/**
 * Module-level holder for the default adapter.
 *
 * The entry point sets this once at module load:
 *  - `@kalyx/react`           -> `setDefaultAdapter(DateFnsAdapter)` (auto-injected).
 *  - `@kalyx/react/headless`  -> never called; stays `null`.
 *
 * Because tsup runs with `splitting: false`, each entry produces a physically
 * separate bundle. The headless bundle never references `DateFnsAdapter`, so
 * the date-fns code path is statically eliminated from `dist/headless.js`.
 *
 * @internal
 */
let __defaultAdapter: DateAdapter | null = null;

/**
 * Install the module-level default adapter. Called exactly once by an entry
 * point before any Root/hook renders.
 *
 * @internal
 */
export function setDefaultAdapter(adapter: DateAdapter): void {
  __defaultAdapter = adapter;
}

/**
 * Read the currently-installed module-level default adapter, if any.
 *
 * @internal
 */
export function getDefaultAdapter(): DateAdapter | null {
  return __defaultAdapter;
}

/**
 * Resolves which DateAdapter a Root component / hook should use.
 *
 * Resolution order:
 *  1. `passed` — adapter explicitly provided via prop / options. Always wins.
 *  2. `fallback` — module-level default supplied by the caller. The main
 *     `@kalyx/react` entry installs `DateFnsAdapter` here via `setDefaultAdapter`
 *     so users get "install and it works" out of the box.
 *  3. neither — the `@kalyx/react/headless` entry never installs a default,
 *     making the adapter contract explicit. Throwing here surfaces the missing
 *     adapter at render-time with a clear remediation hint rather than crashing
 *     later inside a date-math call with a cryptic stack trace.
 *
 * @internal Not part of the public API.
 */
export function resolveAdapter(
  passed: DateAdapter | undefined,
  fallback: DateAdapter | null,
  componentName: string,
): DateAdapter {
  if (passed) return passed;
  if (fallback) return fallback;
  throw new Error(
    `[@kalyx/react/headless] ${componentName} requires an adapter. ` +
      `Pass one via <${componentName} adapter={...}>. ` +
      `If you don't need a custom adapter, import from '@kalyx/react' instead.`,
  );
}
