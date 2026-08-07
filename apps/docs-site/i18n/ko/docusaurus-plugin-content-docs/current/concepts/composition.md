---
id: composition
title: Composition API
sidebar_position: 1
---

# Composition API

Kalyx는 **설정보다 조합**을 따릅니다. 모든 picker는 작은 프리미티브들의 트리이며, 배치는 여러분의 몫입니다.

## 구조

```tsx
<DatePicker value={...} onChange={...}>     {/* Root — 상태와 컨텍스트 보유 */}
  <DatePicker.Input />                       {/* 텍스트 입력, 타이핑된 날짜 파싱 */}
  <DatePicker.Trigger />                     {/* 캘린더 아이콘 버튼 */}
  <DatePicker.Popover>                       {/* Floating UI 포털 */}
    <DatePicker.Calendar />                  {/* 월별 그리드 */}
    <DatePicker.MonthGrid />                 {/* (선택) 빠른 월 이동 */}
    <DatePicker.YearGrid />                  {/* (선택) 빠른 연도 이동 */}
  </DatePicker.Popover>
</DatePicker>
```

각 리프는 단일 HTML 요소를 렌더링하며 표준 props (`className`, `ref`, `aria-*`, 이벤트 핸들러 등)와 내부 슬롯용 `classNames` 맵을 받습니다.

## Props 대신 조합을 쓰는 이유

대부분의 DatePicker 라이브러리는 props가 줄줄이 늘어납니다.

```tsx
// 다른 라이브러리 — 기능마다 새 prop
<DatePicker
  showTimeSelect
  showMonthDropdown
  showYearDropdown
  renderCustomHeader={fn}
  excludeDates={[]}
  highlightDates={[]}
  {/* …그 외 90개 */}
/>
```

Kalyx는 반대입니다 — 월 드롭다운이 필요하면 그걸 mount합니다.

```tsx
<DatePicker.Popover>
  <DatePicker.Calendar onTitleClick={() => setView('months')} />
  {view === 'months' && <DatePicker.MonthGrid onSelect={() => setView('days')} />}
</DatePicker.Popover>
```

이렇게 하면:

1. **Composition이 명시적으로 유지됩니다.** 사용하는 공개 파트를 import 하세요 — import 하지 않은 picker 는 제거되고, import 한 picker 에 딸린 서브 컴포넌트는 함께 따라옵니다. 실제 비용은 프로덕션 번들러에서 확인하세요.
2. **숨은 상태가 없습니다.** 트리의 구조 *자체*가 기능 세트입니다.
3. **슬롯별 스타일링.** 모든 프리미티브는 타깃 가능한 DOM 요소입니다.

## Dot 표기

서브 컴포넌트는 `Object.assign`으로 Root에 붙어 있습니다.

```tsx
import { DatePicker } from '@kalyx/react';

DatePicker.Input;      // <input>
DatePicker.Trigger;    // <button>
DatePicker.Popover;    // <div role="dialog">
DatePicker.Calendar;   // <table role="grid">
DatePicker.MonthGrid;  // <div>
DatePicker.YearGrid;   // <div>
```

모든 컴포넌트 군에 동일한 패턴이 적용됩니다.

| Root | 서브 컴포넌트 |
| --- | --- |
| `<DatePicker>` | `.Input`, `.Trigger`, `.Popover`, `.Calendar`, `.MonthGrid`, `.YearGrid` |
| `<RangePicker>` | `.Input`, `.Popover`, `.Calendar`, `.Presets`, `.Preset` |
| `<TimePicker>` | `.Input`, `.HourList`, `.MinuteList`, `.AmPmToggle` |
| `<DateTimePicker>` | `.Input`, `.Popover`, `.Calendar`, `.HourList`, `.MinuteList`, `.AmPmToggle`, `.MonthGrid`, `.YearGrid` |

## 슬롯 생략

모든 슬롯은 선택적입니다. 아래도 모두 유효한 DatePicker입니다.

```tsx
{/* input만 — popover 없음 */}
<DatePicker value={v} onChange={setV}>
  <DatePicker.Input />
</DatePicker>

{/* Calendar만, input 없음 */}
<DatePicker value={v} onChange={setV}>
  <DatePicker.Calendar />
</DatePicker>

{/* 캘린더를 여는 버튼 */}
<DatePicker value={v} onChange={setV}>
  <DatePicker.Trigger>날짜 선택</DatePicker.Trigger>
  <DatePicker.Popover>
    <DatePicker.Calendar />
  </DatePicker.Popover>
</DatePicker>
```

## 완전 커스텀으로 가기

조합으로도 충족되지 않을 때는 훅으로 내려가 원하는 마크업을 그리세요.

```tsx
import { useDatePicker } from '@kalyx/react';

function MyPicker() {
  const { calendar, selectDate, previousMonth, nextMonth } = useDatePicker();

  return (
    <div>
      <button onClick={previousMonth}>◀</button>
      <button onClick={nextMonth}>▶</button>
      {calendar.flat().map((day) => (
        <button
          key={day.isoString}
          disabled={day.isDisabled}
          onClick={() => selectDate(day.isoString)}>
          {day.dayNumber}
        </button>
      ))}
    </div>
  );
}
```

자세한 내용은 [useDatePicker →](../hooks/use-date-picker.md).

## 다음

- [ISO 문자열 값 →](./iso-string.md)
- [SSR 안전 →](./ssr.md)
- [접근성 →](./accessibility.md)
