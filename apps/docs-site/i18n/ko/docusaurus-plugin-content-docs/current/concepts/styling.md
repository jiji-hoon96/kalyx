---
id: styling
title: 스타일링
sidebar_position: 2
---

# 스타일링

Kalyx는 **CSS를 전혀 포함하지 않습니다**. 모든 파트는 의미론적이고 스타일이 없는 HTML을 렌더링하며, 두 가지 스타일링 계약을 노출합니다:

1. **`classNames` prop** — 각 서브 컴포넌트에 있는, 슬롯 이름 → 클래스 문자열의 타입드 맵.
2. **`data-*` 상태 어트리뷰트** — 인터랙티브 요소에 방출되어, 리렌더 없이 CSS / Tailwind로 상태별 스타일을 줄 수 있습니다.

둘 중 하나만 써도 되고, 안정적인 클래스 + 상태 기반 변형을 원하면 함께 쓰세요.

## 1. `classNames` prop

모든 서브 컴포넌트는 내부 슬롯별로 키가 지정된 `classNames` 객체를 받습니다. 필요한 슬롯만 전달하세요.

```tsx
<DatePicker.Calendar
  classNames={{
    grid: 'grid grid-cols-7 gap-1',
    day: 'rounded p-2 hover:bg-gray-100',
    daySelected: 'bg-blue-600 text-white',
    dayToday: 'ring-1 ring-blue-400',
    dayDisabled: 'opacity-40 cursor-not-allowed',
    dayOutsideMonth: 'text-gray-300',
  }}
/>
```

슬롯 키는 각 컴포넌트 페이지에 서브 컴포넌트별로 문서화되어 있습니다. 상태 슬롯(`daySelected`, `dayToday` 등)은 해당 상태가 활성일 때 기본 슬롯(`day`)에 **추가로** 적용됩니다 — 즉 선택된 날짜는 `day`와 `daySelected` 클래스를 모두 갖습니다.

## 2. `data-*` 상태 어트리뷰트

Tailwind(`data-[selected]:…`)나 일반 CSS 어트리뷰트 셀렉터를 쓰려면, 모든 상태 요소가 `data-*` 어트리뷰트도 함께 갖습니다. 이 어트리뷰트는 **상태가 활성일 때만 존재**하며(비활성이면 생략 — `data-selected="false"`는 절대 없음), 따라서 `[data-selected]`는 신뢰할 수 있는 셀렉터입니다.

```css
/* 일반 CSS */
.day[data-selected] { background: #2563eb; color: white; }
.day[data-today]    { outline: 1px solid #60a5fa; }
.day[data-in-range] { background: #dbeafe; }
```

```tsx
/* Tailwind v3.1+ data 변형 — classNames 불필요 */
<DatePicker.Calendar
  classNames={{
    day: 'rounded p-2 data-[selected]:bg-blue-600 data-[selected]:text-white data-[today]:ring-1',
  }}
/>
```

### 어트리뷰트 레퍼런스

Kalyx가 방출하는 어트리뷰트 목록입니다. `disabled` 날짜는 네이티브 `disabled` 어트리뷰트 **와** `aria-disabled`를 사용하므로(`data-*` 플래그 아님), `:disabled` 또는 `dayDisabled` 슬롯으로 스타일하세요.

#### 캘린더 날짜 셀

| 어트리뷰트 | 방출 주체 | 활성 조건 |
| --- | --- | --- |
| `data-focused` | `DatePicker` / `RangePicker` / `WeekPicker` / `DateTimePicker` `.Calendar` | 날짜가 키보드 포커스를 가짐(roving tabindex). |
| `data-selected` | `DatePicker` / `DateTimePicker` `.Calendar` | 날짜가 선택된 날짜임. |
| `data-today` | 모든 `.Calendar` | 날짜가 오늘(설정 시 `displayTimezone` 기준). |
| `data-outside-month` | 모든 `.Calendar` | 6주 뷰를 채우는 인접 월의 날짜. |
| `data-range-start` | `RangePicker` / `WeekPicker` `.Calendar` | 범위의 시작일. |
| `data-range-end` | `RangePicker` / `WeekPicker` `.Calendar` | 범위의 종료일. |
| `data-in-range` | `RangePicker` / `WeekPicker` `.Calendar` | 시작과 종료 사이(배타적)의 날짜. |
| `data-week-number` | 모든 `.Calendar`(행 `<th>`에) | 주차 표시가 켜져 있을 때 존재. |

#### 월 / 연도 셀

| 어트리뷰트 | 방출 주체 | 활성 조건 |
| --- | --- | --- |
| `data-selected` | `DatePicker.MonthGrid` / `.YearGrid`, `MonthPicker.Grid`, `YearPicker.Grid` | 셀이 선택된 월 / 연도. |
| `data-current` | 위와 동일 | 셀이 현재 월 / 연도(오늘). |
| `data-focused` | 위와 동일 | 셀이 키보드 포커스를 가짐. |

#### 시간 셀

| 어트리뷰트 | 방출 주체 | 활성 조건 |
| --- | --- | --- |
| `data-selected` | `TimePicker.HourList` / `.MinuteList` / `.AmPmToggle`(및 `DateTimePicker` 대응) | 시 / 분 / 오전·오후가 현재 값. |

#### 프리셋 & 입력

| 어트리뷰트 | 방출 주체 | 활성 조건 |
| --- | --- | --- |
| `data-active` | `DatePicker` / `RangePicker` / `DateTimePicker` `.Preset` | 프리셋이 해석한 날짜가 현재 값과 일치. |
| `data-part` | `RangePicker` / `WeekPicker` `.Input` | 항상 — 값은 `"start"` 또는 `"end"`로, 각 입력을 타겟팅. |

## 무엇을 써야 하나요?

- **정적인 외형** → `classNames` 기본 슬롯(`day`, `grid` 등).
- **Tailwind에서 상태 변형** → 한 슬롯 클래스 안에 `data-[selected]:` / `data-[today]:` 유틸리티.
- **일반 CSS / 디자인 토큰** → 스타일시트의 `data-*` 어트리뷰트 셀렉터.

전체 예제는 [Tailwind 레시피](../recipes/tailwind.md)와 [shadcn 레시피](../recipes/shadcn.md)를 참고하세요.
