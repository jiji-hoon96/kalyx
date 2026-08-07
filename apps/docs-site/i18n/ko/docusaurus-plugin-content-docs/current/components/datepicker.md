---
id: datepicker
title: DatePicker
sidebar_position: 1
---

import StackBlitzEmbed from '@site/src/components/StackBlitzEmbed';

# DatePicker

input, trigger, popover, 캘린더 그리드로 이뤄진 단일 날짜 선택.

<figure>
  <img src="/img/demos/datepicker.avif" alt="DatePicker 데모: popover를 열고 날짜를 선택" width="640" loading="lazy" />
  <figcaption><em>화면의 스타일은 데모용입니다 — Kalyx는 CSS를 전혀 포함하지 않습니다.</em></figcaption>
</figure>

```tsx
import { DatePicker } from '@kalyx/react';
```

## 기본 사용

```tsx
import { useState } from 'react';
import { DatePicker, type ISODateString } from '@kalyx/react';

function Example() {
  const [date, setDate] = useState<ISODateString | null>(null);
  return (
    <DatePicker value={date} onChange={setDate}>
      <DatePicker.Input placeholder="YYYY-MM-DD" />
      <DatePicker.Trigger />
      <DatePicker.Popover>
        <DatePicker.Calendar />
      </DatePicker.Popover>
    </DatePicker>
  );
}
```

## 직접 사용해보기

<StackBlitzEmbed id="datepicker-basic" />

## `<DatePicker>` (Root)

