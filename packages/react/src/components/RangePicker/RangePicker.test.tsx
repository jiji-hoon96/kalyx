import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { DateFnsAdapter } from '@kalyx/adapter-date-fns';
import { RangePicker } from './index.js';
import { useRangePickerContext } from '../../context/RangePickerContext.js';
import type { DateRange, DisabledRule } from '@kalyx/core';

const EMPTY: DateRange = { start: null, end: null };

/** Test wrapper that auto-updates value in controlled mode. */
function ControlledRangePicker({
  initialValue,
  onChange,
}: {
  initialValue: DateRange;
  onChange?: (r: DateRange) => void;
}) {
  const [value, setValue] = useState<DateRange>(initialValue);
  return (
    <RangePicker
      value={value}
      onChange={(r) => {
        setValue(r);
        onChange?.(r);
      }}
    >
      <RangePicker.Input part="start" />
      <RangePicker.Input part="end" />
      <RangePicker.Popover>
        <RangePicker.Calendar />
      </RangePicker.Popover>
    </RangePicker>
  );
}

function renderRangePicker(
  props: {
    value?: DateRange;
    defaultValue?: DateRange;
    onChange?: (r: DateRange) => void;
    disabled?: DisabledRule[] | boolean;
    displayTimezone?: string;
  } = {},
) {
  const onChange = props.onChange ?? vi.fn();
  const result = render(
    <RangePicker
      value={props.value}
      defaultValue={props.defaultValue}
      onChange={onChange}
      disabled={props.disabled}
      displayTimezone={props.displayTimezone}
    >
      <RangePicker.Input part="start" />
      <RangePicker.Input part="end" />
      <RangePicker.Popover>
        <RangePicker.Calendar />
      </RangePicker.Popover>
    </RangePicker>,
  );
  return { ...result, onChange };
}

