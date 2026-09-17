/**
 * 홈 페이지 (Server Component). Kalyx 라이브러리 소개
 *
 * "use client" 없이 순수 SSR로 렌더링된다.
 */
export default function HomePage() {
	return (
		<>
			<h1>Kalyx</h1>
			<p>
				CSS 없이 설치 즉시 동작하고, 어떤 스타일링 방식으로도 자유롭게
				커스터마이징 가능한 React DatePicker.
			</p>

			<h2>왜 Kalyx인가</h2>
			<p>
				Headless, Composition API, 7개 picker
				(Date/Range/Time/DateTime/Month/Year/Week)를 한 패키지로 제공한다. 값은
				ISO 8601 UTC string 하나로 주고받고, TimePicker 는 시·분 목록(listbox)으로
				고르며, 월·연·주 단위 피커가 따로 있다.
			</p>

			<h2>핵심 특징</h2>
			<ul>
				<li>
					<strong>Zero CSS</strong>: Headless. classNames prop과 data-* 속성으로
					자유롭게 스타일링.
				</li>
				<li>
					<strong>Composition API</strong>:{' '}
					<code>{'<DatePicker.Calendar />'}</code> 등 서브 컴포넌트 조합 (Props
					폭발 방지).
				</li>
				<li>
					<strong>SSR 안전</strong>: 모든 picker 에 <code>renderToString</code>{' '}
					테스트가 있다. 이 데모 앱도 Next.js App Router 정적 export 로 빌드된다.
				</li>
				<li>
					<strong>ISO 8601 UTC string</strong>: native Date 객체를 값으로 쓰지 않는다.
					timezone 에 따른 날짜 밀림을 값 모델에서 막는다.
				</li>
				<li>
					<strong>WAI-ARIA 패턴</strong>: combobox, dialog, grid, listbox,
					radiogroup. 컴포넌트마다 jest-axe 테스트가 있다.
				</li>
				<li>
					<strong>7개 picker 통합</strong>: DatePicker, RangePicker, TimePicker,
					DateTimePicker, MonthPicker, YearPicker, WeekPicker.
				</li>
				<li>
					<strong>이벤트 API</strong>: <code>onOpenChange</code>,{' '}
					<code>onCalendarNavigate</code>로 팝오버·월 이동 감지.
				</li>
				<li>
					<strong>Presets 지원</strong>: <code>DatePicker.Presets</code>,{' '}
					<code>RangePicker.Presets</code>로 원클릭 빠른 선택.
				</li>
				<li>
					<strong>번들 크기</strong>: 의존성 포함·React 제외·gzip 기준 DatePicker 하나
					약 19 KB, 7종과 훅 전체 약 26 KB (<code>pnpm check-tree-shaking</code>).
					배포 파일 <code>dist/index.js</code> 는 CI 가 gzip 20 KB 이하로 막는다{' '}
					(<code>pnpm check-bundle</code>).
				</li>
			</ul>

			<h2>설치</h2>
			<pre>
				<code>{'pnpm add @kalyx/react'}</code>
			</pre>

			<h2>빠른 시작</h2>
			<pre>
				<code>{`import { DatePicker } from '@kalyx/react';

function MyForm() {
  const [date, setDate] = useState(null);

  return (
    <DatePicker value={date} onChange={setDate}>
      <DatePicker.Input />
      <DatePicker.Popover>
        <DatePicker.Calendar />
      </DatePicker.Popover>
    </DatePicker>
  );
}`}</code>
			</pre>

			<p>
				왼쪽 메뉴에서 7개 picker의 실제 동작 예제를 볼 수 있다. 모든 페이지는
				Next.js App Router 정적 export 로 빌드 시점에 미리 렌더링된다.
			</p>
		</>
	);
}
