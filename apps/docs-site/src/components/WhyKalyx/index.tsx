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
              Build a date with new Date in Seoul, store it, and the server
              sees the day before. Kalyx never takes a Date: values go in and
              out as ISO 8601 UTC strings, and the display timezone is a
              separate prop. On top of that, a list-style TimePicker and month,
              year, and week pickers share the same composition API.
            </Translate>
          </p>
          <Link className={styles.cta} to="/docs/intro">
            <Translate id="home.whyKalyx.cta">Read the docs →</Translate>
          </Link>
        </div>
      </div>
    </section>
  );
}
