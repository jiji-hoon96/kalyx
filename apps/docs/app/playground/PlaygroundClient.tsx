'use client';

import { useCallback, useMemo, useState } from 'react';
import {
	DatePicker,
	RangePicker,
	TimePicker,
	DateTimePicker,
	MonthPicker,
	YearPicker,
	WeekPicker,
} from '@kalyx/react';
import type { DateRange, ISODateString } from '@kalyx/react';

type LocaleId = 'en-US' | 'ko-KR' | 'ja-JP' | 'de-DE' | 'fr-FR' | 'ar-SA';
type WeekStartsOn = 0 | 1;
type TimeFormat = '12h' | '24h';
type MinuteStep = 1 | 5 | 15 | 30;

const LOCALES: LocaleId[] = ['en-US', 'ko-KR', 'ja-JP', 'de-DE', 'fr-FR', 'ar-SA'];
const TIMEZONES = [
	'UTC',
	'Asia/Seoul',
	'Asia/Tokyo',
	'America/New_York',
	'America/Los_Angeles',
	'Europe/London',
	'Europe/Berlin',
	'Pacific/Auckland',
];

interface EventLogEntry {
	at: string;
	component: string;
	type: string;
	payload: string;
}

export function PlaygroundClient() {
	// ── Shared controls ──────────────────────────────────────────────────
	const [locale, setLocale] = useState<LocaleId>('en-US');
	const [displayTimezone, setDisplayTimezone] = useState<string>('');
	const [weekStartsOn, setWeekStartsOn] = useState<WeekStartsOn>(0);
	const [timeFormat, setTimeFormat] = useState<TimeFormat>('24h');
	const [minuteStep, setMinuteStep] = useState<MinuteStep>(1);
	const [disableWeekends, setDisableWeekends] = useState(false);
	const [readOnly, setReadOnly] = useState(false);
	const [globalDisabled, setGlobalDisabled] = useState(false);

	// ── Per-component values ─────────────────────────────────────────────
	const [date, setDate] = useState<ISODateString | null>(null);
	const [range, setRange] = useState<DateRange>({ start: null, end: null });
	const [time, setTime] = useState<ISODateString | null>(null);
	const [dateTime, setDateTime] = useState<ISODateString | null>(null);
	const [month, setMonth] = useState<ISODateString | null>(null);
	const [year, setYear] = useState<ISODateString | null>(null);
	const [week, setWeek] = useState<DateRange>({ start: null, end: null });

	// ── Event log (last 20 entries) ──────────────────────────────────────
	const [events, setEvents] = useState<EventLogEntry[]>([]);
	const log = useCallback((component: string, type: string, payload: unknown) => {
		const at = new Date().toISOString().slice(11, 19);
		setEvents((prev) =>
			[
				{ at, component, type, payload: typeof payload === 'string' ? payload : JSON.stringify(payload) },
				...prev,
			].slice(0, 20),
		);
	}, []);

	// ── Derived: shared `disabled` array used by every picker that takes one
	const disabledRules = useMemo(
		() => (disableWeekends ? [{ dayOfWeek: [0, 6] as number[] }] : undefined),
		[disableWeekends],
	);

	// `disabled` prop accepts boolean too — globalDisabled wins over rules.
	const sharedDisabled = globalDisabled ? true : disabledRules;

	const tzOrUndefined = displayTimezone || undefined;

	const onDateChange = useCallback(
		(value: ISODateString | null) => {
			setDate(value);
			log('DatePicker', 'change', value);
		},
		[log],
	);
	const onRangeChange = useCallback(
		(value: DateRange) => {
			setRange(value);
			log('RangePicker', 'change', value);
		},
		[log],
	);
	const onTimeChange = useCallback(
		(value: ISODateString | null) => {
			setTime(value);
			log('TimePicker', 'change', value);
		},
		[log],
	);
	const onDateTimeChange = useCallback(
		(value: ISODateString | null) => {
			setDateTime(value);
			log('DateTimePicker', 'change', value);
		},
		[log],
	);
	const onMonthChange = useCallback(
		(value: ISODateString | null) => {
			setMonth(value);
			log('MonthPicker', 'change', value);
		},
		[log],
	);
	const onYearChange = useCallback(
		(value: ISODateString | null) => {
			setYear(value);
			log('YearPicker', 'change', value);
		},
		[log],
	);
	const onWeekChange = useCallback(
		(value: DateRange) => {
			setWeek(value);
			log('WeekPicker', 'change', value);
		},
		[log],
	);

	const resetAll = useCallback(() => {
		setDate(null);
		setRange({ start: null, end: null });
		setTime(null);
		setDateTime(null);
		setMonth(null);
		setYear(null);
		setWeek({ start: null, end: null });
		setEvents([]);
	}, []);

	return (
		<div className="playground">
			{/* ── Controls ─────────────────────────────────────────────── */}
			<section className="playground-controls" aria-label="Shared controls">
				<div className="playground-controls-row">
					<label>
						<span>locale</span>
						<select value={locale} onChange={(e) => setLocale(e.target.value as LocaleId)}>
							{LOCALES.map((l) => (
								<option key={l} value={l}>
									{l}
								</option>
							))}
						</select>
					</label>
					<label>
						<span>displayTimezone</span>
						<select
							value={displayTimezone}
							onChange={(e) => setDisplayTimezone(e.target.value)}
						>
							<option value="">(none — UTC)</option>
							{TIMEZONES.map((tz) => (
								<option key={tz} value={tz}>
									{tz}
								</option>
							))}
						</select>
					</label>
					<label>
						<span>weekStartsOn</span>
						<select
							value={weekStartsOn}
							onChange={(e) => setWeekStartsOn(Number(e.target.value) as WeekStartsOn)}
						>
							<option value={0}>Sunday (0)</option>
							<option value={1}>Monday (1)</option>
						</select>
					</label>
					<label>
						<span>time format</span>
						<select
							value={timeFormat}
							onChange={(e) => setTimeFormat(e.target.value as TimeFormat)}
						>
							<option value="24h">24h</option>
							<option value="12h">12h</option>
						</select>
					</label>
					<label>
						<span>minute step</span>
						<select
							value={minuteStep}
							onChange={(e) => setMinuteStep(Number(e.target.value) as MinuteStep)}
						>
							<option value={1}>1</option>
							<option value={5}>5</option>
							<option value={15}>15</option>
							<option value={30}>30</option>
						</select>
					</label>
				</div>
				<div className="playground-controls-row">
					<label className="playground-toggle">
						<input
							type="checkbox"
							checked={disableWeekends}
							onChange={(e) => setDisableWeekends(e.target.checked)}
						/>
						<span>disable weekends</span>
					</label>
					<label className="playground-toggle">
						<input
							type="checkbox"
							checked={readOnly}
							onChange={(e) => setReadOnly(e.target.checked)}
						/>
						<span>readOnly</span>
					</label>
					<label className="playground-toggle">
						<input
							type="checkbox"
							checked={globalDisabled}
							onChange={(e) => setGlobalDisabled(e.target.checked)}
						/>
						<span>disabled (whole picker)</span>
					</label>
					<button type="button" className="playground-reset" onClick={resetAll}>
						Reset all
					</button>
				</div>
			</section>

			<div className="playground-grid">
				{/* ── DatePicker ─────────────────────────────────────────── */}
				<section className="playground-card" data-component="DatePicker">
					<header>
						<h2>DatePicker</h2>
						<code>{'<DatePicker.Input /> + .Calendar'}</code>
					</header>
					<DatePicker
						value={date}
						onChange={onDateChange}
						locale={locale}
						displayTimezone={tzOrUndefined}
						weekStartsOn={weekStartsOn}
						readOnly={readOnly}
						disabled={sharedDisabled}
						onOpenChange={(open) => log('DatePicker', 'openChange', open)}
					>
						<DatePicker.Input className="kalyx-input" placeholder="YYYY-MM-DD" />
						<DatePicker.Popover>
							<DatePicker.Calendar />
						</DatePicker.Popover>
					</DatePicker>
					<output>
						<strong>ISO:</strong> <code>{date ?? '(empty)'}</code>
					</output>
				</section>

				{/* ── RangePicker ────────────────────────────────────────── */}
				<section className="playground-card" data-component="RangePicker">
					<header>
						<h2>RangePicker</h2>
						<code>{'<RangePicker.Input part="start|end"/>'}</code>
					</header>
					<RangePicker
						value={range}
						onChange={onRangeChange}
						locale={locale}
						displayTimezone={tzOrUndefined}
						weekStartsOn={weekStartsOn}
						readOnly={readOnly}
						disabled={sharedDisabled}
						onOpenChange={(open) => log('RangePicker', 'openChange', open)}
					>
						<div style={{ display: 'flex', gap: 8 }}>
							<RangePicker.Input part="start" className="kalyx-input" />
							<RangePicker.Input part="end" className="kalyx-input" />
						</div>
						<RangePicker.Popover>
							<RangePicker.Calendar />
						</RangePicker.Popover>
					</RangePicker>
					<output>
						<strong>start:</strong> <code>{range.start ?? '(empty)'}</code>
						<br />
						<strong>end:</strong> <code>{range.end ?? '(empty)'}</code>
					</output>
				</section>

				{/* ── TimePicker ─────────────────────────────────────────── */}
				<section className="playground-card" data-component="TimePicker">
					<header>
						<h2>TimePicker</h2>
						<code>{'.HourList + .MinuteList (+ .AmPmToggle)'}</code>
					</header>
					<TimePicker
						value={time}
						onChange={onTimeChange}
						format={timeFormat}
						step={minuteStep}
						readOnly={readOnly}
						disabled={globalDisabled}
					>
						<TimePicker.Input className="kalyx-input" />
						<div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
							<TimePicker.HourList />
							<TimePicker.MinuteList />
							{timeFormat === '12h' ? <TimePicker.AmPmToggle /> : null}
						</div>
					</TimePicker>
					<output>
						<strong>ISO:</strong> <code>{time ?? '(empty)'}</code>
					</output>
				</section>

				{/* ── DateTimePicker ─────────────────────────────────────── */}
				<section className="playground-card" data-component="DateTimePicker">
					<header>
						<h2>DateTimePicker</h2>
						<code>{'.Calendar + .HourList + .MinuteList'}</code>
					</header>
					<DateTimePicker
						value={dateTime}
						onChange={onDateTimeChange}
						locale={locale}
						displayTimezone={tzOrUndefined}
						weekStartsOn={weekStartsOn}
						format={timeFormat}
						step={minuteStep}
						readOnly={readOnly}
						disabled={sharedDisabled}
						onOpenChange={(open) => log('DateTimePicker', 'openChange', open)}
					>
						<DateTimePicker.Input className="kalyx-input" placeholder="YYYY-MM-DD HH:mm" />
						<DateTimePicker.Popover>
							<DateTimePicker.Calendar />
							<div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
								<DateTimePicker.HourList />
								<DateTimePicker.MinuteList />
								{timeFormat === '12h' ? <DateTimePicker.AmPmToggle /> : null}
							</div>
						</DateTimePicker.Popover>
					</DateTimePicker>
					<output>
						<strong>ISO:</strong> <code>{dateTime ?? '(empty)'}</code>
					</output>
				</section>

				{/* ── MonthPicker ────────────────────────────────────────── */}
				<section className="playground-card" data-component="MonthPicker">
					<header>
						<h2>MonthPicker</h2>
						<code>{'.Input + .Trigger + .Grid'}</code>
					</header>
					<MonthPicker
						value={month}
						onChange={onMonthChange}
						locale={locale}
						displayTimezone={tzOrUndefined}
						readOnly={readOnly}
						disabled={globalDisabled}
						onOpenChange={(open) => log('MonthPicker', 'openChange', open)}
					>
						<MonthPicker.Input className="kalyx-input" />
						<MonthPicker.Popover>
							<MonthPicker.Grid />
						</MonthPicker.Popover>
					</MonthPicker>
					<output>
						<strong>ISO:</strong> <code>{month ?? '(empty)'}</code>
					</output>
				</section>

				{/* ── YearPicker ─────────────────────────────────────────── */}
				<section className="playground-card" data-component="YearPicker">
					<header>
						<h2>YearPicker</h2>
						<code>{'.Input + .Trigger + .Grid'}</code>
					</header>
					<YearPicker
						value={year}
						onChange={onYearChange}
						locale={locale}
						displayTimezone={tzOrUndefined}
						readOnly={readOnly}
						disabled={globalDisabled}
						onOpenChange={(open) => log('YearPicker', 'openChange', open)}
					>
						<YearPicker.Input className="kalyx-input" />
						<YearPicker.Popover>
							<YearPicker.Grid />
						</YearPicker.Popover>
					</YearPicker>
					<output>
						<strong>ISO:</strong> <code>{year ?? '(empty)'}</code>
					</output>
				</section>

				{/* ── WeekPicker ─────────────────────────────────────────── */}
				<section className="playground-card" data-component="WeekPicker">
					<header>
						<h2>WeekPicker</h2>
						<code>{'.Input + .Calendar (selectionMode="week")'}</code>
					</header>
					<WeekPicker
						value={week}
						onChange={onWeekChange}
						locale={locale}
						displayTimezone={tzOrUndefined}
						weekStartsOn={weekStartsOn}
						readOnly={readOnly}
						disabled={sharedDisabled}
						onOpenChange={(open) => log('WeekPicker', 'openChange', open)}
					>
						<WeekPicker.Input part="start" className="kalyx-input" />
						<WeekPicker.Popover>
							<WeekPicker.Calendar />
						</WeekPicker.Popover>
					</WeekPicker>
					<output>
						<strong>start:</strong> <code>{week.start ?? '(empty)'}</code>
						<br />
						<strong>end:</strong> <code>{week.end ?? '(empty)'}</code>
					</output>
				</section>

				{/* ── Event log ──────────────────────────────────────────── */}
				<section className="playground-card playground-eventlog" data-component="EventLog">
					<header>
						<h2>Event log</h2>
						<code>last 20</code>
					</header>
					<ol>
						{events.length === 0 ? (
							<li className="playground-eventlog-empty">No events yet — interact with any picker.</li>
						) : (
							events.map((evt, i) => (
								<li key={`${evt.at}-${i}`}>
									<span className="playground-eventlog-time">{evt.at}</span>{' '}
									<span className="playground-eventlog-comp">{evt.component}</span>{' '}
									<span className="playground-eventlog-type">{evt.type}</span>{' '}
									<code>{evt.payload}</code>
								</li>
							))
						)}
					</ol>
				</section>
			</div>

			{/* ── Keyboard reference ──────────────────────────────────── */}
			<section className="playground-keyboard" aria-label="Keyboard shortcuts">
				<h2>Keyboard reference</h2>
				<dl>
					<dt>↑ / ↓ / ← / →</dt>
					<dd>Move focus by 1 day / 1 week (Calendar) or 1 option (HourList / MinuteList).</dd>
					<dt>PageUp / PageDown</dt>
					<dd>Move by 1 month. Hold Shift to move by 1 year.</dd>
					<dt>Home / End</dt>
					<dd>Jump to start / end of the current week.</dd>
					<dt>Enter / Space</dt>
					<dd>Commit the focused day. Disabled days are skipped automatically.</dd>
					<dt>Escape</dt>
					<dd>Close the popover and restore focus to the trigger.</dd>
				</dl>
			</section>
		</div>
	);
}
