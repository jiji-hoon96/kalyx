import styles from './Hero.module.css';

/**
 * SSG-safe placeholder for the right column. Identical to the static
 * frame 0 of <HeroDemo>, so the lazy chunk swap is layout-stable.
 */
export default function StaticHero() {
  return (
    <img
      className={styles.staticHero}
      src="/img/hero-light.webp"
      alt="Kalyx — DatePicker, RangePicker, TimePicker, DateTimePicker, MonthPicker, YearPicker, WeekPicker"
      width={960}
      height={540}
      loading="eager"
    />
  );
}
