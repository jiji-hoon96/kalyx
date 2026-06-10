import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import styles from './WhyKalyx.module.css';

export default function WhyKalyx() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.card}>
          <span className={styles.eyebrow}>
            <Translate id="home.whyKalyx.eyebrow">Why Kalyx</Translate>
          </span>
          <h2 className={styles.heading}>
            <Translate id="home.whyKalyx.heading">
              Headless without the assembly.
            </Translate>
          </h2>
          <p className={styles.body}>
            <Translate id="home.whyKalyx.body">
              react-day-picker is headless but only ships Calendar.
              react-datepicker is integrated but forces its CSS on you.
              Kalyx is the one that's both — every primitive, no stylesheet,
              ≤16 KB.
            </Translate>
          </p>
          {/*
            PR-D will ship /docs/comparison; until then point at the
            existing anchor on /docs/intro. PR-D's plan must swap this
            href to '/docs/comparison'.
          */}
          <Link className={styles.cta} to="/docs/intro#comparison">
            <Translate id="home.whyKalyx.cta">See how Kalyx compares →</Translate>
          </Link>
        </div>
      </div>
    </section>
  );
}
