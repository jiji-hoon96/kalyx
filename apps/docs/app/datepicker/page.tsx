import { DatePickerDemo, DatePickerWithNavDemo, DatePickerLocaleDemo } from './demo';

export default function DatePickerPage() {
	return (
		<>
			<h1>DatePicker</h1>
			<p>단일 날짜를 선택하는 기본 컴포넌트.</p>

			<h2>기본 예제</h2>
			<div className="demo">
				<DatePickerDemo />
			</div>

			<h2>Month/Year 빠른 네비게이션</h2>
			<p>
				타이틀을 클릭하면 MonthGrid → YearGrid로 드릴다운하여 먼 날짜로 빠르게
				이동할 수 있다.
			</p>
			<div className="demo">
				<DatePickerWithNavDemo />
			</div>

			<h2>다국어 (Locale)</h2>
			<p>
				<code>locale</code> prop으로 월 이름, 요일 이름이 자동으로 현지화된다.
				Intl.DateTimeFormat 내장 API를 사용하므로 추가 의존성 없음.
			</p>
			<div className="demo">
				<DatePickerLocaleDemo />
			</div>

			<h2>코드</h2>
			<pre>
				<code>{`// 기본
<DatePicker value={date} onChange={setDate}>
  <DatePicker.Input />
  <DatePicker.Popover>
    <DatePicker.Calendar />
  </DatePicker.Popover>
</DatePicker>

// Month/Year 네비게이션
<DatePicker.Calendar onTitleClick={() => setView('months')} />
<DatePicker.MonthGrid onSelect={() => setView('days')}
                      onTitleClick={() => setView('years')} />
<DatePicker.YearGrid onSelect={() => setView('months')} />

// 다국어
<DatePicker locale="ko-KR" ...>
<DatePicker locale="ja-JP" ...>`}</code>
			</pre>
		</>
	);
}
