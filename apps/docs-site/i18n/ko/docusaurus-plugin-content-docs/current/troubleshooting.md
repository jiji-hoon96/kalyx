---
id: troubleshooting
title: Troubleshooting
sidebar_position: 8
---

# Troubleshooting

Common issues and how to fix them.

## Installation

### `Cannot find module '@kalyx/react'`

Make sure you have the correct peer dependencies installed:

```bash
pnpm add @kalyx/react react react-dom
```

Kalyx requires **React 19+**. Check your version:

```bash
pnpm list react
```

### TypeScript errors after install

Kalyx ships its own `.d.ts` files. If you see type errors, ensure your `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler" // or "node16" / "nodenext"
  }
}
```

The legacy `"node"` resolution mode doesn't support `package.json` `exports` — upgrade to `"bundler"` or `"node16"`.

---

## SSR / Next.js

### `useLayoutEffect` warning in Next.js

Kalyx does **not** use `useLayoutEffect`. If you see this warning, it's from another library in your tree. Kalyx uses only `useEffect` and `useId` for SSR safety.

### `ReferenceError: window is not defined`

This should never happen with Kalyx components — all `window`/`document` access is inside `useEffect`. If you encounter it:

1. Check that you're using `@kalyx/react` (not importing from `@kalyx/core` directly in a server component)
2. Ensure you're not destructuring Kalyx components in a Server Component file — wrap them in a Client Component:

```tsx title="components/MyDatePicker.tsx"
'use client';

import { DatePicker } from '@kalyx/react';

export function MyDatePicker() {
  return (
    <DatePicker>
      <DatePicker.Input />
      <DatePicker.Popover>
        <DatePicker.Calendar />
      </DatePicker.Popover>
    </DatePicker>
  );
}
```

### Hydration mismatch

If you see a hydration mismatch, check:

- Are you using `displayTimezone`? The server and client must resolve the same timezone. Avoid relying on the system timezone — always pass an explicit IANA zone string.
- Are you conditionally rendering based on `new Date()`? The server timestamp differs from the client's. Use `defaultValue` instead of computing a value during render.

---

## Popover / Positioning

### Popover appears in the wrong position

