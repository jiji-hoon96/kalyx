import Translate from '@docusaurus/Translate';
import FeatureCard from './FeatureCard';
import { FEATURES } from './data';
import styles from './FeatureGrid.module.css';

export default function FeatureGrid() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <span className={styles.eyebrow}>
            <Translate id="home.featureGrid.eyebrow">What you get</Translate>
          </span>
          <h2 className={styles.heading}>
            <Translate id="home.featureGrid.heading">
              Primitives that stay out of your way
            </Translate>
          </h2>
        </div>
        <div className={styles.grid}>
          {FEATURES.map(f => <FeatureCard key={f.id} feature={f} />)}
        </div>
      </div>
    </section>
  );
}
