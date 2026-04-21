import { YearPickerDemo } from './demo';

export default function YearPickerPage() {
	return (
		<>
			<h1>YearPicker</h1>
			<p>
				연도 단위 선택. 값은 해당 연도의 1월 1일(UTC-ISO)로 저장된다 — 예:{' '}
				<code>&quot;2026-01-01T00:00:00.000Z&quot;</code>. 12년 단위 decade 그리드로
				먼 연도까지 빠르게 이동 가능.
			</p>

			<h2>기본 예제</h2>
			<p>
				<code>displayFormat</code>의 기본값은 <code>&quot;yyyy&quot;</code>. 연도 클릭
				시 해당 연도의 1월 1일이 저장된다.
			</p>
			<div className="demo">
				<YearPickerDemo />
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
						<td>선택된 연도의 1월 1일 (controlled)</td>
					</tr>
					<tr>
						<td><code>onChange</code></td>
						<td><code>(value) =&gt; void</code></td>
						<td>연도 선택 시 호출</td>
					</tr>
					<tr>
						<td><code>displayTimezone</code></td>
						<td><code>string</code></td>
						<td>IANA 타임존 — 타임존-인식 연도 하이라이팅</td>
					</tr>
				</tbody>
			</table>
		</>
	);
}
