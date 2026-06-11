import type { ClassNamesShape, PickerId } from './classNamesByPicker';
import styles from './Playground.module.css';

export type ClassNamesEditorProps = {
  pickerId: PickerId;
  value: ClassNamesShape;
  onChange: (next: ClassNamesShape) => void;
};

type LeafPath = readonly string[];

function* walkLeaves(obj: ClassNamesShape, prefix: LeafPath = []): Generator<{ path: LeafPath; value: string }> {
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string') {
      yield { path: [...prefix, k], value: v };
    } else {
      yield* walkLeaves(v, [...prefix, k]);
    }
  }
}

function setAt(obj: ClassNamesShape, path: LeafPath, next: string): ClassNamesShape {
  const [head, ...tail] = path;
  if (tail.length === 0) {
    return { ...obj, [head]: next };
  }
  const sub = obj[head];
  if (typeof sub !== 'object') return obj;
  return { ...obj, [head]: setAt(sub, tail, next) } as ClassNamesShape;
}

export default function ClassNamesEditor({ pickerId, value, onChange }: ClassNamesEditorProps) {
  const leaves = Array.from(walkLeaves(value));
  return (
    <fieldset className={styles.classNamesEditor} aria-label={`classNames editor — ${pickerId}`}>
      <legend className={styles.controlLabel}>classNames</legend>
      {leaves.map(({ path, value: leafValue }) => {
        const label = path.join('.');
        return (
          <label key={label} className={styles.leafRow}>
            <span className={styles.leafKey}>{label}</span>
            <input
              type="text"
              aria-label={label}
              className={styles.leafInput}
              value={leafValue}
              onChange={e => onChange(setAt(value, path, e.target.value))}
            />
          </label>
        );
      })}
    </fieldset>
  );
}
