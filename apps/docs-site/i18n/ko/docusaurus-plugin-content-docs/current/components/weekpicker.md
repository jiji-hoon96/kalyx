---
id: weekpicker
title: WeekPicker
sidebar_position: 7
description: '주 피커. 클릭 한 번으로 주 전체가 확정되며, 캘린더 정렬 또는 클릭 기준 주 경계를 고를 수 있습니다.'
---

import StackBlitzEmbed from '@site/src/components/StackBlitzEmbed';

# WeekPicker

주 단위 선택기. 클릭 한 번으로 클릭한 날이 속한 주 전체가 `weekStartsOn` 기준으로 확정된다. 값은 그 7일을 모두 담은 `DateRange` 다.

<figure>
  <img src="/img/demos/weekpicker.avif" alt="WeekPicker 데모: 한 번의 클릭으로 한 주 전체 선택" width="640" loading="lazy" />
  <figcaption><em>화면의 스타일은 데모용입니다. Kalyx는 CSS를 전혀 포함하지 않습니다.</em></figcaption>
</figure>

```tsx
import { WeekPicker, type DateRange } from '@kalyx/react';
```

## 구조

```tsx
<WeekPicker>            {/* Root: value = { start, end } of the week */}
  <WeekPicker.Input part="start" /> {/* week-start combobox input */}
  <WeekPicker.Input part="end" />   {/* week-end combobox input */}
  <WeekPicker.Popover> {/* Floating-UI portal, role="dialog" */}
    <WeekPicker.Calendar /> {/* week-highlighting month grid */}
  </WeekPicker.Popover>
</WeekPicker>
```

`Input` 과 `Popover` 는 `RangePicker` 에서 재노출된 것이다. `WeekPicker.Calendar` 를 한 번 클릭하면 클릭한 날이 속한 주 전체가 (`weekStartsOn` 기준으로) 확정된다.

## 기본 사용

```tsx
import { useState } from 'react';
import { WeekPicker, type DateRange } from '@kalyx/react';

function Example() {
  const [week, setWeek] = useState<DateRange>({ start: null, end: null });
  return (
    <WeekPicker value={week} onChange={setWeek}>
      <WeekPicker.Input part="start" />
      <span>→</span>
      <WeekPicker.Input part="end" />
      <WeekPicker.Popover>
        <WeekPicker.Calendar />
      </WeekPicker.Popover>
    </WeekPicker>
  );
}
```

### 직접 사용해보기

> 라이브 에디터는 `React` 와 Kalyx 컴포넌트 전부가 스코프에 들어간 상태로 실행되므로 `import` 줄을 생략했다. 프로젝트로 옮길 때는 직접 채워 넣는다. 전체 import 는 위의 일반 코드 블록을 참고한다.

```jsx live
function BasicWeekPicker() {
  const [week, setWeek] = React.useState({ start: null, end: null });
  const label = week.start && week.end
    ? `${week.start.slice(0, 10)} → ${week.end.slice(0, 10)}`
    : 'null';
  return (
    <WeekPicker value={week} onChange={setWeek}>
      <div className="kx-live-row">
        <WeekPicker.Input part="start" className="kx-live-input" placeholder="시작" />
        <span aria-hidden>→</span>
        <WeekPicker.Input part="end" className="kx-live-input" placeholder="종료" />
      </div>
      <WeekPicker.Popover className="kx-live-popover">
        <WeekPicker.Calendar
          classNames={{
            header: 'kx-live-header',
            title: 'kx-live-title',
            navButton: 'kx-live-nav',
            grid: 'kx-live-grid',
            gridCell: 'kx-live-cell',
            weekdayHeader: 'kx-live-weekday',
            day: 'kx-live-day-range',
            dayInRange: 'kx-live-inrange',
            dayRangeStart: 'kx-live-range-start',
            dayRangeEnd: 'kx-live-range-end',
            dayToday: 'live-day-today',
            dayOutsideMonth: 'kx-live-outside',
          }}
        />
      </WeekPicker.Popover>
      <div className="kx-live-value">
        선택된 주: <code>{label}</code>
      </div>
    </WeekPicker>
  );
}
```

