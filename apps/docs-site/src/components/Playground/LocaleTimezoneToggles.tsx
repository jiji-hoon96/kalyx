import styles from './Playground.module.css';

export type Locale = 'en-US' | 'ko-KR' | 'ja-JP' | 'fr-FR';
export type Timezone = 'UTC' | 'Asia/Seoul' | 'America/New_York' | 'Europe/London';

const LOCALES: readonly { id: Locale; label: string }[] = [
  { id: 'en-US', label: 'English (US)' },
  { id: 'ko-KR', label: '한국어' },
  { id: 'ja-JP', label: '日本語' },
  { id: 'fr-FR', label: 'Français' },
];

const TIMEZONES: readonly Timezone[] = [
  'UTC', 'Asia/Seoul', 'America/New_York', 'Europe/London',
];

export type LocaleTimezoneTogglesProps = {
  locale: Locale;
  timezone: Timezone;
  onLocaleChange: (next: Locale) => void;
  onTimezoneChange: (next: Timezone) => void;
};

export default function LocaleTimezoneToggles({
  locale, timezone, onLocaleChange, onTimezoneChange,
}: LocaleTimezoneTogglesProps) {
  return (
    <div className={styles.toggleRow}>
      <label className={styles.control}>
        <span className={styles.controlLabel}>Locale</span>
        <select
          className={styles.select}
          value={locale}
          onChange={e => onLocaleChange(e.target.value as Locale)}
          aria-label="Locale">
          {LOCALES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
        </select>
      </label>
      <label className={styles.control}>
        <span className={styles.controlLabel}>Timezone</span>
        <select
          className={styles.select}
          value={timezone}
          onChange={e => onTimezoneChange(e.target.value as Timezone)}
          aria-label="Timezone">
          {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
        </select>
      </label>
    </div>
  );
}
