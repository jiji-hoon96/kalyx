'use client';

import { useState } from 'react';
import { WeekPicker } from '@kalyx/react';
import type { DateRange } from '@kalyx/react';

const EMPTY: DateRange = { start: null, end: null };

export function WeekPickerDemo() {
	const [week, setWeek] = useState<DateRange>(EMPTY);

	return (
		<>
			<WeekPicker value={week} onChange={setWeek}>
				<WeekPicker.Input part="start" className="kalyx-input" />
				<span style={{ margin: '0 0.5rem' }}>→</span>
				<WeekPicker.Input part="end" className="kalyx-input" />
				<WeekPicker.Popover>
					<WeekPicker.Calendar />
				</WeekPicker.Popover>
			</WeekPicker>
			<div className="demo-result">
				<strong>선택된 주:</strong>{' '}
				<code>
					{week.start && week.end
						? `${week.start.slice(0, 10)} – ${week.end.slice(0, 10)}`
						: '(없음)'}
				</code>
			</div>
		</>
	);
}

export function WeekPickerMondayDemo() {
	const [week, setWeek] = useState<DateRange>(EMPTY);

	return (
		<>
			<WeekPicker value={week} onChange={setWeek} weekStartsOn={1}>
				<WeekPicker.Input part="start" className="kalyx-input" />
				<span style={{ margin: '0 0.5rem' }}>→</span>
				<WeekPicker.Input part="end" className="kalyx-input" />
				<WeekPicker.Popover>
					<WeekPicker.Calendar />
				</WeekPicker.Popover>
			</WeekPicker>
			<div className="demo-result">
				<strong>월요일 시작 (weekStartsOn=1):</strong>{' '}
				<code>
					{week.start && week.end
						? `${week.start.slice(0, 10)} – ${week.end.slice(0, 10)}`
						: '(없음)'}
				</code>
			</div>
		</>
	);
}
