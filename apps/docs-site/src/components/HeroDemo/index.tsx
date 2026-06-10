import { useEffect, useMemo, useState } from 'react';
import {
  DatePicker,
  RangePicker,
  TimePicker,
  DateTimePicker,
  MonthPicker,
  YearPicker,
  WeekPicker,
} from '@kalyx/react';
import styles from './HeroDemo.module.css';
import { FRAME_DURATION_MS, sequence, type HeroFrame } from './sequence';

export type HeroDemoProps = {
  /** Start at a specific frame (used by the recorder). Default 0. */
  initialFrame?: number;
  /** When false, do not advance the frame on a timer (used by the recorder). Default true. */
  autoplay?: boolean;
};

/**
 * Animated 7-frame "seven primitives. one API." hero demo.
 *
 * Default export so it can be wrapped in React.lazy() by the landing page
 * without an extra hop.
 */
export default function HeroDemo({
  initialFrame = 0,
  autoplay = true,
}: HeroDemoProps) {
  const [frame, setFrame] = useState(initialFrame);
  const [paused, setPaused] = useState(false);
  const reduced = usePrefersReducedMotion();
  const frames = useFrames();

  useEffect(() => {
    if (!autoplay || paused || reduced) return;
    const id = setInterval(() => {
      setFrame(f => (f + 1) % sequence.length);
    }, FRAME_DURATION_MS);
    return () => clearInterval(id);
  }, [autoplay, paused, reduced]);

  return (
    <div
      data-testid="hero-demo-root"
      data-frame={frame}
      data-paused={paused || undefined}
      data-reduced-motion={reduced || undefined}
      className={styles.root}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {frames.map((f, i) => (
        <div
          key={f.id}
          data-frame-id={f.id}
          aria-hidden={i !== frame}
          className={`${styles.frame} ${i === frame ? styles.frameActive : ''}`}
        >
          {f.render()}
        </div>
      ))}
      <span data-testid="hero-demo-label" className={styles.label}>
        {sequence[frame].label}
      </span>
      <span className={styles.cycleHint}>seven primitives. one API.</span>
    </div>
  );
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, []);
  return reduced;
}

// Frozen values so every captured frame is byte-deterministic. The
// recorder reuses these via `?frame=N`.
const FROZEN_DATE = '2026-06-15T00:00:00.000Z';
const FROZEN_RANGE = {
  start: '2026-06-15T00:00:00.000Z',
  end: '2026-06-19T00:00:00.000Z',
};
const FROZEN_WEEK = {
  start: '2026-06-14T00:00:00.000Z',
  end: '2026-06-20T00:00:00.000Z',
};
const FROZEN_TIME = '2026-06-15T14:30:00.000Z';

/**
 * Returns the sequence with real render functions wired in. Memoised so we
 * don't recreate the picker JSX every state change.
 *
 * The kalyx pickers have no `defaultOpen` on the Popover — the Popover
 * renders null while `ctx.isOpen` is false, and there is no public API
 * to force-open from the outside. For the hero demo we side-step the
 * Popover wrapper entirely and render the body components (Calendar /
 * Grid / TimePicker lists) directly inside the Root. They read the same
 * context, so the visual surface matches what a user sees with the
 * Popover open, and we avoid both library mutation and an imperative
 * open-on-mount trick.
 */
function useFrames(): HeroFrame[] {
  return useMemo(
    () => [
      {
        id: 'datepicker',
        label: 'DatePicker',
        render: () => (
          <DatePicker value={FROZEN_DATE} onChange={() => {}}>
            <DatePicker.Calendar />
          </DatePicker>
        ),
      },
      {
        id: 'rangepicker',
        label: 'RangePicker',
        render: () => (
          <RangePicker value={FROZEN_RANGE} onChange={() => {}}>
            <RangePicker.Calendar />
          </RangePicker>
        ),
      },
      {
        id: 'timepicker',
        label: 'TimePicker',
        render: () => (
          <TimePicker value={FROZEN_TIME} onChange={() => {}} format="12h">
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <TimePicker.HourList />
              <TimePicker.MinuteList />
              <TimePicker.AmPmToggle />
            </div>
          </TimePicker>
        ),
      },
      {
        id: 'datetimepicker',
        label: 'DateTimePicker',
        render: () => (
          <DateTimePicker value={FROZEN_DATE} onChange={() => {}} format="24h">
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <DateTimePicker.Calendar />
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <DateTimePicker.HourList />
                <DateTimePicker.MinuteList />
              </div>
            </div>
          </DateTimePicker>
        ),
      },
      {
        id: 'monthpicker',
        label: 'MonthPicker',
        render: () => (
          <MonthPicker value={FROZEN_DATE} onChange={() => {}}>
            <MonthPicker.Grid />
          </MonthPicker>
        ),
      },
      {
        id: 'yearpicker',
        label: 'YearPicker',
        render: () => (
          <YearPicker value={FROZEN_DATE} onChange={() => {}}>
            <YearPicker.Grid />
          </YearPicker>
        ),
      },
      {
        id: 'weekpicker',
        label: 'WeekPicker',
        render: () => (
          <WeekPicker value={FROZEN_WEEK} onChange={() => {}}>
            <WeekPicker.Calendar />
          </WeekPicker>
        ),
      },
    ],
    []
  );
}
