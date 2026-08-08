---
id: yearpicker
title: YearPicker
sidebar_position: 6
---

import StackBlitzEmbed from '@site/src/components/StackBlitzEmbed';

# YearPicker

Year selector. The value is January 1 of the selected year in UTC-ISO form — for example, picking 2026 yields `"2026-01-01T00:00:00.000Z"`.

<figure>
  <img src="/img/demos/yearpicker.avif" alt="YearPicker 데모: 10년 그리드에서 연도 선택" width="640" loading="lazy" />
  <figcaption><em>화면의 스타일은 데모용입니다 — Kalyx는 CSS를 전혀 포함하지 않습니다.</em></figcaption>
</figure>

```tsx
import { YearPicker } from '@kalyx/react';
```

## Basic usage

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

The default `displayFormat` is `"yyyy"`.

## 직접 사용해보기

<StackBlitzEmbed id="datepicker-basic" />

## Parts

| Part | Source | Purpose |
|------|--------|---------|
| `YearPicker.Root` | wraps `DatePicker.Root` | controlled/uncontrolled state, `displayTimezone`, `disabled` rules, `dir` (RTL mirrors the year grid) |
| `YearPicker.Input` | = `DatePicker.Input` | text input (combobox role) |
| `YearPicker.Trigger` | = `DatePicker.Trigger` | icon button |
| `YearPicker.Popover` | = `DatePicker.Popover` | Floating UI positioning |
| **`YearPicker.Grid`** | new | 12-year decade grid with prev/next decade navigation |

The grid displays the decade block containing the current year (e.g., 2016–2027 when the value is 2026). Navigate by 12 years at a time using the header buttons.

## Timezone

When `displayTimezone` is set, year highlighting is timezone-aware. This matters when the stored UTC-ISO has been shifted to represent civil midnight in a non-UTC zone.

```tsx
<YearPicker value={year} onChange={setYear} displayTimezone="America/New_York">
  <YearPicker.Input />
  <YearPicker.Popover>
    <YearPicker.Grid />
  </YearPicker.Popover>
</YearPicker>
```

## Disabled rules

규칙이 해당 연도의 모든 날짜를 제외할 때만 연도 전체가 비활성화됩니다. 1월 1일 하나만 막는 규칙은 나머지 날짜까지 비활성화하지 않습니다.

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

## Uncontrolled

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

## Event callbacks

| Prop | Signature | Fires when |
| --- | --- | --- |
| `onChange` | `(value: ISODateString \| null) => void` | A year is committed (click or input typed). |
| `onOpenChange` | `(isOpen: boolean) => void` | The popover opens or closes. |
| `onCalendarNavigate` | `(viewMonth: ISODateString) => void` | The grid navigates to a different decade. |

## Props

`YearPicker` Root accepts the same props as `DatePicker.Root`. Only the default `displayFormat` differs. See [DatePicker](./datepicker.md) for the full reference.

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

## Related

- [DatePicker →](./datepicker.md)
- [MonthPicker →](./monthpicker.md)
- [Timezone →](../concepts/timezone.md)
