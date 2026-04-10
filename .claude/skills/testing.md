---
name: testing
version: 1.0.0
description: DatePicker 테스트 전략. 단위→통합→접근성→SSR 순으로 계층화된 테스트.
triggers:
  - "테스트를 작성할 때"
  - "테스트가 실패했을 때"
  - "커버리지를 확인할 때"
  - "새 컴포넌트의 테스트 파일을 만들 때"
external_reference: engineering-team/senior-qa (alirezarezvani/claude-skills)
---

# Skill: 테스트 전략

## 테스트 철학

"버그 없는 코드"가 아니라 **"버그를 발견할 수 있는 테스트가 있는 코드"**를 만든다.

테스트의 가치는 커버리지 숫자가 아니라 **"이 테스트가 실제 버그를 잡을 수 있는가"**다.

---

## 테스트 피라미드

```
        ┌──────────┐
        │  E2E     │ ← 소수, 핵심 플로우만 (Playwright)
        ├──────────┤
        │ 통합 테스트│ ← 컴포넌트 인터랙션, SSR, 접근성
        ├──────────┤
        │ 단위 테스트│ ← 코어 로직, 날짜 계산, 순수 함수 (100%)
        └──────────┘
```

---

## 테스트 스택

```
Vitest           ← 빠른 테스트 러너 (Jest 호환)
@testing-library/react  ← 사용자 관점 컴포넌트 테스트
@testing-library/user-event  ← 실제 사용자 인터랙션 시뮬레이션
jest-axe         ← 접근성 자동 검사 (axe-core 기반)
@testing-library/jest-dom  ← DOM 매처 확장
jsdom            ← 브라우저 환경 시뮬레이션
```

---

## 레이어 1: 코어 로직 (100% 커버리지 필수)

순수 함수이므로 빠르고 완전하게 테스트한다.

```tsx
// src/utils/dateUtils.test.ts

describe('getCalendarDays', () => {
  it('2026년 1월의 달력을 올바르게 생성한다', () => {
    const weeks = getCalendarDays('2026-01-01T00:00:00.000Z');
    expect(weeks).toHaveLength(5); // 1월은 5주
    expect(weeks[0][0].dayNumber).toBe(28); // 1월 1일 주의 첫 날 (일요일 기준)
    expect(weeks[0][3].dayNumber).toBe(1);  // 실제 1월 1일
    expect(weeks[0][3].isCurrentMonth).toBe(true);
  });

  it('윤년 2024년 2월은 29일까지 있다', () => {
    const weeks = getCalendarDays('2024-02-01T00:00:00.000Z');
    const allDays = weeks.flat().filter(d => d.isCurrentMonth);
    expect(allDays).toHaveLength(29);
    expect(allDays[28].dayNumber).toBe(29);
  });

  it('비윤년 2026년 2월은 28일까지 있다', () => {
    const weeks = getCalendarDays('2026-02-01T00:00:00.000Z');
    const allDays = weeks.flat().filter(d => d.isCurrentMonth);
    expect(allDays).toHaveLength(28);
  });

  it('주 시작을 월요일로 설정할 수 있다', () => {
    const weeks = getCalendarDays('2026-01-01T00:00:00.000Z', { weekStartsOn: 1 });
    expect(weeks[0][0].dayNumber).toBe(29); // 월요일이 첫 열
  });
});

describe('isDateDisabled', () => {
  const disabledRules = [
    { before: '2026-01-10T00:00:00.000Z' },
    { after: '2026-01-31T00:00:00.000Z' },
    { date: '2026-01-15T00:00:00.000Z' },
    { dayOfWeek: [0, 6] }, // 주말
  ];

  it('before 규칙: 이전 날짜는 disabled', () => {
    expect(isDateDisabled('2026-01-09T00:00:00.000Z', disabledRules)).toBe(true);
    expect(isDateDisabled('2026-01-10T00:00:00.000Z', disabledRules)).toBe(false);
  });

  it('특정 날짜는 disabled', () => {
    expect(isDateDisabled('2026-01-15T00:00:00.000Z', disabledRules)).toBe(true);
  });

  it('주말은 disabled', () => {
    expect(isDateDisabled('2026-01-11T00:00:00.000Z', disabledRules)).toBe(true); // 일요일
    expect(isDateDisabled('2026-01-12T00:00:00.000Z', disabledRules)).toBe(false); // 월요일
  });
});
```

