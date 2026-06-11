import { PICKER_IDS, type PickerId } from './classNamesByPicker';
import styles from './Playground.module.css';

export type PickerSelectorProps = {
  value: PickerId;
  onChange: (next: PickerId) => void;
};

export default function PickerSelector({ value, onChange }: PickerSelectorProps) {
  return (
    <label className={styles.control}>
      <span className={styles.controlLabel}>Picker</span>
      <select
        className={styles.select}
        value={value}
        onChange={e => onChange(e.target.value as PickerId)}
        aria-label="Picker">
        {PICKER_IDS.map(id => (
          <option key={id} value={id}>{prettify(id)}</option>
        ))}
      </select>
    </label>
  );
}

function prettify(id: string): string {
  // 'datepicker' -> 'DatePicker'; 'datetimepicker' -> 'DateTimePicker'
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  if (id === 'datetimepicker') return 'DateTimePicker';
  if (id === 'monthpicker') return 'MonthPicker';
  if (id === 'yearpicker') return 'YearPicker';
  if (id === 'weekpicker') return 'WeekPicker';
  if (id === 'rangepicker') return 'RangePicker';
  if (id === 'timepicker') return 'TimePicker';
  return cap(id);
}
