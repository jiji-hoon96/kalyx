import { DateTimePickerDemo } from './demo';

export default function DateTimePickerPage() {
	return (
		<>
			<h1>DateTimePicker</h1>
			<p>
				날짜와 시간을 함께 선택하는 통합 컴포넌트. Context Bridging 패턴으로
				기존 Calendar + TimePicker를 100% 재사용하며, 코드 추가는 0.44KB에
				불과.
			</p>

			<h2>예제</h2>
			<div className="demo">
				<DateTimePickerDemo />
			</div>

			<h2>코드</h2>
			<pre>
				<code>{`import { DateTimePicker } from '@kalyx/react';
import { useState } from 'react';

function MyForm() {
  const [dt, setDt] = useState<string | null>(null);

  return (
    <DateTimePicker value={dt} onChange={setDt} format="24h" step={15}>
      <DateTimePicker.Input />
      <DateTimePicker.Popover>
        <DateTimePicker.Calendar />
        <div style={{ display: 'flex', gap: 8 }}>
          <DateTimePicker.HourList />
          <DateTimePicker.MinuteList />
        </div>
      </DateTimePicker.Popover>
    </DateTimePicker>
  );
}`}</code>
			</pre>

			<h2>핵심 동작</h2>
			<ul>
				<li>
					<strong>날짜 클릭 → 날짜만 변경, 시간 보존</strong> — 14:30 선택 후
					다른 날짜 클릭해도 시간은 14:30 유지
				</li>
				<li>
					<strong>시간 변경 → 시간만 변경, 날짜 보존</strong> — 같은 날짜에서
					시간만 갱신
				</li>
				<li>
					<strong>날짜 선택 후에도 팝오버 유지</strong> — DatePicker와 달리 시간
					선택이 가능하도록 팝오버를 닫지 않음
				</li>
				<li>
					<strong>Escape / 바깥 클릭</strong> — 확정하고 닫기
				</li>
			</ul>

			<h2>아키텍처: Context Bridging</h2>
			<p>
				DateTimePicker.Root는 내부적으로 <strong>DatePickerContext</strong>와{' '}
				<strong>TimePickerContext</strong>를 동시에 제공하여, 기존 Calendar과
				TimePicker 컴포넌트를 그대로 재사용한다. 하나의 ISO datetime이 source of
				truth.
			</p>
		</>
	);
}
