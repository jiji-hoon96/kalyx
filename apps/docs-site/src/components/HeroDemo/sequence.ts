import type { ReactNode } from 'react';

/**
 * One frame in the hero demo cycle. Each frame corresponds to one of the
 * 7 kalyx picker primitives. The `render` function returns the JSX to
 * display for that frame; it is called fresh every cycle so component
 * state (input focus, popover open) resets cleanly.
 */
export type HeroFrame = {
  id: string;
  label: string;
  render: () => ReactNode;
};

/** Milliseconds each frame is visible before the cycle advances. */
export const FRAME_DURATION_MS = 850;

/** Number of frames in the sequence (== sequence.length, exposed for tests). */
export const FRAME_COUNT = 7;

// Frame render functions are wired up in HeroDemo/index.tsx where the
// kalyx picker imports live. sequence.ts is intentionally render-free
// so the tests (and CI) can validate invariants without importing React.
// `render` is set to a placeholder here; HeroDemo replaces it at module
// load time. (We keep a single source-of-truth for ids/labels/order.)
export const sequence: HeroFrame[] = [
  { id: 'datepicker',     label: 'DatePicker',     render: () => null },
  { id: 'rangepicker',    label: 'RangePicker',    render: () => null },
  { id: 'timepicker',     label: 'TimePicker',     render: () => null },
  { id: 'datetimepicker', label: 'DateTimePicker', render: () => null },
  { id: 'monthpicker',    label: 'MonthPicker',    render: () => null },
  { id: 'yearpicker',     label: 'YearPicker',     render: () => null },
  { id: 'weekpicker',     label: 'WeekPicker',     render: () => null },
];
