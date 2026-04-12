'use client';

import { useState } from 'react';
import { TimePicker } from '@kalyx/react';

export function TimePickerDemo() {
	const [time, setTime] = useState<string | null>('2026-04-11T14:30:00.000Z');
	const [format, setFormat] = useState<'12h' | '24h'>('24h');

	return (
		<>
			<div style={{ marginBottom: 16 }}>
				<label style={{ marginRight: 16 }}>
					<input
						type="radio"
						checked={format === '24h'}
						onChange={() => setFormat('24h')}
					/>{' '}
					24h
				</label>
				<label>
					<input
						type="radio"
						checked={format === '12h'}
						onChange={() => setFormat('12h')}
					/>{' '}
					12h
				</label>
			</div>

			<TimePicker value={time} onChange={setTime} format={format} step={15}>
				<TimePicker.Input className="kalyx-input" style={{ width: 120 }} />
				<div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
					<TimePicker.HourList />
					<TimePicker.MinuteList />
					<TimePicker.AmPmToggle />
				</div>
			</TimePicker>

			<div className="demo-result">
				<strong>선택된 시간 (ISO):</strong> <code>{time ?? '(없음)'}</code>
			</div>
		</>
	);
}
