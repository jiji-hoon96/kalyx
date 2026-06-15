import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import type { Picker } from './data';
import styles from './PickerGrid.module.css';

export default function PickerCard({ picker }: { picker: Picker }) {
  return (
    <Link
      data-testid="picker-card"
      className={styles.card}
      to={`/docs/components/${picker.id}`}>
      <div className={styles.label}>{picker.label}</div>
      <div className={styles.oneLine}>
        <Translate id={picker.oneLineId}>{picker.oneLineDefault}</Translate>
      </div>
      <div className={styles.cta}>
        <Translate id="home.pickerGrid.cta">Docs →</Translate>
      </div>
    </Link>
  );
}
