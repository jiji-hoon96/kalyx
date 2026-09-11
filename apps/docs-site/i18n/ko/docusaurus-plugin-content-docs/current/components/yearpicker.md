---
id: yearpicker
title: YearPicker
sidebar_position: 6
description: '페이지네이션되는 연도 그리드와 YYYY 입력을 갖춘 연도 단위 피커.'
---

import StackBlitzEmbed from '@site/src/components/StackBlitzEmbed';

# YearPicker

연도 선택기입니다. 값은 선택한 연도의 1월 1일을 UTC-ISO 형식으로 나타냅니다. 예를 들어 2026을 고르면 `"2026-01-01T00:00:00.000Z"` 가 됩니다.

<figure>
  <img src="/img/demos/yearpicker.avif" alt="YearPicker 데모: 10년 그리드에서 연도 선택" width="640" loading="lazy" />
  <figcaption><em>화면의 스타일은 데모용입니다 — Kalyx는 CSS를 전혀 포함하지 않습니다.</em></figcaption>
</figure>

```tsx
import { YearPicker } from '@kalyx/react';
```

## 구조

```tsx
<YearPicker>            {/* Root — value = Jan 1 of the year, UTC */}
  <YearPicker.Input /> {/* combobox <input>, parses "YYYY" */}
  <YearPicker.Trigger /> {/* button that toggles the popover */}
  <YearPicker.Popover> {/* Floating-UI portal, role="dialog" */}
    <YearPicker.Grid /> {/* paginated grid of years, role="grid" */}
  </YearPicker.Popover>
</YearPicker>
```

`Input` 과 `Trigger` 는 `DatePicker` 에서 재노출된 것이고 `YearPicker` 컨텍스트를 읽는다.

## 기본 사용

```tsx
import { useState } from 'react';
import { YearPicker, type ISODateString } from '@kalyx/react';

function Example() {
  const [year, setYear] = useState<ISODateString | null>(null);
  return (
    <YearPicker value={year} onChange={setYear}>
      <YearPicker.Input placeholder="YYYY" />
      <YearPicker.Popover>
        <YearPicker.Grid />
      </YearPicker.Popover>
    </YearPicker>
  );
}
```

기본 `displayFormat` 은 `"yyyy"` 입니다.

### 직접 사용해보기

> 라이브 에디터에는 `React` 와 모든 Kalyx 컴포넌트가 이미 스코프에 들어 있어서 `import` 줄을 생략했습니다. 여러분의 프로젝트로 옮길 때는 직접 넣으세요. 전체 import 는 위의 일반 코드 블록에 있습니다.

```jsx live
function BasicYearPicker() {
  const [year, setYear] = React.useState(null);
  const headerCls = {
    header: 'kx-live-header',
    title: 'kx-live-title',
    navButton: 'kx-live-nav',
  };
  return (
    <YearPicker value={year} onChange={setYear}>
      <div className="kx-live-row">
        <YearPicker.Input className="kx-live-input" placeholder="YYYY" />
        <YearPicker.Trigger className="kx-live-trigger" aria-label="연도 선택기 열기" />
      </div>
      <YearPicker.Popover className="kx-live-popover">
        <YearPicker.Grid
          classNames={{
            ...headerCls,
            grid: 'kx-live-year-grid',
            year: 'kx-live-my-cell',
            yearSelected: 'kx-live-my-selected',
            yearCurrent: 'kx-live-my-current',
          }}
        />
      </YearPicker.Popover>
      <div className="kx-live-value">
        선택됨: <code>{year ?? 'null'}</code>
      </div>
    </YearPicker>
  );
}
```

<StackBlitzEmbed id="datepicker-basic" />

## 구성 요소

| 파트 | 출처 | 역할 |
|------|--------|---------|
| `YearPicker.Root` | `DatePicker.Root` 를 감쌈 | 제어형/비제어형 상태, `displayTimezone`, `disabled` 규칙, `dir`(RTL 이면 연도 그리드를 미러링) |
| `YearPicker.Input` | = `DatePicker.Input` | 텍스트 입력(combobox role) |
| `YearPicker.Trigger` | = `DatePicker.Trigger` | 아이콘 버튼 |
| `YearPicker.Popover` | = `DatePicker.Popover` | Floating UI 포지셔닝 |
| **`YearPicker.Grid`** | 신규 | 이전/다음 10년 내비게이션이 있는 12년 그리드 |

