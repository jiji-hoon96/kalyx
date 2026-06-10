import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import styles from './GetStarted.module.css';

const FIRST_EXAMPLE = `import { DatePicker } from '@kalyx/react';

function BirthdayField() {
  const [iso, setIso] = useState<string | null>(null);
  return (
    <DatePicker value={iso} onChange={setIso}>
      <DatePicker.Input />
      <DatePicker.Popover>
        <DatePicker.Calendar />
      </DatePicker.Popover>
    </DatePicker>
  );
}`;

export default function GetStarted() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <span className={styles.eyebrow}>
            <Translate id="home.getStarted.eyebrow">Ready in 60 seconds</Translate>
          </span>
          <h2 className={styles.heading}>
            <Translate id="home.getStarted.heading">
              Install. Compose. Ship.
            </Translate>
          </h2>
        </div>

        <div className={styles.grid}>
          <div className={styles.col}>
            <div className={styles.colLabel}>
              <Translate id="home.getStarted.install.label">1. Install</Translate>
            </div>
            <div className={styles.installBar}>
              <span className={styles.installPrefix}>$</span>
              <span className={styles.installCmd}>pnpm add @kalyx/react</span>
            </div>
            <div className={styles.actions}>
              <Link className={styles.ctaPrimary} to="/docs/getting-started/quick-start">
                <Translate id="home.getStarted.cta.quickStart">Quick Start →</Translate>
              </Link>
              <Link className={styles.ctaSecondary} to="/playground">
                <Translate id="home.getStarted.cta.playground">Try the Playground</Translate>
              </Link>
            </div>
          </div>

          <div className={styles.col}>
            <div className={styles.colLabel}>
              <Translate id="home.getStarted.example.label">2. Compose</Translate>
            </div>
            <pre data-testid="first-example" className={styles.code}>
              <code>{FIRST_EXAMPLE}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