describe('RangePicker — basic interactions', () => {
  it('renders two comboboxes (start and end)', () => {
    renderRangePicker();
    const combos = screen.getAllByRole('combobox');
    expect(combos).toHaveLength(2);
    expect(screen.getByLabelText('Start date')).toBeInTheDocument();
    expect(screen.getByLabelText('End date')).toBeInTheDocument();
  });

  it('keeps the popover closed on initial render', () => {
    renderRangePicker();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the popover when an input is clicked', async () => {
    const user = userEvent.setup();
    renderRangePicker();

    await user.click(screen.getByLabelText('Start date'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('selects start on the first click and end on the second click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ControlledRangePicker
        initialValue={{ start: '2026-01-01T00:00:00.000Z', end: '2026-01-31T00:00:00.000Z' }}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByLabelText('Start date'));

    // First click (Jan 10) sets start
    const day10 = screen.getByRole('button', { name: /January 10, 2026/ });
    await user.click(day10);

    expect(onChange).toHaveBeenLastCalledWith({
      start: expect.stringMatching(/^2026-01-10T/),
      end: null,
    });

    // Second click (Jan 20) sets end
    const day20 = screen.getByRole('button', { name: /January 20, 2026/ });
    await user.click(day20);

    expect(onChange).toHaveBeenLastCalledWith({
      start: expect.stringMatching(/^2026-01-10T/),
      end: expect.stringMatching(/^2026-01-20T/),
    });
  });

  it('swaps start and end automatically when end is earlier than start', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ControlledRangePicker
        initialValue={{ start: '2026-01-01T00:00:00.000Z', end: '2026-01-31T00:00:00.000Z' }}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByLabelText('Start date'));

    // First click (Jan 20) sets start
    await user.click(screen.getByRole('button', { name: /January 20, 2026/ }));
    // Second click (Jan 10) triggers a swap because end precedes start
    await user.click(screen.getByRole('button', { name: /January 10, 2026/ }));

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1]![0] as DateRange;
    expect(lastCall.start).toMatch(/^2026-01-10T/);
    expect(lastCall.end).toMatch(/^2026-01-20T/);
  });

  it('renders a hover preview range after the start is committed (TC-H1)', async () => {
    // Regression guard for the RangePicker's signature UX: while only `start`
    // is committed, hovering over a candidate end-date should mark every day
    // between (exclusive) with data-in-range="true" so consumers can paint a
    // preview shading. Pre-fix the test suite had zero `onMouseEnter`/`hover`
    // assertions against any RangePicker behaviour.
    const user = userEvent.setup();
    render(
      <ControlledRangePicker
        initialValue={{ start: '2026-01-01T00:00:00.000Z', end: '2026-01-31T00:00:00.000Z' }}
      />,
    );

    await user.click(screen.getByLabelText('Start date'));
    // Commit Jan 10 as start.
    await user.click(screen.getByRole('button', { name: /January 10, 2026/ }));

    // Sanity: end is now null and only start is committed → no preview yet.
    expect(screen.getByRole('button', { name: /January 12, 2026/ })).not.toHaveAttribute(
      'data-in-range',
    );

    // Hover Jan 15 — the candidate end. Days 11..14 should show preview shading
    // (data-in-range) and Jan 15 itself should NOT (it's the candidate endpoint,
    // not strictly between).
    await user.hover(screen.getByRole('button', { name: /January 15, 2026/ }));

    for (const day of [11, 12, 13, 14]) {
      expect(
        screen.getByRole('button', { name: new RegExp(`January ${day}, 2026`) }),
      ).toHaveAttribute('data-in-range', 'true');
    }
    expect(screen.getByRole('button', { name: /January 15, 2026/ })).not.toHaveAttribute(
      'data-in-range',
    );
    expect(screen.getByRole('button', { name: /January 10, 2026/ })).toHaveAttribute(
      'data-range-start',
      'true',
    );

    // Moving hover further extends the preview window.
    await user.hover(screen.getByRole('button', { name: /January 20, 2026/ }));
    expect(screen.getByRole('button', { name: /January 17, 2026/ })).toHaveAttribute(
      'data-in-range',
      'true',
    );
  });

  it('clears the hover preview when the pointer leaves the calendar grid', async () => {
    const user = userEvent.setup();
    render(
      <ControlledRangePicker
        initialValue={{ start: '2026-01-01T00:00:00.000Z', end: '2026-01-31T00:00:00.000Z' }}
      />,
    );

    await user.click(screen.getByLabelText('Start date'));
    await user.click(screen.getByRole('button', { name: /January 10, 2026/ }));
    await user.hover(screen.getByRole('button', { name: /January 15, 2026/ }));

    expect(screen.getByRole('button', { name: /January 12, 2026/ })).toHaveAttribute(
      'data-in-range',
      'true',
    );

    // Move pointer off the grid entirely.
    await user.unhover(screen.getByRole('button', { name: /January 15, 2026/ }));
    await user.hover(screen.getByLabelText('Start date'));

    expect(screen.getByRole('button', { name: /January 12, 2026/ })).not.toHaveAttribute(
      'data-in-range',
    );
  });

  it('closes the popover after the range is fully selected', async () => {
    const user = userEvent.setup();
    render(
      <ControlledRangePicker
        initialValue={{ start: '2026-01-01T00:00:00.000Z', end: '2026-01-31T00:00:00.000Z' }}
      />,
    );

    await user.click(screen.getByLabelText('Start date'));
    await user.click(screen.getByRole('button', { name: /January 10, 2026/ }));

    // Popover stays open while only start is selected
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /January 20, 2026/ }));

    // Popover closes once end is selected
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes the popover when Escape is pressed', async () => {
    const user = userEvent.setup();
    renderRangePicker();

    await user.click(screen.getByLabelText('Start date'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not propagate Escape to parent handlers when popover is open', async () => {
    const user = userEvent.setup();
    const parentKeyDown = vi.fn();

    render(
      <div onKeyDown={parentKeyDown}>
        <RangePicker onChange={vi.fn()}>
          <RangePicker.Input part="start" />
          <RangePicker.Input part="end" />
          <RangePicker.Popover>
            <RangePicker.Calendar />
          </RangePicker.Popover>
        </RangePicker>
      </div>,
    );

    await user.click(screen.getByLabelText('Start date'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const escapeBubbles = parentKeyDown.mock.calls.filter(
      ([e]: [React.KeyboardEvent]) => e.key === 'Escape',
    );
    expect(escapeBubbles).toHaveLength(0);
  });

  it('shows the selected range in the inputs', () => {
    renderRangePicker({
      value: {
        start: '2026-01-10T00:00:00.000Z',
        end: '2026-01-20T00:00:00.000Z',
      },
    });
    expect(screen.getByLabelText('Start date')).toHaveValue('2026-01-10');
    expect(screen.getByLabelText('End date')).toHaveValue('2026-01-20');
  });

  it('renders empty inputs for an empty range', () => {
    renderRangePicker({ value: EMPTY });
    expect(screen.getByLabelText('Start date')).toHaveValue('');
    expect(screen.getByLabelText('End date')).toHaveValue('');
  });
});

