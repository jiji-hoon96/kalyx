/**
 * 홈 페이지 (Server Component) — Kalyx 라이브러리 소개
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
				2026년 React 생태계의 DatePicker는 두 극단만 존재한다:{' '}
				<strong>Headless지만 Calendar Grid만 제공하는 react-day-picker</strong>
				와, <strong>통합됐지만 CSS 필수 import에 timezone 버그가 만성인 react-datepicker</strong>.
				Kalyx는 이 빈자리를 채운다 — Headless, Composition API, 통합된 7개
				picker (Date/Range/Time/DateTime/Month/Year/Week), SSR 안전, ~12 KB (≤ 13 KB).
			</p>

			<h2>핵심 특징</h2>
			<ul>
				<li>
					<strong>Zero CSS</strong> — Headless. classNames prop과 data-* 속성으로
					자유롭게 스타일링.
				</li>
				<li>
					<strong>Composition API</strong> —{' '}
					<code>{'<DatePicker.Calendar />'}</code> 등 서브 컴포넌트 조합 (Props
					폭발 방지).
				</li>
				<li>
					<strong>SSR 안전</strong> — Next.js App Router 검증. 이 페이지가 그
					증거.
				</li>
				<li>
					<strong>ISO 8601 UTC string</strong> — native Date 객체 금지. timezone
					버그 구조적 방지.
				</li>
				<li>
					<strong>WAI-ARIA 준수</strong> — combobox, dialog, grid, listbox,
					radiogroup. axe 검사 통과.
				</li>
				<li>
					<strong>7개 picker 통합</strong> — DatePicker, RangePicker, TimePicker,
					DateTimePicker, MonthPicker, YearPicker, WeekPicker.
				</li>
				<li>
					<strong>이벤트 API</strong> — <code>onOpenChange</code>,{' '}
					<code>onCalendarNavigate</code>로 팝오버·월 이동 감지.
				</li>
				<li>
					<strong>Presets 지원</strong> — <code>DatePicker.Presets</code>,{' '}
					<code>RangePicker.Presets</code>로 원클릭 빠른 선택.
				</li>
				<li>
					<strong>{'≤ 13KB gzip'}</strong> — 현재 12.27KB (7개 picker 전체).
					react-datepicker (40-60KB) 대비 1/4 이상 가벼움.
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
				Next.js App Router 환경에서 SSR로 렌더링된다.
			</p>
		</>
	);
}
