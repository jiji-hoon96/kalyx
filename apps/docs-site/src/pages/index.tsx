import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Translate, {translate} from '@docusaurus/Translate';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';

import styles from './index.module.css';

function Hero(): ReactNode {
  const heroImg = useBaseUrl('/img/kalyx-hero.jpeg');
  return (
    <section className={styles.hero}>
      <div className="container">
        <div className={styles.heroGrid}>
          <div>
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowDot} aria-hidden="true" />
              <Translate id="home.eyebrow">Headless · SSR-safe · under 12KB</Translate>
            </span>
            <h1 className={styles.title}>
              <Translate id="home.title.line1">The headless</Translate>{' '}
              <span className={styles.titleAccent}>
                <Translate id="home.title.accent">DatePicker</Translate>
              </span>
              ,<br />
              <Translate id="home.title.line2">finally complete.</Translate>
            </h1>
            <p className={styles.subtitle}>
              <Translate id="home.subtitle">
                DatePicker, RangePicker, TimePicker, and DateTimePicker — composable React primitives
                with zero built-in styles. Works everywhere React runs.
              </Translate>
            </p>
            <div className={styles.ctas}>
              <Link className={styles.ctaPrimary} to="/docs/getting-started/quick-start">
                <Translate id="home.cta.start">Get Started</Translate>
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                className={styles.ctaSecondary}
                to="https://github.com/jiji-hoon96/kalyx">
                <Translate id="home.cta.github">Star on GitHub</Translate>
              </Link>
            </div>
            <div className={styles.installBar}>
              <span className={styles.installPrefix}>$</span>
              <span className={styles.installCmd}>pnpm add @kalyx/react</span>
            </div>
          </div>
          <div className={styles.heroMedia}>
            <img
              className={styles.heroImage}
              src={heroImg}
              alt={translate({
                id: 'home.hero.alt',
                message: 'Kalyx — composable DatePicker components',
              })}
              width={768}
              height={432}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

type Feature = {
  icon: ReactNode;
  titleId: string;
  titleDefault: string;
  descId: string;
  descDefault: string;
};

const features: Feature[] = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
    titleId: 'home.feat.headless.title',
    titleDefault: 'Zero CSS',
    descId: 'home.feat.headless.desc',
    descDefault:
      'No stylesheets to import, no classes to override. Pair with Tailwind, shadcn, Chakra, or your own CSS.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2 2 7l10 5 10-5-10-5Z" />
        <path d="m2 17 10 5 10-5" />
        <path d="m2 12 10 5 10-5" />
      </svg>
    ),
    titleId: 'home.feat.composition.title',
    titleDefault: 'True Composition',
    descId: 'home.feat.composition.desc',
    descDefault:
      'Radix-style dot-notation API. Compose Input, Popover, Calendar, and TimePicker exactly how you need.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      </svg>
    ),
    titleId: 'home.feat.ssr.title',
    titleDefault: 'SSR-Safe',
    descId: 'home.feat.ssr.desc',
    descDefault:
      'Tested with Next.js App Router. Stable IDs via useId, no window access at module scope.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    titleId: 'home.feat.tz.title',
    titleDefault: 'Timezone-Aware',
    descId: 'home.feat.tz.desc',
    descDefault:
      'All values as ISO 8601 UTC strings. Display any timezone without mutating the source of truth.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    titleId: 'home.feat.a11y.title',
    titleDefault: 'Accessible by Default',
    descId: 'home.feat.a11y.desc',
    descDefault:
      'ARIA roles, keyboard navigation, and focus management baked in. Every component passes axe.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
      </svg>
    ),
    titleId: 'home.feat.bundle.title',
    titleDefault: 'Under 12KB',
    descId: 'home.feat.bundle.desc',
    descDefault:
      '9.2KB gzip total — a fraction of react-datepicker’s 60KB. Tree-shakable down to what you use.',
  },
];