describe('RangePicker — timezone calendar coordinates', () => {
  it.each([
    {
      name: 'a positive-offset range',
      timezone: 'Asia/Seoul',
      value: { start: '2025-12-31T15:00:00.000Z', end: '2026-01-02T15:00:00.000Z' },
      startDay: 1,
      endDay: 3,
    },
    {
      name: 'a negative-offset range',
      timezone: 'America/New_York',
      value: { start: '2026-01-15T05:00:00.000Z', end: '2026-01-17T05:00:00.000Z' },
      startDay: 15,
      endDay: 17,
    },
  ])(
    'opens and highlights $name on its displayed civil days',
    async ({ timezone, value, startDay, endDay }) => {
      const user = userEvent.setup();
      renderRangePicker({ value, displayTimezone: timezone });

      await user.click(screen.getByLabelText('Start date'));

      expect(screen.getByRole('grid')).toHaveAttribute('aria-label', 'January 2026');
      const start = screen.getByRole('button', { name: new RegExp(`January ${startDay}, 2026`) });
      const end = screen.getByRole('button', { name: new RegExp(`January ${endDay}, 2026`) });
      expect(start).toHaveAttribute('data-range-start', 'true');
      expect(start).toHaveFocus();
      expect(end).toHaveAttribute('data-range-end', 'true');
    },
  );
});

function DirectRangeCommit() {
  const { setRange } = useRangePickerContext('DirectRangeCommit');
  return (
    <button
      type="button"
      onClick={() =>
        setRange({
          start: '2026-01-14T15:00:00.000Z',
          end: '2026-01-15T15:00:00.000Z',
        })
      }
    >
      Commit disabled range
    </button>
  );
}

describe('RangePicker — shared range constraints', () => {
  it('rejects a direct context range with a disabled endpoint', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <RangePicker
        defaultValue={{ start: '2026-01-09T15:00:00.000Z', end: '2026-01-09T15:00:00.000Z' }}
        displayTimezone="Asia/Seoul"
        disabled={[{ date: '2026-01-14T15:00:00.000Z' }]}
        onChange={onChange}
      >
        <RangePicker.Input part="start" />
        <DirectRangeCommit />
      </RangePicker>,
    );

    await user.click(screen.getByRole('button', { name: 'Commit disabled range' }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Start date')).toHaveValue('2026-01-10');
  });
});

describe('RangePicker — controlled / uncontrolled modes', () => {
  it('reflects the value prop in controlled mode', () => {
    renderRangePicker({
      value: {
        start: '2026-06-15T00:00:00.000Z',
        end: '2026-06-20T00:00:00.000Z',
      },
    });
    expect(screen.getByLabelText('Start date')).toHaveValue('2026-06-15');
    expect(screen.getByLabelText('End date')).toHaveValue('2026-06-20');
  });

  it('shows defaultValue as the initial value in uncontrolled mode', () => {
    renderRangePicker({
      defaultValue: {
        start: '2026-03-01T00:00:00.000Z',
        end: '2026-03-15T00:00:00.000Z',
      },
    });
    expect(screen.getByLabelText('Start date')).toHaveValue('2026-03-01');
    expect(screen.getByLabelText('End date')).toHaveValue('2026-03-15');
  });
});

describe('RangePicker — disabled state', () => {
  it('disables the inputs when disabled=true', () => {
    renderRangePicker({ disabled: true });
    expect(screen.getByLabelText('Start date')).toBeDisabled();
    expect(screen.getByLabelText('End date')).toBeDisabled();
  });
});

