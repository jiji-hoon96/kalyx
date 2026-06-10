import Translate from '@docusaurus/Translate';
import type { Feature } from './data';
import styles from './FeatureGrid.module.css';

export default function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <div data-testid="feature-card" className={styles.card}>
      <div className={styles.icon} aria-hidden="true">{feature.icon}</div>
      <h3 className={styles.cardTitle}>
        <Translate id={feature.titleId}>{feature.titleDefault}</Translate>
      </h3>
      <p className={styles.cardBody}>
        <Translate id={feature.bodyId}>{feature.bodyDefault}</Translate>
      </p>
    </div>
  );
}
