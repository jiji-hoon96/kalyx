---
id: testing
title: Testing
sidebar_position: 4
---

# Testing

How to test Kalyx components in your application using Vitest (or Jest) + Testing Library.

## Setup

Install the testing dependencies:

```bash npm2yarn
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jest-axe jsdom
```

Configure Vitest with jsdom:

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

// Required for Floating UI in jsdom
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
```

## Basic rendering

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

## Selecting a date

```tsx
test('calls onChange with ISO string when a date is clicked', async () => {
  const user = userEvent.setup();
  const handleChange = vi.fn();

  render(<TestDatePicker onChange={handleChange} />);

  // Open the popover by clicking the input
  await user.click(screen.getByPlaceholderText('Pick a date'));

  // Click a day button (e.g., the 15th)
  const day15 = screen.getByRole('button', { name: /15/ });
  await user.click(day15);

  // onChange receives an ISO string, not a Date object
  expect(handleChange).toHaveBeenCalledWith(
    expect.stringMatching(/^\d{4}-\d{2}-15T00:00:00\.000Z$/),
  );
});
```

## Keyboard navigation

```tsx
test('can select a date with keyboard only', async () => {
  const user = userEvent.setup();
  const handleChange = vi.fn();

  render(<TestDatePicker onChange={handleChange} />);

  // Focus the input and open popover
  const input = screen.getByPlaceholderText('Pick a date');
  await user.click(input);

  // Navigate with arrow keys. Use `user.keyboard`, not `user.type(grid, …)`:
  // `type` clicks its target first, and clicking the non-focusable
  // <table role="grid"> pulls focus off the focused day, so the arrow keys
  // never reach the grid handler and nothing is committed.
  await user.keyboard('{ArrowDown}');   // move to next week
  await user.keyboard('{ArrowRight}');  // move to next day
  await user.keyboard('{Enter}');       // commit selection

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

## Controlled component

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

  // Day buttons are labelled with the full date, e.g. "Friday, April 10, 2026",
  // so a bare /20/ also matches the year in every single cell. Anchor the match.
  // Click start date
  await user.click(screen.getByRole('button', { name: /April 10, 2026/ }));
  // Click end date
  await user.click(screen.getByRole('button', { name: /April 20, 2026/ }));

  expect(handleChange).toHaveBeenCalledWith(
    expect.objectContaining({
      start: expect.stringMatching(/T00:00:00\.000Z$/),
      end: expect.stringMatching(/T00:00:00\.000Z$/),
    }),
  );
});
```

## Accessibility testing

Use `jest-axe` to catch WCAG violations:

```tsx
import { axe } from 'jest-axe';

test('DatePicker has no accessibility violations', async () => {
  const user = userEvent.setup();
  const { container } = render(<TestDatePicker />);

  // Test closed state
  expect(await axe(container)).toHaveNoViolations();

  // Open popover and test open state
  await user.click(screen.getByPlaceholderText('Pick a date'));
  expect(await axe(container)).toHaveNoViolations();
});
```

## Testing with timezone

When testing `displayTimezone` behavior, assert against the formatted display value, not the raw ISO string:

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

  // Seoul is UTC+9, so 15:00 UTC = 2026-01-16 00:00 KST
  const input = screen.getByRole('combobox');
  expect(input).toHaveValue('2026-01-16');
});
```

## Tips

- **Always use `userEvent.setup()`** instead of `fireEvent` — it simulates real browser behavior (focus, blur, keydown sequences).
- **Mock `ResizeObserver`** in your test setup — jsdom doesn't implement it, and Floating UI requires it.
- **Don't test internal implementation** — test what the user sees (input values, aria attributes, visible text), not internal state.
- **Snapshot testing is discouraged** — the calendar grid changes with the current date. Prefer behavior assertions.