describe('RangePicker — keyboard navigation', () => {
  it('moves the focused day with arrow keys and selects it with Enter', async () => {
    const user = userEvent.setup();
    const { onChange } = renderRangePicker({
      value: { start: '2026-01-15T00:00:00.000Z', end: '2026-01-20T00:00:00.000Z' },
    });

    await user.click(screen.getByLabelText('Start date'));
    // Focus lands on the start (Jan 15); opening resets selectingTarget to 'start'

    // ArrowRight advances by one day (to the 16th)
    await user.keyboard('{ArrowRight}');
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenLastCalledWith({
      start: expect.stringMatching(/^2026-01-16T/),
      end: null,
    });
  });

  it('skips a timezone-disabled civil day when navigating', async () => {
    const user = userEvent.setup();
    renderRangePicker({
      value: { start: '2026-01-15T05:00:00.000Z', end: null },
      displayTimezone: 'America/New_York',
      disabled: [{ date: '2026-01-16T05:00:00.000Z' }],
    });

    await user.click(screen.getByLabelText('Start date'));
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('button', { name: /January 17, 2026/ })).toHaveFocus();
  });

  it.each(['Enter', ' '])('uses the timezone civil instant for %s disabled checks', async (key) => {
    const onChange = vi.fn();
    let reject = false;
    const filter = vi.fn((iso: string) => reject && iso === '2026-01-15T05:00:00.000Z');
    render(
      <RangePicker
        value={{ start: '2026-01-15T05:00:00.000Z', end: null }}
        displayTimezone="America/New_York"
        disabled={[{ filter }]}
        onChange={onChange}
      >
        <RangePicker.Input part="start" />
        <RangePicker.Popover>
          <RangePicker.Calendar />
        </RangePicker.Popover>
      </RangePicker>,
    );
    await userEvent.click(screen.getByLabelText('Start date'));
    reject = true;
    filter.mockClear();
    fireEvent.keyDown(screen.getByRole('grid'), { key });

    expect(filter.mock.calls).toEqual([['2026-01-15T05:00:00.000Z']]);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('RangePicker — range visualization', () => {
  it('sets data-in-range on days inside the range', async () => {
    const user = userEvent.setup();
    renderRangePicker({
      value: {
        start: '2026-01-10T00:00:00.000Z',
        end: '2026-01-15T00:00:00.000Z',
      },
    });

    await user.click(screen.getByLabelText('Start date'));

    const day12 = screen.getByRole('button', { name: /January 12, 2026/ });
    expect(day12).toHaveAttribute('data-in-range', 'true');
  });

  it('sets data-range-start on the start day and data-range-end on the end day', async () => {
    const user = userEvent.setup();
    renderRangePicker({
      value: {
        start: '2026-01-10T00:00:00.000Z',
        end: '2026-01-15T00:00:00.000Z',
      },
    });

    await user.click(screen.getByLabelText('Start date'));

    const day10 = screen.getByRole('button', { name: /January 10, 2026/ });
    const day15 = screen.getByRole('button', { name: /January 15, 2026/ });

    expect(day10).toHaveAttribute('data-range-start', 'true');
    expect(day15).toHaveAttribute('data-range-end', 'true');
  });
});

describe('RangePicker — context errors', () => {
  it('throws when Input is used without Root', () => {
    expect(() => {
      render(<RangePicker.Input part="start" />);
    }).toThrow(/RangePicker.Root 내부에서 사용해야 합니다/);
  });

  it('throws when Calendar is used without Root', () => {
    expect(() => {
      render(<RangePicker.Calendar />);
    }).toThrow(/RangePicker.Root 내부에서 사용해야 합니다/);
  });
});

describe('RangePicker — accessibility', () => {
  it('sets the correct ARIA attributes on the input', () => {
    renderRangePicker();
    const start = screen.getByLabelText('Start date');
    expect(start).toHaveAttribute('role', 'combobox');
    expect(start).toHaveAttribute('aria-expanded', 'false');
    expect(start).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('does not advertise aria-multiselectable on the grid (a range is one selection)', async () => {
    const user = userEvent.setup();
    renderRangePicker();

    await user.click(screen.getByLabelText('Start date'));
    const grid = screen.getByRole('grid');
    expect(grid).not.toHaveAttribute('aria-multiselectable');
  });

  it('passes axe accessibility checks (closed state)', async () => {
    const { container } = renderRangePicker({
      value: {
        start: '2026-01-10T00:00:00.000Z',
        end: '2026-01-20T00:00:00.000Z',
      },
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe accessibility checks (open state)', async () => {
    const user = userEvent.setup();
    const { container } = renderRangePicker({
      value: {
        start: '2026-01-10T00:00:00.000Z',
        end: '2026-01-20T00:00:00.000Z',
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

  it('announces the next selection target after picking start', async () => {
    const user = userEvent.setup();
    render(
      <ControlledRangePicker
        initialValue={{ start: '2026-01-01T00:00:00.000Z', end: '2026-01-31T00:00:00.000Z' }}
      />,
    );

    await user.click(screen.getByLabelText('Start date'));
    await user.click(screen.getByRole('button', { name: /January 10, 2026/ }));

    const live = screen.getByRole('status');
    expect(live.textContent).toMatch(/January 10, 2026/);
    expect(live.textContent).toMatch(/Now select end date/);
  });

  it('announces the full range when both endpoints commit', async () => {
    const user = userEvent.setup();
    render(
      <ControlledRangePicker
        initialValue={{ start: '2026-01-01T00:00:00.000Z', end: '2026-01-31T00:00:00.000Z' }}
      />,
    );

    await user.click(screen.getByLabelText('Start date'));
    await user.click(screen.getByRole('button', { name: /January 10, 2026/ }));
    await user.click(screen.getByRole('button', { name: /January 20, 2026/ }));

    const live = screen.getByRole('status');
    expect(live.textContent).toMatch(/Range selected/);
    expect(live.textContent).toMatch(/January 10, 2026/);
    expect(live.textContent).toMatch(/January 20, 2026/);
  });

  it('announces the swapped range when the second click precedes the first', async () => {
    const user = userEvent.setup();
    render(
      <ControlledRangePicker
        initialValue={{ start: '2026-01-01T00:00:00.000Z', end: '2026-01-31T00:00:00.000Z' }}
      />,
    );

    await user.click(screen.getByLabelText('Start date'));
    // First click Jan 20 (becomes start), second click Jan 10 swaps so the announcement
    // must reflect Jan 10 – Jan 20, not the click order.
    await user.click(screen.getByRole('button', { name: /January 20, 2026/ }));
    await user.click(screen.getByRole('button', { name: /January 10, 2026/ }));

    const live = screen.getByRole('status');
    const text = live.textContent ?? '';
    const startIdx = text.indexOf('January 10, 2026');
    const endIdx = text.indexOf('January 20, 2026');
    expect(startIdx).toBeGreaterThan(-1);
    expect(endIdx).toBeGreaterThan(startIdx);
  });

  it('respects the labels prop override for live-region announcements', async () => {
    const user = userEvent.setup();
    render(
      <RangePicker
        defaultValue={{ start: '2026-01-01T00:00:00.000Z', end: '2026-01-31T00:00:00.000Z' }}
        labels={{ selectingEnd: '종료일을 선택하세요', rangeSelected: '범위 선택됨' }}
      >
        <RangePicker.Input part="start" />
        <RangePicker.Input part="end" />
        <RangePicker.Popover>
          <RangePicker.Calendar />
        </RangePicker.Popover>
      </RangePicker>,
    );

    await user.click(screen.getByLabelText('Start date'));
    await user.click(screen.getByRole('button', { name: /January 10, 2026/ }));

    const live = screen.getByRole('status');
    expect(live.textContent).toMatch(/종료일을 선택하세요/);
  });
});

describe('RangePicker — date rules and edge cases (CLAUDE.md §7)', () => {
  // Anchor the calendar on January 2026 by providing a same-month start value.
  function renderWithDisabled(disabled: DisabledRule[], onChange = vi.fn()) {
    return render(
      <RangePicker
        value={{ start: '2026-01-15T00:00:00.000Z', end: '2026-01-15T00:00:00.000Z' }}
        onChange={onChange}
        disabled={disabled}
      >
        <RangePicker.Input part="start" />
        <RangePicker.Input part="end" />
        <RangePicker.Popover>
          <RangePicker.Calendar />
        </RangePicker.Popover>
      </RangePicker>,
    );
  }

  it('selects the leap-year day (Feb 29 2024) as start', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <RangePicker value={{ start: '2024-02-15T00:00:00.000Z', end: null }} onChange={onChange}>
        <RangePicker.Input part="start" />
        <RangePicker.Input part="end" />
        <RangePicker.Popover>
          <RangePicker.Calendar />
        </RangePicker.Popover>
      </RangePicker>,
    );
    await user.click(screen.getByLabelText('Start date'));
    await user.click(screen.getByRole('button', { name: /February 29, 2024/ }));

    expect(onChange).toHaveBeenCalledWith({
      start: expect.stringMatching(/^2024-02-29T/),
      end: null,
    });
  });

  it('blocks clicks outside [before, after] (minDate/maxDate equivalent)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithDisabled(
      [{ before: '2026-01-10T00:00:00.000Z' }, { after: '2026-01-20T00:00:00.000Z' }],
      onChange,
    );

    await user.click(screen.getByLabelText('Start date'));
    const day5 = screen.getByRole('button', { name: /January 5, 2026/ });
    expect(day5).toBeDisabled();
    await user.click(day5);
    expect(onChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /January 12, 2026/ }));
    expect(onChange).toHaveBeenLastCalledWith({
      start: expect.stringMatching(/^2026-01-12T/),
      end: null,
    });
  });

  it('blocks per-day disabled rules (dayOfWeek) and shows them as visually disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithDisabled([{ dayOfWeek: [0, 6] }], onChange);

    await user.click(screen.getByLabelText('Start date'));
    const sat = screen.getByRole('button', { name: /January 10, 2026/ });
    expect(sat).toBeDisabled();
    expect(sat.closest('[role="gridcell"]')).toHaveAttribute('aria-disabled', 'true');

    await user.click(sat);
    expect(onChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /January 12, 2026/ }));
    expect(onChange).toHaveBeenLastCalledWith({
      start: expect.stringMatching(/^2026-01-12T/),
      end: null,
    });
  });

  it('keyboard ArrowLeft skips disabled days', async () => {
    const user = userEvent.setup();
    render(
      <RangePicker
        value={{ start: '2026-01-12T00:00:00.000Z', end: '2026-01-12T00:00:00.000Z' }}
        onChange={vi.fn()}
        disabled={[{ dayOfWeek: [0, 6] }]}
      >
        <RangePicker.Input part="start" />
        <RangePicker.Input part="end" />
        <RangePicker.Popover>
          <RangePicker.Calendar />
        </RangePicker.Popover>
      </RangePicker>,
    );
    await user.click(screen.getByLabelText('Start date'));
    // Focus on Jan 12 (Mon). ArrowLeft → skip Sun → Fri Jan 9.
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('button', { name: /January 9, 2026/ })).toHaveFocus();
  });

  it('moves the first Arrow from the enabled DOM fallback when the controlled start is disabled', async () => {
    const user = userEvent.setup();
    render(
      <RangePicker
        value={{ start: '2026-01-17T00:00:00.000Z', end: null }}
        disabled={[{ dayOfWeek: [0, 6] }]}
        onChange={vi.fn()}
      >
        <RangePicker.Input part="start" />
        <RangePicker.Popover>
          <RangePicker.Calendar />
        </RangePicker.Popover>
      </RangePicker>,
    );

    await user.click(screen.getByLabelText('Start date'));
    expect(screen.getByRole('button', { name: /January 1, 2026/ })).toHaveFocus();

    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('button', { name: /January 2, 2026/ })).toHaveFocus();
  });
});

describe('RangePicker — Presets', () => {
  function renderWithPresets(onChange?: (r: DateRange) => void) {
    const cb = onChange ?? vi.fn();
    const result = render(
      <RangePicker onChange={cb}>
        <RangePicker.Input part="start" />
        <RangePicker.Input part="end" />
        <RangePicker.Popover>
          <RangePicker.Presets>
            <RangePicker.Preset value="today">Today</RangePicker.Preset>
            <RangePicker.Preset value="last7days">Last 7 days</RangePicker.Preset>
            <RangePicker.Preset value="last30days">Last 30 days</RangePicker.Preset>
            <RangePicker.Preset value="thisMonth">This month</RangePicker.Preset>
          </RangePicker.Presets>
          <RangePicker.Calendar />
        </RangePicker.Popover>
      </RangePicker>,
    );
    return { ...result, onChange: cb };
  }

  it('renders Presets as a group', async () => {
    const user = userEvent.setup();
    renderWithPresets();
    await user.click(screen.getByLabelText('Start date'));
    expect(screen.getByRole('group', { name: 'Date range presets' })).toBeInTheDocument();
  });

  it('passes the correct range to onChange when a preset is clicked', async () => {
    const user = userEvent.setup();
    const { onChange } = renderWithPresets();
    await user.click(screen.getByLabelText('Start date'));

    await user.click(screen.getByRole('button', { name: 'Today' }));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        start: expect.any(String),
        end: expect.any(String),
      }),
    );

    // Today preset: start === end
    const call = (onChange as ReturnType<typeof vi.fn>).mock.calls[0]![0] as DateRange;
    expect(call.start).toBe(call.end);
  });

  it('spans seven days for the "Last 7 days" preset', async () => {
    const user = userEvent.setup();
    const { onChange } = renderWithPresets();
    await user.click(screen.getByLabelText('Start date'));

    await user.click(screen.getByRole('button', { name: 'Last 7 days' }));

    const call = (onChange as ReturnType<typeof vi.fn>).mock.calls[0]![0] as DateRange;
    expect(call.start).toBeTruthy();
    expect(call.end).toBeTruthy();
    // end - start = 6 days (7 days inclusive of today)
    const startDate = new Date(call.start!);
    const endDate = new Date(call.end!);
    const diffDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(6);
  });

  it('closes the popover after a preset is clicked', async () => {
    const user = userEvent.setup();
    renderWithPresets();
    await user.click(screen.getByLabelText('Start date'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Today' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('marks the active preset with aria-selected', async () => {
    const user = userEvent.setup();
    renderWithPresets();
    await user.click(screen.getByLabelText('Start date'));

    // Click "Today"
    await user.click(screen.getByRole('button', { name: 'Today' }));

    // Reopen the popover
    await user.click(screen.getByLabelText('Start date'));

    // The "Today" option should be active
    const todayOption = screen.getByRole('button', { name: 'Today' });
    expect(todayOption).toHaveAttribute('aria-pressed', 'true');
  });

  it('recomputes direct-range active state when displayTimezone changes', () => {
    const value = {
      start: '2026-01-15T00:00:00.000Z',
      end: '2026-01-15T00:00:00.000Z',
    };
    const directRange = {
      start: '2026-01-15T05:00:00.000Z',
      end: '2026-01-15T05:00:00.000Z',
    };
    const renderPicker = (displayTimezone?: string) => (
      <RangePicker value={value} displayTimezone={displayTimezone} onChange={vi.fn()}>
        <RangePicker.Preset range={directRange}>Direct range</RangePicker.Preset>
      </RangePicker>
    );
    const { rerender } = render(renderPicker());
    const preset = screen.getByRole('button', { name: 'Direct range' });
    expect(preset).toHaveAttribute('aria-pressed', 'true');

    rerender(renderPicker('America/New_York'));

    expect(preset).toHaveAttribute('aria-pressed', 'false');
  });

  it('sets the correct range for "Last 30 days"', async () => {
    const user = userEvent.setup();
    const { onChange } = renderWithPresets();
    await user.click(screen.getByLabelText('Start date'));

    await user.click(screen.getByRole('button', { name: 'Last 30 days' }));

    const call = (onChange as ReturnType<typeof vi.fn>).mock.calls[0]![0] as DateRange;
    expect(call.start).toBeTruthy();
    expect(call.end).toBeTruthy();
    const diffDays = Math.round(
      (new Date(call.end!).getTime() - new Date(call.start!).getTime()) / (1000 * 60 * 60 * 24),
    );
    expect(diffDays).toBe(29);
  });

  it('sets the correct range for "This month"', async () => {
    const user = userEvent.setup();
    const { onChange } = renderWithPresets();
    await user.click(screen.getByLabelText('Start date'));

    await user.click(screen.getByRole('button', { name: 'This month' }));

    const call = (onChange as ReturnType<typeof vi.fn>).mock.calls[0]![0] as DateRange;
    expect(call.start).toBeTruthy();
    expect(call.end).toBeTruthy();
    // Start should be the first of the month
    expect(call.start).toMatch(/-01T/);
  });

  it.each([
    {
      label: 'This week',
      expected: { start: '2026-03-28T15:00:00.000Z', end: '2026-04-03T15:00:00.000Z' },
    },
    {
      label: 'This month',
      expected: { start: '2026-03-31T15:00:00.000Z', end: '2026-04-29T15:00:00.000Z' },
    },
    {
      label: 'This year',
      expected: { start: '2025-12-31T15:00:00.000Z', end: '2026-03-31T15:00:00.000Z' },
    },
  ])(
    'computes $label in the display timezone at UTC date boundaries',
    async ({ label, expected }) => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const adapter = { ...DateFnsAdapter, today: () => '2026-03-31T15:00:00.000Z' };
      render(
        <RangePicker adapter={adapter} displayTimezone="Asia/Seoul" onChange={onChange}>
          <RangePicker.Presets>
            <RangePicker.Preset value="thisWeek">This week</RangePicker.Preset>
            <RangePicker.Preset value="thisMonth">This month</RangePicker.Preset>
            <RangePicker.Preset value="thisYear">This year</RangePicker.Preset>
          </RangePicker.Presets>
        </RangePicker>,
      );

      await user.click(screen.getByRole('button', { name: label }));

      expect(onChange).toHaveBeenLastCalledWith(expected);
    },
  );

  it('supports explicit ranges via the custom range prop', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <RangePicker onChange={onChange}>
        <RangePicker.Input part="start" />
        <RangePicker.Popover>
          <RangePicker.Presets>
            <RangePicker.Preset
              range={{ start: '2026-01-01T00:00:00.000Z', end: '2026-03-31T00:00:00.000Z' }}
            >
              Q1 2026
            </RangePicker.Preset>
          </RangePicker.Presets>
        </RangePicker.Popover>
      </RangePicker>,
    );
    await user.click(screen.getByLabelText('Start date'));
    await user.click(screen.getByRole('button', { name: 'Q1 2026' }));

    expect(onChange).toHaveBeenCalledWith({
      start: '2026-01-01T00:00:00.000Z',
      end: '2026-03-31T00:00:00.000Z',
    });
  });

  it('rejects a direct preset whose endpoint is disabled without closing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <RangePicker
        defaultValue={{ start: '2026-01-09T15:00:00.000Z', end: '2026-01-09T15:00:00.000Z' }}
        displayTimezone="Asia/Seoul"
        disabled={[{ date: '2026-01-14T15:00:00.000Z' }]}
        onChange={onChange}
      >
        <RangePicker.Input part="start" />
        <RangePicker.Popover>
          <RangePicker.Presets>
            <RangePicker.Preset
              range={{ start: '2026-01-14T15:00:00.000Z', end: '2026-01-15T15:00:00.000Z' }}
            >
              Disabled range
            </RangePicker.Preset>
          </RangePicker.Presets>
        </RangePicker.Popover>
      </RangePicker>,
    );

    await user.click(screen.getByLabelText('Start date'));
    await user.click(screen.getByRole('button', { name: 'Disabled range' }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});

