'use client';

import { useState } from 'react';
import { RangePicker, type DateRange } from '@kalyx/react';

export function RangePickerDemo() {
	const [range, setRange] = useState<DateRange>({ start: null, end: null });

	return (
		<>
			<RangePicker value={range} onChange={setRange}>
				<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
					<RangePicker.Input
						part="start"
						className="kalyx-input"
						placeholder="시작일"
						style={{ width: 140 }}
					/>
					<span>~</span>
					<RangePicker.Input
						part="end"
						className="kalyx-input"
						placeholder="종료일"
						style={{ width: 140 }}
					/>
				</div>
				<RangePicker.Popover>
					<RangePicker.Calendar />
				</RangePicker.Popover>
			</RangePicker>
			<div className="demo-result">
				<strong>선택된 범위:</strong>
				<br />
				start: <code>{range.start ?? '(없음)'}</code>
				<br />
				end: <code>{range.end ?? '(없음)'}</code>
			</div>
		</>
	);
}

export function RangePickerPresetsDemo() {
	const [range, setRange] = useState<DateRange>({ start: null, end: null });

	return (
		<>
			<RangePicker value={range} onChange={setRange}>
				<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
					<RangePicker.Input
						part="start"
						className="kalyx-input"
						placeholder="시작일"
						style={{ width: 140 }}
					/>
					<span>~</span>
					<RangePicker.Input
						part="end"
						className="kalyx-input"
						placeholder="종료일"
						style={{ width: 140 }}
					/>
				</div>
				<RangePicker.Popover>
					<div style={{ display: 'flex', gap: 16 }}>
						<RangePicker.Presets>
							<RangePicker.Preset value="today">Today</RangePicker.Preset>
							<RangePicker.Preset value="yesterday">Yesterday</RangePicker.Preset>
							<RangePicker.Preset value="last7days">Last 7 days</RangePicker.Preset>
							<RangePicker.Preset value="last30days">Last 30 days</RangePicker.Preset>
							<RangePicker.Preset value="thisMonth">This month</RangePicker.Preset>
							<RangePicker.Preset value="lastMonth">Last month</RangePicker.Preset>
						</RangePicker.Presets>
						<RangePicker.Calendar />
					</div>
				</RangePicker.Popover>
			</RangePicker>
			<div className="demo-result">
				<strong>선택된 범위:</strong>
				<br />
				start: <code>{range.start ?? '(없음)'}</code>
				<br />
				end: <code>{range.end ?? '(없음)'}</code>
			</div>
		</>
	);
}
