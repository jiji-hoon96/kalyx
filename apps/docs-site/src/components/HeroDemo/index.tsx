import { useEffect, useMemo, useRef, useState } from 'react';
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

/**
 * Returns the sequence with real render functions wired in. Memoised so we
 * don't recreate the picker JSX every state change.
 *
 * NOTE: actual picker rendering is added in Task 4. For this skeleton we
 * use a labelled placeholder so the timer/cycle tests pass first.
 */
function useFrames(): HeroFrame[] {
  return useMemo(
    () =>
      sequence.map(f => ({
        ...f,
        render: () => <div data-placeholder-for={f.id}>{f.label}</div>,
      })),
    []
  );
}
