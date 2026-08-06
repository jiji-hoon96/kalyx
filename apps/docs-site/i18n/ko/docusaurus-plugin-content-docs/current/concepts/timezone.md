---
id: timezone
title: Timezone (displayTimezone)
sidebar_position: 3
---

# Timezone 지원

7종 피커(`DatePicker`, `RangePicker`, `TimePicker`, `DateTimePicker`, `MonthPicker`, `YearPicker`, `WeekPicker`) 전부가 `displayTimezone` prop을 받습니다. 이 값을 설정하면 Kalyx는 사용자의 입력과 표시되는 값을 *해당 IANA 존의 civil time*으로 해석하면서도, 여러분이 이미 저장하고 있는 평범한 UTC ISO string을 그대로 내보냅니다.

이것이 [react-datepicker #1018](https://github.com/Hacker0x01/react-datepicker/issues/1018) — timezone에 민감한 앱을 10년째 괴롭혀 온 "하루 어긋남" 버그 — 에 대한 Kalyx의 구조적 답입니다.

## 문제를 한 조각으로

존을 의도적으로 지정하지 않으면, 서울에서 "4월 15일"을 선택해도 4월 14일이 저장됩니다.

```ts
const picked = new Date(2026, 3, 15); // UTC+9 → "2026-04-14T15:00:00.000Z"
await save(picked.toISOString());     // 서버에는 4월 14일이 저장된다
```

`displayTimezone`을 쓰면 같은 클릭이 언제나 같은 *civil* 날짜를 저장합니다.

```tsx
<DatePicker displayTimezone="Asia/Seoul" onChange={save}>
  <DatePicker.Input />
  <DatePicker.Popover>
    <DatePicker.Calendar />
  </DatePicker.Popover>
</DatePicker>
// "4월 15일" 클릭 → onChange("2026-04-14T15:00:00.000Z")
// 이 값은 정확히 서울의 4월 15일 00:00 을 가리킨다
```

ISO string은 여전히 UTC입니다 — 다만 서버 런타임 존의 civil 자정이 아니라, **표시 존의 civil 자정과 같은 UTC instant** 입니다.

## 언제 쓰나

| 상황 | 권장 |
| --- | --- |
| 로그·생일·기념일처럼 civil 날짜 하나를 다룰 때 | 사용자 존으로 `displayTimezone`을 설정. |
| 서버가 여러 지역을 대상으로 렌더하는 예약 슬롯 | UTC로 저장하고, 고객의 `displayTimezone`으로 렌더. |
| 단일 지역 안의 시각 | root에 `displayTimezone`을 한 번 설정. |
| 모든 사용자가 한 존에 있을 때(예: 한국 전용 서비스) | `displayTimezone="Asia/Seoul"`을 설정하면 timezone 동작이 명시적이 되고 서버 런타임 드리프트로부터 안전해집니다. |
| UTC를 벗어날 일이 없을 때(분석, 감사 로그) | 설정하지 마세요 — Kalyx의 기본 시맨틱이 UTC입니다. |

## 컴포넌트별 동작

```tsx
<DatePicker displayTimezone="Asia/Seoul" value={iso} onChange={setIso}>
  <DatePicker.Input />           {/* `iso` 를 서울 기준으로 포매팅 */}
  <DatePicker.Popover>
    <DatePicker.Calendar />      {/* today/selected 를 서울 civil 날짜로 하이라이트 */}
  </DatePicker.Popover>
</DatePicker>
```

| 표면 | 효과 |
| --- | --- |
| `DatePicker.Input` / `RangePicker.Input` / `DateTimePicker.Input` | `format`이 `displayTimezone` 안에서 실행됩니다. |
| `Calendar` | `today`와 `isSelected` 비교가 해당 존의 civil-day 동치로 이뤄집니다. |
| 캘린더 클릭 시 `onChange` | 저장되는 ISO는 클릭한 날의 *그 존에서의* civil 자정을 나타냅니다. |
| `TimePicker.HourList` / `MinuteList` | 해당 존에서 관측되는 시각을 읽고 씁니다(DST 인식). |

## DST 처리

Kalyx는 offset 조회를 `Intl.DateTimeFormat`에 위임하므로 모든 IANA 존의 전환이 올바르게 처리됩니다.

```ts
// America/New_York 의 2026-03-08 spring forward: 02:00 EST → 03:00 EDT
startOfDayInTimezone('2026-03-08T12:00:00.000Z', 'America/New_York');
// → '2026-03-08T05:00:00.000Z'  (EST — 자정은 아직 전환 이전)

startOfDayInTimezone('2026-03-09T12:00:00.000Z', 'America/New_York');
// → '2026-03-09T04:00:00.000Z'  (EDT — 하루 전체가 서머타임)
```

## 저수준 헬퍼

같은 계산을 직접 해야 한다면 `@kalyx/core`에서 가져오세요.

```ts
import {
  civilMidnightFromUtcDay,  // 캘린더 셀 UTC iso → 해당 존의 civil 자정 ISO
  getTimeInTimezone,         // UTC iso → 해당 존에서 관측되는 { hours, minutes, seconds }
  setTimeInTimezone,         // UTC iso + TimeValue → 해당 존에서 시각이 바뀐 UTC iso
  formatInTimezone,
  startOfDayInTimezone,
  isSameDayInTimezone,
  todayInTimezone,
  getTimezoneOffsetMinutes,
} from '@kalyx/core';
```

## timezone 없는 코드에서 마이그레이션

1. 표시 존을 정합니다(사용자 설정, 계정 설정, 또는 서버가 아는 지역).
2. root에 `displayTimezone={userZone}`을 추가합니다. 호출부의 나머지는 그대로입니다.
3. 기존 테스트를 돌립니다 — 계약(`value`, `onChange`가 UTC ISO string)이 바뀌지 않았으므로 계속 통과합니다. 달라지는 것은 그 string들의 *내용*이 이제 단일하고 모호하지 않은 의미를 갖는다는 점뿐입니다.

```diff
  <DatePicker
    value={iso}
    onChange={setIso}
+   displayTimezone={user.timezone ?? 'UTC'}
  >
    <DatePicker.Input />
    <DatePicker.Popover>
      <DatePicker.Calendar />
    </DatePicker.Popover>
  </DatePicker>
```

## 함정

- **prop을 생략하면 UTC 시맨틱이 유지됩니다.** 기존 코드는 그대로 동작합니다.
- **어댑터 계약은 그대로입니다.** `DateAdapter` 인터페이스를 구현하는 커스텀 어댑터는 `format`·`isSameDay`·`startOfDay`·`today`의 `timezone?: string` 파라미터를 존중해야 합니다. 내장 `DateFnsAdapter`는 이미 그렇게 합니다.
- **IANA 존만 지원합니다.** `"+09:00"` 같은 offset은 지원하지 않습니다 — `"Asia/Seoul"`을 쓰세요.
- **손으로 쓴 `…T00:00:00.000Z` 는 civil 자정이 아닙니다.** 실제로 발목을 잡는 건 이겁니다. `'2026-01-15T00:00:00.000Z'` 같은 리터럴은 UTC 좌표를 가리킵니다. `America/New_York`에서 그 instant는 현지 기준 아직 1월 14일이고, `Pacific/Auckland`에서는 이미 1월 15일 오후입니다. 그래서 `displayTimezone`을 켜는 순간, 손으로 조립한 값들 — 데이터베이스 `DATE` 컬럼에서 온 `value`, `{ before }` / `{ after }` 경계, `isDateDisabled`의 인자 — 은 여러분이 타이핑한 캘린더 날짜를 더 이상 의미하지 않습니다.

  피커가 내보내는 것과 같은 종류의 값을 쓰세요. `onChange`에서 나온 값이거나, `civilMidnightFromUtcDay(coordinate, zone)`으로 만든 instant입니다. 반대 방향으로는 `calendarDayFromInstant(instant, zone)`이 그 instant가 어느 캘린더 셀에 속하는지 알려줍니다. 커스텀 그리드 안에서는 직접 다시 계산하지 말고 `getCalendarDays`가 미리 계산해 둔 `isDisabled` / `isSelected` 플래그를 읽으세요 — 셀마다 이미 정규화돼 있습니다.

## 다음

- [어댑터 →](./adapters.md)
- [ISO 8601 UTC string →](./iso-string.md)
