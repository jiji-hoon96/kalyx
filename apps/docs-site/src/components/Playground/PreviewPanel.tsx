import { useCallback, useRef, useState } from 'react';
import {
  DatePicker, RangePicker, TimePicker, DateTimePicker,
  MonthPicker, YearPicker, WeekPicker,
} from '@kalyx/react';
import type { DateRange } from '@kalyx/react';
import type { ClassNamesShape, PickerId } from './classNamesByPicker';
import type { Locale, Timezone } from './LocaleTimezoneToggles';
import styles from './Playground.module.css';

const FROZEN_DATE = '2026-06-15T00:00:00.000Z';
const FROZEN_RANGE: DateRange = { start: '2026-06-15T00:00:00.000Z', end: '2026-06-19T00:00:00.000Z' };
const FROZEN_WEEK: DateRange = { start: '2026-06-14T00:00:00.000Z', end: '2026-06-20T00:00:00.000Z' };
const FROZEN_TIME = '2026-06-15T14:30:00.000Z';

type ListCn = { root?: string; option?: string; optionSelected?: string };
type AmPmCn = { root?: string; option?: string; optionSelected?: string };

export type PreviewPanelProps = {
  pickerId: PickerId;
  classNames: ClassNamesShape;
  locale: Locale;
  timezone: Timezone;
};

export default function PreviewPanel({ pickerId, classNames, locale, timezone }: PreviewPanelProps) {
  return (
    <div
      data-testid="preview-panel"
      data-picker={pickerId}
      className={`tw-enable ${styles.preview}`}>
      {pickerId === 'datepicker' && <DatePickerPreview classNames={classNames} locale={locale} timezone={timezone} />}
      {pickerId === 'rangepicker' && <RangePickerPreview classNames={classNames} locale={locale} timezone={timezone} />}
      {pickerId === 'timepicker' && <TimePickerPreview classNames={classNames} locale={locale} timezone={timezone} />}
      {pickerId === 'datetimepicker' && <DateTimePickerPreview classNames={classNames} locale={locale} timezone={timezone} />}
      {pickerId === 'monthpicker' && <MonthPickerPreview classNames={classNames} locale={locale} timezone={timezone} />}
      {pickerId === 'yearpicker' && <YearPickerPreview classNames={classNames} locale={locale} timezone={timezone} />}
      {pickerId === 'weekpicker' && <WeekPickerPreview classNames={classNames} locale={locale} timezone={timezone} />}
    </div>
  );
}

type SubProps = { classNames: ClassNamesShape; locale: Locale; timezone: Timezone };

function DatePickerPreview({ classNames, locale, timezone }: SubProps) {
  const [iso, setIso] = useState<string | null>(FROZEN_DATE);
  const cn = classNames as { input?: string; calendar?: Record<string, string> };
  return (
    <DatePicker value={iso} onChange={setIso} locale={locale} displayTimezone={timezone}>
      <DatePicker.Input className={cn.input} placeholder="Pick a date" />
      <DatePicker.Popover>
        <DatePicker.Calendar classNames={cn.calendar} />
      </DatePicker.Popover>
    </DatePicker>
  );
}

// Similar shape for the other 6 pickers; copy the DatePickerPreview pattern and
// adjust the picker component + value type. For brevity each preview is short:

function RangePickerPreview({ classNames, locale, timezone }: SubProps) {
  const [v, setV] = useState<DateRange>(FROZEN_RANGE);
  const cn = classNames as { input?: string; calendar?: Record<string, string> };
  return (
    <RangePicker value={v} onChange={setV} locale={locale} displayTimezone={timezone}>
      <div className={styles.rangeInputRow}>
        <RangePicker.Input className={cn.input} part="start" />
        <span className={styles.rangeInputSep} aria-hidden="true">–</span>
        <RangePicker.Input className={cn.input} part="end" />
      </div>
      <RangePicker.Popover>
        <RangePicker.Calendar classNames={cn.calendar} />
      </RangePicker.Popover>
    </RangePicker>
  );
}

