import { useState } from 'react';
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
      className={styles.preview}>
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
      <RangePicker.Input className={cn.input} part="start" />
      <RangePicker.Input className={cn.input} part="end" />
      <RangePicker.Popover>
        <RangePicker.Calendar classNames={cn.calendar} />
      </RangePicker.Popover>
    </RangePicker>
  );
}

function TimePickerPreview({ classNames, timezone }: SubProps) {
  const [v, setV] = useState<string | null>(FROZEN_TIME);
  return (
    <TimePicker value={v} onChange={setV} format="12h" displayTimezone={timezone}>
      <TimePicker.Input />
      <div style={{ display: 'flex', gap: 8 }}>
        <TimePicker.HourList />
        <TimePicker.MinuteList />
        <TimePicker.AmPmToggle />
      </div>
    </TimePicker>
  );
}

function DateTimePickerPreview({ classNames, locale, timezone }: SubProps) {
  const [v, setV] = useState<string | null>(FROZEN_DATE);
  return (
    <DateTimePicker value={v} onChange={setV} locale={locale} displayTimezone={timezone}>
      <DateTimePicker.Input />
      <DateTimePicker.Popover>
        <DateTimePicker.Calendar />
        <DateTimePicker.HourList />
        <DateTimePicker.MinuteList />
      </DateTimePicker.Popover>
    </DateTimePicker>
  );
}

function MonthPickerPreview({ locale, timezone }: SubProps) {
  const [v, setV] = useState<string | null>(FROZEN_DATE);
  return (
    <MonthPicker value={v} onChange={setV} locale={locale} displayTimezone={timezone}>
      <MonthPicker.Input />
      <MonthPicker.Popover>
        <MonthPicker.Grid />
      </MonthPicker.Popover>
    </MonthPicker>
  );
}

function YearPickerPreview({ locale, timezone }: SubProps) {
  const [v, setV] = useState<string | null>(FROZEN_DATE);
  return (
    <YearPicker value={v} onChange={setV} locale={locale} displayTimezone={timezone}>
      <YearPicker.Input />
      <YearPicker.Popover>
        <YearPicker.Grid />
      </YearPicker.Popover>
    </YearPicker>
  );
}

function WeekPickerPreview({ locale, timezone }: SubProps) {
  const [v, setV] = useState<DateRange>(FROZEN_WEEK);
  return (
    <WeekPicker value={v} onChange={setV} locale={locale} displayTimezone={timezone}>
      <WeekPicker.Input part="start" />
      <WeekPicker.Input part="end" />
      <WeekPicker.Popover>
        <WeekPicker.Calendar />
      </WeekPicker.Popover>
    </WeekPicker>
  );
}