<StackBlitzEmbed id="datepicker-basic" />

## `<WeekPicker.Calendar>`

`selectionMode` 를 `'week'` 으로 고정한 `RangePicker.Calendar` 다. 따라서
`RangePicker.Calendar` 의 나머지 prop 이 그대로 적용된다.

| Prop | 타입 | 설명 |
| --- | --- | --- |
| `classNames` | `WeekPickerCalendarClassNames` | 스타일 슬롯. |
| `weekAnchor` | `'calendar' \| 'clicked'` (기본 `'calendar'`) | 클릭한 날을 어떤 주로 볼지 정한다. `'calendar'` 는 `weekStartsOn` 경계로 스냅한다(흔히 말하는 "몇째 주"). `'clicked'` 는 클릭한 날에 고정된 7일 구간을 쓰며, 이는 주의 정의 자체가 다르다. |
| `showWeekNumber` | `boolean` (기본 `false`) | 그리드 왼쪽에 ISO 8601 주차 열(1~53)을 렌더한다. |
| `fixedWeeks` | `boolean` (기본 `false`) | 항상 6주 행을 렌더. 지정하지 않으면 4~6행이라 달마다 popover 높이가 바뀐다. |

## weekStartsOn

`weekStartsOn` prop (`RangePicker.Root` 에서 상속)은 주가 어느 요일에 시작하는지를 정한다. `0` 은 일요일, `1` 은 월요일이다. 생략하면 `locale` 에서 추론하고(`en-US` → `0`, `de-DE` → `1`), 명시한 prop 이 항상 우선한다.

```jsx live
function MondayStartWeekPicker() {
  const [week, setWeek] = React.useState({ start: null, end: null });
  const label = week.start && week.end
    ? `${week.start.slice(0, 10)} → ${week.end.slice(0, 10)}`
    : 'null';
  return (
    <WeekPicker value={week} onChange={setWeek} weekStartsOn={1}>
      <div className="kx-live-row">
        <WeekPicker.Input part="start" className="kx-live-input" placeholder="월요일 시작" />
        <span aria-hidden>→</span>
        <WeekPicker.Input part="end" className="kx-live-input" placeholder="일요일 종료" />
      </div>
      <WeekPicker.Popover className="kx-live-popover">
        <WeekPicker.Calendar
          classNames={{
            header: 'kx-live-header',
            title: 'kx-live-title',
            navButton: 'kx-live-nav',
            grid: 'kx-live-grid',
            gridCell: 'kx-live-cell',
            weekdayHeader: 'kx-live-weekday',
            day: 'kx-live-day-range',
            dayInRange: 'kx-live-inrange',
            dayRangeStart: 'kx-live-range-start',
            dayRangeEnd: 'kx-live-range-end',
            dayToday: 'live-day-today',
            dayOutsideMonth: 'kx-live-outside',
          }}
        />
      </WeekPicker.Popover>
      <div className="kx-live-value">
        선택된 주: <code>{label}</code>
      </div>
    </WeekPicker>
  );
}
```

```tsx
<WeekPicker weekStartsOn={1} value={week} onChange={setWeek}>
  <WeekPicker.Input part="start" />
  <WeekPicker.Popover>
    <WeekPicker.Calendar />
  </WeekPicker.Popover>
</WeekPicker>
```

`weekStartsOn={1}` 이면 예컨대 2026년 4월 14일(화요일)을 클릭했을 때 4월 13일(월) → 4월 19일(일) 범위가 확정된다.

## 구성 요소

