import { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './Reveal.module.css';

/**
 * Scroll-in reveal wrapper: fades + slides its children up when they first
 * enter the viewport. SSR-safe (renders visible-by-default on the server and
 * before the observer attaches, so no-JS / crawlers see full content) and
 * fully disabled under prefers-reduced-motion.
 *
 * Wrap a landing section: <Reveal><FeatureGrid /></Reveal>.
 */
export default function Reveal({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Start "shown" so SSR output is visible; flip to hidden only on the client
  // when we know we can animate, then reveal on intersection.
  const [shown, setShown] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) return;

    setShown(false);
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            setShown(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${styles.reveal} ${shown ? styles.shown : ''}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