describe('RangePicker — event callbacks', () => {
  it('fires onOpenChange(true) when the popover opens', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <RangePicker value={EMPTY} onChange={vi.fn()} onOpenChange={onOpenChange}>
        <RangePicker.Input part="start" />
        <RangePicker.Input part="end" />
        <RangePicker.Popover>
          <RangePicker.Calendar />
        </RangePicker.Popover>
      </RangePicker>,
    );

    await user.click(screen.getByLabelText('Start date'));
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
  });

  it('fires onOpenChange(false) when Escape closes the popover', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <RangePicker value={EMPTY} onChange={vi.fn()} onOpenChange={onOpenChange}>
        <RangePicker.Input part="start" />
        <RangePicker.Input part="end" />
        <RangePicker.Popover>
          <RangePicker.Calendar />
        </RangePicker.Popover>
      </RangePicker>,
    );

    await user.click(screen.getByLabelText('Start date'));
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('fires onCalendarNavigate when the user clicks next month', async () => {
    const user = userEvent.setup();
    const onCalendarNavigate = vi.fn();
    render(
      <RangePicker
        value={{ start: '2026-01-15T00:00:00.000Z', end: null }}
        onChange={vi.fn()}
        onCalendarNavigate={onCalendarNavigate}
      >
        <RangePicker.Input part="start" />
        <RangePicker.Input part="end" />
        <RangePicker.Popover>
          <RangePicker.Calendar />
        </RangePicker.Popover>
      </RangePicker>,
    );

    await user.click(screen.getByLabelText('Start date'));
    onCalendarNavigate.mockClear();

    await user.click(screen.getByRole('button', { name: 'Next month' }));

    expect(onCalendarNavigate).toHaveBeenCalledTimes(1);
    expect(onCalendarNavigate).toHaveBeenLastCalledWith(expect.stringMatching(/^2026-02-01T/));
  });
});

