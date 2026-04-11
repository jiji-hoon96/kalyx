# @kalyx/core — 패키지 컨텍스트

> 플랫폼 독립 날짜 로직 패키지. React에 의존하지 않는다.

## 핵심 원칙

1. **모든 날짜는 ISO 8601 UTC string** — native Date 객체 금지
2. **UTC 기반 연산** — `getUTCFullYear()`, `getUTCMonth()` 등 UTC 메서드만 사용
3. **DateAdapter 인터페이스** — 날짜 라이브러리를 추상화. 현재 date-fns 구현체 제공
4. **순수 함수** — 사이드이펙트 없음. 100% 테스트 커버리지 목표

## 파일 구조

```
src/
├── types.ts              ← 모든 타입 정의 (DateAdapter, CalendarDay 등)
├── adapters/
│   └── date-fns.ts       ← DateFnsAdapter (UTC 기반)
├── utils/
│   ├── calendar.ts       ← getCalendarDays, isDateDisabled
│   └── date.ts           ← normalizeISO, parseInputValue, weekday 헬퍼
├── __tests__/            ← 단위 테스트
└── index.ts              ← 공개 API
```

## 코딩 규칙

- `new Date()` 직접 사용 금지 → `parseISO()` + UTC 메서드 사용
- 로컬 timezone 메서드 금지: `getFullYear()` → `getUTCFullYear()`
- 새 유틸 함수는 반드시 `__tests__/`에 테스트 추가
- `index.ts`에서 내부 구현 export 금지

## 빌드

```bash
pnpm --filter @kalyx/core build     # tsup: ESM + CJS + DTS
pnpm --filter @kalyx/core typecheck
```
