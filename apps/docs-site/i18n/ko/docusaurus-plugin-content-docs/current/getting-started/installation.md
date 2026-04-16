---
id: installation
title: 설치
sidebar_position: 1
---

# 설치

Kalyx는 두 개의 패키지로 배포됩니다. 대부분의 앱은 `@kalyx/react`만 설치하면 됩니다 — 필요한 것은 `@kalyx/core`에서 재export됩니다.

## 요구사항

| 항목 | 버전 |
| --- | --- |
| React | `^19.0.0` |
| React DOM | `^19.0.0` |
| Node | `>= 20` |
| TypeScript (선택) | `>= 5.5` |

## 설치 명령

```bash
# pnpm (권장)
pnpm add @kalyx/react

# npm
npm install @kalyx/react

# yarn
yarn add @kalyx/react
```

`@kalyx/react`는 다음에 의존합니다.

- `@kalyx/core` — 플랫폼 독립 날짜 로직.
- `@floating-ui/react` — SSR 안전 popover 위치 계산.
- `date-fns` + `date-fns-tz` — 기본 날짜 엔진.

자동으로 함께 설치됩니다.

## TypeScript

Kalyx는 strict TypeScript로 작성됐습니다. 타입 선언이 패키지에 포함돼 있으므로 `@types/*`가 필요 없습니다.

```tsx
import type {
  DatePickerRootProps,
  DatePickerCalendarClassNames,
  ISODateString,
  DateRange,
} from '@kalyx/react';
```

## 동작 확인

```tsx
import { DatePicker } from '@kalyx/react';

export default function Hello() {
  return (
    <DatePicker defaultValue="2026-04-15T00:00:00.000Z">
      <DatePicker.Input />
    </DatePicker>
  );
}
```

TypeScript 컴파일과 페이지 렌더링에 input이 보이면 완료입니다.

## 다음

- [빠른 시작 →](./quick-start.md)
- [Composition API →](../concepts/composition.md)