function TimePickerPreview({ classNames, timezone }: SubProps) {
  const [v, setV] = useState<string | null>(FROZEN_TIME);
  const cn = classNames as { input?: string; hourList?: ListCn; minuteList?: ListCn; ampmToggle?: AmPmCn };
  return (
    <TimePicker value={v} onChange={setV} format="12h" displayTimezone={timezone}>
      <TimePicker.Input className={cn.input} />
      <div className={styles.timeRow}>
        <TimePicker.HourList classNames={cn.hourList} />
        <TimePicker.MinuteList classNames={cn.minuteList} />
        <TimePicker.AmPmToggle classNames={cn.ampmToggle} />
      </div>
    </TimePicker>
  );
}

function DateTimePickerPreview({ classNames, locale, timezone }: SubProps) {
  const [v, setV] = useState<string | null>(FROZEN_DATE);
  const cn = classNames as { input?: string; calendar?: Record<string, string>; hourList?: ListCn; minuteList?: ListCn };
  const popoverRef = useRef<HTMLDivElement>(null);

  // "Apply" confirms the current date+time selection and closes the popover.
  // DateTimePicker keeps its popover open after a day click (so you can also
  // pick a time); it commits/closes on Escape or outside click. We reuse that
  // public Escape-to-close behavior by dispatching an Escape keydown into the
  // open dialog — the library's own handler closes it.
  const handleApply = useCallback(() => {
    const dialog = popoverRef.current?.querySelector<HTMLElement>('[role="dialog"]');
    const grid = dialog?.querySelector<HTMLElement>('[role="grid"]') ?? dialog;
    grid?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    );
  }, []);

  return (
    <DateTimePicker value={v} onChange={setV} locale={locale} displayTimezone={timezone}>
      <DateTimePicker.Input className={cn.input} />
      <div ref={popoverRef}>
        <DateTimePicker.Popover className={styles.dateTimeCard}>
          <div className={styles.dateTimeRow}>
            <DateTimePicker.Calendar classNames={cn.calendar} />
            <div className={styles.timeRow}>
              <DateTimePicker.HourList classNames={cn.hourList} />
              <DateTimePicker.MinuteList classNames={cn.minuteList} />
            </div>
          </div>
          <button type="button" className={styles.applyButton} onClick={handleApply}>
            Apply
          </button>
        </DateTimePicker.Popover>
      </div>
    </DateTimePicker>
  );
}

function MonthPickerPreview({ classNames, locale, timezone }: SubProps) {
  const [v, setV] = useState<string | null>(FROZEN_DATE);
  const cn = classNames as { input?: string; grid?: Record<string, string> };
  return (
    <MonthPicker value={v} onChange={setV} locale={locale} displayTimezone={timezone}>
      <MonthPicker.Input className={cn.input} />
      <MonthPicker.Popover>
        <MonthPicker.Grid classNames={cn.grid} />
      </MonthPicker.Popover>
    </MonthPicker>
  );
}

function YearPickerPreview({ classNames, locale, timezone }: SubProps) {
  const [v, setV] = useState<string | null>(FROZEN_DATE);
  const cn = classNames as { input?: string; grid?: Record<string, string> };
  return (
    <YearPicker value={v} onChange={setV} locale={locale} displayTimezone={timezone}>
      <YearPicker.Input className={cn.input} />
      <YearPicker.Popover>
        <YearPicker.Grid classNames={cn.grid} />
      </YearPicker.Popover>
    </YearPicker>
  );
}

function WeekPickerPreview({ classNames, locale, timezone }: SubProps) {
  const [v, setV] = useState<DateRange>(FROZEN_WEEK);
  const cn = classNames as { input?: string; calendar?: Record<string, string> };
  return (
    <WeekPicker value={v} onChange={setV} locale={locale} displayTimezone={timezone}>
      <div className={styles.rangeInputRow}>
        <WeekPicker.Input className={cn.input} part="start" />
        <span className={styles.rangeInputSep} aria-hidden="true">–</span>
        <WeekPicker.Input className={cn.input} part="end" />
      </div>
      <WeekPicker.Popover>
        <WeekPicker.Calendar classNames={cn.calendar} />
      </WeekPicker.Popover>
    </WeekPicker>
  );
}
