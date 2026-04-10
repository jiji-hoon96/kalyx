---
name: check-a11y
description: 접근성 검사를 실행한다. axe 기반 자동 검사 + 수동 체크리스트.
---

# /check-a11y

## 설명

모든 컴포넌트의 접근성을 점검한다. axe 자동 검사와 수동 체크리스트를 모두 포함한다.

## Claude가 수행할 작업

### 1. axe 자동 검사 실행

```bash
# 접근성 테스트만 실행 (jest-axe 포함)
pnpm test:run --reporter=verbose src/**/*.test.tsx

# 또는 a11y 태그가 있는 테스트만
pnpm test:run --grep "접근성|axe|aria"
```

### 2. 컴포넌트별 ARIA 확인

각 컴포넌트에서 다음을 직접 확인한다:

```
DatePicker.Input:
  □ role="combobox" 있는가?
  □ aria-expanded 있는가?
  □ aria-haspopup="dialog" 있는가?
  □ aria-controls가 calendar id를 가리키는가?
  □ label이 연결됐는가? (htmlFor 또는 aria-label)

DatePicker.Calendar:
  □ role="grid" 있는가?
  □ aria-label에 현재 월/년이 있는가?
  □ th에 abbr 속성이 있는가?
  □ td에 role="gridcell" 있는가?
  □ aria-selected 올바르게 토글되는가?
  □ aria-disabled가 disabled 날짜에 있는가?
  □ aria-current="date"가 오늘 날짜에 있는가?
  □ tabIndex가 포커스된 날짜만 0이고 나머지 -1인가?

DatePicker.Popover:
  □ role="dialog" 있는가?
  □ aria-modal="true" 있는가?
  □ aria-label 또는 aria-labelledby 있는가?
  □ 포커스 트랩이 동작하는가? (Tab 순환)
  □ Escape로 닫히는가?
  □ 닫힐 때 트리거로 포커스가 복원되는가?

CalendarIcon Button:
  □ aria-label 있는가? (예: "달력 열기")
  □ aria-expanded 있는가?
  □ tabIndex={0} 있는가?
  □ SVG에 aria-hidden="true" 있는가?
```

### 3. 키보드 내비게이션 수동 테스트

```
브라우저에서 직접 테스트:

□ Tab만으로 Input까지 이동 가능
□ Enter/Space로 팝오버 열기
□ 방향키(←→↑↓)로 날짜 이동
□ PageUp/Down으로 월 이동
□ Shift+PageUp/Down으로 년 이동
□ Home/End으로 주 첫날/마지막날 이동
□ Enter로 날짜 선택
□ Escape로 팝오버 닫기, 포커스 복원
□ 팝오버 안에서 Tab → 순환 (포커스 트랩)
```

### 4. 스크린리더 테스트 (macOS)

```bash
# VoiceOver 켜기: Command + F5

테스트 순서:
1. Tab으로 DatePicker Input 이동
2. VoiceOver가 "날짜 선택, 편집 가능, 팝업 버튼" 읽는지
3. Enter로 팝오버 열기
4. "X월 달력" 안내 읽히는지
5. 방향키로 날짜 이동 시 "2026년 1월 15일 목요일" 읽히는지
6. Enter로 선택 시 "선택됨" 알림 읽히는지
7. Escape 후 Input으로 포커스 복원 확인
```

### 5. 결과 보고

검사 후 Claude가 보고할 내용:

```
접근성 검사 결과 (YYYY-MM-DD)

자동 검사 (axe):
  ✅ DatePicker.Input — 위반 없음
  ✅ DatePicker.Calendar — 위반 없음
  ✅ DatePicker.Popover — 위반 없음

수동 체크:
  ✅ 키보드 내비게이션 완전 동작
  ⚠️ 월 이동 시 Live Region 알림 미구현 → 이슈 #XX 생성

개선 필요 사항:
  1. [이슈] 월 이동 시 aria-live 알림 추가
```

## 외부 참조

`.claude/skills/accessibility.md` — ARIA 패턴 상세 구현 가이드