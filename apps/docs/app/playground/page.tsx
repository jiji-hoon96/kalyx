import { PlaygroundClient } from './PlaygroundClient';

/**
 * Playground — admin-facing test surface that exercises every component
 * `@kalyx/react` ships with under one set of shared, live-editable controls
 * (locale, displayTimezone, weekStartsOn, 12h/24h, minute step, disabled rules).
 *
 * The page is a thin RSC shell; all interactivity lives in `PlaygroundClient`.
 */
export default function PlaygroundPage() {
	return (
		<>
			<h1>Playground</h1>
			<p>
				라이브러리가 지원하는 7개 컴포넌트(DatePicker · RangePicker · TimePicker ·
				DateTimePicker · MonthPicker · YearPicker · WeekPicker)를 한 화면에서
				테스트할 수 있는 페이지. 상단 컨트롤로 <code>locale</code>,{' '}
				<code>displayTimezone</code>, <code>weekStartsOn</code>, 시간 포맷,
				<code>step</code>, <code>disabled</code> 등을 일괄 적용한다.
			</p>
			<PlaygroundClient />
		</>
	);
}
