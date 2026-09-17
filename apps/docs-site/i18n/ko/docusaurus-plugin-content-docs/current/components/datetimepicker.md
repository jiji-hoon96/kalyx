---
id: datetimepicker
title: DateTimePicker
sidebar_position: 4
description: '날짜와 시간을 하나의 값으로. 공유 컨텍스트 아래에서 DatePicker 와 TimePicker 파츠를 재사용합니다.'
---

import StackBlitzEmbed from '@site/src/components/StackBlitzEmbed';

# DateTimePicker

날짜 + 시간을 하나의 popover, 하나의 ISO 문자열로 결합합니다.

<figure>
  <img src="/img/demos/datetimepicker.avif" alt="DateTimePicker 데모: 한 popover에서 날짜와 시간을 차례로 선택" width="640" loading="lazy" />
  <figcaption><em>화면의 스타일은 데모용입니다. Kalyx는 CSS를 전혀 포함하지 않습니다.</em></figcaption>
</figure>

```tsx
import { DateTimePicker } from '@kalyx/react';
```

## 구조

```tsx
<DateTimePicker>            {/* Root: one ISO string for date + time */}
  <DateTimePicker.Input /> {/* combobox <input>, parses date + time */}
  <DateTimePicker.Popover> {/* Floating-UI portal, role="dialog" */}
    <DateTimePicker.Calendar /> {/* month grid (reuses DatePicker.Calendar) */}
    <DateTimePicker.MonthGrid /> {/* optional month jump view */}
    <DateTimePicker.YearGrid /> {/* optional year jump view */}
    <DateTimePicker.HourList /> {/* hour listbox (reuses TimePicker.HourList) */}
    <DateTimePicker.MinuteList /> {/* minute listbox */}
    <DateTimePicker.AmPmToggle /> {/* AM/PM switch (12-hour mode only) */}
  </DateTimePicker.Popover>
</DateTimePicker>
```

Calendar·MonthGrid·YearGrid 는 `DatePicker` 에서, HourList·MinuteList·AmPmToggle 은 `TimePicker` 에서 재노출된 것이다. 공유된 `DateTimePicker` 컨텍스트를 읽으므로 값 하나가 양쪽을 모두 움직인다. `DateTimePicker.Presets` / `.Preset` 은 [`@kalyx/react/headless`](../guides/adapters.md) 엔트리에서 제공된다.

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

일자를 고른 뒤에도 **popover가 닫히지 않습니다**. 이어서 시간을 조정하세요. 닫기는 자체 버튼이나 바깥 클릭으로 처리합니다.

### 직접 사용해보기

> 라이브 에디터에는 `React` 와 모든 Kalyx 컴포넌트가 이미 스코프에 들어 있어서 `import` 줄을 생략했습니다. 실제 프로젝트로 옮길 때는 import 를 채워 넣으세요. 전체 import 는 위의 일반 코드 블록에 있습니다.

```jsx live
function BasicDateTime() {
  const [dt, setDt] = React.useState(null);
  return (
    <DateTimePicker value={dt} onChange={setDt} format="24h" step={15}>
      <DateTimePicker.Input className="kx-live-input" style={{ minWidth: '14rem' }} />
      <DateTimePicker.Popover className="kx-live-popover">
        <DateTimePicker.Calendar
          classNames={{
            header: 'kx-live-header',
            title: 'kx-live-title',
            navButton: 'kx-live-nav',
            grid: 'kx-live-grid',
            gridCell: 'kx-live-cell',
            weekdayHeader: 'kx-live-weekday',
            day: 'live-day',
            daySelected: 'live-day-selected',
            dayToday: 'live-day-today',
            dayOutsideMonth: 'kx-live-outside',
          }}
        />
        <div
          className="kx-live-row"
          style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--kalyx-border)' }}
        >
          <DateTimePicker.HourList
            classNames={{
              root: 'kx-live-list',
              option: 'kx-live-option',
              optionSelected: 'kx-live-option-selected',
            }}
          />
          <DateTimePicker.MinuteList
            classNames={{
              root: 'kx-live-list',
              option: 'kx-live-option',
              optionSelected: 'kx-live-option-selected',
            }}
          />
        </div>
      </DateTimePicker.Popover>
      <div className="kx-live-value" style={{ marginTop: 8 }}>
        선택됨: <code>{dt ?? 'null'}</code>
      </div>
    </DateTimePicker>
  );
}
```