---

## 레이어 2: 컴포넌트 인터랙션

```tsx
// Testing Library 핵심 원칙:
// 사용자가 보는 것(role, label, text)으로 쿼리한다
// 구현 세부사항(class name, test ID)으로 쿼리하지 않는다

const user = userEvent.setup();

describe('DatePicker — 기본 인터랙션', () => {
  it('Input 클릭 → 팝오버 열림', async () => {
    render(
      <DatePicker onChange={vi.fn()}>
        <DatePicker.Input aria-label="날짜" />
        <DatePicker.Popover>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('날짜 클릭 → onChange가 ISO string으로 호출됨', async () => {
    const onChange = vi.fn();
    render(
      <DatePicker
        value="2026-01-01T00:00:00.000Z"
        onChange={onChange}
      >
        <DatePicker.Input aria-label="날짜" />
        <DatePicker.Popover>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>
    );

    await user.click(screen.getByRole('combobox'));
    // "15일" 텍스트를 가진 gridcell 클릭
    await user.click(
      screen.getByRole('gridcell', { name: /2026년 1월 15일/ })
    );

    expect(onChange).toHaveBeenCalledWith(
      expect.stringMatching(/^2026-01-15T/)
    );
  });

  it('Escape → 팝오버 닫힘, 트리거로 포커스 복원', async () => {
    render(<DatePickerTestWrapper />);
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveFocus(); // 포커스 복원
  });

  it('날짜 선택 후 팝오버 닫힘', async () => {
    render(<DatePickerTestWrapper />);
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('gridcell', { name: /15일/ }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('팝오버 바깥 클릭 → 닫힘', async () => {
    render(<DatePickerTestWrapper />);
    await user.click(screen.getByRole('combobox'));
    await user.click(document.body);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
```

---

## 레이어 3: 키보드 내비게이션

```tsx
describe('키보드 내비게이션', () => {
  it('→ 키 → 다음 날로 이동', async () => {
    render(<DatePickerWithInitialValue value="2026-01-15T00:00:00.000Z" />);
    await openCalendar();
    await user.keyboard('{ArrowRight}');
    expect(getFocusedDate()).toMatchISOString(/2026-01-16T/);
  });

  it('← 키 → 이전 날로 이동', async () => { ... });
  it('↑ 키 → 7일 전으로 이동', async () => { ... });
  it('↓ 키 → 7일 후로 이동', async () => { ... });
  it('PageUp → 이전 달', async () => { ... });
  it('PageDown → 다음 달', async () => { ... });
  it('Shift+PageUp → 이전 년', async () => { ... });
  it('Shift+PageDown → 다음 년', async () => { ... });
  it('Home → 주의 첫 날', async () => { ... });
  it('End → 주의 마지막 날', async () => { ... });
  it('Enter → 날짜 선택', async () => { ... });
  it('Space → 날짜 선택', async () => { ... });

  it('disabled 날짜는 포커스되지만 선택되지 않는다', async () => {
    render(
      <DatePickerWithDisabled
        disabled={[{ date: '2026-01-16T00:00:00.000Z' }]}
        value="2026-01-15T00:00:00.000Z"
      />
    );
    await openCalendar();
    await user.keyboard('{ArrowRight}'); // 16일로 이동 (포커스 가능)
    await user.keyboard('{Enter}');       // 선택 시도
    expect(onChange).not.toHaveBeenCalled(); // 선택 안 됨
  });
});
```

---

## 레이어 4: SSR 안전성

