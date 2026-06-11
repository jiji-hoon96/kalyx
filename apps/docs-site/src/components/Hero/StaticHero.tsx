import Head from '@docusaurus/Head';
import styles from './Hero.module.css';

/**
 * SSG-safe placeholder for the right column. Identical to the static
 * frame 0 of <HeroDemo>, so the lazy chunk swap is layout-stable.
 *
 * Injects a <link rel="preload"> for the hero WebP at <head> level so
 * the browser kicks off the LCP image fetch before the rest of the body
 * scripts. The <img> itself is also marked fetchpriority=high so browsers
 * that ignore preload still treat the request as critical.
 */
export default function StaticHero() {
  return (
    <>
      <Head>
        <link
          rel="preload"
          as="image"
          href="/img/hero-light.webp"
          // @ts-expect-error fetchpriority is a valid HTML attribute but not yet in React's link types
          fetchpriority="high"
        />
      </Head>
      <img
        className={styles.staticHero}
        src="/img/hero-light.webp"
        alt="Kalyx — DatePicker, RangePicker, TimePicker, DateTimePicker, MonthPicker, YearPicker, WeekPicker"
        width={960}
        height={540}
        loading="eager"
        // @ts-expect-error fetchpriority is valid HTML; React 19 types do not yet include it
        fetchpriority="high"
      />
    </>
  );
}
