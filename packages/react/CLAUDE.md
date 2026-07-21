# @kalyx/react — 패키지 컨텍스트

> Headless React DatePicker 컴포넌트 레이어. @kalyx/core 위에 구축.
> (AI 에이전트 공용 문서 — Claude Code 는 이 `CLAUDE.md` 를 자동 로드한다. 모노레포 전체 원칙은 루트 `CLAUDE.md` 참조.)

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
│   ├── DatePicker/           ← 날짜 선택 (Root, Input, Trigger, Popover, Calendar, MonthGrid, YearGrid, Presets, Preset)
│   ├── RangePicker/          ← 날짜 범위 선택 (Root, Input, Popover, Calendar, Presets, Preset)
│   ├── TimePicker/           ← 시간 선택 (Root, Input, HourList, MinuteList, AmPmToggle)
│   ├── DateTimePicker/       ← 날짜+시간 복합 (Root, Input + DatePicker/TimePicker 재사용)
│   ├── MonthPicker/          ← 월 단위 선택 (Root, Input, Trigger, Popover, Grid)
│   ├── YearPicker/           ← 연도 단위 선택 (Root, Input, Trigger, Popover, Grid)
│   └── WeekPicker/           ← 주 단위 선택 (Root, Input, Popover, Calendar)
├── context/
│   ├── DatePickerContext.ts  ← createContext + useDatePickerContext
│   ├── RangePickerContext.ts ← createContext + useRangePickerContext
│   └── TimePickerContext.ts  ← createContext + useTimePickerContext
├── hooks/
│   ├── useDatePicker.ts      ← 커스텀 DatePicker UI용 Hook
│   ├── useRangePicker.ts     ← 커스텀 RangePicker UI용 Hook
│   ├── useTimePicker.ts      ← 커스텀 TimePicker UI용 Hook
│   ├── usePopover.ts         ← Floating UI 공통 로직 (내부)
│   ├── useChangeEffect.ts    ← 값 변경 시에만 콜백 실행 (내부)
│   └── useListboxNavigation.ts ← 리스트박스 키보드 내비게이션 (내부)
└── index.ts                   ← 공개 API (7 컴포넌트 + 3 hooks + 타입)
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
pnpm --filter @kalyx/react build     # tsup: ESM + CJS + DTS (번들 목표 ≤16KB)
pnpm --filter @kalyx/react typecheck
```