describe('RangePicker — SSR safety', () => {
  it('renderToString runs without errors on the server', async () => {
    const { renderToString } = await import('react-dom/server');
    expect(() => {
      renderToString(
        <RangePicker
          value={{ start: '2026-01-10T00:00:00.000Z', end: '2026-01-20T00:00:00.000Z' }}
          onChange={vi.fn()}
        >
          <RangePicker.Input part="start" />
          <RangePicker.Input part="end" />
        </RangePicker>,
      );
    }).not.toThrow();
  });

  // Range straddles the 2026 US Eastern spring-forward seam (2026-03-08). Both
  // endpoints, the in-range fill, and the timezone-aware highlighting must
  // produce byte-identical output across two independent renders.
  it('renders deterministic markup across a DST boundary with displayTimezone', async () => {
    const { renderToString } = await import('react-dom/server');
    const tree = (
      <RangePicker
        value={{ start: '2026-03-07T05:00:00.000Z', end: '2026-03-09T04:00:00.000Z' }}
        displayTimezone="America/New_York"
        onChange={vi.fn()}
      >
        <RangePicker.Input part="start" />
        <RangePicker.Input part="end" />
        <RangePicker.Popover>
          <RangePicker.Calendar />
        </RangePicker.Popover>
      </RangePicker>
    );
    expect(renderToString(tree)).toBe(renderToString(tree));
  });
});

