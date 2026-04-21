---
id: internationalization
title: 다국어 (i18n)
sidebar_position: 6
---

# 다국어 (i18n)

Kalyx는 영어 ARIA 라벨을 기본으로 제공합니다. `labels` prop으로 컴포넌트별 오버라이드하세요 — 별도 i18n 라이브러리 불필요.

## 동작 방식

모든 Root 컴포넌트(`DatePicker`, `RangePicker`, `TimePicker`, `DateTimePicker`)가 `labels` prop을 받습니다. **부분 객체**만 넘기면 됩니다 — 오버라이드한 키만 교체되고 나머지는 영어 기본값이 유지됩니다.

```tsx
<DatePicker
  value={date}
  onChange={setDate}
  labels={{
    triggerOpen: '캘린더 열기',
    prevMonth: '이전 달',
    nextMonth: '다음 달',
  }}
>
  {/* ... */}
</DatePicker>
```

## 라벨 키 레퍼런스

### DatePicker

| 키 | 기본값 (영어) | 사용 위치 |
| --- | --- | --- |
| `triggerOpen` | `"Open calendar"` | Trigger `aria-label` (닫힘) |
| `triggerClose` | `"Close calendar"` | Trigger `aria-label` (열림) |
| `popoverLabel` | `"Choose date"` | Popover `aria-label` |
| `prevMonth` | `"Previous month"` | Calendar 이전 달 버튼 |
| `nextMonth` | `"Next month"` | Calendar 다음 달 버튼 |
| `prevYear` | `"Previous year"` | Calendar 이전 년 버튼 |
| `nextYear` | `"Next year"` | Calendar 다음 년 버튼 |
| `prevDecade` | `"Previous decade"` | YearGrid 이전 10년 버튼 |
| `nextDecade` | `"Next decade"` | YearGrid 다음 10년 버튼 |

### RangePicker (DatePicker 확장)

| 키 | 기본값 | 사용 위치 |
| --- | --- | --- |
| `popoverLabel` | `"Choose date range"` | Popover `aria-label` |
| `startInput` | `"Start date"` | 시작 Input `aria-label` |
| `endInput` | `"End date"` | 종료 Input `aria-label` |
| `presetsGroup` | `"Date range presets"` | Presets 그룹 `aria-label` |

### TimePicker

| 키 | 기본값 | 사용 위치 |
| --- | --- | --- |
| `timeInput` | `"Time"` | Input `aria-label` |
| `hourList` | `"Hour"` | 시 목록 `aria-label` |
| `minuteList` | `"Minute"` | 분 목록 `aria-label` |
| `amPmToggle` | `"AM/PM"` | AM/PM 라디오그룹 `aria-label` |
| `hourOption(h)` | `` `${h} hours` `` | 시 옵션 `aria-label` |
| `minuteOption(m)` | `` `${m} minutes` `` | 분 옵션 `aria-label` |

### DateTimePicker (DatePicker + TimePicker 확장)

| 키 | 기본값 | 사용 위치 |
| --- | --- | --- |
| `dateTimeInput` | `"Date and time"` | Input `aria-label` |

## 재사용 가능한 로케일 프리셋

공유 라벨 파일을 만들어 앱 전체에서 import하세요:

```ts title="lib/kalyx-labels.ts"
import type { DatePickerLabels, RangePickerLabels, TimePickerLabels } from '@kalyx/core';

export const ko: DatePickerLabels = {
  triggerOpen: '캘린더 열기',
  triggerClose: '캘린더 닫기',
  popoverLabel: '날짜 선택',
  prevMonth: '이전 달',
  nextMonth: '다음 달',
  prevYear: '이전 년',
  nextYear: '다음 년',
  prevDecade: '이전 10년',
  nextDecade: '다음 10년',
};

export const koRange: RangePickerLabels = {
  ...ko,
  popoverLabel: '날짜 범위 선택',
  startInput: '시작일',
  endInput: '종료일',
  presetsGroup: '날짜 범위 프리셋',
};

export const koTime: TimePickerLabels = {
  timeInput: '시간',
  hourList: '시',
  minuteList: '분',
  amPmToggle: '오전/오후',
  hourOption: (h) => `${h}시`,
  minuteOption: (m) => `${m}분`,
};
```

```tsx title="components/BookingPicker.tsx"
import { ko } from '@/lib/kalyx-labels';

<DatePicker labels={ko} value={date} onChange={setDate}>
  {/* ... */}
</DatePicker>
```

## 일본어 예제

```ts
import type { DatePickerLabels } from '@kalyx/core';

export const ja: DatePickerLabels = {
  triggerOpen: 'カレンダーを開く',
  triggerClose: 'カレンダーを閉じる',
  popoverLabel: '日付を選択',
  prevMonth: '前月',
  nextMonth: '翌月',
  prevYear: '前年',
  nextYear: '翌年',
  prevDecade: '前の10年',
  nextDecade: '次の10年',
};
```

## 캘린더 로케일 (요일·월 이름)

요일 헤더와 월 이름은 내부적으로 `Intl.DateTimeFormat`을 사용합니다. `locale` prop (BCP 47 태그)을 넘기면 해당 언어로 렌더됩니다:

```tsx
<DatePicker locale="ko-KR" labels={ko} value={date} onChange={setDate}>
  <DatePicker.Input />
  <DatePicker.Popover>
    <DatePicker.Calendar />
  </DatePicker.Popover>
</DatePicker>
```

- `locale`은 **표시 포맷**을 제어합니다 (요일 이름, 헤더의 월 이름).
- `labels`는 **ARIA 속성**을 제어합니다 (스크린 리더 텍스트).

둘은 독립적입니다 — `locale="ko-KR"`과 영어 라벨을 함께 쓸 수도 있고, 그 반대도 가능합니다.

## 다음

- [접근성 →](./accessibility.md)
- [마이그레이션 가이드 (v0.2 → v0.3) →](../migration.md#v02--v03--aria-라벨-i18n)