function Features(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.sectionHeading}>
          <div className={styles.sectionEyebrow}>
            <Translate id="home.features.eyebrow">What you get</Translate>
          </div>
          <h2 className={styles.sectionTitle}>
            <Translate id="home.features.title">Primitives that stay out of your way</Translate>
          </h2>
        </div>
        <div className={styles.featuresGrid}>
          {features.map((f) => (
            <div key={f.titleId} className={styles.featureCard}>
              <div className={styles.featureIcon} aria-hidden="true">
                {f.icon}
              </div>
              <h3 className={styles.featureTitle}>
                <Translate id={f.titleId}>{f.titleDefault}</Translate>
              </h3>
              <p className={styles.featureDesc}>
                <Translate id={f.descId}>{f.descDefault}</Translate>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Compare(): ReactNode {
  return (
    <section className={styles.compare}>
      <div className="container">
        <div className={styles.sectionHeading}>
          <div className={styles.sectionEyebrow}>
            <Translate id="home.compare.eyebrow">Comparison</Translate>
          </div>
          <h2 className={styles.sectionTitle}>
            <Translate id="home.compare.title">How Kalyx compares</Translate>
          </h2>
        </div>
        <div className={styles.compareTable}>
          <table>
            <thead>
              <tr>
                <th>
                  <Translate id="home.compare.col.feature">Feature</Translate>
                </th>
                <th className={styles.kalyxCell}>Kalyx</th>
                <th>react-datepicker</th>
                <th>react-day-picker</th>
                <th>Ark UI</th>
                <th>React Aria</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Translate id="home.compare.row.bundle">Bundle (gzip)</Translate>
                </td>
                <td className={styles.kalyxCell}>~11KB</td>
                <td>~60KB</td>
                <td>~22KB</td>
                <td>~18KB</td>
                <td>~45KB</td>
              </tr>
              <tr>
                <td>
                  <Translate id="home.compare.row.css">Required CSS import</Translate>
                </td>
                <td className={styles.kalyxCell}>None</td>
                <td>Required</td>
                <td>None</td>
                <td>None</td>
                <td>None</td>
              </tr>
              <tr>
                <td>
                  <Translate id="home.compare.row.tp">Built-in TimePicker</Translate>
                </td>
                <td className={styles.kalyxCell}>✓</td>
                <td>✓</td>
                <td>✗</td>
                <td>✗</td>
                <td>✓</td>
              </tr>
              <tr>
                <td>
                  <Translate id="home.compare.row.range">RangePicker</Translate>
                </td>
                <td className={styles.kalyxCell}>✓</td>
                <td>✓</td>
                <td>✓</td>
                <td>✓</td>
                <td>✓</td>
              </tr>
              <tr>
                <td>
                  <Translate id="home.compare.row.month">MonthPicker / YearPicker</Translate>
                </td>
                <td className={styles.kalyxCell}>✓</td>
                <td>△ (drop-down)</td>
                <td>✗</td>
                <td>✗</td>
                <td>✗</td>
              </tr>
              <tr>
                <td>
                  <Translate id="home.compare.row.ssr">SSR-safe (App Router)</Translate>
                </td>
                <td className={styles.kalyxCell}>✓</td>
                <td>△</td>
                <td>✓</td>
                <td>✓</td>
                <td>✓</td>
              </tr>
              <tr>
                <td>
                  <Translate id="home.compare.row.iso">ISO string values</Translate>
                </td>
                <td className={styles.kalyxCell}>✓</td>
                <td>✗ (Date objects)</td>
                <td>✗ (Date objects)</td>
                <td>✗ (Date objects)</td>
                <td>✗ (@internationalized/date)</td>
              </tr>
              <tr>
                <td>
                  <Translate id="home.compare.row.tz">IANA timezone</Translate>
                </td>
                <td className={styles.kalyxCell}>✓</td>
                <td>✗ (#1018 bug)</td>
                <td>✗</td>
                <td>✗</td>
                <td>✓</td>
              </tr>
              <tr>
                <td>
                  <Translate id="home.compare.row.composition">Composition API</Translate>
                </td>
                <td className={styles.kalyxCell}>✓</td>
                <td>✗ (100+ props)</td>
                <td>✓</td>
                <td>✓</td>
                <td>△ (hooks-based)</td>
              </tr>
              <tr>
                <td>
                  <Translate id="home.compare.row.adapter">Date library adapter</Translate>
                </td>
                <td className={styles.kalyxCell}>✓ (date-fns / custom)</td>
                <td>✗</td>
                <td>✗</td>
                <td>✗</td>
                <td>✗ (locked)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function FinalCta(): ReactNode {
  const mascot = useBaseUrl('/img/kalyx-mascot.png');
  return (
    <section className={styles.finalCta}>
      <img
        className={styles.mascot}
        src={mascot}
        alt={translate({id: 'home.mascot.alt', message: 'Kalyx mascot'})}
        width={120}
        height={120}
      />
      <h2 className={styles.finalCtaTitle}>
        <Translate id="home.finalCta.title">Ready in 60 seconds</Translate>
      </h2>
      <p className={styles.finalCtaDesc}>
        <Translate id="home.finalCta.desc">
          Install the package, drop in the components, style them your way. That’s the whole onboarding.
        </Translate>
      </p>
      <div className={styles.ctas} style={{justifyContent: 'center'}}>
        <Link className={styles.ctaPrimary} to="/docs/getting-started/installation">
          <Translate id="home.finalCta.install">Install Kalyx</Translate>
          <span aria-hidden="true">→</span>
        </Link>
        <Link className={styles.ctaSecondary} to="/docs/components/datepicker">
          <Translate id="home.finalCta.components">Browse Components</Translate>
        </Link>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title={translate({
        id: 'home.meta.title',
        message: 'Kalyx — The headless DatePicker, finally complete',
      })}
      description={translate({
        id: 'home.meta.description',
        message:
          'Headless, SSR-safe React DatePicker with Input, Calendar, TimePicker, and RangePicker in under 12KB.',
      })}>
      <Hero />
      <main>
        <Features />
        <Compare />
        <FinalCta />
      </main>
    </Layout>
  );
}
