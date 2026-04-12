'use client';

import { useState } from 'react';
import { DatePicker } from '@kalyx/react';

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