Kalyx uses [Floating UI](https://floating-ui.com/) with `flip` and `shift` middleware. If the popover is mispositioned:

1. **Check for `overflow: hidden` on ancestors** — Floating UI detects overflow boundaries. A parent with `overflow: hidden` can clip or misposition the popover.
2. **Check CSS transforms on ancestors** — `transform` creates a new containing block, which can offset `position: fixed` elements.
3. **In a modal/dialog?** — The popover renders as a sibling, not a portal. If your modal clips overflow, the popover may be clipped.

### Popover doesn't close on outside click

This can happen if an element calls `event.stopPropagation()` before the click reaches the document listener. Check your modal or dropdown wrappers.

---

## Timezone

### 선택한 날짜가 하루 어긋나요

이것은 **가장 많이 보고되는 datepicker 버그**입니다([react-datepicker #1018](https://github.com/Hacker0x01/react-datepicker/issues/1018)이 10년 된 사례). 거의 항상 두 가지 원인 중 하나입니다.

**원인 1 — ISO 문자열 대신 네이티브 `Date`를 전달함.** `Date`는 *런타임의* 로컬 존으로 해석되며, 사용자 브라우저와 서버에서 다릅니다:

```ts
// ❌ off-by-one이 기다리고 있음
const picked = new Date(2026, 3, 15); // 로컬 자정 → UTC+9에서 "2026-04-14T15:00:00.000Z"
save(picked.toISOString());           // 서버는 4월 14일로 읽음
```

Kalyx는 `Date`를 받지 않습니다 — 값 계약이 ISO-8601 UTC 문자열이라 이 부류의 버그가 구조적으로 제거됩니다. 항상 `onChange`에서 값을 읽으세요:

```tsx
// ✅ value는 이미 올바른 UTC ISO 문자열
<DatePicker value={value} onChange={setValue}>...</DatePicker>
```

**원인 2 — UTC 순간을 다른 civil 존에서 표시함.** `"2026-04-15T00:00:00.000Z"`는 UTC에서 4월 15일이고 서울에서도 4월 15일이지만, `"2026-04-15T15:00:00.000Z"`는 서울에서 4월 16일입니다. 캘린더가 특정 존의 *civil* 일자 기준으로 커밋·강조하길 원하면 `displayTimezone`을 설정하세요:

```tsx
<DatePicker
  value={value}
  onChange={setValue}
  displayTimezone="Asia/Seoul"   // 서울 civil 일자 기준으로 커밋 + 강조
>
  ...
</DatePicker>
// "4월 15일" 클릭 → onChange는 서울 4월 15일 00:00과 같은 UTC 순간을 방출
```

**진단 체크리스트:**

1. `new Date(...)`를 만들어 `.toISOString()`을 `value`에 넣고 있나요? → 멈추고 `onChange`가 값을 소유하게 하세요.
2. *저장된* 문자열은 맞는데 *표시된* 일자가 틀린가요? → 표시하려는 존으로 `displayTimezone`을 설정하세요.
3. *저장된* 문자열 자체가 틀린가요? → 그것을 쓴 코드를 확인하세요(흔히 서버가 UTC 대신 로컬 `00:00`을 기본값으로 사용).

전체 모델은 [타임존 개념 페이지](./concepts/timezone.md)를 참고하세요.

### `displayTimezone`을 켜면 disabled 날짜나 min/max 경계가 하루 어긋납니다

위와 같은 원인이 한 겹 아래에서 나타난 것입니다. `disabled` 규칙과 `isDateDisabled` 헬퍼는 **instant**를 비교합니다. 손으로 `'2026-01-15T00:00:00.000Z'`라고 쓴 경계값은 civil 자정이 아니라 UTC 좌표이므로, `displayTimezone`이 켜져 있으면 경계일 자체가 규칙의 반대편으로 넘어갈 수 있습니다.

```tsx
import { civilMidnightFromUtcDay } from '@kalyx/core';

const tz = 'America/New_York';

// ❌ raw UTC 좌표 — New_York에서 이 instant는 현지 기준 아직 1월 14일
disabled={[{ before: '2026-01-15T00:00:00.000Z' }]}

// ✅ 같은 civil 날짜를, 피커가 실제로 쓰는 instant로 표현
disabled={[{ before: civilMidnightFromUtcDay('2026-01-15T00:00:00.000Z', tz) }]}
```

믿을 수 있는 규칙: `displayTimezone`을 설정했다면 피커에 넘기는 모든 날짜는 **피커가 스스로 내보낼 수 있었던 값**이어야 합니다 — `onChange`로 돌려받은 값이거나 `civilMidnightFromUtcDay`로 만든 값입니다. 커스텀 그리드 안에서는 `isDateDisabled`를 직접 부르지 말고 `getCalendarDays`가 셀마다 이미 계산해 둔 `isDisabled` 플래그를 쓰세요.

### DST 전환 시 예기치 않은 동작

DST 전환(예: 미국 "spring forward") 동안 새벽 2:00는 존재하지 않습니다. Kalyx는 two-pass 오프셋 보정으로 내부 처리합니다. 수동 타임존 계산을 한다면 자정을 직접 계산하지 말고 `@kalyx/core`의 `startOfDayInTimezone`을 쓰세요.

---

## Styling

### Components have no styles at all

This is by design — Kalyx is headless. You must provide styles via `classNames` props or `className`. See the [Tailwind recipe](./recipes/tailwind.md) for a complete example.

### `classNames` prop doesn't work

Make sure you're passing an object, not a string:

```tsx
// ❌ Wrong — className (string) only applies to the root element
<DatePicker.Calendar className="my-calendar" />

// ✅ Right — classNames (object) targets internal slots
<DatePicker.Calendar
  classNames={{
    root: 'my-calendar',
    day: 'my-day',
    daySelected: 'my-day-selected',
  }}
/>
```

Both `className` (root element) and `classNames` (slots) are supported. Use `classNames` when you need to style internal elements.

---

## Forms

### Value is not submitted with the form

In uncontrolled mode, pass a `name` prop to `DatePicker.Root`:

```tsx
<DatePicker name="startDate" defaultValue="2026-04-15T00:00:00.000Z">
  <DatePicker.Input name="startDate" />
  ...
</DatePicker>
```

### react-hook-form integration

See the dedicated [React Hook Form recipe](./recipes/react-hook-form.md).

---

## Performance

### Calendar re-renders on every state change

This is normal — the calendar grid is lightweight (~42 cells). If you're experiencing jank:

1. Profile with React DevTools — check if the re-render is actually slow
2. Avoid creating new objects on every render in parent components:

```tsx
// ❌ Creates a new array on every render
<DatePicker disabled={[{ dayOfWeek: [0, 6] }]}>

// ✅ Stable reference
const DISABLED = [{ dayOfWeek: [0, 6] }] as const;
<DatePicker disabled={DISABLED}>
```

### 번들 크기가 예상보다 큽니다

서로 다른 두 숫자를 보게 되는데, 둘 다 맞습니다 — 재는 대상이 다릅니다.

**~18.5 KB 는 배포된 아티팩트입니다.** 배지와 CI 게이트가 추적하는 값으로, 의존성을 external 로 둔 `@kalyx/react` 자체 `dist/index.js` 의 gzip 크기입니다. Kalyx 가 직접 통제하고 게이팅하는 수치입니다 — 기본 엔트리는 ESM·CJS 모두 20 KB 입니다. 선택적으로 쓰는 `headless` 엔트리는 같은 컴포넌트에 훅 7종까지 싣기 때문에 22 KB 로 따로 게이팅합니다.

**~24 KB 는 소비자가 실제로 배포하는 크기입니다.** 아티팩트가 참조만 하던 의존성을 번들러가 해석하므로, 그래프에 `@kalyx/core`·`@kalyx/adapter-date-fns`(및 거기서 쓰는 date-fns 함수들)·`@floating-ui/react` 가 함께 들어옵니다. 이 저장소에서 `pnpm check-tree-shaking` 을 돌리면 실측 시나리오를 볼 수 있습니다 — 현재 피커 하나 기준 약 24.0 KB gzip, 7종 전부 + 훅 기준 약 25.0 KB 입니다.

두 수치의 약 5.5 KB 차이는 의존성 그래프이지 Kalyx 의 오버헤드가 아닙니다. 단일 합산 수치를 공개하는 라이브러리와 비교할 때는 ~24 KB 쪽을 인용하세요.

그보다도 번들이 크다면:

1. 프로덕션 번들러 리포트를 확인하세요. 현재 루트 엔트리는 picker별 제거를 보장하지 않습니다 — 피커 하나만 import 해도 7종을 전부 import 하는 것과 비용이 거의 같습니다.
2. 기본 엔트리는 date-fns 어댑터를 포함합니다. 앱에서 다른 날짜 라이브러리를 사용한다면 같은 소비자 설정으로 명시적인 `/headless` 엔트리와 비교해 date-fns 가 두 번 계산되지 않게 하세요.
3. 산출물 한계는 `pnpm check-bundle`, 소비자 시나리오는 `pnpm check-tree-shaking`으로 확인하세요.

---

## Still stuck?

- [기존 이슈](https://github.com/jiji-hoon96/kalyx/issues) 검색
- [버그 리포트](https://github.com/jiji-hoon96/kalyx/issues/new?template=bug_report.yml) 작성
- [기능 요청](https://github.com/jiji-hoon96/kalyx/issues/new?template=feature_request.yml) 보내기
- [Discussions](https://github.com/jiji-hoon96/kalyx/discussions)에서 질문하기
