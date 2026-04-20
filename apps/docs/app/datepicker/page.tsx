import { DatePickerDemo, DatePickerWithNavDemo, DatePickerLocaleDemo, DatePickerTimezoneDemo } from './demo';

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

			<h2>Timezone (displayTimezone)</h2>
			<p>
				<code>displayTimezone</code> prop으로 IANA 타임존을 지정하면, 같은 시민 날짜를
				클릭해도 타임존에 맞는 UTC 자정이 저장된다. 서버에서 구동해도 동일한 결과를
				보장한다 (react-datepicker #1018 방지).
			</p>
			<div className="demo" data-testid="timezone-demo">
				<DatePickerTimezoneDemo />
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
