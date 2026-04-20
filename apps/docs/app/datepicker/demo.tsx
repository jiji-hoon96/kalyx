'use client';

import { useState } from 'react';
import { DatePicker } from '@kalyx/react';

type View = 'days' | 'months' | 'years';

export function DatePickerDemo() {
	const [date, setDate] = useState<string | null>(null);

	return (
		<>
			<DatePicker value={date} onChange={setDate}>
				<DatePicker.Input className="kalyx-input" placeholder="날짜 선택" />
				<DatePicker.Popover>
					<DatePicker.Calendar />
				</DatePicker.Popover>
			</DatePicker>
			<div className="demo-result">
				<strong>선택된 값 (ISO 8601 UTC):</strong>{' '}
				<code>{date ?? '(없음)'}</code>
			</div>
		</>
	);
}

export function DatePickerWithNavDemo() {
	const [date, setDate] = useState<string | null>(null);
	const [view, setView] = useState<View>('days');

	return (
		<>
			<DatePicker value={date} onChange={(d) => { setDate(d); setView('days'); }}>
				<DatePicker.Input className="kalyx-input" placeholder="날짜 선택" />
				<DatePicker.Popover>
					{view === 'days' && (
						<DatePicker.Calendar onTitleClick={() => setView('months')} />
					)}
					{view === 'months' && (
						<DatePicker.MonthGrid
							onSelect={() => setView('days')}
							onTitleClick={() => setView('years')}
						/>
					)}
					{view === 'years' && (
						<DatePicker.YearGrid onSelect={() => setView('months')} />
					)}
				</DatePicker.Popover>
			</DatePicker>
			<div className="demo-result">
				<strong>선택된 값:</strong> <code>{date ?? '(없음)'}</code>
				<br />
				<em>타이틀을 클릭하여 월/년 빠른 이동 가능</em>
			</div>
		</>
	);
}

export function DatePickerTimezoneDemo() {
	const [date, setDate] = useState<string | null>(null);
	const [tz, setTz] = useState('Asia/Seoul');
	const zones = ['UTC', 'Asia/Seoul', 'America/New_York', 'Europe/London'];

	return (
		<>
			<div style={{ marginBottom: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
				{zones.map((z) => (
					<label key={z} style={{ fontSize: 13 }}>
						<input
							type="radio"
							name="tz"
							checked={tz === z}
							onChange={() => setTz(z)}
							data-testid={`tz-${z}`}
						/>{' '}
						{z}
					</label>
				))}
			</div>
			<DatePicker value={date} onChange={setDate} displayTimezone={tz}>
				<DatePicker.Input className="kalyx-input" placeholder="날짜 선택" />
				<DatePicker.Popover>
					<DatePicker.Calendar />
				</DatePicker.Popover>
			</DatePicker>
			<div className="demo-result">
				<strong>displayTimezone:</strong> <code>{tz}</code>
				<br />
				<strong>저장 ISO (UTC):</strong>{' '}
				<code data-testid="tz-emitted-iso">{date ?? '(없음)'}</code>
			</div>
		</>
	);
}

export function DatePickerLocaleDemo() {
	const [date, setDate] = useState<string | null>(null);
	const [locale, setLocale] = useState('en-US');

	return (
		<>
			<div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
				{['en-US', 'ko-KR', 'ja-JP', 'de-DE', 'fr-FR'].map((l) => (
					<label key={l} style={{ fontSize: 13 }}>
						<input
							type="radio"
							checked={locale === l}
							onChange={() => setLocale(l)}
						/>{' '}
						{l}
					</label>
				))}
			</div>
			<DatePicker value={date} onChange={setDate} locale={locale}>
				<DatePicker.Input className="kalyx-input" placeholder="날짜 선택" />
				<DatePicker.Popover>
					<DatePicker.Calendar />
				</DatePicker.Popover>
			</DatePicker>
			<div className="demo-result">
				<strong>locale:</strong> <code>{locale}</code> |{' '}
				<strong>값:</strong> <code>{date ?? '(없음)'}</code>
			</div>
		</>
	);
}
