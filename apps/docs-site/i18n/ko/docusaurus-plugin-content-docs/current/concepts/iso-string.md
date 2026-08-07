---
id: iso-string
title: ISO 8601 UTC string
sidebar_position: 2
---

# ISO 8601 UTC string

Kalyx의 모든 값 — `value`, `defaultValue`, `onChange`의 인자, `DateRange`의 각 항목 — 은 ISO 8601 UTC string 이거나 `null` 입니다. `Date` 객체는 절대 쓰지 않습니다.

```ts
type ISODateString = string; // 예: "2026-04-15T00:00:00.000Z"
```

## 왜 `Date`가 아닌가?

`Date` 객체는 가변(mutable)이고, timezone이 모호하며, 직렬화 결과가 일관되지 않습니다. 전형적인 버그는 이렇습니다.

```ts
// 서울에 있는 사용자가 4월 15일을 선택
const picked = new Date(2026, 3, 15); // KST에서는 "2026-04-14T15:00:00.000Z" 🤦

// DB에 저장
await save(picked);

// UTC 서버에서 다시 읽음
new Date(picked.toISOString()).getDate(); // 14 — 하루 어긋남
```

ISO string은 이 모호함을 경계에서 제거합니다.

```tsx
<DatePicker
  value="2026-04-15T00:00:00.000Z"  // 항상 UTC 자정
  onChange={(iso) => save(iso)}      // 항상 UTC string
/>
```

Kalyx가 보장하는 것:

1. 시간을 명시적으로 지정하지 않는 한 날짜는 **UTC 자정**(`T00:00:00.000Z`)으로 저장됩니다.
2. `onChange`는 `Date`를 넘기지 않습니다 — string 아니면 `null` 뿐입니다.
3. 내부 연산은 전 구간 UTC 안전한 [`DateAdapter`](./adapters.md)를 통해 이루어집니다.

## 로컬 시간으로 표시하기

값은 UTC입니다. **표시**는 렌더링 관심사이며, 각 root의 `displayFormat`과 `locale`이 담당합니다.

```tsx
<DatePicker
  value={iso}
  onChange={setIso}
  displayFormat="MMM d, yyyy"
  locale="en-US"
/>
```

내부적으로 어댑터가 요청된 locale로 UTC instant를 포매팅합니다.

## `Date`와 상호 변환하기

레거시 폼 라이브러리처럼 `Date`로 다리를 놓아야 한다면, 반드시 경계에서 처리하세요.

```ts
// Date → ISO
const iso = new Date(2026, 3, 15).toISOString();
// → "2026-04-14T15:00:00.000Z"  (여전히 KST의 영향을 받는다!)

// 더 안전한 방법: UTC 자정을 직접 만든다
const iso = new Date(Date.UTC(2026, 3, 15)).toISOString();
// → "2026-04-15T00:00:00.000Z"

// ISO → Date
const date = new Date(iso);
```

더 세밀한 변환이 필요하면 Kalyx가 제공하는 헬퍼를 쓰세요.

```ts
import { normalizeISO, parseInputValue } from '@kalyx/core';
import { DateFnsAdapter } from '@kalyx/adapter-date-fns';

normalizeISO('2026-04-15'); // "2026-04-15T00:00:00.000Z"
parseInputValue('2026-04-15', DateFnsAdapter); // "2026-04-15T00:00:00.000Z"
parseInputValue('nope', DateFnsAdapter); // null
```

이 두 함수는 `@kalyx/react`가 아니라 `@kalyx/core`에 있습니다 — React 패키지가 다시 export 하는 것은 `DateFnsAdapter` 뿐입니다. `parseInputValue`는 두 번째 인자로 어댑터를 받아 거기서 입력 형식을 읽습니다. 별도의 format 파라미터는 없습니다.

## 시간과 timezone

`TimePicker`와 `DateTimePicker`도 ISO string을 반환합니다. 순수 `TimePicker` 값의 날짜 부분은 고정된 자리표시자이므로, 시간 필드만 소비하세요(`@kalyx/core`의 `getTime(iso)`가 도와줍니다).

IANA timezone을 인식하는 표시·입력 — `"2026-04-15T00:00:00Z"`를 `"2026-04-15 09:00 KST"`로 렌더하거나, 캘린더 클릭이 사용자 존의 civil 자정을 내보내게 하는 것 — 이 필요하면 `displayTimezone` prop을 쓰세요. 전용 페이지인 [Timezone 개념 문서](./timezone.md)를 참고하세요.

## 다음

- [Timezone (displayTimezone) →](./timezone.md)
- [어댑터 →](./adapters.md)
- [SSR 안전성 →](./ssr.md)
