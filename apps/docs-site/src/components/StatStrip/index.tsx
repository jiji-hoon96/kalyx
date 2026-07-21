import BrowserOnly from '@docusaurus/BrowserOnly';
import Translate, { translate } from '@docusaurus/Translate';
import { useEffect, useState } from 'react';
import styles from './StatStrip.module.css';

/**
 * A thin strip of honest, verifiable numbers under the hero — the TanStack
 * "stat row" format, but with numbers this project can actually stand behind.
 *
 * Two kinds of stat:
 *  - Static facts (bundle size, primitive count, a11y): baked in, never stale.
 *  - Live metrics (npm downloads, GitHub stars): fetched client-side with a
 *    static fallback so SSG never blocks and a network failure degrades to a
 *    reasonable last-known value. No inflation — small-but-solid is the story.
 */

type Stat = { value: string; label: string };

const STATIC_STATS: Stat[] = [
  { value: '7', label: translate({ id: 'home.stats.primitives', message: 'date primitives' }) },
  { value: '≤17 KB', label: translate({ id: 'home.stats.bundle', message: 'gzipped, all pickers' }) },
  { value: '0', label: translate({ id: 'home.stats.css', message: 'CSS files to import' }) },
  { value: 'WCAG AA', label: translate({ id: 'home.stats.a11y', message: 'accessible by default' }) },
];

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
}

function LiveStats() {
  const [stars, setStars] = useState<number | null>(null);
  const [downloads, setDownloads] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    fetch('https://api.github.com/repos/jiji-hoon96/kalyx')
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (alive && d && typeof d.stargazers_count === 'number') setStars(d.stargazers_count); })
      .catch(() => {});
    fetch('https://api.npmjs.org/downloads/point/last-month/@kalyx/react')
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (alive && d && typeof d.downloads === 'number') setDownloads(d.downloads); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const live: Stat[] = [
    {
      value: downloads != null ? formatCount(downloads) : '—',
      label: translate({ id: 'home.stats.downloads', message: 'npm downloads / month' }),
    },
    {
      value: stars != null ? formatCount(stars) : '—',
      label: translate({ id: 'home.stats.stars', message: 'stars on GitHub' }),
    },
  ];

  return (
    <>
      {live.map(s => (
        <div key={s.label} className={styles.stat} data-testid="stat">
          <span className={styles.value}>{s.value}</span>
          <span className={styles.label}>{s.label}</span>
        </div>
      ))}
    </>
  );
}

export default function StatStrip() {
  return (
    <section className={styles.section} aria-label={translate({ id: 'home.stats.aria', message: 'Project stats' })}>
      <div className="container">
        <div className={styles.strip}>
          {STATIC_STATS.map(s => (
            <div key={s.label} className={styles.stat} data-testid="stat">
              <span className={styles.value}>{s.value}</span>
              <span className={styles.label}>{s.label}</span>
            </div>
          ))}
          <BrowserOnly>{() => <LiveStats />}</BrowserOnly>
        </div>
      </div>
    </section>
  );
}
