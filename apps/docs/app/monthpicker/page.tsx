import { MonthPickerDemo, MonthPickerLocaleDemo } from './demo';

export default function MonthPickerPage() {
	return (
		<>
			<h1>MonthPicker</h1>
			<p>
				월 단위 선택. 값은 해당 월의 첫 일(UTC-ISO)로 저장된다 — 예:{' '}
				<code>&quot;2026-04-01T00:00:00.000Z&quot;</code>. 내부적으로 DatePicker 인프라를
				재사용하고 새 primitive는 <code>MonthPicker.Grid</code> 하나뿐.
			</p>

			<h2>기본 예제</h2>
			<p>
				<code>displayFormat</code>의 기본값은 <code>&quot;yyyy-MM&quot;</code>. 클릭으로
				월을 선택하면 해당 월의 첫 일이 저장되고 팝오버가 닫힌다.
			</p>
			<div className="demo">
				<MonthPickerDemo />
			</div>

			<h2>다국어 지원</h2>
			<p>
				<code>locale</code>로 월 이름이 자동 현지화된다 (Intl.DateTimeFormat 기반).
			</p>
			<div className="demo">
				<MonthPickerLocaleDemo />
			</div>

			<h2>API 요약</h2>
			<table className="api-table">
				<thead>
					<tr>
						<th>Prop</th>
						<th>타입</th>
						<th>설명</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td><code>value</code></td>
						<td><code>ISODateString | null</code></td>
						<td>선택된 월의 첫 일 (controlled)</td>
					</tr>
					<tr>
						<td><code>defaultValue</code></td>
						<td><code>ISODateString</code></td>
						<td>초기값 (uncontrolled)</td>
					</tr>
					<tr>
						<td><code>onChange</code></td>
						<td><code>(value) =&gt; void</code></td>
						<td>월 선택 시 호출</td>
					</tr>
					<tr>
						<td><code>displayTimezone</code></td>
						<td><code>string</code></td>
						<td>IANA 타임존. 해당 존의 civil midnight로 저장</td>
					</tr>
					<tr>
						<td><code>locale</code></td>
						<td><code>string</code></td>
						<td>BCP 47 로케일 (기본 <code>&quot;en-US&quot;</code>)</td>
					</tr>
				</tbody>
			</table>
		</>
	);
}
