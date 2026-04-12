import { DatePickerDemo } from './demo';

/**
 * DatePicker 페이지 (Server Component).
 * 인터랙티브 데모는 Client Component로 분리.
 */
export default function DatePickerPage() {
	return (
		<>
			<h1>DatePicker</h1>
			<p>단일 날짜를 선택하는 기본 컴포넌트.</p>

			<h2>예제</h2>
			<div className="demo">
				<DatePickerDemo />
			</div>

			<h2>코드</h2>
			<pre>
				<code>{`import { DatePicker } from '@kalyx/react';
import { useState } from 'react';

function MyForm() {
  const [date, setDate] = useState<string | null>(null);

  return (
    <DatePicker value={date} onChange={setDate}>
      <DatePicker.Input className="kalyx-input" />
      <DatePicker.Popover>
        <DatePicker.Calendar />
      </DatePicker.Popover>
    </DatePicker>
  );
}`}</code>
			</pre>

			<h2>특징</h2>
			<ul>
				<li>
					<code>value</code>와 <code>onChange</code>는 항상 ISO 8601 UTC string
				</li>
				<li>
					제어/비제어 모드 모두 지원 (<code>defaultValue</code>)
				</li>
				<li>키보드 내비게이션: ← → ↑ ↓ Home End PageUp PageDown Enter Escape</li>
				<li>
					바깥 클릭 / Escape로 자동 닫기, 날짜 선택 시 자동 닫기
				</li>
			</ul>
		</>
	);
}
