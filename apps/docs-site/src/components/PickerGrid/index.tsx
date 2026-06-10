import Translate from '@docusaurus/Translate';
import PickerCard from './PickerCard';
import { PICKERS } from './data';
import styles from './PickerGrid.module.css';

export default function PickerGrid() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <span className={styles.eyebrow}>
            <Translate id="home.pickerGrid.eyebrow">All seven primitives</Translate>
          </span>
          <h2 className={styles.heading}>
            <Translate id="home.pickerGrid.heading">
              Pick the one you came for.
            </Translate>
          </h2>
        </div>
        <div className={styles.grid}>
          {PICKERS.map(p => <PickerCard key={p.id} picker={p} />)}
        </div>
      </div>
    </section>
  );
}
