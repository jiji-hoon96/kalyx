---
id: ssr
title: SSR 안전
sidebar_position: 3
---

# SSR 안전

Kalyx는 서버 렌더링을 전제로 설계됐습니다. Next.js App Router, Pages Router, Remix, `renderToString`을 호출하는 모든 환경에서 동작합니다.

## Kalyx가 하는 것

- **안정적 ID**는 React `useId()`로 — 서버/클라이언트 간 일치.
- **모듈 스코프 `window`/`document` 접근 없음.** 모든 DOM 접근은 `useEffect` 안.
- **`useLayoutEffect` 사용 안 함** (핫패스) — SSR 경고 회피.
- **Floating UI**는 SSR 안전한 `useFloating`으로 위치 계산.

한 줄로: 서버에서 `@kalyx/react`를 import하는 것은 안전합니다.

## Next.js App Router 사용법

Kalyx 컴포넌트는 React Context와 상호작용이 필요하므로 **client component**에서 렌더링해야 합니다.

```tsx
// app/booking/date-field.tsx
'use client';

import { useState } from 'react';
import { DatePicker, type ISODateString } from '@kalyx/react';

export function DateField() {
  const [date, setDate] = useState<ISODateString | null>(null);

  return (
    <DatePicker value={date} onChange={setDate}>
      <DatePicker.Input />
      <DatePicker.Popover>
        <DatePicker.Calendar />
      </DatePicker.Popover>
    </DatePicker>
  );
}
```

서버 컴포넌트에서 소비:

```tsx
// app/booking/page.tsx
import { DateField } from './date-field';

export default function Page() {
  return (
    <main>
      <h1>예약 날짜</h1>
      <DateField />
    </main>
  );
}
```

## RSC (React Server Components)

Kalyx 컴포넌트 자체는 client component입니다 — `'use client'` 경계는 Kalyx 안이 아니라 여러분의 래퍼에 있어야 합니다. 보통은:

```tsx
// components/ui/date-field.tsx
'use client';
export { DatePicker } from '@kalyx/react';
```

이렇게 경계 모듈을 하나 두고 거기서만 import하면 `'use client'` 지시문을 한 곳에 모을 수 있습니다.

## 서버에서 비제어 렌더링

SSR 첫 렌더에는 아직 사용자 상호작용이 없습니다. `defaultValue` 혹은 `value={null}`로 시작하세요.

```tsx
{/* 비제어 — 폼에 적합 */}
<DatePicker name="checkIn" defaultValue="2026-04-15T00:00:00.000Z">
  <DatePicker.Input />
</DatePicker>

{/* null 제어 — 선택 필드에 적합 */}
<DatePicker value={null} onChange={setDate}>
  <DatePicker.Input />
</DatePicker>
```

## 하이드레이션 주의점

렌더 시점에 `navigator.language`를 읽어 `displayFormat`이나 `locale`이 서버/클라이언트 간 다르면 하이드레이션 불일치가 납니다. 로케일은 **렌더 이전에** 결정하세요.

```tsx
// 로케일을 쿠키/세션에서 서버측 결정
<DatePicker locale={cookieLocale} value={iso} onChange={setIso}>
  ...
</DatePicker>
```

렌더 본문에서 `navigator`, `window.matchMedia`, `Intl.DateTimeFormat().resolvedOptions()`를 호출하지 마세요. `useEffect`에서 읽고 필요하면 렌더를 지연하세요.

## SSR 테스트

프로덕션 렌더링을 흉내 내는 스모크 테스트를 하나 추가하세요.

```ts
import { renderToString } from 'react-dom/server';
import { DatePicker } from '@kalyx/react';

it('서버에서 에러 없이 렌더된다', () => {
  const html = renderToString(
    <DatePicker defaultValue="2026-04-15T00:00:00.000Z">
      <DatePicker.Input />
      <DatePicker.Popover>
        <DatePicker.Calendar />
      </DatePicker.Popover>
    </DatePicker>,
  );
  expect(html).toContain('input');
});
```

## 다음

- [Composition →](./composition.md)
- [접근성 →](./accessibility.md)
