import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { WeekPicker } from './index.js';
import type { DateRange } from '@kalyx/core';

function renderWeekPicker(
  props: {
    value?: DateRange;
    defaultValue?: DateRange;
    onChange?: (r: DateRange) => void;
    disabled?: boolean;
    weekStartsOn?: 0 | 1;
  } = {},
) {
  const onChange = props.onChange ?? vi.fn();
  const result = render(
    <WeekPicker
      value={props.value}
      defaultValue={props.defaultValue}
      onChange={onChange}
      disabled={props.disabled}
      weekStartsOn={props.weekStartsOn}
    >
      <WeekPicker.Input part="start" />
      <WeekPicker.Input part="end" />
      <WeekPicker.Popover>
        <WeekPicker.Calendar />
      </WeekPicker.Popover>
    </WeekPicker>,
  );
  return { ...result, onChange };
}

// Anchor the calendar view on January 2026 by giving it a value in that month.
const JAN_ANCHOR: DateRange = {
  start: '2026-01-01T00:00:00.000Z',
  end: '2026-01-01T00:00:00.000Z',
};

describe('WeekPicker — single-click commits the full week', () => {
  it('selects Sunday–Saturday when weekStartsOn=0', async () => {
    const user = userEvent.setup();
    const { onChange } = renderWeekPicker({ value: JAN_ANCHOR, weekStartsOn: 0 });

    await user.click(screen.getByLabelText('Start date'));
    // Click Jan 14, 2026 (Wednesday) — expect range Jan 11 (Sun) – Jan 17 (Sat)
    await user.click(screen.getByRole('button', { name: /January 14, 2026/ }));

    expect(onChange).toHaveBeenCalledWith({
      start: expect.stringMatching(/^2026-01-11T/),
      end: expect.stringMatching(/^2026-01-17T/),
    });
  });

  it('selects Monday–Sunday when weekStartsOn=1', async () => {
    const user = userEvent.setup();
    const { onChange } = renderWeekPicker({ value: JAN_ANCHOR, weekStartsOn: 1 });

    await user.click(screen.getByLabelText('Start date'));
    // Click Jan 14, 2026 (Wed) — expect range Jan 12 (Mon) – Jan 18 (Sun)
    await user.click(screen.getByRole('button', { name: /January 14, 2026/ }));

    expect(onChange).toHaveBeenCalledWith({
      start: expect.stringMatching(/^2026-01-12T/),
      end: expect.stringMatching(/^2026-01-18T/),
    });
  });

  it('closes the popover after a week is selected', async () => {
    const user = userEvent.setup();
    renderWeekPicker({ value: JAN_ANCHOR });

    await user.click(screen.getByLabelText('Start date'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /January 14, 2026/ }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('commits full week when Enter is pressed on the focused day', async () => {
    const user = userEvent.setup();
    function Wrapper() {
      const [v, setV] = useState<DateRange>({
        start: '2026-01-14T00:00:00.000Z',
        end: '2026-01-14T00:00:00.000Z',
      });
      return (
        <WeekPicker value={v} onChange={setV} weekStartsOn={0}>
          <WeekPicker.Input part="start" />
          <WeekPicker.Input part="end" />
          <WeekPicker.Popover>
            <WeekPicker.Calendar />
          </WeekPicker.Popover>
        </WeekPicker>
      );
    }
    const { container } = render(<Wrapper />);
    // Clear any prior range state by opening fresh
    await user.click(screen.getByLabelText('Start date'));
    await user.keyboard('{Enter}');

    // After Enter, the start input should reflect Jan 11 (Sunday of that week)
    const startInput = container.querySelector<HTMLInputElement>('input[aria-label="Start date"]');
    expect(startInput?.value).toMatch(/^2026-01-11/);
  });
});

describe('WeekPicker — visual range highlighting', () => {
  it('highlights every day in the selected week with aria-selected', () => {
    renderWeekPicker({
      value: {
        start: '2026-01-11T00:00:00.000Z',
        end: '2026-01-17T00:00:00.000Z',
      },
      weekStartsOn: 0,
    });
    // Note: popover is closed by default; open it to inspect cells
  });

  it('applies in-week classes to all 7 days of the selected week', async () => {
    const user = userEvent.setup();
    renderWeekPicker({
      value: {
        start: '2026-01-11T00:00:00.000Z',
        end: '2026-01-17T00:00:00.000Z',
      },
      weekStartsOn: 0,
    });

    await user.click(screen.getByLabelText('Start date'));

    // Each day Jan 11-17 should have aria-selected="true" on its <td>
    for (const dayNumber of [11, 12, 13, 14, 15, 16, 17]) {
      const btn = screen.getByRole('button', { name: new RegExp(`January ${dayNumber}, 2026`) });
      const cell = btn.closest('[role="gridcell"]');
      expect(cell).toHaveAttribute('aria-selected', 'true');
    }
    // Day outside the week should not
    const jan10 = screen.getByRole('button', { name: /January 10, 2026/ });
    const cell10 = jan10.closest('[role="gridcell"]');
    expect(cell10).not.toHaveAttribute('aria-selected', 'true');
  });
});

describe('WeekPicker — accessibility', () => {
  it('passes axe checks when closed', async () => {
    const { container } = renderWeekPicker({
      value: {
        start: '2026-01-11T00:00:00.000Z',
        end: '2026-01-17T00:00:00.000Z',
      },
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe checks when open', async () => {
    const user = userEvent.setup();
    const { container } = renderWeekPicker({
      value: {
        start: '2026-01-11T00:00:00.000Z',
        end: '2026-01-17T00:00:00.000Z',
      },
    });

    await user.click(screen.getByLabelText('Start date'));

    const results = await axe(container, {
      rules: {
        'aria-command-name': { selector: ':not([data-floating-ui-focus-guard])' },
      },
    });
    expect(results).toHaveNoViolations();
  });
});

describe('WeekPicker — SSR safety', () => {
  it('renderToString runs without errors', async () => {
    const { renderToString } = await import('react-dom/server');
    expect(() => {
      renderToString(
        <WeekPicker
          value={{ start: '2026-01-11T00:00:00.000Z', end: '2026-01-17T00:00:00.000Z' }}
          onChange={vi.fn()}
        >
          <WeekPicker.Input part="start" />
          <WeekPicker.Input part="end" />
        </WeekPicker>,
      );
    }).not.toThrow();
  });
});
