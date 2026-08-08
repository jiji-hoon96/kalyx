---
id: rangepicker
title: RangePicker
sidebar_position: 2
---

import StackBlitzEmbed from '@site/src/components/StackBlitzEmbed';

# RangePicker

시작과 끝, 두 날짜를 선택합니다. 선택 사항으로 프리셋 제공.

<figure>
  <img src="/img/demos/rangepicker.avif" alt="RangePicker 데모: 시작일과 종료일 선택, hover 미리보기" width="640" loading="lazy" />
  <figcaption><em>화면의 스타일은 데모용입니다 — Kalyx는 CSS를 전혀 포함하지 않습니다.</em></figcaption>
</figure>

```tsx
import { RangePicker } from '@kalyx/react';
```

## 기본 사용

```tsx
import { useState } from 'react';
import { RangePicker, type DateRange } from '@kalyx/react';

function Example() {
  const [range, setRange] = useState<DateRange>({ start: null, end: null });
  return (
    <RangePicker value={range} onChange={setRange}>
      <RangePicker.Input part="start" placeholder="시작" />
      <RangePicker.Input part="end" placeholder="종료" />
      <RangePicker.Popover>
        <RangePicker.Calendar />
      </RangePicker.Popover>
    </RangePicker>
  );
}
```

**선택 흐름:** 첫 클릭이 `start`를, 두 번째가 `end`를 설정합니다. 두 번째 클릭이 더 이르면 자동으로 위치가 교환됩니다.

## 직접 사용해보기

<StackBlitzEmbed id="rangepicker-presets" />

## `<RangePicker>` (Root)

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `value` | `DateRange` | — | 제어형 범위. |
| `defaultValue` | `DateRange` | — | 비제어형 초기 범위. |
| `onChange` | `(range: DateRange) => void` | — | 모든 변경(부분 포함)에 호출. |
| `disabled` | `DisabledRule[] \| boolean` | `false` | 비활성 규칙 또는 전체 비활성. |
| `readOnly` | `boolean` | `false` | 변경 방지. |
| `weekStartsOn` | `0 \| 1` | `0` | 주 시작. |
| `displayFormat` | `string` | `'yyyy-MM-dd'` | 포맷 문자열. |
| `locale` | `string` | `'en-US'` | BCP 47 로케일. |
| `dir` | `'ltr' \| 'rtl'` | `'ltr'` | 레이아웃 방향. `'rtl'`이면 캘린더 그리드에 `dir="rtl"`이 붙고 ArrowLeft/ArrowRight가 반전된다(WAI-ARIA grid 패턴). [국제화](../concepts/internationalization.md#오른쪽-왼쪽-rtl) 참고. |
| `adapter` | `DateAdapter` | `DateFnsAdapter` | 커스텀 어댑터. |
| `children` | `ReactNode` | — | 서브 컴포넌트. |

### `DateRange`

```ts
type DateRange = {
  start: ISODateString | null;
  end: ISODateString | null;
};
```

선택 중에는 `end >= start`를 강제하지 않습니다 — 커밋 시점에 자동 스왑. `onChange`에서 `{ start, end }` 형태를 항상 받습니다.

## `<RangePicker.Input>`

입력 두 개 — `start`용 하나, `end`용 하나 — 가 필요합니다. 먼저 렌더된 입력이 Floating UI 기준점이 됩니다.

| Prop | 타입 | 설명 |
| --- | --- | --- |
| `part` | `'start' \| 'end'` | **필수.** 이 입력이 관리하는 범위 측. |
| `format` | `string` | Root의 `displayFormat` 오버라이드. |

## `<RangePicker.Popover>`

[`DatePicker.Popover`](./datepicker.md#datepickerpopover)와 동일한 동작. `role="dialog"`, 바깥 클릭 해제, Escape 지원.

## `<RangePicker.Calendar>`

범위 강조가 적용된 월 그리드.

| Prop | 타입 | 설명 |
| --- | --- | --- |
| `classNames` | `RangePickerCalendarClassNames` | 스타일. |
| `fixedWeeks` | `boolean` (기본 `false`) | 항상 6주 행을 렌더. 지정하지 않으면 4~6행이라 달마다 popover 높이가 바뀐다. |

```ts
type RangePickerCalendarClassNames = {
  root?: string;
  header?: string;
  title?: string;
  navButton?: string;
  grid?: string;
  gridRow?: string;
  gridCell?: string;
  day?: string;
  daySelected?: string;      // 시작 또는 끝 날짜
  dayInRange?: string;       // 시작과 끝 사이 날짜
  dayToday?: string;
  dayDisabled?: string;
  dayOutsideMonth?: string;
  weekdayHeader?: string;
};
```

## `<RangePicker.Presets>`

빠른 선택 버튼 컨테이너.

| Prop | 타입 | 설명 |
| --- | --- | --- |
| `classNames` | `RangePickerPresetsClassNames` | 스타일. |
| `children` | `ReactNode` | `<RangePicker.Preset>` 자식. |

```ts
type RangePickerPresetsClassNames = {
  root?: string;
  preset?: string;
  presetActive?: string;
};
```

## `<RangePicker.Preset>`

단일 프리셋 버튼. 내장 `value` 키 **또는** 커스텀 `range`를 제공하세요.

| Prop | 타입 | 설명 |
| --- | --- | --- |
| `value` | `PresetKey` | 내장 프리셋 키. |
| `range` | `DateRange` | 커스텀 범위 (`value` 대신). |
| `children` | `ReactNode` | 버튼 라벨. |

### 내장 `PresetKey`

```ts
type PresetKey =
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'thisWeek'
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisYear';
```

## 패턴

### 사이드바 프리셋 + 캘린더

```tsx
<RangePicker value={range} onChange={setRange}>
  <div className="flex gap-2">
    <RangePicker.Input part="start" />
    <RangePicker.Input part="end" />
  </div>
  <RangePicker.Popover className="flex gap-4 p-3">
    <RangePicker.Presets className="flex flex-col gap-1">
      <RangePicker.Preset value="today">오늘</RangePicker.Preset>
      <RangePicker.Preset value="last7days">지난 7일</RangePicker.Preset>
      <RangePicker.Preset value="last30days">지난 30일</RangePicker.Preset>
      <RangePicker.Preset value="thisMonth">이번 달</RangePicker.Preset>
    </RangePicker.Presets>
    <RangePicker.Calendar />
  </RangePicker.Popover>
</RangePicker>
```

### 커스텀 프리셋

```tsx
<RangePicker.Preset
  range={{
    start: '2026-01-01T00:00:00.000Z',
    end: '2026-06-30T00:00:00.000Z',
  }}>
  2026 상반기
</RangePicker.Preset>
```

### 범위 제약

```tsx
<RangePicker
  value={range}
  onChange={setRange}
  disabled={[{ before: '2026-01-01T00:00:00.000Z' }]}>
  ...
</RangePicker>
```

## 네이티브 폼 제출

각 입력에 `name`을 지정하면 화면에는 포맷된 날짜를 표시하되, hidden input이
각 시작·종료 값을 UTC-ISO 문자열로 제출합니다.

```tsx
<RangePicker defaultValue={range}>
  <RangePicker.Input part="start" name="startDate" />
  <RangePicker.Input part="end" name="endDate" />
</RangePicker>
```

## 관련

- [DatePicker →](./datepicker.md)
- [useRangePicker →](../hooks/use-range-picker.md)
