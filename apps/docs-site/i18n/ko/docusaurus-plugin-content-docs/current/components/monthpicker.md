---
id: monthpicker
title: MonthPicker
sidebar_position: 5
description: '3x4 월 그리드와 YYYY-MM 입력을 갖춘 월 단위 피커.'
---

import StackBlitzEmbed from '@site/src/components/StackBlitzEmbed';

# MonthPicker

월 선택기. 값은 선택한 달의 첫날을 UTC-ISO 형식으로 나타낸 것입니다. 예를 들어 2026년 4월을 고르면 `"2026-04-01T00:00:00.000Z"` 가 됩니다.

<figure>
  <img src="/img/demos/monthpicker.avif" alt="MonthPicker 데모: 12개월 그리드에서 월 선택" width="640" loading="lazy" />
  <figcaption><em>화면의 스타일은 데모용입니다 — Kalyx는 CSS를 전혀 포함하지 않습니다.</em></figcaption>
</figure>

```tsx
import { MonthPicker } from '@kalyx/react';
```

## 구조

```tsx
<MonthPicker>            {/* Root — value = first day of month, UTC */}
  <MonthPicker.Input /> {/* combobox <input>, parses "YYYY-MM" */}
  <MonthPicker.Trigger /> {/* button that toggles the popover */}
  <MonthPicker.Popover> {/* Floating-UI portal, role="dialog" */}
    <MonthPicker.Grid /> {/* 3×4 grid of months, role="grid" */}
  </MonthPicker.Popover>
</MonthPicker>
```

`Input` 과 `Trigger` 는 `DatePicker` 에서 재노출된 것이고 `MonthPicker` 컨텍스트를 읽는다.

## 기본 사용

```tsx
import { useState } from 'react';
import { MonthPicker, type ISODateString } from '@kalyx/react';

function Example() {
  const [month, setMonth] = useState<ISODateString | null>(null);
  return (
    <MonthPicker value={month} onChange={setMonth}>
      <MonthPicker.Input placeholder="YYYY-MM" />
      <MonthPicker.Popover>
        <MonthPicker.Grid />
      </MonthPicker.Popover>
    </MonthPicker>
  );
}
```

`displayFormat` 의 기본값은 `"yyyy-MM"` 입니다. 다른 표기를 쓰고 싶다면 재정의하세요(예: `"April 2026"` 처럼 보이려면 `"MMMM yyyy"`).

## 직접 사용해보기

<StackBlitzEmbed id="datepicker-basic" />

## 구성 요소

`MonthPicker` 는 그리드를 뺀 나머지를 전부 `DatePicker` 의 구성 요소로 재사용합니다.

| 파트 | 출처 | 역할 |
|------|--------|---------|
| `MonthPicker.Root` | `DatePicker.Root` 를 감쌈 | 제어/비제어 상태, `displayTimezone`, `disabled` 규칙, `dir`(RTL 이면 월 그리드를 미러링) |
| `MonthPicker.Input` | = `DatePicker.Input` | 텍스트 입력(combobox role) |
| `MonthPicker.Trigger` | = `DatePicker.Trigger` | 아이콘 버튼 |
| `MonthPicker.Popover` | = `DatePicker.Popover` | Floating UI 포지셔닝 |
| **`MonthPicker.Grid`** | 신규 | 이전/다음 연도 내비게이션이 있는 12개월 그리드 |

## Timezone

`displayTimezone` 을 설정하면, 커밋되는 값은 그 존에서 선택한 달 첫날의 civil 자정(UTC-ISO 형식)입니다. 그리드 하이라이트도 이 타임존을 따르므로, 존에 맞춰 보정된 UTC string 으로 저장돼 있어도 올바른 달이 선택 상태로 남습니다.

```tsx
<MonthPicker value={month} onChange={setMonth} displayTimezone="Asia/Seoul">
  <MonthPicker.Input />
  <MonthPicker.Popover>
    <MonthPicker.Grid />
  </MonthPicker.Popover>
</MonthPicker>
```

## Locale

월 이름은 `locale` prop(BCP 47)을 따릅니다. 내장 `getMonthName` 헬퍼가 `Intl.DateTimeFormat` 을 쓰기 때문에, JS 런타임이 지원하는 로케일이라면 추가 의존성 없이 그대로 동작합니다.

```tsx
<MonthPicker locale="ko-KR">
  <MonthPicker.Input />
  <MonthPicker.Popover>
    <MonthPicker.Grid />
  </MonthPicker.Popover>
</MonthPicker>
```

## 비활성화 규칙

`DatePicker`와 같은 `DisabledRule` 문법으로 선택 가능한 월을 제한합니다. 규칙이 그 달의 모든 날짜를 제외할 때만 월 전체가 비활성화됩니다. 첫날 하나만 막는 규칙은 나머지 날짜까지 비활성화하지 않습니다.

```tsx
<MonthPicker
  value={month}
  onChange={setMonth}
  disabled={[
    { before: '2026-01-01T00:00:00.000Z' },
    { after: '2026-12-31T00:00:00.000Z' },
  ]}
>
  <MonthPicker.Input placeholder="2026 only" />
  <MonthPicker.Popover>
    <MonthPicker.Grid />
  </MonthPicker.Popover>
</MonthPicker>
```

## 비제어

React 상태가 필요 없는 단순한 폼에서는 이렇게 씁니다.

```tsx
<MonthPicker defaultValue="2026-04-01T00:00:00.000Z">
  <MonthPicker.Input name="billingMonth" />
  <MonthPicker.Popover>
    <MonthPicker.Grid />
  </MonthPicker.Popover>
</MonthPicker>
```

`MonthPicker.Input`은 `DatePicker.Input`의 네이티브 폼 계약을 그대로 상속합니다.
`name`을 넘기면 월 시작 UTC ISO 값을 담은 hidden input이 렌더링되며, 화면에 보이는
포맷된 입력값은 그 이름으로 제출되지 않습니다.

## 이벤트 콜백

| Prop | 시그니처 | 호출 시점 |
| --- | --- | --- |
| `onChange` | `(value: ISODateString \| null) => void` | 월이 확정될 때(클릭 또는 입력 타이핑). |
| `onOpenChange` | `(isOpen: boolean) => void` | popover 가 열리거나 닫힐 때. |
| `onCalendarNavigate` | `(viewMonth: ISODateString) => void` | 그리드가 다른 연도로 이동할 때. |

## Props

`MonthPicker` Root 는 `DatePicker.Root` 와 같은 prop 을 받습니다. 유일한 차이는 `displayFormat` 의 기본값뿐이고, `disabled`, `readOnly`, `weekStartsOn`, `locale`, `displayTimezone`, `labels`, `adapter`, `onOpenChange`, `onCalendarNavigate` 는 전부 동일하게 동작합니다. 전체 레퍼런스는 [DatePicker](./datepicker.md) 를 참고하세요.

### Grid classNames

```tsx
<MonthPicker.Grid
  classNames={{
    root: '',
    header: '',
    title: '',
    navButton: '',
    grid: '',
    gridRow: '',
    month: '',
    monthSelected: '',
    monthCurrent: '',
    monthDisabled: '',
  }}
/>
```

## 관련

- [DatePicker →](./datepicker.md)
- [YearPicker →](./yearpicker.md)
- [Timezone →](../concepts/timezone.md)