그리드는 현재 연도가 속한 10년 블록을 표시합니다(값이 2026이면 2016~2027). 헤더 버튼으로 12년씩 이동합니다.

## Timezone

`displayTimezone` 을 설정하면 연도 하이라이트가 timezone 을 인식합니다. 저장된 UTC-ISO 가 UTC 가 아닌 존의 civil 자정을 나타내도록 이동된 경우에 이 차이가 드러납니다.

```tsx
<YearPicker value={year} onChange={setYear} displayTimezone="America/New_York">
  <YearPicker.Input />
  <YearPicker.Popover>
    <YearPicker.Grid />
  </YearPicker.Popover>
</YearPicker>
```

## 비활성화 규칙

규칙이 해당 연도의 모든 날짜를 제외할 때만 연도 전체가 비활성화됩니다. 1월 1일 하나만 막는 규칙은 나머지 날짜까지 비활성화하지 않습니다.

```jsx live
function DisabledYearPicker() {
  const [year, setYear] = React.useState(null);
  const headerCls = {
    header: 'kx-live-header',
    title: 'kx-live-title',
    navButton: 'kx-live-nav',
  };
  return (
    <YearPicker
      value={year}
      onChange={setYear}
      disabled={[
        { before: '2020-01-01T00:00:00.000Z' },
        { after: '2030-01-01T00:00:00.000Z' },
      ]}
    >
      <div className="kx-live-row">
        <YearPicker.Input className="kx-live-input" placeholder="2020–2030" />
        <YearPicker.Trigger className="kx-live-trigger" aria-label="연도 선택기 열기" />
      </div>
      <YearPicker.Popover className="kx-live-popover">
        <YearPicker.Grid
          classNames={{
            ...headerCls,
            grid: 'kx-live-year-grid',
            year: 'kx-live-my-cell',
            yearSelected: 'kx-live-my-selected',
            yearCurrent: 'kx-live-my-current',
            yearDisabled: 'kx-live-disabled',
          }}
        />
      </YearPicker.Popover>
      <div className="kx-live-value">
        선택됨: <code>{year ?? 'null'}</code>
      </div>
    </YearPicker>
  );
}
```

```tsx
<YearPicker
  value={year}
  onChange={setYear}
  disabled={[
    { before: '2020-01-01T00:00:00.000Z' },
    { after: '2030-01-01T00:00:00.000Z' },
  ]}
>
  <YearPicker.Input placeholder="2020–2030" />
  <YearPicker.Popover>
    <YearPicker.Grid />
  </YearPicker.Popover>
</YearPicker>
```

## 비제어

```tsx
<YearPicker defaultValue="2026-01-01T00:00:00.000Z">
  <YearPicker.Input name="fiscalYear" />
  <YearPicker.Popover>
    <YearPicker.Grid />
  </YearPicker.Popover>
</YearPicker>
```

`YearPicker.Input`은 `DatePicker.Input`의 네이티브 폼 계약을 그대로 상속합니다.
`name`을 넘기면 연도 시작 UTC ISO 값을 담은 hidden input이 렌더링되며, 화면에 보이는
포맷된 입력값은 그 이름으로 제출되지 않습니다.

## 이벤트 콜백

| Prop | 시그니처 | 호출 시점 |
| --- | --- | --- |
| `onChange` | `(value: ISODateString \| null) => void` | 연도가 확정될 때(클릭 또는 입력 타이핑). |
| `onOpenChange` | `(isOpen: boolean) => void` | popover 가 열리거나 닫힐 때. |
| `onCalendarNavigate` | `(viewMonth: ISODateString) => void` | 그리드가 다른 10년 블록으로 이동할 때. |

## Props

`YearPicker` Root 는 `DatePicker.Root` 와 같은 prop 을 받습니다. 기본 `displayFormat` 만 다릅니다. 전체 레퍼런스는 [DatePicker](./datepicker.md) 를 참고하세요.

### Grid classNames

```tsx
<YearPicker.Grid
  classNames={{
    root: '',
    header: '',
    title: '',
    navButton: '',
    grid: '',
    gridRow: '',
    year: '',
    yearSelected: '',
    yearCurrent: '',
    yearDisabled: '',
  }}
/>
```

각 연도 셀은 `data-selected`, `data-current`, `data-focused`(활성 셀에만) 를 내보냅니다. [스타일링](../concepts/styling.md) 을 참고하세요.

## 관련

- [DatePicker →](./datepicker.md)
- [MonthPicker →](./monthpicker.md)
- [Timezone →](../concepts/timezone.md)