상태를 보관하고 서브 컴포넌트에 컨텍스트를 제공합니다. `value` 제공 시 제어형, `defaultValue`만 제공 시 비제어형.

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `value` | `ISODateString \| null` | — | 제어형 선택 날짜. |
| `defaultValue` | `ISODateString` | — | 비제어형 초기값. `value` 있으면 무시. |
| `onChange` | `(value: ISODateString \| null) => void` | — | 선택 또는 초기화 시 호출. |
| `disabled` | `DisabledRule[] \| boolean` | `false` | 특정 날짜 비활성화 또는 전체 비활성. |
| `readOnly` | `boolean` | `false` | 변경 방지, 표시용으로 선택 가능. |
| `weekStartsOn` | `0 \| 1` | `0` | `0` = 일요일, `1` = 월요일. |
| `displayFormat` | `string` | `'yyyy-MM-dd'` | date-fns 포맷 문자열. |
| `locale` | `string` | `'en-US'` | BCP 47 로케일 태그. |
| `dir` | `'ltr' \| 'rtl'` | `'ltr'` | 레이아웃 방향. `'rtl'`이면 캘린더 그리드에 `dir="rtl"`이 붙고 ArrowLeft/ArrowRight가 시각적 레이아웃을 따르도록 반전된다(WAI-ARIA grid 패턴). ArrowUp/Down, PageUp/Down, Home/End는 논리적 방향을 유지한다. [국제화](../concepts/internationalization.md#오른쪽-왼쪽-rtl) 참고. |
| `adapter` | `DateAdapter` | `DateFnsAdapter` | 커스텀 날짜 어댑터. |
| `children` | `ReactNode` | — | 서브 컴포넌트. |

### `DisabledRule`

```ts
type DisabledRule =
  | { date: ISODateString }        // 특정 일자
  | { before: ISODateString }       // 그 이전 모든 날짜
  | { after: ISODateString }        // 그 이후 모든 날짜
  | { dayOfWeek: number[] };        // 0 = 일 … 6 = 토
```

주말과 오늘 이전 모든 날짜 비활성화:

```tsx
<DatePicker
  value={iso}
  onChange={setIso}
  disabled={[{ dayOfWeek: [0, 6] }, { before: new Date().toISOString() }]}
/>
```

## `<DatePicker.Input>`

`<input role="combobox">`를 렌더합니다. blur/Enter에서 타이핑된 날짜를 파싱합니다. `value`, `onChange`, `type`을 제외한 모든 표준 input 속성을 확장합니다.

| Prop | 타입 | 설명 |
| --- | --- | --- |
| `format` | `string` | Root의 `displayFormat` 오버라이드. |

내부 `<input>`으로 `ref`가 전달됩니다.

## `<DatePicker.Trigger>`

popover를 토글하는 버튼. `children`이 없으면 기본 캘린더 아이콘을 렌더합니다. `type`을 제외한 모든 표준 버튼 속성을 확장합니다.

| Prop | 타입 | 설명 |
| --- | --- | --- |
| `children` | `ReactNode` | 기본 아이콘 오버라이드. |

```tsx
<DatePicker.Trigger aria-label="캘린더 열기">
  📅
</DatePicker.Trigger>
```

## `<DatePicker.Popover>`

Floating UI 위치 계산 포털 (`role="dialog"`, `aria-modal="false"`). 바깥 클릭 해제, Escape 닫기, 포커스 복원을 처리합니다.

`role`을 제외한 표준 `<div>` 속성 확장.

```tsx
<DatePicker.Popover className="rounded-lg border bg-white p-3 shadow-lg">
  <DatePicker.Calendar />
</DatePicker.Popover>
```

## `<DatePicker.Calendar>`

월 그리드. 완전한 키보드 네비게이션 ([접근성](../concepts/accessibility.md) 참조).

| Prop | 타입 | 설명 |
| --- | --- | --- |
| `classNames` | `DatePickerCalendarClassNames` | 내부 슬롯 스타일. |
| `fixedWeeks` | `boolean` (기본 `false`) | 항상 6주 행을 렌더. 지정하지 않으면 4~6행이라 달마다 popover 높이가 바뀐다. |
| `onTitleClick` | `() => void` | 월/연 타이틀 클릭 시 — `MonthGrid`/`YearGrid`와 연결. |

### `classNames` 키

```ts
type DatePickerCalendarClassNames = {
  root?: string;
  header?: string;         // 타이틀 + nav 버튼 감싸기
  title?: string;          // "2026년 4월"
  navButton?: string;      // 이전 / 다음 버튼
  grid?: string;           // <table role="grid">
  gridRow?: string;        // <tr>
  gridCell?: string;       // <td role="gridcell">
  day?: string;            // 날짜 버튼
  daySelected?: string;    // day.isSelected일 때
  dayToday?: string;       // day.isToday일 때
  dayDisabled?: string;    // day.isDisabled일 때
  dayOutsideMonth?: string;// 6주 뷰 패딩
  weekdayHeader?: string;  // "월", "화", …
};
```

## `<DatePicker.MonthGrid>` (선택)

3×4 월 그리드. 월 바로 이동이 필요할 때 mount.

| Prop | 타입 | 설명 |
| --- | --- | --- |
| `classNames` | `DatePickerMonthGridClassNames` | 스타일. |
| `onSelect` | `() => void` | 월 선택 후 호출 — 보통 `Calendar`로 복귀. |
| `onTitleClick` | `() => void` | 연도 타이틀 클릭 — `YearGrid`와 연결. |

```ts
type DatePickerMonthGridClassNames = {
  root?: string;
  header?: string;
  title?: string;
  navButton?: string;
  grid?: string;
  month?: string;
  monthSelected?: string;
  monthCurrent?: string;
};
```

## `<DatePicker.YearGrid>` (선택)

페이지네이션되는 연도 그리드 (12년 단위).

| Prop | 타입 | 설명 |
| --- | --- | --- |
| `classNames` | `DatePickerYearGridClassNames` | 스타일. |
| `onSelect` | `() => void` | 연도 선택 후 호출. |

```ts
type DatePickerYearGridClassNames = {
  root?: string;
  header?: string;
  title?: string;
  navButton?: string;
  grid?: string;
  year?: string;
  yearSelected?: string;
  yearCurrent?: string;
};
```

## 패턴

### 월 / 연도 네비게이션

```tsx
import { useState } from 'react';
import { DatePicker } from '@kalyx/react';

function WithJump() {
  const [view, setView] = useState<'days' | 'months' | 'years'>('days');
  return (
    <DatePicker value={iso} onChange={setIso}>
      <DatePicker.Input />
      <DatePicker.Popover>
        {view === 'days' && (
          <DatePicker.Calendar onTitleClick={() => setView('months')} />
        )}
        {view === 'months' && (
          <DatePicker.MonthGrid
            onSelect={() => setView('days')}
            onTitleClick={() => setView('years')}
          />
        )}
        {view === 'years' && (
          <DatePicker.YearGrid onSelect={() => setView('months')} />
        )}
      </DatePicker.Popover>
    </DatePicker>
  );
}
```

### 비제어 + 폼 제출

```tsx
<form action="/api/save" method="post">
  <DatePicker name="startDate" defaultValue="2026-04-15T00:00:00.000Z">
    <DatePicker.Input name="startDate" />
    <DatePicker.Popover>
      <DatePicker.Calendar />
    </DatePicker.Popover>
  </DatePicker>
  <button type="submit">저장</button>
</form>
```

### 최소 / 최대 날짜

별도의 `minDate`/`maxDate` prop은 없습니다 — 동일한 규칙을 `disabled`로 표현하세요.

```tsx
<DatePicker
  disabled={[
    { before: '2026-01-01T00:00:00.000Z' },
    { after: '2026-12-31T00:00:00.000Z' },
  ]}
  value={iso}
  onChange={setIso}
/>
```

:::caution `disabled` 경계값은 `displayTimezone`과 짝을 맞추세요

`disabled` 규칙은 캘린더 좌표가 아니라 **instant**를 비교합니다. `displayTimezone`을 쓰지 않으면 둘이 같은 것이라 위 예제가 정확합니다.

`displayTimezone`을 켜는 순간, 손으로 쓴 `'2026-01-01T00:00:00.000Z'`는 더 이상 그 존의 civil 1월 1일이 아닙니다 — 음수 UTC offset에서는 현지 기준 아직 12월 31일이고, 큰 양수 offset에서는 현지 자정보다 한참 전에 이미 1월 1일입니다. 그래서 경계일이 규칙의 반대편에 놓일 수 있습니다.

피커가 실제로 내보내는 것과 같은 종류의 값을 넘기세요 — `onChange`로 받은 instant, 또는 `civilMidnightFromUtcDay`로 만든 값입니다.

```tsx
import { civilMidnightFromUtcDay } from '@kalyx/core';

const tz = 'Asia/Seoul';

<DatePicker
  displayTimezone={tz}
  disabled={[{ before: civilMidnightFromUtcDay('2026-01-01T00:00:00.000Z', tz) }]}
  value={iso}
  onChange={setIso}
/>;
```

[`isDateDisabled`](../api/core.md#isdatedisablediso-rules-adapter-timezone)를 직접 호출할 때도 같은 규칙이 적용됩니다. 커스텀 그리드의 셀별 상태는 `getCalendarDays`가 미리 계산해 둔 `isDisabled` 플래그를 쓰세요 — 셀마다 이미 정규화돼 있습니다.

:::

## 관련

- [RangePicker →](./rangepicker.md)
- [useDatePicker →](../hooks/use-date-picker.md)
- [접근성 →](../concepts/accessibility.md)
