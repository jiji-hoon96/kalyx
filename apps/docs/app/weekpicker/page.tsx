import { WeekPickerDemo, WeekPickerMondayDemo } from './demo';

export default function WeekPickerPage() {
	return (
		<>
			<h1>WeekPicker</h1>
			<p>
				주 단위 선택. 한 번의 클릭으로 해당 주 전체(7일)가 범위로 선택된다. 값은{' '}
				<code>DateRange</code> (<code>start</code>/<code>end</code>).
			</p>

			<h2>기본 예제 (일요일 시작)</h2>
			<p>
				아무 날짜나 클릭하면 그 날이 포함된 주의 일요일 ~ 토요일이 선택된다.
			</p>
			<div className="demo">
				<WeekPickerDemo />
			</div>

			<h2>월요일 시작 (weekStartsOn=1)</h2>
			<p>
				유럽/아시아권 주 시작 관례. <code>weekStartsOn=1</code>로 변경하면
				월요일~일요일이 하나의 주로 묶인다.
			</p>
			<div className="demo">
				<WeekPickerMondayDemo />
			</div>

			<h2>구성 요소</h2>
			<ul>
				<li>
					<code>WeekPicker.Root</code> — RangePicker.Root 재사용
				</li>
				<li>
					<code>WeekPicker.Input</code> — RangePicker.Input 재사용 (
					<code>part=&quot;start&quot; | &quot;end&quot;</code>)
				</li>
				<li>
					<code>WeekPicker.Popover</code> — RangePicker.Popover 재사용
				</li>
				<li>
					<code>WeekPicker.Calendar</code> — 단일 클릭으로 주 전체 커밋 (
					<code>selectionMode=&quot;week&quot;</code>)
				</li>
			</ul>
		</>
	);
}
