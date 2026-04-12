import { RangePickerDemo } from './demo';

export default function RangePickerPage() {
	return (
		<>
			<h1>RangePicker</h1>
			<p>날짜 범위를 선택하는 컴포넌트.</p>

			<h2>예제</h2>
			<div className="demo">
				<RangePickerDemo />
			</div>

			<h2>코드</h2>
			<pre>
				<code>{`import { RangePicker } from '@kalyx/react';
import { useState } from 'react';

function MyForm() {
  const [range, setRange] = useState({ start: null, end: null });

  return (
    <RangePicker value={range} onChange={setRange}>
      <RangePicker.Input part="start" className="kalyx-input" />
      <RangePicker.Input part="end" className="kalyx-input" />
      <RangePicker.Popover>
        <RangePicker.Calendar />
      </RangePicker.Popover>
    </RangePicker>
  );
}`}</code>
			</pre>

			<h2>특징</h2>
			<ul>
				<li>
					<strong>자동 swap</strong> — 종료일이 시작일보다 이전이면 자동 정렬
				</li>
				<li>
					<strong>hover 미리보기</strong> — 시작일 선택 후 마우스 hover로 범위 시각화
				</li>
				<li>
					<strong>자동 단계 진행</strong> — 첫 클릭=시작일, 두 번째 클릭=종료일
				</li>
				<li>
					<code>data-range-start</code>, <code>data-range-end</code>,{' '}
					<code>data-in-range</code> 속성으로 스타일링
				</li>
			</ul>
		</>
	);
}