```tsx
import { renderToString } from 'react-dom/server';

describe('SSR 안전성', () => {
  it('서버에서 renderToString이 에러 없이 동작한다', () => {
    expect(() => {
      renderToString(
        <DatePicker value="2026-01-15T00:00:00.000Z" onChange={vi.fn()}>
          <DatePicker.Input aria-label="날짜" />
        </DatePicker>
      );
    }).not.toThrow();
  });

  it('window가 없어도 에러가 없다 (Node.js 환경)', () => {
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;

    expect(() => {
      renderToString(<DatePicker onChange={vi.fn()}>
        <DatePicker.Input aria-label="날짜" />
      </DatePicker>);
    }).not.toThrow();

    global.window = originalWindow;
  });

  it('서버에서 렌더링된 HTML이 클라이언트 hydration과 일치한다', () => {
    // React 18+ hydration 테스트
    const container = document.createElement('div');
    const serverHTML = renderToString(
      <DatePicker value="2026-01-15T00:00:00.000Z" onChange={vi.fn()}>
        <DatePicker.Input aria-label="날짜" />
      </DatePicker>
    );
    container.innerHTML = serverHTML;

    expect(() => {
      hydrateRoot(
        container,
        <DatePicker value="2026-01-15T00:00:00.000Z" onChange={vi.fn()}>
          <DatePicker.Input aria-label="날짜" />
        </DatePicker>
      );
    }).not.toThrow(); // hydration mismatch 없음
  });
});
```

---

## 테스트 헬퍼 패턴

```tsx
// test/helpers/DatePickerHelper.tsx
export function renderDatePicker(
  props: Partial<DatePickerRootProps> = {},
) {
  const onChange = vi.fn();

  const result = render(
    <DatePicker onChange={onChange} {...props}>
      <DatePicker.Input aria-label="날짜 선택" />
      <DatePicker.Popover>
        <DatePicker.Calendar />
      </DatePicker.Popover>
    </DatePicker>
  );

  return {
    ...result,
    onChange,
    openCalendar: () =>
      userEvent.click(screen.getByRole('combobox')),
    selectDay: (day: number | string) =>
      userEvent.click(
        screen.getByRole('gridcell', { name: new RegExp(String(day)) })
      ),
    closeWithEscape: () => userEvent.keyboard('{Escape}'),
    getFocusedDate: () =>
      (document.activeElement as HTMLElement)?.getAttribute('aria-label'),
  };
}

// 사용
it('날짜를 선택한다', async () => {
  const { onChange, openCalendar, selectDay } = renderDatePicker();
  await openCalendar();
  await selectDay(15);
  expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/15T/));
});
```

---

## 엣지 케이스 목록 (반드시 커버)

```
날짜 계산:
□ 윤년 2024-02-29 선택 가능
□ 비윤년에서 2024-02-29 → disabled
□ 12월 → 다음 달 이동 시 1월(다음 년)으로
□ 1월 → 이전 달 이동 시 12월(이전 년)으로

입력 검증:
□ value = null → 빈 상태
□ value = undefined → 비제어 모드
□ value = 잘못된 형식 → 에러 처리 (throw vs 무시)
□ minDate = maxDate → 딱 하루만 선택 가능

Range Picker:
□ 시작일 > 종료일 선택 시
□ 시작일 = 종료일 선택 시
□ 시작일 선택 후 disabled 날짜 클릭 시

Timezone:
□ UTC+9 (서울)에서 선택한 날짜가 UTC로 정확히 저장
□ DST 전환일 (미국 서머타임)
□ UTC+12 (뉴질랜드), UTC-12 극단값
```

---

## Vitest 설정

```ts
// vitest.config.ts
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    coverage: {
      thresholds: {
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90,
      },
      exclude: ['**/*.test.*', '**/index.ts', 'apps/**'],
    },
  },
});
```

```ts
// test/setup.ts
import '@testing-library/jest-dom';
import { expect } from 'vitest';
import { toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);
```