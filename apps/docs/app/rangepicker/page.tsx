import { RangePickerDemo, RangePickerPresetsDemo } from './demo';

export default function RangePickerPage() {
	return (
		<>
			<h1>RangePicker</h1>
			<p>날짜 범위를 선택하는 컴포넌트.</p>

			<h2>기본 예제</h2>
			<div className="demo">
				<RangePickerDemo />
			</div>

			<h2>Presets (대시보드용)</h2>
			<p>
				한 클릭으로 미리 정의된 범위를 선택. 9가지 내장 프리셋 + 커스텀 범위
				지원.
			</p>
			<div className="demo">
				<RangePickerPresetsDemo />
			</div>

			<h2>코드</h2>
			<pre>
				<code>{`// 기본
<RangePicker value={range} onChange={setRange}>
  <RangePicker.Input part="start" />
  <RangePicker.Input part="end" />
  <RangePicker.Popover>
    <RangePicker.Calendar />
  </RangePicker.Popover>
</RangePicker>

// Presets
<RangePicker.Popover>
  <RangePicker.Presets>
    <RangePicker.Preset value="last7days">Last 7 days</RangePicker.Preset>
    <RangePicker.Preset value="thisMonth">This month</RangePicker.Preset>
    <RangePicker.Preset range={{ start: "...", end: "..." }}>
      Custom
    </RangePicker.Preset>
  </RangePicker.Presets>
  <RangePicker.Calendar />
</RangePicker.Popover>`}</code>
			</pre>

			<h2>내장 프리셋</h2>
			<ul>
				<li><code>today</code> / <code>yesterday</code></li>
				<li><code>last7days</code> / <code>last30days</code></li>
				<li><code>thisWeek</code> / <code>lastWeek</code></li>
				<li><code>thisMonth</code> / <code>lastMonth</code></li>
				<li><code>thisYear</code></li>
			</ul>
		</>
	);
}
