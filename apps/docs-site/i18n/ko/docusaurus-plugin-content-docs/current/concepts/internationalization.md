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

## 오른쪽-왼쪽 (RTL)

RTL 지원은 두 계층이며, 보통 둘 다 필요합니다:

1. **시각적 미러링**은 문서에서 옵니다. 상위 요소(또는 `<html dir="rtl">`)에 `dir="rtl"`을 주면 캘린더 그리드·입력·popover가 페이지와 함께 미러링됩니다. Kalyx는 의미론적 HTML을 렌더링하며 자체적으로 레이아웃 방향을 더하지 않으므로 이 부분은 "그냥 동작"합니다.
2. **키보드 내비게이션**은 picker 자신의 `dir` prop에서 옵니다. 어느 picker Root든(`DatePicker`, `RangePicker`, `DateTimePicker`, `MonthPicker`, `YearPicker`, `WeekPicker`) `dir="rtl"`을 넘기면 ArrowLeft/ArrowRight가 WAI-ARIA grid 패턴에 따라 시각적 레이아웃을 따르도록 반전됩니다. 즉 시각적으로 왼쪽 셀이 *다음* 날짜, 오른쪽 셀이 *이전* 날짜가 됩니다. ArrowUp/Down, PageUp/Down, Home/End는 논리적 방향을 유지합니다. Root는 그리드 요소에 `dir`도 찍어주므로, picker에 지정하면 캘린더의 시각 계층까지 함께 처리됩니다.

아랍어 요일/월 이름을 위해 맞는 `locale`(예: `ar-EG`)을 사용하세요.

아래에서 방향을 토글해 같은 picker가 미러링되는 것을 확인하세요:

```jsx live
function RtlToggle() {
  const [date, setDate] = React.useState(null);
  const [dir, setDir] = React.useState('rtl');
  return (
    <div>
      <button
        className="kx-live-trigger"
        style={{ marginBottom: 12 }}
        onClick={() => setDir((d) => (d === 'rtl' ? 'ltr' : 'rtl'))}>
        dir = {dir} (토글)
      </button>
      <div dir={dir}>
        <DatePicker dir={dir} value={date} onChange={setDate} locale={dir === 'rtl' ? 'ar-EG' : 'en-US'}>
          <DatePicker.Input className="kx-live-input" placeholder="YYYY-MM-DD" />
          <DatePicker.Popover className="kx-live-popover">
            <DatePicker.Calendar
              classNames={{
                header: 'kx-live-header', title: 'kx-live-title', navButton: 'kx-live-nav',
                grid: 'kx-live-grid', gridCell: 'kx-live-cell', weekdayHeader: 'kx-live-weekday',
                day: 'live-day', daySelected: 'live-day-selected', dayToday: 'live-day-today',
                dayOutsideMonth: 'kx-live-outside',
              }}
            />
          </DatePicker.Popover>
        </DatePicker>
      </div>
    </div>
  );
}
```

내비게이션 화살표는 그리드 전체가 `dir`과 함께 미러링되므로 "이전 / 다음"의 시각적 의미를 그대로 유지합니다 — 직접 바꿀 필요가 없습니다. 스크린 리더 안내가 언어와 맞도록 지역화된 `labels`(위 라벨 키 레퍼런스 참고)를 제공하세요.

> 상위 `<div>`에 `dir`을 주면 CSS 미러링이 처리되고, `<DatePicker>` Root에 `dir`을 주면 화살표 키 내비게이션이 미러링됩니다. 완전히 미러링되고 키보드까지 올바른 picker를 위해서는 위 예시처럼 둘 다 설정하세요.

## 다음

- [접근성 →](./accessibility.md)
- [마이그레이션 가이드 (v0.2 → v0.3) →](../migration.md#v02--v03--aria-labels-i18n)
