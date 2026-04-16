---
id: iso-string
title: ISO 8601 UTC 문자열
sidebar_position: 2
---

# ISO 8601 UTC 문자열

모든 Kalyx 값 — `value`, `defaultValue`, `onChange`의 인자, `DateRange`의 모든 요소 — 는 ISO 8601 UTC 문자열 또는 `null`입니다. `Date` 객체를 쓰지 않습니다.

```ts
type ISODateString = string; // 예: "2026-04-15T00:00:00.000Z"
```

## `Date` 객체를 쓰지 않는 이유

`Date` 객체는 변경 가능하고, 타임존이 모호하며, 직렬화가 일관되지 않습니다. 전형적인 버그:

```ts
// 서울의 사용자가 4월 15일을 고름
const picked = new Date(2026, 3, 15); // KST 기준 "2026-04-14T15:00:00.000Z" 🤦

// DB에 저장
await save(picked);

// UTC 서버에서 읽음
new Date(picked.toISOString()).getDate(); // 14 — 하루 밀림
```

ISO 문자열은 경계에서 모호함을 없앱니다.

```tsx
<DatePicker
  value="2026-04-15T00:00:00.000Z"  // 항상 UTC 자정
  onChange={(iso) => save(iso)}      // 항상 UTC 문자열
/>
```

Kalyx는 다음을 보장합니다.

1. 명시적 시간이 없으면 날짜는 **UTC 자정** (`T00:00:00.000Z`)으로 저장.
2. `onChange`는 절대 `Date`를 넘기지 않음 — 문자열 또는 `null`만.
3. 내부 산술은 UTC 안전한 [`DateAdapter`](./adapters.md)가 처리.

## 로컬 시간 표시

값은 UTC. **표시**는 렌더링 문제로, 각 Root의 `displayFormat`과 `locale`이 담당합니다.

```tsx
<DatePicker
  value={iso}
  onChange={setIso}
  displayFormat="yyyy년 M월 d일"
  locale="ko-KR"
/>
```

어댑터가 요청한 로케일로 UTC 시각을 포맷합니다.

## `Date`와의 변환

레거시 폼 라이브러리 등 반드시 `Date`로 연결해야 할 때는 경계에서 처리하세요.

```ts
// Date → ISO
const iso = new Date(2026, 3, 15).toISOString();
// → "2026-04-14T15:00:00.000Z"  (여전히 KST 영향!)

// 안전: UTC 자정을 직접 만들기
const iso = new Date(Date.UTC(2026, 3, 15)).toISOString();
// → "2026-04-15T00:00:00.000Z"

// ISO → Date
const date = new Date(iso);
```

세밀한 변환이 필요하면 `@kalyx/core`의 헬퍼를 쓰세요.

```ts
import { normalizeISO, parseInputValue, DateFnsAdapter } from '@kalyx/react';

normalizeISO('2026-04-15');           // "2026-04-15T00:00:00.000Z"
parseInputValue('15/04/2026', 'dd/MM/yyyy', DateFnsAdapter); // → ISO 또는 null
```

## 시간과 타임존

`TimePicker`와 `DateTimePicker`도 ISO 문자열을 반환합니다. 순수 `TimePicker` 값의 날짜 부분은 안정적 placeholder이므로 시간 필드만 소비하세요 (`@kalyx/core`의 `getTime(iso)`가 도와줍니다).

완전한 IANA 타임존 표시 (예: `"2026-04-15T00:00:00Z"`를 `"2026-04-15 09:00 KST"`로 렌더)는 v0.4에서 도입됩니다. 그 전에는 애플리케이션 쪽에서 표시 포맷팅을 담당하세요.

## 다음

- [어댑터 →](./adapters.md)
- [SSR 안전 →](./ssr.md)
