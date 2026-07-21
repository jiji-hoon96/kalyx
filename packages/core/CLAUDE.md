# @kalyx/core — 패키지 컨텍스트

> 플랫폼 독립 날짜 로직 패키지. React에 의존하지 않는다.
> (AI 에이전트 공용 문서 — Claude Code 는 이 `CLAUDE.md` 를 자동 로드한다. 모노레포 전체 원칙은 루트 `CLAUDE.md` 참조.)

## 핵심 원칙

1. **모든 날짜는 ISO 8601 UTC string** — native Date 객체 금지
2. **UTC 기반 연산** — `getUTCFullYear()`, `getUTCMonth()` 등 UTC 메서드만 사용
3. **DateAdapter 인터페이스** — 날짜 라이브러리를 추상화. 현재 date-fns 구현체 제공
4. **순수 함수** — 사이드이펙트 없음. 100% 테스트 커버리지 목표

## 파일 구조

```
src/
├── types.ts              ← 타입 정의 (DateAdapter, CalendarDay, DisabledRule 등)
├── adapters/
│   └── date-fns.ts       ← DateFnsAdapter (UTC 기반, 17개 메서드)
├── utils/
│   ├── calendar.ts       ← getCalendarDays, isDateDisabled, minDate, maxDate
│   ├── date.ts           ← normalizeISO, parseInputValue
│   ├── time.ts           ← setTime, getTime, parseTimeString, 12h/24h 변환
│   ├── locale.ts         ← Intl 기반 다국어 월/요일명 (EN, KO, JA 등)
│   ├── timezone.ts       ← DST-aware timezone 유틸 (8개 함수)
│   └── labels.ts         ← 접근성 ARIA 라벨 기본값
├── __tests__/            ← 단위 테스트 (코어 ~140 케이스, 워크스페이스 전체 374)
└── index.ts              ← 공개 API
```

## 코딩 규칙

- `new Date()` 직접 사용 금지 → `parseISO()` + UTC 메서드 사용
- 로컬 timezone 메서드 금지: `getFullYear()` → `getUTCFullYear()`
- 새 유틸 함수는 반드시 `__tests__/`에 테스트 추가
- `index.ts`에서 내부 구현 export 금지

## 플랫폼 독립성

`@kalyx/core`는 DOM / React / Node 전용 API를 참조하지 않아 React Native / 웹 어디서든 동작한다.

| 검사 항목 | 상태 |
|---|---|
| `window` / `document` / `navigator` / `localStorage` | ❌ 미사용 |
| `process.env` / `require()` | ❌ 미사용 |
| `react` import | ❌ 미사용 |
| `new Date()` | ✅ `now()` / `today()` 내부에서만 (의도적) |
| `Intl.DateTimeFormat` | ✅ 사용 — RN Hermes 0.72+ (React Native 0.71+) 기본 지원. 이전 버전은 `hermes-intl` 또는 폴리필 필요 |

핵심 원칙을 유지하려면:
- 외부 IO를 여기에 넣지 말 것 (fetch / fs / storage / analytics 등)
- 브라우저 전용 API에 의존하지 말 것 — React 레이어로 이동시킬 것
- 새 파일 추가 시 "이 모듈을 Node · 브라우저 · React Native 모두에서 import했을 때 깨지는가?"를 확인

## 빌드

```bash
pnpm --filter @kalyx/core build     # tsup: ESM + CJS + DTS
pnpm --filter @kalyx/core typecheck
```
