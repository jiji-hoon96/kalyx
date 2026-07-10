import { lazy, Suspense, useState } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Translate from '@docusaurus/Translate';
import { CODE, VARIANTS } from './SameJsxDemo';
import styles from './SameJsxBlock.module.css';

const SameJsxDemo = lazy(() => import('./SameJsxDemo'));

type VariantId = (typeof VARIANTS)[number]['id'];

/**
 * "Same JSX, your styles" — an interactive style-switcher. The left column is
 * a tab bar + the code for the active variant; the right column renders ONE
 * real <DatePicker> that actually re-skins as you switch tabs. Proves the
 * claim by demonstration rather than three static snippets side by side.
 *
 * Asymmetric two-column layout (copy/code left, live surface right), the
 * TanStack docs pattern. The live surface is BrowserOnly + lazy so SSG stays
 * clean; a static code placeholder renders on the server.
 */
export default function SameJsxBlock() {
  const [active, setActive] = useState<VariantId>('tailwind');

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <span className={styles.eyebrow}>
            <Translate id="home.sameJsx.eyebrow">Same JSX, your styles</Translate>
          </span>
          <h2 className={styles.heading}>
            <Translate id="home.sameJsx.heading">
              One component. Every styling story.
            </Translate>
          </h2>
          <p className={styles.body}>
            <Translate id="home.sameJsx.body">
              Pass any class string to any part. No CSS file to import, no
              theme provider to wrap. The library never touches your design
              system.
            </Translate>
          </p>
        </div>

        <div className={styles.split}>
          <div className={styles.left}>
            <div className={styles.tabs} role="tablist" aria-label="Styling approach">
              {VARIANTS.map(v => (
                <button
                  key={v.id}
                  type="button"
                  role="tab"
                  aria-selected={active === v.id}
                  data-testid="jsx-tab"
                  data-variant={v.id}
                  className={`${styles.tab} ${active === v.id ? styles.tabActive : ''}`}
                  onClick={() => setActive(v.id)}>
                  {v.label}
                </button>
              ))}
            </div>
            <pre className={styles.code}>
              <code>{CODE[active]}</code>
            </pre>
          </div>

          <div className={styles.right} data-testid="jsx-preview">
            <BrowserOnly fallback={<div className={styles.previewFallback} aria-hidden="true" />}>
              {() => (
                <Suspense fallback={<div className={styles.previewFallback} aria-hidden="true" />}>
                  <SameJsxDemo variant={active} />
                </Suspense>
              )}
            </BrowserOnly>
          </div>
        </div>
      </div>
    </section>
  );
}
