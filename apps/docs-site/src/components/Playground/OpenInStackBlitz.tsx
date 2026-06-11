import sdk from '@stackblitz/sdk';
import { buildSeed } from './seedProject';
import type { ClassNamesShape, PickerId } from './classNamesByPicker';
import type { Locale, Timezone } from './LocaleTimezoneToggles';
import styles from './Playground.module.css';

export type OpenInStackBlitzProps = {
  pickerId: PickerId;
  classNames: ClassNamesShape;
  locale: Locale;
  timezone: Timezone;
};

export default function OpenInStackBlitz({ pickerId, classNames, locale, timezone }: OpenInStackBlitzProps) {
  const handleClick = () => {
    const seed = buildSeed(pickerId, classNames, locale, timezone);
    sdk.openProject(seed, { openFile: 'src/App.tsx' });
  };
  return (
    <button
      type="button"
      className={styles.stackblitzButton}
      onClick={handleClick}>
      Open in StackBlitz ↗
    </button>
  );
}
