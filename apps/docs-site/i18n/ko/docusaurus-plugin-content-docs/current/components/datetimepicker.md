---
id: datetimepicker
title: DateTimePicker
sidebar_position: 4
---

# DateTimePicker

날짜 + 시간을 하나의 popover, 하나의 ISO 문자열로 결합합니다.

```tsx
import { DateTimePicker } from '@kalyx/react';
```

## 기본 사용

```tsx
import { useState } from 'react';
import { DateTimePicker, type ISODateString } from '@kalyx/react';

function Example() {
  const [dt, setDt] = useState<ISODateString | null>(null);
  return (
    <DateTimePicker value={dt} onChange={setDt} format="24h" step={15}>
      <DateTimePicker.Input />
      <DateTimePicker.Popover>
        <DateTimePicker.Calendar />
        <DateTimePicker.HourList />
        <DateTimePicker.MinuteList />
      </DateTimePicker.Popover>
    </DateTimePicker>
  );
}
```

일자를 고른 뒤에도 **popover가 닫히지 않습니다** — 이어서 시간을 조정하세요. 닫기는 자체 버튼이나 바깥 클릭으로 처리합니다.

## `<DateTimePicker>` (Root)

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `value` | `ISODateString \| null` | — | 제어형 datetime. |
| `defaultValue` | `ISODateString` | — | 비제어 초기값. |
| `onChange` | `(value: ISODateString \| null) => void` | — | 날짜 또는 시간 변경 시 호출. |
| `format` | `'12h' \| '24h'` | `'24h'` | 시간 포맷. |
| `step` | `number` | `1` | 분 간격. |
| `disabled` | `DisabledRule[] \| boolean` | `false` | 날짜 비활성 규칙. |
| `readOnly` | `boolean` | `false` | 변경 방지. |
| `weekStartsOn` | `0 \| 1` | `0` | 주 시작. |
| `displayFormat` | `string` | `'yyyy-MM-dd HH:mm'` | date-fns 포맷. |
| `locale` | `string` | `'en-US'` | BCP 47 로케일. |
| `adapter` | `DateAdapter` | `DateFnsAdapter` | 커스텀 어댑터. |
| `children` | `ReactNode` | — | 서브 컴포넌트. |

## 서브 컴포넌트

DateTimePicker는 DatePicker와 TimePicker의 서브 컴포넌트를 한 네임스페이스로 묶어 재노출합니다.

| 이름 | 동작 |
| --- | --- |
| `.Input` | 결합 날짜+시간 입력 — 둘 다 파싱. |
| `.Popover` | DatePicker.Popover와 동일. |
| `.Calendar` | 월 그리드 (선택해도 열린 상태 유지). |
| `.MonthGrid` | 선택. 월 이동. |
| `.YearGrid` | 선택. 연도 이동. |
| `.HourList` | TimePicker.HourList와 동일. |
| `.MinuteList` | TimePicker.MinuteList와 동일. |
| `.AmPmToggle` | TimePicker.AmPmToggle와 동일 (12h 모드만). |

모든 `classNames` 타입이 재export됩니다 — [DatePicker](./datepicker.md)와 [TimePicker](./timepicker.md) 참고.

## 패턴

### 12시간제 datetime

```tsx
<DateTimePicker value={dt} onChange={setDt} format="12h" step={5}>
  <DateTimePicker.Input />
  <DateTimePicker.Popover>
    <DateTimePicker.Calendar />
    <div className="flex gap-2 p-2 border-t">
      <DateTimePicker.HourList />
      <DateTimePicker.MinuteList />
      <DateTimePicker.AmPmToggle />
    </div>
  </DateTimePicker.Popover>
</DateTimePicker>
```

### 정해진 슬롯 스케줄링

고정 슬롯 예약엔 `step={15}` 또는 `step={30}`으로 분을 스냅하세요.

```tsx
<DateTimePicker
  value={dt}
  onChange={setDt}
  step={30}
  displayFormat="yyyy-MM-dd HH:mm">
  <DateTimePicker.Input />
  <DateTimePicker.Popover>
    <DateTimePicker.Calendar />
    <DateTimePicker.HourList />
    <DateTimePicker.MinuteList />
  </DateTimePicker.Popover>
</DateTimePicker>
```

### 예약 흐름

```tsx
<DateTimePicker
  value={dt}
  onChange={setDt}
  disabled={[
    { dayOfWeek: [0, 6] },                           // 주말 제외
    { before: new Date().toISOString() },            // 과거 제외
  ]}>
  <DateTimePicker.Input />
  <DateTimePicker.Popover>
    <DateTimePicker.Calendar />
    <DateTimePicker.HourList />
    <DateTimePicker.MinuteList />
  </DateTimePicker.Popover>
</DateTimePicker>
```

## 관련

- [DatePicker →](./datepicker.md)
- [TimePicker →](./timepicker.md)
