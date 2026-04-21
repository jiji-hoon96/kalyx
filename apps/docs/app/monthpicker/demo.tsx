'use client';

import { useState } from 'react';
import { MonthPicker } from '@kalyx/react';

export function MonthPickerDemo() {
	const [month, setMonth] = useState<string | null>(null);

	return (
		<>
			<MonthPicker value={month} onChange={setMonth}>
				<MonthPicker.Input className="kalyx-input" placeholder="월 선택" />
				<MonthPicker.Popover>
					<MonthPicker.Grid />
				</MonthPicker.Popover>
			</MonthPicker>
			<div className="demo-result">
				<strong>선택된 월 (month-start ISO):</strong>{' '}
				<code>{month ?? '(없음)'}</code>
			</div>
		</>
	);
}

export function MonthPickerLocaleDemo() {
	const [month, setMonth] = useState<string | null>(null);

	return (
		<>
			<MonthPicker value={month} onChange={setMonth} locale="ko-KR">
				<MonthPicker.Input className="kalyx-input" placeholder="월 선택" />
				<MonthPicker.Popover>
					<MonthPicker.Grid />
				</MonthPicker.Popover>
			</MonthPicker>
			<div className="demo-result">
				<strong>한국어 (locale=ko-KR):</strong>{' '}
				<code>{month ?? '(없음)'}</code>
			</div>
		</>
	);
}