<StackBlitzEmbed id="datetimepicker-timezone" />

## `<DateTimePicker>` (Root)

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `value` | `ISODateString \| null` | - | 제어형 datetime. |
| `defaultValue` | `ISODateString` | - | 비제어 초기값. |
| `onChange` | `(value: ISODateString \| null) => void` | - | 날짜 또는 시간 변경 시 호출. |
| `format` | `'12h' \| '24h'` | `'24h'` | 시간 포맷. |
| `step` | `number` | `1` | 분 간격. |
| `withSeconds` | `boolean` | `false` | 표시와 입력에 초를 포함한다. |
| `filterTime` | `(hours: number, minutes: number) => boolean` | - | 슬롯별 비활성 predicate. `true` 를 반환하면 해당 슬롯이 **선택 불가**가 된다. `format` 과 무관하게 항상 24시간 값을 받는다. [`TimePicker` 의 `filterTime`](./timepicker.md) 과 같은 규칙이다. |
| `disabled` | `DisabledRule[] \| boolean` | `false` | 날짜 비활성 규칙. |
| `readOnly` | `boolean` | `false` | 변경 방지. |
| `weekStartsOn` | `0 \| 1` | `0` | 주 시작. |
| `displayFormat` | `string` | `'yyyy-MM-dd HH:mm'` | date-fns 포맷. |
| `locale` | `string` | `'en-US'` | BCP 47 로케일. |
| `dir` | `'ltr' \| 'rtl'` | `'ltr'` | 레이아웃 방향. 캘린더 그리드로 전달된다. `'rtl'`이면 ArrowLeft/ArrowRight가 반전된다(WAI-ARIA grid 패턴). [국제화](../concepts/internationalization.md#오른쪽-왼쪽-rtl) 참고. |
| `displayTimezone` | `string` | - | IANA 타임존. 설정하면 캘린더와 시간 컨트롤이 이 타임존 기준으로 읽고 쓴다 (DST 인식). [Timezone](../concepts/timezone.md) 참고. |
| `labels` | `Partial<DateTimePickerLabels>` | - | ARIA 라벨 재정의. |
| `adapter` | `DateAdapter` | `DateFnsAdapter` | 커스텀 어댑터. |
| `children` | `ReactNode` | - | 서브 컴포넌트. |

## 서브 컴포넌트

DateTimePicker는 DatePicker와 TimePicker의 서브 컴포넌트를 한 네임스페이스로 묶어 재노출합니다.

| 이름 | 동작 |
| --- | --- |
| `.Input` | 결합 날짜+시간 입력. 둘 다 파싱. |
| `.Popover` | DatePicker.Popover와 동일. |
| `.Calendar` | 월 그리드 (선택해도 열린 상태 유지). `fixedWeeks`를 포함해 `DatePicker.Calendar`와 동일한 prop을 받습니다. |
| `.MonthGrid` | 선택. 월 이동. |
| `.YearGrid` | 선택. 연도 이동. |
| `.HourList` | TimePicker.HourList와 동일. |
| `.MinuteList` | TimePicker.MinuteList와 동일. |
| `.AmPmToggle` | TimePicker.AmPmToggle와 동일 (12h 모드만). |

모든 `classNames` 타입이 재export됩니다. [DatePicker](./datepicker.md)와 [TimePicker](./timepicker.md) 참고.

서브 컴포넌트는 원래 picker 와 동일한 `data-*` 상태 속성을 그대로 내보냅니다. 캘린더 날짜에는 `data-selected` / `data-today` / `data-focused`, 시간 옵션에는 `data-selected` 가 붙습니다. [스타일링](../concepts/styling.md) 참고.

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

```jsx live
function TwelveHourDateTime() {
  const [dt, setDt] = React.useState(null);
  return (
    <DateTimePicker value={dt} onChange={setDt} format="12h" step={30}>
      <DateTimePicker.Input className="kx-live-input" style={{ minWidth: '14rem' }} />
      <DateTimePicker.Popover className="kx-live-popover">
        <DateTimePicker.Calendar
          classNames={{
            header: 'kx-live-header',
            title: 'kx-live-title',
            navButton: 'kx-live-nav',
            grid: 'kx-live-grid',
            gridCell: 'kx-live-cell',
            weekdayHeader: 'kx-live-weekday',
            day: 'live-day',
            daySelected: 'live-day-selected',
            dayToday: 'live-day-today',
            dayOutsideMonth: 'kx-live-outside',
          }}
        />
        <div
          className="kx-live-row"
          style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--kalyx-border)' }}
        >
          <DateTimePicker.HourList
            classNames={{
              root: 'kx-live-list',
              option: 'kx-live-option',
              optionSelected: 'kx-live-option-selected',
            }}
          />
          <DateTimePicker.MinuteList
            classNames={{
              root: 'kx-live-list',
              option: 'kx-live-option',
              optionSelected: 'kx-live-option-selected',
            }}
          />
          <DateTimePicker.AmPmToggle
            classNames={{
              root: 'kx-live-ampm',
              option: 'kx-live-ampm-btn',
              optionSelected: 'kx-live-ampm-selected',
            }}
          />
        </div>
      </DateTimePicker.Popover>
    </DateTimePicker>
  );
}
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
    { dayOfWeek: [0, 6] },                           // weekends off
    { before: new Date().toISOString() },            // no past
  ]}>
  <DateTimePicker.Input />
  <DateTimePicker.Popover>
    <DateTimePicker.Calendar />
    <DateTimePicker.HourList />
    <DateTimePicker.MinuteList />
  </DateTimePicker.Popover>
</DateTimePicker>
```

```jsx live
function BookingFlow() {
  const [dt, setDt] = React.useState(null);
  const today = new Date().toISOString();
  return (
    <DateTimePicker
      value={dt}
      onChange={setDt}
      format="12h"
      step={30}
      disabled={[{ dayOfWeek: [0, 6] }, { before: today }]}
    >
      <DateTimePicker.Input
        className="kx-live-input"
        style={{ minWidth: '16rem' }}
        placeholder="평일 슬롯만 선택 가능"
      />
      <DateTimePicker.Popover className="kx-live-popover">
        <DateTimePicker.Calendar
          classNames={{
            header: 'kx-live-header',
            title: 'kx-live-title',
            navButton: 'kx-live-nav',
            grid: 'kx-live-grid',
            gridCell: 'kx-live-cell',
            weekdayHeader: 'kx-live-weekday',
            day: 'live-day',
            daySelected: 'live-day-selected',
            dayToday: 'live-day-today',
            dayDisabled: 'kx-live-disabled',
            dayOutsideMonth: 'kx-live-outside',
          }}
        />
        <div
          className="kx-live-row"
          style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--kalyx-border)' }}
        >
          <DateTimePicker.HourList
            classNames={{
              root: 'kx-live-list',
              option: 'kx-live-option',
              optionSelected: 'kx-live-option-selected',
            }}
          />
          <DateTimePicker.MinuteList
            classNames={{
              root: 'kx-live-list',
              option: 'kx-live-option',
              optionSelected: 'kx-live-option-selected',
            }}
          />
          <DateTimePicker.AmPmToggle
            classNames={{
              root: 'kx-live-ampm',
              option: 'kx-live-ampm-btn',
              optionSelected: 'kx-live-ampm-selected',
            }}
          />
        </div>
      </DateTimePicker.Popover>
    </DateTimePicker>
  );
}
```

## 네이티브 폼 제출

`DateTimePicker.Input`에 `name`을 지정하면 화면용 포맷 문자열 대신 전체
UTC-ISO 값이 hidden input으로 제출됩니다.

## 관련

- [DatePicker →](./datepicker.md)
- [TimePicker →](./timepicker.md)
