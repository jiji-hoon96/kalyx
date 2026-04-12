import { TimePickerDemo } from './demo';

export default function TimePickerPage() {
	return (
		<>
			<h1>TimePicker</h1>
			<p>
				시간을 선택하는 컴포넌트. Ark UI가 "심각한 버그로 사용 불가"라며 공식
				제거했고, react-day-picker는 처음부터 제공하지 않은 영역. Kalyx의 핵심
				차별화 기능.
			</p>

			<h2>예제</h2>
			<div className="demo">
				<TimePickerDemo />
			</div>

			<h2>코드</h2>
			<pre>
				<code>{`import { TimePicker } from '@kalyx/react';
import { useState } from 'react';

function MyForm() {
  const [time, setTime] = useState<string | null>(null);

  return (
    <TimePicker value={time} onChange={setTime} format="24h" step={15}>
      <TimePicker.Input />
      <div style={{ display: 'flex', gap: 8 }}>
        <TimePicker.HourList />
        <TimePicker.MinuteList />
        <TimePicker.AmPmToggle />  {/* format="12h"일 때만 표시 */}
      </div>
    </TimePicker>
  );
}`}</code>
			</pre>

			<h2>특징</h2>
			<ul>
				<li>
					<strong>12/24시간제 자동 전환</strong> — <code>format</code> prop 하나로
				</li>
				<li>
					<strong>분 step 지원</strong> — <code>step={'{15}'}</code> →{' '}
					<code>[0, 15, 30, 45]</code>만 표시
				</li>
				<li>
					<strong>표준 ARIA listbox 패턴</strong> —{' '}
					<code>{'<li role="option">'}</code> 직접 인터랙티브
				</li>
				<li>
					<strong>키보드 완전 지원</strong> — ↑/↓, Home/End, Enter/Space
				</li>
				<li>
					<strong>AmPmToggle radiogroup</strong> — 12h 모드에서 자동 표시
				</li>
			</ul>
		</>
	);
}
