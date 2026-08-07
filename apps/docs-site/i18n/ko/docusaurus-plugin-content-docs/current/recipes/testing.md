---
id: testing
title: 테스트
sidebar_position: 4
---

# 테스트

Vitest(또는 Jest) + Testing Library로 애플리케이션 안의 Kalyx 컴포넌트를 테스트하는 방법입니다.

## 설정

테스트 의존성을 설치합니다.

```bash npm2yarn
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jest-axe jsdom
```

Vitest를 jsdom으로 설정합니다.

```ts title="vitest.config.ts"
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
  },
});
```

```ts title="test/setup.ts"
import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';

// jsdom 환경의 Floating UI 에 필요
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
```

## 기본 렌더링

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatePicker, type ISODateString } from '@kalyx/react';

function TestDatePicker({ onChange }: { onChange?: (v: ISODateString | null) => void }) {
  return (
    <DatePicker onChange={onChange}>
      <DatePicker.Input placeholder="Pick a date" />
      <DatePicker.Popover>
        <DatePicker.Calendar />
      </DatePicker.Popover>
    </DatePicker>
  );
}

test('renders an input', () => {
  render(<TestDatePicker />);
  expect(screen.getByPlaceholderText('Pick a date')).toBeInTheDocument();
});
```

## 날짜 선택

```tsx
test('calls onChange with ISO string when a date is clicked', async () => {
  const user = userEvent.setup();
  const handleChange = vi.fn();

  render(<TestDatePicker onChange={handleChange} />);

  // input 을 클릭해 popover 를 연다
  await user.click(screen.getByPlaceholderText('Pick a date'));

  // 날짜 버튼을 클릭한다 (예: 15일)
  const day15 = screen.getByRole('button', { name: /15/ });
  await user.click(day15);

  // onChange 는 Date 객체가 아니라 ISO string 을 받는다
  expect(handleChange).toHaveBeenCalledWith(
    expect.stringMatching(/^\d{4}-\d{2}-15T00:00:00\.000Z$/),
  );
});
```

## 키보드 내비게이션

```tsx
test('can select a date with keyboard only', async () => {
  const user = userEvent.setup();
  const handleChange = vi.fn();

  render(<TestDatePicker onChange={handleChange} />);

  // input 에 포커스를 주고 popover 를 연다
  const input = screen.getByPlaceholderText('Pick a date');
  await user.click(input);

  // 캘린더 안에서 화살표 키로 이동한다
  const grid = screen.getByRole('grid');
  await user.type(grid, '{ArrowDown}');   // 다음 주로 이동
  await user.type(grid, '{ArrowRight}');  // 다음 날로 이동
  await user.type(grid, '{Enter}');       // 선택 확정

  expect(handleChange).toHaveBeenCalledTimes(1);
});

test('Escape closes the popover', async () => {
  const user = userEvent.setup();
  render(<TestDatePicker />);

  await user.click(screen.getByPlaceholderText('Pick a date'));
  expect(screen.getByRole('dialog')).toBeInTheDocument();

  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
```

## 제어 컴포넌트

```tsx
test('controlled mode reflects external value changes', () => {
  const { rerender } = render(
    <DatePicker value="2026-04-15T00:00:00.000Z" onChange={() => {}}>
      <DatePicker.Input />
      <DatePicker.Popover>
        <DatePicker.Calendar />
      </DatePicker.Popover>
    </DatePicker>,
  );

  expect(screen.getByRole('combobox')).toHaveValue('2026-04-15');

  rerender(
    <DatePicker value="2026-12-25T00:00:00.000Z" onChange={() => {}}>
      <DatePicker.Input />
      <DatePicker.Popover>
        <DatePicker.Calendar />
      </DatePicker.Popover>
    </DatePicker>,
  );

  expect(screen.getByRole('combobox')).toHaveValue('2026-12-25');
});
```

## RangePicker

```tsx
import { RangePicker, type DateRange } from '@kalyx/react';

test('selects a date range', async () => {
  const user = userEvent.setup();
  const handleChange = vi.fn();

  render(
    <RangePicker onChange={handleChange}>
      <RangePicker.Input part="start" placeholder="Start" />
      <RangePicker.Input part="end" placeholder="End" />
      <RangePicker.Popover>
        <RangePicker.Calendar />
      </RangePicker.Popover>
    </RangePicker>,
  );

  await user.click(screen.getByPlaceholderText('Start'));

  // 시작일 클릭
  await user.click(screen.getByRole('button', { name: /10/ }));
  // 종료일 클릭
  await user.click(screen.getByRole('button', { name: /20/ }));

  expect(handleChange).toHaveBeenCalledWith(
    expect.objectContaining({
      start: expect.stringMatching(/T00:00:00\.000Z$/),
      end: expect.stringMatching(/T00:00:00\.000Z$/),
    }),
  );
});
```

## 접근성 테스트

WCAG 위반을 잡으려면 `jest-axe`를 쓰세요.

```tsx
import { axe } from 'jest-axe';

test('DatePicker has no accessibility violations', async () => {
  const user = userEvent.setup();
  const { container } = render(<TestDatePicker />);

  // 닫힌 상태 검사
  expect(await axe(container)).toHaveNoViolations();

  // popover 를 열고 열린 상태도 검사
  await user.click(screen.getByPlaceholderText('Pick a date'));
  expect(await axe(container)).toHaveNoViolations();
});
```

## timezone 테스트

`displayTimezone` 동작을 테스트할 때는 raw ISO string 이 아니라 **포매팅된 표시값**을 단언하세요.

```tsx
test('displays date in the specified timezone', () => {
  render(
    <DatePicker
      value="2026-01-15T15:00:00.000Z"
      displayTimezone="Asia/Seoul"
      onChange={() => {}}
    >
      <DatePicker.Input />
      <DatePicker.Popover>
        <DatePicker.Calendar />
      </DatePicker.Popover>
    </DatePicker>,
  );

  // 서울은 UTC+9 이므로 15:00 UTC = 2026-01-16 00:00 KST
  const input = screen.getByRole('combobox');
  expect(input).toHaveValue('2026-01-16');
});
```

## 팁

- **항상 `userEvent.setup()`을 쓰세요** — `fireEvent` 대신입니다. 실제 브라우저 동작(focus, blur, keydown 순서)을 시뮬레이션합니다.
- **테스트 셋업에서 `ResizeObserver`를 목으로 만드세요** — jsdom에는 구현이 없는데 Floating UI가 이를 요구합니다.
- **내부 구현을 테스트하지 마세요** — 내부 상태가 아니라 사용자가 보는 것(input 값, aria 속성, 보이는 텍스트)을 테스트하세요.
- **스냅샷 테스트는 권장하지 않습니다** — 캘린더 그리드는 현재 날짜에 따라 바뀝니다. 동작 단언을 쓰세요.
