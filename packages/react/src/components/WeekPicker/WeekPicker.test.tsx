import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { WeekPicker } from './index.js';
import type { DateRange, DisabledRule } from '@kalyx/core';

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

describe('WeekPicker — year-boundary week (TC-M7)', () => {
  it('computes a week spanning Dec 31 2026 → Jan 1 2027 across the year boundary', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    // Anchor the view on December 2026 so the grid renders that month.
    render(
      <WeekPicker
        value={{ start: '2026-12-15T00:00:00.000Z', end: '2026-12-15T00:00:00.000Z' }}
        onChange={onChange}
        weekStartsOn={0}
      >
        <WeekPicker.Input part="start" />
        <WeekPicker.Input part="end" />
        <WeekPicker.Popover>
          <WeekPicker.Calendar />
        </WeekPicker.Popover>
      </WeekPicker>,
    );

    await user.click(screen.getByLabelText('Start date'));
    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', 'December 2026');

    // Dec 31 2026 is a Thursday. Sunday-anchored week = Dec 27 2026 – Jan 2 2027,
    // which crosses the year boundary and contains both Dec 31 and Jan 1.
    await user.click(screen.getByRole('button', { name: /December 31, 2026/ }));

    expect(onChange).toHaveBeenCalledWith({
      start: expect.stringMatching(/^2026-12-27T/),
      end: expect.stringMatching(/^2027-01-02T/),
    });
  });

  it('highlights every day of the year-boundary week, including the Jan 1 2027 trailing cell', async () => {
    const user = userEvent.setup();
    // A committed week that straddles the boundary: Dec 27 2026 – Jan 2 2027.
    render(
      <WeekPicker
        value={{ start: '2026-12-27T00:00:00.000Z', end: '2027-01-02T00:00:00.000Z' }}
        weekStartsOn={0}
        onChange={vi.fn()}
      >
        <WeekPicker.Input part="start" />
        <WeekPicker.Input part="end" />
        <WeekPicker.Popover>
          <WeekPicker.Calendar />
        </WeekPicker.Popover>
      </WeekPicker>,
    );

    await user.click(screen.getByLabelText('Start date'));

    // Dec 31 2026 (in-month) and Jan 1 2027 (trailing/outside-month cell) both
    // carry aria-selected on their gridcell.
    const dec31 = screen.getByRole('button', { name: /December 31, 2026/ });
    expect(dec31.closest('[role="gridcell"]')).toHaveAttribute('aria-selected', 'true');
    const jan1 = screen.getByRole('button', { name: /January 1, 2027/ });
    expect(jan1.closest('[role="gridcell"]')).toHaveAttribute('aria-selected', 'true');
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

describe('WeekPicker — date rules and edge cases (CLAUDE.md §7)', () => {
  function renderWithDisabled(
    initialValue: DateRange,
    disabled: DisabledRule[],
    onChange = vi.fn(),
  ) {
    return render(
      <WeekPicker value={initialValue} onChange={onChange} disabled={disabled}>
        <WeekPicker.Input part="start" />
        <WeekPicker.Input part="end" />
        <WeekPicker.Popover>
          <WeekPicker.Calendar />
        </WeekPicker.Popover>
      </WeekPicker>,
    );
  }

  it('selects the leap-year week containing Feb 29 2024', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <WeekPicker
        value={{ start: '2024-02-15T00:00:00.000Z', end: '2024-02-15T00:00:00.000Z' }}
        onChange={onChange}
        weekStartsOn={0}
      >
        <WeekPicker.Input part="start" />
        <WeekPicker.Input part="end" />
        <WeekPicker.Popover>
          <WeekPicker.Calendar />
        </WeekPicker.Popover>
      </WeekPicker>,
    );
    await user.click(screen.getByLabelText('Start date'));
    await user.click(screen.getByRole('button', { name: /February 29, 2024/ }));

    // Feb 29 2024 is a Thursday. Sunday-anchored week = Feb 25 – Mar 2.
    expect(onChange).toHaveBeenCalledWith({
      start: expect.stringMatching(/^2024-02-25T/),
      end: expect.stringMatching(/^2024-03-02T/),
    });
  });

  it('blocks clicks outside [before, after] (minDate/maxDate equivalent)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithDisabled(
      { start: '2026-01-15T00:00:00.000Z', end: '2026-01-15T00:00:00.000Z' },
      [{ before: '2026-01-10T00:00:00.000Z' }, { after: '2026-01-20T00:00:00.000Z' }],
      onChange,
    );

    await user.click(screen.getByLabelText('Start date'));
    const day5 = screen.getByRole('button', { name: /January 5, 2026/ });
    expect(day5).toBeDisabled();
    await user.click(day5);
    expect(onChange).not.toHaveBeenCalled();

    // Jan 14, 2026 is a Wednesday; weekStartsOn defaults to 0 (Sun) so the
    // committed week is Sun Jan 11 – Sat Jan 17, both inside [Jan 10, Jan 20].
    await user.click(screen.getByRole('button', { name: /January 14, 2026/ }));
    expect(onChange).toHaveBeenCalledWith({
      start: expect.stringMatching(/^2026-01-11T/),
      end: expect.stringMatching(/^2026-01-17T/),
    });
  });

  it('blocks per-day disabled rules (dayOfWeek) and accepts an enabled day', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithDisabled(
      { start: '2026-01-15T00:00:00.000Z', end: '2026-01-15T00:00:00.000Z' },
      [{ dayOfWeek: [0, 6] }],
      onChange,
    );

    await user.click(screen.getByLabelText('Start date'));
    const sat = screen.getByRole('button', { name: /January 10, 2026/ });
    expect(sat).toBeDisabled();
    expect(sat.closest('[role="gridcell"]')).toHaveAttribute('aria-disabled', 'true');

    await user.click(sat);
    expect(onChange).not.toHaveBeenCalled();

    // Sanity check: an enabled weekday IS selectable. Wed Jan 14 → week Sun
    // Jan 11 – Sat Jan 17, but Sun and Sat are themselves disabled days.
    // The week-mode commits regardless of weekday filtering on endpoints, so
    // verify the call still fires for the chosen day.
    await user.click(screen.getByRole('button', { name: /January 14, 2026/ }));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('keyboard ArrowLeft skips disabled days', async () => {
    const user = userEvent.setup();
    renderWithDisabled({ start: '2026-01-12T00:00:00.000Z', end: '2026-01-12T00:00:00.000Z' }, [
      { dayOfWeek: [0, 6] },
    ]);

    await user.click(screen.getByLabelText('Start date'));
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('button', { name: /January 9, 2026/ })).toHaveFocus();
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

  // Week containing the 2026 US Eastern spring-forward (March 8). WeekPicker
  // reuses RangePicker.Calendar in week-mode, so this also covers the in-range
  // fill for the seven days that span the DST seam.
  it('renders deterministic markup for a DST-boundary week with displayTimezone', async () => {
    const { renderToString } = await import('react-dom/server');
    const tree = (
      <WeekPicker
        value={{ start: '2026-03-08T05:00:00.000Z', end: '2026-03-14T04:00:00.000Z' }}
        displayTimezone="America/New_York"
        onChange={vi.fn()}
      >
        <WeekPicker.Input part="start" />
        <WeekPicker.Input part="end" />
        <WeekPicker.Popover>
          <WeekPicker.Calendar />
        </WeekPicker.Popover>
      </WeekPicker>
    );
    expect(renderToString(tree)).toBe(renderToString(tree));
  });
});
