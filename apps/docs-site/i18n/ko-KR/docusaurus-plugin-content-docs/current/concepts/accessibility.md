---
id: accessibility
title: 접근성
sidebar_position: 5
---

# 접근성

모든 Kalyx 컴포넌트는 WAI-ARIA 역할, 풀 키보드 지원을 갖추고 테스트에서 axe 자동 검사를 통과합니다. 접근성을 *추가*하는 게 아니라 *제거*하려 애써야 사라집니다.

## ARIA 역할 한눈에

| 요소 | 역할 / 속성 |
| --- | --- |
| `DatePicker.Input` | `role="combobox"`, `aria-expanded`, `aria-haspopup="dialog"`, `aria-controls` |
| `DatePicker.Trigger` | `role="button"`, `aria-expanded`, `aria-controls` |
| `DatePicker.Popover` | `role="dialog"`, `aria-modal="false"` |
| `DatePicker.Calendar` | 내부에 `role="grid"`, `role="row"`, `role="gridcell"` |
| `DatePicker.Calendar` 날짜 | `aria-selected`, `aria-disabled`, 오늘은 `aria-current="date"` |
| `TimePicker.HourList` / `.MinuteList` | 자식 `role="option"`을 가진 `role="listbox"` |
| `TimePicker.AmPmToggle` | `role="radio"` 자식 두 개를 가진 `role="radiogroup"` |

모든 역할은 렌더 DOM에 존재합니다 — 스크린 리더가 읽기 위한 JS가 필요 없습니다.

## 키보드 — DatePicker.Calendar

| 키 | 동작 |
| --- | --- |
| `←` / `→` | 하루 이동 |
| `↑` / `↓` | 한 주 이동 |
| `PageUp` / `PageDown` | 이전 / 다음 달 |
| `Shift` + `PageUp` / `PageDown` | 이전 / 다음 연도 |
| `Home` / `End` | 주의 시작 / 끝 |
| `Enter` / `Space` | 포커스된 날짜 선택 |
| `Escape` | popover 닫고 input으로 포커스 복원 |

포커스 위치만 `tabIndex=0`, 나머지 날은 `tabIndex=-1` — 탭 스톱은 하나입니다.

## 키보드 — TimePicker 리스트

| 키 | 동작 |
| --- | --- |
| `↑` / `↓` | 옵션 간 이동 |
| `Home` / `End` | 첫 / 마지막 옵션 |
| `Enter` / `Space` | 옵션 선택 |

## 키보드 — Trigger / Input

- `Tab`은 `Input → Trigger` 순으로 이동.
- `Input`에서 `↓`를 누르면 popover가 열리며 선택된 날짜 (또는 오늘)로 포커스가 이동.
- `Trigger`에서 `Enter`/`Space`로 popover 토글.

## 포커스 관리

- popover가 열리면 포커스가 캘린더 그리드 안으로 이동.
- 닫힐 때 (`Escape`, 바깥 클릭, 날짜 선택)는 열었던 요소로 포커스 복원.
- popover는 의도적으로 **포커스 트랩이 아닙니다** — 폼 제출 버튼 등 패턴 조합을 지원하기 위해서입니다.

## 스크린 리더 라벨

입력에 폼 라벨과 맞는 접근성 이름을 부여하세요.

```tsx
<label htmlFor="checkIn">체크인</label>
<DatePicker value={iso} onChange={setIso}>
  <DatePicker.Input id="checkIn" />
  <DatePicker.Trigger aria-label="캘린더 열기" />
  <DatePicker.Popover aria-label="체크인 날짜 선택">
    <DatePicker.Calendar />
  </DatePicker.Popover>
</DatePicker>
```

RangePicker에서는 각 입력에 라벨을 붙이세요.

```tsx
<label htmlFor="from">시작</label>
<RangePicker.Input id="from" part="start" />
<label htmlFor="to">종료</label>
<RangePicker.Input id="to" part="end" />
```

## 색상 대비

Kalyx는 색상을 전혀 제공하지 않습니다. **팔레트를 여러분이 소유**하므로 대비도 여러분의 책임입니다. 최소 WCAG AA (텍스트 4.5:1, 큰 텍스트/포커스 인디케이터 3:1)를 확보해야 합니다. 특히 점검할 지점:

- `daySelected` vs `dayToday` — 둘 모두 일반 날짜와 구별 가능해야 함.
- 비활성 날짜 — 가독성은 3:1 이상, 그러면서도 흐리게.
- 포커스 외곽선 — `:focus-visible` 스타일을 절대 제거하지 마세요.

## 여러분의 스타일링 검증

구조에 대한 axe 검사는 번들돼 있지만, 대비는 CSS에 민감합니다. 컴포넌트 테스트에 jest-axe를 붙이세요.

```ts
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

it('캘린더가 접근성 기준을 만족한다', async () => {
  const { container } = render(<StyledCalendar />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## 다음

- [Composition →](./composition.md)
- [SSR 안전 →](./ssr.md)
