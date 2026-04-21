'use client';

import { useState } from 'react';
import { YearPicker } from '@kalyx/react';

export function YearPickerDemo() {
	const [year, setYear] = useState<string | null>(null);

	return (
		<>
			<YearPicker value={year} onChange={setYear}>
				<YearPicker.Input className="kalyx-input" placeholder="연도 선택" />
				<YearPicker.Popover>
					<YearPicker.Grid />
				</YearPicker.Popover>
			</YearPicker>
			<div className="demo-result">
				<strong>선택된 연도 (year-start ISO):</strong>{' '}
				<code>{year ?? '(없음)'}</code>
			</div>
		</>
	);
}
