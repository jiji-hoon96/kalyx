'use client';

import { useState } from 'react';
import { DateTimePicker } from '@kalyx/react';

export function DateTimePickerDemo() {
	const [dt, setDt] = useState<string | null>('2026-04-12T14:30:00.000Z');

	return (
		<>
			<DateTimePicker value={dt} onChange={setDt} format="24h" step={15}>
				<DateTimePicker.Input className="kalyx-input" />
				<DateTimePicker.Popover>
					<DateTimePicker.Calendar />
					<div
						style={{
							display: 'flex',
							gap: 8,
							marginTop: 12,
							paddingTop: 12,
							borderTop: '1px solid #e5e5e5',
						}}
					>
						<DateTimePicker.HourList />
						<DateTimePicker.MinuteList />
					</div>
				</DateTimePicker.Popover>
			</DateTimePicker>

			<div className="demo-result">
				<strong>선택된 값 (ISO 8601 UTC):</strong>{' '}
				<code>{dt ?? '(없음)'}</code>
			</div>
		</>
	);
}
