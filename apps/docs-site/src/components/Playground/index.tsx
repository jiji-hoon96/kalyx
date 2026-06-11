import { useState } from 'react';
import PickerSelector from './PickerSelector';
import ClassNamesEditor from './ClassNamesEditor';
import LocaleTimezoneToggles from './LocaleTimezoneToggles';
import PreviewPanel from './PreviewPanel';
import OpenInStackBlitz from './OpenInStackBlitz';
import { CLASSNAMES_BY_PICKER, type ClassNamesShape, type PickerId } from './classNamesByPicker';
import type { Locale, Timezone } from './LocaleTimezoneToggles';
import styles from './Playground.module.css';

export default function Playground() {
  const [pickerId, setPickerId] = useState<PickerId>('datepicker');
  const [classNames, setClassNames] = useState<ClassNamesShape>(CLASSNAMES_BY_PICKER.datepicker);
  const [locale, setLocale] = useState<Locale>('en-US');
  const [timezone, setTimezone] = useState<Timezone>('UTC');

  const handlePickerChange = (next: PickerId) => {
    setPickerId(next);
    setClassNames(CLASSNAMES_BY_PICKER[next]);
  };

  return (
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        <PickerSelector value={pickerId} onChange={handlePickerChange} />
        <LocaleTimezoneToggles
          locale={locale}
          timezone={timezone}
          onLocaleChange={setLocale}
          onTimezoneChange={setTimezone}
        />
        <ClassNamesEditor
          pickerId={pickerId}
          value={classNames}
          onChange={setClassNames}
        />
      </aside>
      <main className={styles.main}>
        <PreviewPanel
          pickerId={pickerId}
          classNames={classNames}
          locale={locale}
          timezone={timezone}
        />
        <div className={styles.footer}>
          <OpenInStackBlitz
            pickerId={pickerId}
            classNames={classNames}
            locale={locale}
            timezone={timezone}
          />
        </div>
      </main>
    </div>
  );
}
