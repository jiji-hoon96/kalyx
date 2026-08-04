import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import HeroDemoSlot from './HeroDemoSlot';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.copy}>
            <span className={styles.eyebrow}>
              <Translate id="home.hero.eyebrow">Headless · SSR-safe · ≤20 KB</Translate>
            </span>

            <h1 className={styles.title}>
              <Translate id="home.hero.title.line1">Seven date primitives.</Translate>{' '}
              <span className={styles.titleAccent}>
                <Translate id="home.hero.title.line2">One API.</Translate>
              </span>
            </h1>

            <p className={styles.subtitle}>
              <Translate id="home.hero.subtitle">
                Kalyx ships DatePicker, RangePicker, TimePicker, DateTimePicker,
                MonthPicker, YearPicker, and WeekPicker under one composition API.
                Zero CSS, SSR-safe, ISO-8601 in/out.
              </Translate>
            </p>

            <div className={styles.ctas}>
              <Link className={styles.ctaPrimary} to="/docs/getting-started/quick-start">
                <Translate id="home.hero.cta.start">Get Started →</Translate>
              </Link>
              <Link className={styles.ctaSecondary} to="https://github.com/jiji-hoon96/kalyx">
                <Translate id="home.hero.cta.github">Star on GitHub</Translate>
              </Link>
            </div>

            <div className={styles.installBar}>
              <span className={styles.installPrefix}>$</span>
              <span className={styles.installCmd}>pnpm add @kalyx/react</span>
            </div>
          </div>

          <div className={styles.demoColumn}>
            <HeroDemoSlot />
          </div>
        </div>
      </div>
    </section>
  );
}