describe('RangePicker.Popover — style merging', () => {
  it('preserves Floating UI positioning when user passes a style prop', async () => {
    const user = userEvent.setup();
    render(
      <RangePicker value={EMPTY} onChange={vi.fn()}>
        <RangePicker.Input part="start" />
        <RangePicker.Input part="end" />
        <RangePicker.Popover style={{ padding: 77, background: 'blue' }}>
          <RangePicker.Calendar />
        </RangePicker.Popover>
      </RangePicker>,
    );

    await user.click(screen.getAllByRole('combobox')[0]);
    const dialog = screen.getByRole('dialog');

    expect(dialog.style.padding).toBe('77px');
    expect(dialog.style.background).toBe('blue');
    expect(dialog.style.position).toBe('absolute');
  });
});

describe('RangePicker — RTL (dir="rtl")', () => {
  it('marks the grid with dir="rtl" and mirrors horizontal navigation', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <RangePicker
        value={{ start: '2026-01-15T00:00:00.000Z', end: null }}
        onChange={onChange}
        dir="rtl"
      >
        <RangePicker.Input part="start" />
        <RangePicker.Input part="end" />
        <RangePicker.Popover>
          <RangePicker.Calendar />
        </RangePicker.Popover>
      </RangePicker>,
    );

    await user.click(screen.getAllByRole('combobox')[0]);
    expect(screen.getByRole('grid')).toHaveAttribute('dir', 'rtl');

    // RTL: physically-left cell is the *next* day.
    await user.keyboard('{ArrowLeft}{Enter}');
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ start: expect.stringMatching(/^2026-01-16T/) }),
    );
  });

  it('defaults the grid to dir="ltr"', async () => {
    const user = userEvent.setup();
    render(
      <RangePicker value={{ start: '2026-01-15T00:00:00.000Z', end: null }} onChange={vi.fn()}>
        <RangePicker.Input part="start" />
        <RangePicker.Input part="end" />
        <RangePicker.Popover>
          <RangePicker.Calendar />
        </RangePicker.Popover>
      </RangePicker>,
    );
    await user.click(screen.getAllByRole('combobox')[0]);
    expect(screen.getByRole('grid')).toHaveAttribute('dir', 'ltr');
  });
});
