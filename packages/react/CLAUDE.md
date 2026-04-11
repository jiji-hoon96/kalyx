# @kalyx/react — 패키지 컨텍스트

> Headless React DatePicker 컴포넌트 레이어. @kalyx/core 위에 구축.

## 핵심 원칙

1. **Composition API** — `<DatePicker.Input />`, `<DatePicker.Calendar />` 서브 컴포넌트 조합
2. **Dot Notation** — `Object.assign(Root, { Input, Calendar, ... })` 패턴
3. **SSR 안전** — `window`/`document` 직접 참조 금지 (useEffect 안에서만)
4. **Headless (Zero CSS)** — 스타일은 `classNames` prop과 `data-*` 속성으로 위임
5. **접근성 내장** — WAI-ARIA Calendar Dialog 패턴, 키보드 네비게이션 10종

## 파일 구조

```
src/
├── components/
│   └── DatePicker/
│       ├── Root.tsx          ← Provider, 제어/비제어, 상태 관리
│       ├── Input.tsx         ← role="combobox", 날짜 파싱
│       ├── Trigger.tsx       ← 캘린더 아이콘 버튼
│       ├── Popover.tsx       ← Floating UI, 바깥 클릭/Escape 닫기
│       ├── Calendar.tsx      ← role="grid", 키보드 네비게이션, classNames
│       ├── index.ts          ← Object.assign Dot Notation export
│       └── DatePicker.test.tsx
├── context/
│   └── DatePickerContext.ts  ← createContext + useDatePickerContext
├── hooks/
│   └── useDatePicker.ts     ← 완전 커스텀 UI용 Hook
└── index.ts                  ← 공개 API
```

## 컴포넌트 추가 시 체크리스트

- [ ] HTML 요소 속성을 그대로 받는가? (`...props` spread)
- [ ] `classNames` prop이 있는가? (스타일 가능한 파트별)
- [ ] `useDatePickerContext('ComponentName')` 호출 시 명확한 에러 메시지?
- [ ] 키보드 접근성 (Tab, Enter, Escape, Arrow keys)?
- [ ] ARIA 속성 (role, aria-label, aria-expanded 등)?
- [ ] `DatePicker.test.tsx`에 테스트 추가?
- [ ] `index.ts`의 Object.assign에 등록?

## 빌드

```bash
pnpm --filter @kalyx/react build     # tsup: ESM + CJS + DTS (번들 목표 ≤12KB)
pnpm --filter @kalyx/react typecheck
```
