---
id: monthpicker
title: MonthPicker
sidebar_position: 5
---

import StackBlitzEmbed from '@site/src/components/StackBlitzEmbed';

# MonthPicker

Month selector. The value is the first day of the selected month in UTC-ISO form — for example, picking April 2026 yields `"2026-04-01T00:00:00.000Z"`.

<figure>
  <img src="/img/demos/monthpicker.avif" alt="MonthPicker 데모: 12개월 그리드에서 월 선택" width="640" loading="lazy" />
  <figcaption><em>화면의 스타일은 데모용입니다 — Kalyx는 CSS를 전혀 포함하지 않습니다.</em></figcaption>
</figure>

```tsx
import { MonthPicker } from '@kalyx/react';
```

## Basic usage

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

The default `displayFormat` is `"yyyy-MM"`. Override it if you prefer a different representation (e.g., `"MMMM yyyy"` for `"April 2026"`).

## 직접 사용해보기

<StackBlitzEmbed id="datepicker-basic" />

## Parts

`MonthPicker` reuses `DatePicker`'s building blocks for everything except the grid:

| Part | Source | Purpose |
|------|--------|---------|
| `MonthPicker.Root` | wraps `DatePicker.Root` | controlled/uncontrolled state, `displayTimezone`, `disabled` rules, `dir` (RTL mirrors the month grid) |
| `MonthPicker.Input` | = `DatePicker.Input` | text input (combobox role) |
| `MonthPicker.Trigger` | = `DatePicker.Trigger` | icon button |
| `MonthPicker.Popover` | = `DatePicker.Popover` | Floating UI positioning |
| **`MonthPicker.Grid`** | new | 12-month grid with prev/next year navigation |

## Timezone

When `displayTimezone` is set, the committed value is the civil midnight of the selected month's first day in that zone (UTC-ISO form). The grid highlighting honors the timezone so the right month stays marked as selected even when stored as a zone-adjusted UTC string.

```tsx
<MonthPicker value={month} onChange={setMonth} displayTimezone="Asia/Seoul">
  <MonthPicker.Input />
  <MonthPicker.Popover>
    <MonthPicker.Grid />
  </MonthPicker.Popover>
</MonthPicker>
```

## Locale

Month names follow the `locale` prop (BCP 47). The built-in `getMonthName` helper uses `Intl.DateTimeFormat` so any locale supported by the JS runtime works without extra dependencies.

```tsx
<MonthPicker locale="ko-KR">
  <MonthPicker.Input />
  <MonthPicker.Popover>
    <MonthPicker.Grid />
  </MonthPicker.Popover>
</MonthPicker>
```

## Disabled rules

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

## Uncontrolled

For simple forms where you don't need React state:

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

## Event callbacks

| Prop | Signature | Fires when |
| --- | --- | --- |
| `onChange` | `(value: ISODateString \| null) => void` | A month is committed (click or input typed). |
| `onOpenChange` | `(isOpen: boolean) => void` | The popover opens or closes. |
| `onCalendarNavigate` | `(viewMonth: ISODateString) => void` | The grid navigates to a different year. |

## Props

`MonthPicker` Root accepts the same props as `DatePicker.Root`. The only difference is the default `displayFormat` — otherwise `disabled`, `readOnly`, `weekStartsOn`, `locale`, `displayTimezone`, `labels`, `adapter`, `onOpenChange`, and `onCalendarNavigate` all behave identically. See [DatePicker](./datepicker.md) for the full reference.

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

## Related

- [DatePicker →](./datepicker.md)
- [YearPicker →](./yearpicker.md)
- [Timezone →](../concepts/timezone.md)
