import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';

/**
 * @kalyx/react/headless entry contract:
 *
 *  - Re-exports the same component / hook surface as @kalyx/react.
 *  - Does NOT install a default adapter at module load.
 *  - Rendering a Root without an explicit `adapter` prop must throw a friendly
 *    error pointing at the fix, not crash inside a date-math call.
 *
 * Module isolation note: `vi.resetModules()` is required because other tests in
 * the suite import `@kalyx/react` first, which installs DateFnsAdapter as the
 * module-level default. Resetting forces a fresh module graph so the headless
 * entry's "no default installed" contract is exercised faithfully.
 */
describe('@kalyx/react/headless entry', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('throws a friendly error when DatePicker.Root is rendered without an adapter', async () => {
    const { DatePicker } = await import('../headless.js');

    // React surfaces the thrown error via the error boundary path; rendering
    // synchronously throws here because the Root function body runs immediately.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(
        <DatePicker>
          <DatePicker.Input />
        </DatePicker>,
      ),
    ).toThrow(/requires an adapter/i);
    consoleError.mockRestore();
  });

  it('accepts an explicit adapter prop and renders without throwing', async () => {
    const { DatePicker } = await import('../headless.js');
    const { DateFnsAdapter } = await import('@kalyx/adapter-date-fns');

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(
        <DatePicker adapter={DateFnsAdapter}>
          <DatePicker.Input aria-label="date" />
        </DatePicker>,
      ),
    ).not.toThrow();
    consoleError.mockRestore();
  });

  it('throws when useDatePicker is invoked without an adapter', async () => {
    const { useDatePicker } = await import('../headless.js');

    // Render a tiny harness component that calls the hook so the resolution
    // path runs during render. Wrap in a stub error boundary so the thrown
    // error doesn't tear down the test runner.
    function Harness() {
      useDatePicker();
      return null;
    }

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Harness />)).toThrow(/requires an adapter/i);
    consoleError.mockRestore();
  });
});