| 파트 | 출처 | 역할 |
|------|--------|---------|
| `WeekPicker.Root` | `RangePicker.Root` 를 감쌈 | 제어/비제어 `DateRange`, `displayTimezone`, `disabled` 규칙, `dir` (RTL 이면 캘린더 그리드를 미러링) |
| `WeekPicker.Input` | = `RangePicker.Input` | 시작/종료 텍스트 입력 (`part="start" \| "end"`) |
| `WeekPicker.Popover` | = `RangePicker.Popover` | Floating UI 포지셔닝 |
| **`WeekPicker.Calendar`** | `selectionMode="week"` 를 고정해 `RangePicker.Calendar` 를 감쌈 | 클릭 한 번으로 주 전체를 선택 |

`WeekPicker.Calendar` 는 `RangePicker.Calendar` 가 공유하는 `selectionMode="week"` prop 으로 구현돼 있다. 그래서 키보드 내비게이션(화살표 키, Home/End, Page Up/Down)이 `RangePicker` 와 똑같이 동작한다. 포커스된 날에서 Enter 나 Space 를 누르면 그 날이 속한 주 전체가 확정된다.

## 키보드

- **화살표 키.** 포커스된 날을 옮긴다.
- **Home / End.** 현재 포커스된 주의 첫날 / 마지막 날로 이동한다.
- **Page Up / Page Down.** 이전 달 / 다음 달. Shift + Page Up/Down 은 이전 해 / 다음 해.
- **Enter / Space.** 포커스된 날이 속한 주 전체를 확정한다.
- **Escape.** 확정하지 않고 popover 를 닫는다.

## 비활성 규칙

선택 가능한 주를 제한한다. 한 주 안의 하루라도 `DisabledRule` 에 걸리면 그 주 전체가 비활성화된다.

```tsx
<WeekPicker
  value={week}
  onChange={setWeek}
  disabled={[{ before: '2026-04-01T00:00:00.000Z' }]}
>
  <WeekPicker.Input part="start" placeholder="Start" />
  <WeekPicker.Input part="end" placeholder="End" />
  <WeekPicker.Popover>
    <WeekPicker.Calendar />
  </WeekPicker.Popover>
</WeekPicker>
```

## 비제어

```tsx
<WeekPicker defaultValue={{ start: '2026-04-13T00:00:00.000Z', end: '2026-04-19T00:00:00.000Z' }}>
  <WeekPicker.Input part="start" />
  <WeekPicker.Input part="end" />
  <WeekPicker.Popover>
    <WeekPicker.Calendar />
  </WeekPicker.Popover>
</WeekPicker>
```

네이티브 폼 제출에는 시작 또는 종료 입력에 `name`을 지정합니다. 화면용 입력에는
이름을 붙이지 않고, hidden input이 해당 끝점의 UTC-ISO 값을 제출합니다.

## Timezone

`RangePicker.Root` 에서 상속된다. `displayTimezone` 을 설정하면 주의 시작과 끝이 해당 존의 civil 자정으로(UTC-ISO 형태로) 나간다.

## Props

`WeekPicker` Root 는 `RangePicker.Root` 와 같은 prop 을 받는다. 전체 레퍼런스는 [RangePicker](./rangepicker.md) 를 참고한다.

### Calendar classNames

`RangePicker.Calendar` 의 classNames 와 같은 모양이고, 선택된 주의 모든 셀을 스타일링하는 `dayInRange` 수식자가 하나 더 있다.

```tsx
<WeekPicker.Calendar
  classNames={{
    root: '',
    day: '',
    dayInRange: 'bg-blue-100',
    dayRangeStart: 'rounded-l',
    dayRangeEnd: 'rounded-r',
    dayToday: 'font-bold',
    /* ...and all other RangePicker.Calendar classNames */
  }}
/>
```

`WeekPicker.Calendar` 는 `RangePicker.Calendar` 를 감싼 것이므로, 날짜 셀은 똑같이 `data-range-start` / `data-range-end` / `data-in-range` / `data-today` / `data-focused` / `data-outside-month` 속성을 내보낸다. 확정된 주 전체가 start → end 로 이어진다. [스타일링](../concepts/styling.md) 을 참고한다.

## 관련

- [RangePicker →](./rangepicker.md)
- [DatePicker →](./datepicker.md)
- [접근성 →](../concepts/accessibility.md)
