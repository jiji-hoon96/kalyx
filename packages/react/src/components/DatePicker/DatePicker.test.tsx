import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import type { DisabledRule } from '@kalyx/core';
import { DateFnsAdapter } from '@kalyx/adapter-date-fns';
import { DatePicker } from './index.js';

function renderDatePicker(
  props: {
    value?: string | null;
    defaultValue?: string;
    onChange?: (v: string | null) => void;
    disabled?: boolean;
  } = {},
) {
  const onChange = props.onChange ?? vi.fn();
  const result = render(
    <DatePicker
      value={props.value}
      defaultValue={props.defaultValue}
      onChange={onChange}
      disabled={props.disabled}
    >
      <DatePicker.Input aria-label="날짜 선택" />
      <DatePicker.Popover>
        <DatePicker.Calendar />
      </DatePicker.Popover>
    </DatePicker>,
  );
  return { ...result, onChange };
}

describe('DatePicker — basic interactions', () => {
  it('renders the input with combobox role', () => {
    renderDatePicker();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('keeps the popover closed on initial render', () => {
    renderDatePicker();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the popover when the input is clicked', async () => {
    const user = userEvent.setup();
    renderDatePicker();

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('calls onChange with an ISO string when a day is clicked', async () => {
    const user = userEvent.setup();
    const { onChange } = renderDatePicker({ value: '2026-01-01T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));

    const day15 = screen.getByRole('button', { name: /January 15, 2026/ });
    await user.click(day15);

    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/^2026-01-15T/));
  });

  it('closes the popover after a date is selected', async () => {
    const user = userEvent.setup();
    renderDatePicker({ value: '2026-01-01T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const day15 = screen.getByRole('button', { name: /January 15, 2026/ });
    await user.click(day15);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes the popover when Escape is pressed', async () => {
    const user = userEvent.setup();
    renderDatePicker();

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not propagate Escape to parent handlers when popover is open', async () => {
    // Reproduces the modal-host bug: opening a Kalyx DatePicker inside a
    // Modal/Dialog whose own Escape handler also closes the modal would close
    // BOTH on a single Escape. The popover Escape must be consumed.
    const user = userEvent.setup();
    const parentKeyDown = vi.fn();

    render(
      <div onKeyDown={parentKeyDown}>
        <DatePicker onChange={vi.fn()}>
          <DatePicker.Input aria-label="날짜 선택" />
          <DatePicker.Popover>
            <DatePicker.Calendar />
          </DatePicker.Popover>
        </DatePicker>
      </div>,
    );

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const escapeBubbles = parentKeyDown.mock.calls.filter(
      ([e]: [React.KeyboardEvent]) => e.key === 'Escape',
    );
    expect(escapeBubbles).toHaveLength(0);
  });

  it('lets Escape pass through when the popover is closed', async () => {
    // The consume-Escape fix must scope to the open state. With the popover
    // closed, a parent's Escape handler must still receive the keypress.
    const user = userEvent.setup();
    const parentKeyDown = vi.fn();

    render(
      <div onKeyDown={parentKeyDown}>
        <DatePicker onChange={vi.fn()}>
          <DatePicker.Input aria-label="날짜 선택" />
          <DatePicker.Popover>
            <DatePicker.Calendar />
          </DatePicker.Popover>
        </DatePicker>
      </div>,
    );

    const input = screen.getByRole('combobox');
    input.focus();
    await user.keyboard('{Escape}');

    const escapeBubbles = parentKeyDown.mock.calls.filter(
      ([e]: [React.KeyboardEvent]) => e.key === 'Escape',
    );
    expect(escapeBubbles.length).toBeGreaterThan(0);
  });

  it('restores focus to the input after closing with Escape from inside the grid', async () => {
    // A-D3: a keyboard user opens the picker (focus on Input), arrow-keys into
    // the calendar grid, then presses Escape. The day button unmounts, so focus
    // must return to the Input — not fall back to <body>. The old focus-restore
    // guard skipped restoration whenever the previous element was the Input,
    // which is exactly this case.
    const user = userEvent.setup();
    renderDatePicker({ value: '2026-01-15T00:00:00.000Z' });

    const input = screen.getByRole('combobox');
    await user.click(input);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Move focus off the Input and onto a day button inside the popover.
    await user.keyboard('{ArrowRight}');
    expect(input).not.toHaveFocus();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(input).toHaveFocus();
  });

  it('does not steal focus to the input when closing by clicking another field', async () => {
    // The focus-restore fix must only recover lost focus (Escape unmounts the
    // focused day → focus falls to <body>). When the user closes the popover by
    // clicking a different field, focus already moved there deliberately and
    // must be left alone. (jsdom flushes the native-mousedown close before the
    // click focuses `other`, so this passed even before the activeElement===body
    // guard; the guard makes it correct in real browsers, where React batches
    // the close and restore would otherwise run after `other` is focused.)
    const user = userEvent.setup();
    render(
      <>
        <DatePicker onChange={vi.fn()}>
          <DatePicker.Input aria-label="날짜 선택" />
          <DatePicker.Popover>
            <DatePicker.Calendar />
          </DatePicker.Popover>
        </DatePicker>
        <input aria-label="다른 입력" />
      </>,
    );

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const other = screen.getByLabelText('다른 입력');
    await user.click(other);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(other).toHaveFocus();
  });

  it('shows the selected value in the input', () => {
    renderDatePicker({ value: '2026-01-15T00:00:00.000Z' });
    expect(screen.getByRole('combobox')).toHaveValue('2026-01-15');
  });

  it('renders an empty input when value is null', () => {
    renderDatePicker({ value: null });
    expect(screen.getByRole('combobox')).toHaveValue('');
  });
});

describe('DatePicker — controlled / uncontrolled modes', () => {
  it('reflects the value prop in controlled mode', () => {
    renderDatePicker({ value: '2026-06-15T00:00:00.000Z' });
    expect(screen.getByRole('combobox')).toHaveValue('2026-06-15');
  });

  it('shows defaultValue as the initial value in uncontrolled mode', () => {
    renderDatePicker({ defaultValue: '2026-03-20T00:00:00.000Z' });
    expect(screen.getByRole('combobox')).toHaveValue('2026-03-20');
  });

  it('drops stale typed text when the parent re-sets value externally', async () => {
    const user = userEvent.setup();

    function ExternalUpdater() {
      const [value, setValue] = useState<string | null>('2026-01-15T00:00:00.000Z');
      return (
        <>
          <DatePicker value={value} onChange={setValue}>
            <DatePicker.Input aria-label="날짜 선택" />
          </DatePicker>
          <button onClick={() => setValue('2026-12-25T00:00:00.000Z')}>jump-to-dec-25</button>
        </>
      );
    }

    render(<ExternalUpdater />);
    const input = screen.getByRole('combobox');

    // User types invalid text — parse fails, inputText holds the half-typed string.
    await user.click(input);
    await user.clear(input);
    await user.type(input, '2026-01');
    expect(input).toHaveValue('2026-01');

    // Parent re-sets value externally (e.g. preset button, calendar callback).
    await user.click(screen.getByRole('button', { name: 'jump-to-dec-25' }));

    // Without the fix the input still shows "2026-01"; with the fix it reflects
    // the new value so source-of-truth and display agree.
    expect(input).toHaveValue('2026-12-25');
  });
});

describe('DatePicker — disabled state', () => {
  it('disables the input when disabled=true', () => {
    renderDatePicker({ disabled: true });
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});

describe('DatePicker — calendar navigation', () => {
  it('navigates months with the previous/next buttons', async () => {
    const user = userEvent.setup();
    renderDatePicker({ value: '2026-01-15T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', 'January 2026');

    await user.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', 'February 2026');

    await user.click(screen.getByRole('button', { name: 'Previous month' }));
    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', 'January 2026');
  });
});

describe('DatePicker — timezone calendar coordinates', () => {
  it('opens January and selects/focuses Seoul January 1 from its stored instant', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker value="2025-12-31T15:00:00.000Z" displayTimezone="Asia/Seoul" onChange={vi.fn()}>
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>,
    );

    await user.click(screen.getByRole('combobox'));

    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', 'January 2026');
    const january1 = screen.getByRole('button', { name: /January 1, 2026/ });
    expect(january1).toHaveAttribute('data-selected', 'true');
    expect(january1).toHaveFocus();
  });

  it('opens, selects, and focuses New York January 15 rather than January 16', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker
        value="2026-01-15T05:00:00.000Z"
        displayTimezone="America/New_York"
        onChange={vi.fn()}
      >
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>,
    );

    await user.click(screen.getByRole('combobox'));

    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', 'January 2026');
    const january15 = screen.getByRole('button', { name: /January 15, 2026/ });
    const january16 = screen.getByRole('button', { name: /January 16, 2026/ });
    expect(january15).toHaveAttribute('data-selected', 'true');
    expect(january15).toHaveFocus();
    expect(january16).not.toHaveAttribute('data-selected');
  });
});

describe('DatePicker — keyboard navigation', () => {
  it('opens the calendar with ArrowDown', async () => {
    const user = userEvent.setup();
    renderDatePicker({ value: '2026-01-15T00:00:00.000Z' });

    const input = screen.getByRole('combobox');
    input.focus();
    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('selects the focused day when Enter is pressed', async () => {
    const user = userEvent.setup();
    const { onChange } = renderDatePicker({ value: '2026-01-15T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));

    // Enter on the initially focused day (15)
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/^2026-01-15T/));
  });

  it('moves the focused day with arrow keys and selects it with Enter', async () => {
    const user = userEvent.setup();
    const { onChange } = renderDatePicker({ value: '2026-01-15T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));

    // ArrowRight advances by one day (to the 16th)
    await user.keyboard('{ArrowRight}');
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/^2026-01-16T/));
  });

  it('uses the civil instant for timezone-aware Enter disabled checks', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const filter = vi.fn((iso: string) => iso === '2026-01-15T05:00:00.000Z');
    render(
      <DatePicker
        value="2026-01-15T05:00:00.000Z"
        displayTimezone="America/New_York"
        disabled={[{ filter }]}
        onChange={onChange}
      >
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>,
    );

    await user.click(screen.getByRole('combobox'));
    filter.mockClear();
    fireEvent.keyDown(screen.getByRole('grid'), { key: 'Enter' });

    expect(filter.mock.calls).toEqual([['2026-01-15T05:00:00.000Z']]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('skips dates whose timezone civil instant is disabled during keyboard focus movement', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker
        value="2026-01-15T05:00:00.000Z"
        displayTimezone="America/New_York"
        disabled={[{ filter: (iso) => iso === '2026-01-16T05:00:00.000Z' }]}
        onChange={vi.fn()}
      >
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>,
    );

    await user.click(screen.getByRole('combobox'));
    fireEvent.keyDown(screen.getByRole('grid'), { key: 'ArrowRight' });

    expect(screen.getByRole('button', { name: /January 17, 2026/ })).toHaveFocus();
  });
});

describe('DatePicker — context errors', () => {
  it('throws when Input is used without Root', () => {
    expect(() => {
      render(<DatePicker.Input aria-label="test" />);
    }).toThrow(/DatePicker.Root 내부에서 사용해야 합니다/);
  });

  it('throws when Calendar is used without Root', () => {
    expect(() => {
      render(<DatePicker.Calendar />);
    }).toThrow(/DatePicker.Root 내부에서 사용해야 합니다/);
  });
});

describe('DatePicker — accessibility', () => {
  it('sets the correct ARIA attributes on the input', () => {
    renderDatePicker();
    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveAttribute('aria-haspopup', 'dialog');
    expect(input).toHaveAttribute('aria-autocomplete', 'none');
  });

  it('sets aria-expanded to true when the popover opens', async () => {
    const user = userEvent.setup();
    renderDatePicker();

    const input = screen.getByRole('combobox');
    await user.click(input);

    expect(input).toHaveAttribute('aria-expanded', 'true');
  });

  it('sets aria-label on the calendar grid', async () => {
    const user = userEvent.setup();
    renderDatePicker({ value: '2026-01-15T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));

    const grid = screen.getByRole('grid');
    expect(grid).toHaveAttribute('aria-label', 'January 2026');
  });

  it('passes axe accessibility checks (closed state)', async () => {
    const { container } = renderDatePicker({ value: '2026-01-15T00:00:00.000Z' });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe accessibility checks (open state)', async () => {
    const user = userEvent.setup();
    const { container } = renderDatePicker({ value: '2026-01-15T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));

    // Exclude Floating UI focus guard elements from axe checks
    const results = await axe(container, {
      rules: {
        'aria-command-name': { selector: ':not([data-floating-ui-focus-guard])' },
      },
    });
    expect(results).toHaveNoViolations();
  });
});

describe('DatePicker — MonthGrid', () => {
  it('renders 12 months in the MonthGrid', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker value="2026-01-15T00:00:00.000Z" onChange={vi.fn()}>
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.MonthGrid />
        </DatePicker.Popover>
      </DatePicker>,
    );
    await user.click(screen.getByRole('combobox'));
    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(12);
    expect(cells[0]).toHaveTextContent('January');
    expect(cells[11]).toHaveTextContent('December');
  });

  it('marks the current month as aria-selected', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker value="2026-03-15T00:00:00.000Z" onChange={vi.fn()}>
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.MonthGrid />
        </DatePicker.Popover>
      </DatePicker>,
    );
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('gridcell', { name: 'March' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('invokes the onSelect callback when a month is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <DatePicker value="2026-01-15T00:00:00.000Z" onChange={vi.fn()}>
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.MonthGrid onSelect={onSelect} />
        </DatePicker.Popover>
      </DatePicker>,
    );
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('gridcell', { name: 'June' }));
    expect(onSelect).toHaveBeenCalled();
  });
});

describe('DatePicker — YearGrid', () => {
  it('renders 12 years in the YearGrid', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker value="2026-01-15T00:00:00.000Z" onChange={vi.fn()}>
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.YearGrid />
        </DatePicker.Popover>
      </DatePicker>,
    );
    await user.click(screen.getByRole('combobox'));
    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(12);
  });

  it('marks the current year as aria-selected', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker value="2026-01-15T00:00:00.000Z" onChange={vi.fn()}>
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.YearGrid />
        </DatePicker.Popover>
      </DatePicker>,
    );
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('gridcell', { name: '2026' })).toHaveAttribute('aria-selected', 'true');
  });

  it('invokes the onSelect callback when a year is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <DatePicker value="2026-01-15T00:00:00.000Z" onChange={vi.fn()}>
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.YearGrid onSelect={onSelect} />
        </DatePicker.Popover>
      </DatePicker>,
    );
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('gridcell', { name: '2025' }));
    expect(onSelect).toHaveBeenCalled();
  });
});

describe('DatePicker.MonthGrid — keyboard navigation (drilldown)', () => {
  function renderMonthGrid(onSelect = vi.fn()) {
    return render(
      <DatePicker value="2026-04-15T00:00:00.000Z" onChange={vi.fn()}>
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.MonthGrid onSelect={onSelect} />
        </DatePicker.Popover>
      </DatePicker>,
    );
  }

  it('marks the current month as the only focusable cell (roving tabIndex)', async () => {
    const user = userEvent.setup();
    renderMonthGrid();
    await user.click(screen.getByRole('combobox'));

    expect(screen.getByRole('gridcell', { name: 'April' })).toHaveAttribute('tabIndex', '0');
    expect(screen.getByRole('gridcell', { name: 'January' })).toHaveAttribute('tabIndex', '-1');
  });

  it('moves focus by ±1 with ArrowLeft/Right', async () => {
    const user = userEvent.setup();
    renderMonthGrid();
    await user.click(screen.getByRole('combobox'));
    screen.getByRole('gridcell', { name: 'April' }).focus();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('gridcell', { name: 'May' })).toHaveFocus();

    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(screen.getByRole('gridcell', { name: 'March' })).toHaveFocus();
  });

  it('moves focus by ±3 with ArrowUp/Down', async () => {
    const user = userEvent.setup();
    renderMonthGrid();
    await user.click(screen.getByRole('combobox'));
    screen.getByRole('gridcell', { name: 'April' }).focus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('gridcell', { name: 'July' })).toHaveFocus();

    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('gridcell', { name: 'April' })).toHaveFocus();
  });

  it('Home/End jump to the row first/last', async () => {
    const user = userEvent.setup();
    renderMonthGrid();
    await user.click(screen.getByRole('combobox'));
    // April = index 3 (row 1: April/May/June). ArrowRight → May (index 4).
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('gridcell', { name: 'May' })).toHaveFocus();

    await user.keyboard('{Home}');
    expect(screen.getByRole('gridcell', { name: 'April' })).toHaveFocus();

    await user.keyboard('{End}');
    expect(screen.getByRole('gridcell', { name: 'June' })).toHaveFocus();
  });

  it('PageUp/Down navigate ±1 year and preserve same-position focus', async () => {
    const user = userEvent.setup();
    renderMonthGrid();
    await user.click(screen.getByRole('combobox'));
    screen.getByRole('gridcell', { name: 'April' }).focus();

    await user.keyboard('{PageDown}');
    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', '2027 months');
    expect(screen.getByRole('gridcell', { name: 'April' })).toHaveFocus();

    await user.keyboard('{PageUp}{PageUp}');
    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', '2025 months');
    expect(screen.getByRole('gridcell', { name: 'April' })).toHaveFocus();
  });

  it('Enter on a focused month invokes onSelect', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderMonthGrid(onSelect);
    await user.click(screen.getByRole('combobox'));
    screen.getByRole('gridcell', { name: 'April' }).focus();

    await user.keyboard('{ArrowRight}{Enter}');
    expect(onSelect).toHaveBeenCalled();
  });

  it('Space on a focused month invokes onSelect', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderMonthGrid(onSelect);
    await user.click(screen.getByRole('combobox'));
    screen.getByRole('gridcell', { name: 'April' }).focus();

    await user.keyboard(' ');
    expect(onSelect).toHaveBeenCalled();
  });
});

describe('DatePicker.YearGrid — keyboard navigation (drilldown)', () => {
  function renderYearGrid(onSelect = vi.fn()) {
    return render(
      <DatePicker value="2026-01-15T00:00:00.000Z" onChange={vi.fn()}>
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.YearGrid onSelect={onSelect} />
        </DatePicker.Popover>
      </DatePicker>,
    );
  }

  it('marks the current year as the only focusable cell (roving tabIndex)', async () => {
    const user = userEvent.setup();
    renderYearGrid();
    await user.click(screen.getByRole('combobox'));

    expect(screen.getByRole('gridcell', { name: '2026' })).toHaveAttribute('tabIndex', '0');
    expect(screen.getByRole('gridcell', { name: '2016' })).toHaveAttribute('tabIndex', '-1');
  });

  it('moves focus by ±1 with ArrowLeft/Right', async () => {
    const user = userEvent.setup();
    renderYearGrid();
    await user.click(screen.getByRole('combobox'));
    screen.getByRole('gridcell', { name: '2026' }).focus();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('gridcell', { name: '2027' })).toHaveFocus();

    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(screen.getByRole('gridcell', { name: '2025' })).toHaveFocus();
  });

  it('moves focus by ±3 with ArrowUp/Down', async () => {
    const user = userEvent.setup();
    renderYearGrid();
    await user.click(screen.getByRole('combobox'));
    // 2026 = index 10
    screen.getByRole('gridcell', { name: '2026' }).focus();

    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('gridcell', { name: '2023' })).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('gridcell', { name: '2026' })).toHaveFocus();
  });

  it('Home/End jump to row first/last', async () => {
    const user = userEvent.setup();
    renderYearGrid();
    await user.click(screen.getByRole('combobox'));
    // 2026 = index 10, row 3: 2025 / 2026 / 2027
    screen.getByRole('gridcell', { name: '2026' }).focus();

    await user.keyboard('{Home}');
    expect(screen.getByRole('gridcell', { name: '2025' })).toHaveFocus();

    await user.keyboard('{End}');
    expect(screen.getByRole('gridcell', { name: '2027' })).toHaveFocus();
  });

  it('PageUp/Down navigate ±1 decade and preserve same-position focus', async () => {
    const user = userEvent.setup();
    renderYearGrid();
    await user.click(screen.getByRole('combobox'));
    screen.getByRole('gridcell', { name: '2026' }).focus();

    await user.keyboard('{PageDown}');
    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', '2028–2039');
    // 2026 was index 10 in 2016–2027; same position in next decade is 2038.
    expect(screen.getByRole('gridcell', { name: '2038' })).toHaveFocus();

    await user.keyboard('{PageUp}{PageUp}');
    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', '2004–2015');
    expect(screen.getByRole('gridcell', { name: '2014' })).toHaveFocus();
  });

  it('Enter on a focused year invokes onSelect', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderYearGrid(onSelect);
    await user.click(screen.getByRole('combobox'));
    screen.getByRole('gridcell', { name: '2026' }).focus();

    await user.keyboard('{ArrowLeft}{Enter}');
    expect(onSelect).toHaveBeenCalled();
  });

  it('Space on a focused year invokes onSelect', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderYearGrid(onSelect);
    await user.click(screen.getByRole('combobox'));
    screen.getByRole('gridcell', { name: '2026' }).focus();

    await user.keyboard(' ');
    expect(onSelect).toHaveBeenCalled();
  });
});

describe('DatePicker — Trigger', () => {
  function renderWithTrigger(
    props: {
      value?: string | null;
      onChange?: (v: string | null) => void;
      disabled?: boolean;
    } = {},
  ) {
    const onChange = props.onChange ?? vi.fn();
    const result = render(
      <DatePicker value={props.value} onChange={onChange} disabled={props.disabled}>
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Trigger />
        <DatePicker.Popover>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>,
    );
    return { ...result, onChange };
  }

  it('renders a button with the calendar icon', () => {
    renderWithTrigger();
    const trigger = screen.getByRole('button', { name: 'Open calendar' });
    expect(trigger).toBeInTheDocument();
    expect(trigger.querySelector('svg')).toBeInTheDocument();
  });

  it('opens the popover when clicked', async () => {
    const user = userEvent.setup();
    renderWithTrigger({ value: '2026-01-15T00:00:00.000Z' });

    const trigger = screen.getByRole('button', { name: 'Open calendar' });
    await user.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-label', 'Close calendar');
  });

  it('closes the popover when Escape is pressed after Trigger opens it', async () => {
    const user = userEvent.setup();
    renderWithTrigger({ value: '2026-01-15T00:00:00.000Z' });

    await user.click(screen.getByRole('button', { name: 'Open calendar' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('sets aria-expanded and aria-controls correctly', async () => {
    const user = userEvent.setup();
    renderWithTrigger({ value: '2026-01-15T00:00:00.000Z' });

    const trigger = screen.getByRole('button', { name: 'Open calendar' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls');
  });

  it('is disabled when the picker is disabled', () => {
    renderWithTrigger({ disabled: true });
    expect(screen.getByRole('button', { name: 'Open calendar' })).toBeDisabled();
  });

  it('renders custom children instead of the default icon', () => {
    render(
      <DatePicker onChange={vi.fn()}>
        <DatePicker.Trigger>Open</DatePicker.Trigger>
        <DatePicker.Popover>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>,
    );
    expect(screen.getByRole('button', { name: 'Open calendar' })).toHaveTextContent('Open');
  });

  it('calls the custom onClick handler alongside toggling', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <DatePicker onChange={vi.fn()}>
        <DatePicker.Trigger onClick={onClick} />
        <DatePicker.Popover>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>,
    );
    await user.click(screen.getByRole('button', { name: 'Open calendar' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('DatePicker — event callbacks', () => {
  it('fires onOpenChange(true) when the popover opens', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <DatePicker value="2026-01-15T00:00:00.000Z" onChange={vi.fn()} onOpenChange={onOpenChange}>
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>,
    );

    await user.click(screen.getByRole('combobox'));
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
  });

  it('fires onOpenChange(false) when the popover closes', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <DatePicker value="2026-01-15T00:00:00.000Z" onChange={vi.fn()} onOpenChange={onOpenChange}>
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>,
    );

    await user.click(screen.getByRole('combobox'));
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('does not fire onOpenChange on initial mount', () => {
    const onOpenChange = vi.fn();
    render(
      <DatePicker value="2026-01-15T00:00:00.000Z" onChange={vi.fn()} onOpenChange={onOpenChange}>
        <DatePicker.Input aria-label="날짜 선택" />
      </DatePicker>,
    );
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('fires onCalendarNavigate when the user navigates months', async () => {
    const user = userEvent.setup();
    const onCalendarNavigate = vi.fn();
    render(
      <DatePicker
        value="2026-01-15T00:00:00.000Z"
        onChange={vi.fn()}
        onCalendarNavigate={onCalendarNavigate}
      >
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>,
    );

    await user.click(screen.getByRole('combobox'));
    onCalendarNavigate.mockClear();

    await user.click(screen.getByRole('button', { name: 'Next month' }));

    expect(onCalendarNavigate).toHaveBeenCalledTimes(1);
    expect(onCalendarNavigate).toHaveBeenLastCalledWith(expect.stringMatching(/^2026-02-01T/));
  });
});

describe('DatePicker.Calendar — showWeekNumber', () => {
  it('renders a week-number column when showWeekNumber is true', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker value="2026-01-15T00:00:00.000Z" onChange={vi.fn()}>
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.Calendar showWeekNumber />
        </DatePicker.Popover>
      </DatePicker>,
    );
    await user.click(screen.getByRole('combobox'));

    // Each row should now expose a th[data-week-number] cell
    const weekCells = document.querySelectorAll('th[data-week-number]');
    expect(weekCells.length).toBeGreaterThanOrEqual(4);
    expect(weekCells.length).toBeLessThanOrEqual(6);

    // The week containing Jan 15 2026 is ISO week 3 (Jan 12–18 is week 3)
    const labels = Array.from(weekCells).map((c) => c.textContent);
    expect(labels).toContain('3');
  });

  it('omits the week-number column by default', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker value="2026-01-15T00:00:00.000Z" onChange={vi.fn()}>
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>,
    );
    await user.click(screen.getByRole('combobox'));

    expect(document.querySelectorAll('th[data-week-number]').length).toBe(0);
  });
});

describe('DatePicker.Calendar — fixedWeeks', () => {
  it('always renders 6 rows when fixedWeeks is true', async () => {
    const user = userEvent.setup();
    // February 2026 normally fits in 4-5 weeks
    render(
      <DatePicker value="2026-02-15T00:00:00.000Z" onChange={vi.fn()}>
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.Calendar fixedWeeks />
        </DatePicker.Popover>
      </DatePicker>,
    );
    await user.click(screen.getByRole('combobox'));

    // role="row" includes the thead row, so 6 weeks + 1 header = 7 rows
    expect(screen.getAllByRole('row')).toHaveLength(7);
  });

  it('still emits 4–6 rows when fixedWeeks is false (default)', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker value="2026-02-15T00:00:00.000Z" onChange={vi.fn()}>
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>,
    );
    await user.click(screen.getByRole('combobox'));

    const rows = screen.getAllByRole('row');
    // thead row + 4–5 weeks
    expect(rows.length).toBeGreaterThanOrEqual(5);
    expect(rows.length).toBeLessThanOrEqual(6);
  });
});

describe('DatePicker — Presets', () => {
  it('renders preset buttons inside a group', () => {
    render(
      <DatePicker onChange={vi.fn()}>
        <DatePicker.Presets>
          <DatePicker.Preset value="today">Today</DatePicker.Preset>
          <DatePicker.Preset value="tomorrow">Tomorrow</DatePicker.Preset>
        </DatePicker.Presets>
      </DatePicker>,
    );
    expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tomorrow' })).toBeInTheDocument();
  });

  it('commits today when the today preset is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePicker onChange={onChange}>
        <DatePicker.Presets>
          <DatePicker.Preset value="today">Today</DatePicker.Preset>
        </DatePicker.Presets>
      </DatePicker>,
    );

    await user.click(screen.getByRole('button', { name: 'Today' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/));
  });

  it('commits the exact ISO when a direct date is passed via `date`', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePicker onChange={onChange}>
        <DatePicker.Presets>
          <DatePicker.Preset date="2026-12-25T00:00:00.000Z">Christmas</DatePicker.Preset>
        </DatePicker.Presets>
      </DatePicker>,
    );

    await user.click(screen.getByRole('button', { name: 'Christmas' }));

    expect(onChange).toHaveBeenCalledWith('2026-12-25T00:00:00.000Z');
  });

  it('converts a timezone-aware today preset exactly once', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const adapter = {
      ...DateFnsAdapter,
      today: () => '2026-01-14T15:00:00.000Z',
    };
    render(
      <DatePicker adapter={adapter} displayTimezone="Asia/Seoul" onChange={onChange}>
        <DatePicker.Presets>
          <DatePicker.Preset value="today">Today</DatePicker.Preset>
        </DatePicker.Presets>
      </DatePicker>,
    );

    await user.click(screen.getByRole('button', { name: 'Today' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('2026-01-14T15:00:00.000Z');
  });

  it('converts a timezone-aware direct-date preset exactly once', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePicker displayTimezone="Asia/Seoul" onChange={onChange}>
        <DatePicker.Presets>
          <DatePicker.Preset date="2026-12-24T15:00:00.000Z">Christmas</DatePicker.Preset>
        </DatePicker.Presets>
      </DatePicker>,
    );

    await user.click(screen.getByRole('button', { name: 'Christmas' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('2026-12-24T15:00:00.000Z');
  });

  it('marks the matching preset as aria-pressed', () => {
    render(
      <DatePicker value="2026-12-25T00:00:00.000Z" onChange={vi.fn()}>
        <DatePicker.Presets>
          <DatePicker.Preset date="2026-12-25T00:00:00.000Z">Christmas</DatePicker.Preset>
          <DatePicker.Preset date="2026-01-01T00:00:00.000Z">New Year's</DatePicker.Preset>
        </DatePicker.Presets>
      </DatePicker>,
    );

    expect(screen.getByRole('button', { name: 'Christmas' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: "New Year's" })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('resolves startOfMonth relative to today', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePicker onChange={onChange}>
        <DatePicker.Presets>
          <DatePicker.Preset value="startOfMonth">Start of month</DatePicker.Preset>
        </DatePicker.Presets>
      </DatePicker>,
    );

    await user.click(screen.getByRole('button', { name: 'Start of month' }));

    // The first day of the current month (any month) — ends with "01T..."
    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/-01T00:00:00\.000Z$/));
  });

  it('does nothing when the picker is disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePicker onChange={onChange} disabled>
        <DatePicker.Presets>
          <DatePicker.Preset value="today">Today</DatePicker.Preset>
        </DatePicker.Presets>
      </DatePicker>,
    );

    await user.click(screen.getByRole('button', { name: 'Today' }));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('DatePicker — date rules and edge cases (CLAUDE.md §7)', () => {
  const typedRuleCases: Array<{
    name: string;
    text: string;
    rules: DisabledRule[];
  }> = [
    {
      name: 'exact date',
      text: '2026-01-15',
      rules: [{ date: '2026-01-14T15:00:00.000Z' }],
    },
    {
      name: 'before',
      text: '2026-01-15',
      rules: [{ before: '2026-01-15T00:00:00.000Z' }],
    },
    {
      name: 'after',
      text: '2026-01-15',
      rules: [{ after: '2026-01-14T00:00:00.000Z' }],
    },
    {
      name: 'dayOfWeek',
      text: '2026-01-17',
      rules: [{ dayOfWeek: [6] }],
    },
    {
      name: 'filter',
      text: '2026-01-15',
      rules: [{ filter: (iso) => iso === '2026-01-14T15:00:00.000Z' }],
    },
  ];

  it.each(typedRuleCases)(
    'rejects a typed date matching the $name rule without changing or closing',
    async ({ text, rules }) => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <DatePicker
          defaultValue="2026-01-09T15:00:00.000Z"
          displayTimezone="Asia/Seoul"
          disabled={rules}
          onChange={onChange}
        >
          <DatePicker.Input aria-label="날짜 선택" />
          <DatePicker.Popover>
            <DatePicker.Calendar />
          </DatePicker.Popover>
        </DatePicker>,
      );

      const input = screen.getByRole('combobox');
      await user.click(input);
      fireEvent.change(input, { target: { value: text } });

      expect(onChange).not.toHaveBeenCalled();
      expect(input).toHaveValue('2026-01-10');
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    },
  );

  it('emits an ISO string when a leap-year day (Feb 29 2024) is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePicker value="2024-02-15T00:00:00.000Z" onChange={onChange}>
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>,
    );

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('button', { name: /February 29, 2024/ }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/^2024-02-29T/));
  });

  it('blocks clicks outside [before, after] (minDate/maxDate equivalent)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePicker
        value="2026-01-15T00:00:00.000Z"
        onChange={onChange}
        disabled={[{ before: '2026-01-10T00:00:00.000Z' }, { after: '2026-01-20T00:00:00.000Z' }]}
      >
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>,
    );
    await user.click(screen.getByRole('combobox'));

    // Out of range — disabled and not selectable
    const day5 = screen.getByRole('button', { name: /January 5, 2026/ });
    expect(day5).toBeDisabled();
    await user.click(day5);
    expect(onChange).not.toHaveBeenCalled();

    const day25 = screen.getByRole('button', { name: /January 25, 2026/ });
    expect(day25).toBeDisabled();
    await user.click(day25);
    expect(onChange).not.toHaveBeenCalled();

    // In range — selectable
    await user.click(screen.getByRole('button', { name: /January 12, 2026/ }));
    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/^2026-01-12T/));
  });

  it('before/after bounds preserve raw instant comparisons after timezone cell normalization (T-G1)', async () => {
    // Calendar cells are normalized to their civil-midnight instants before the
    // raw before/after comparison. In Seoul, June 17 civil midnight is June 16
    // 15:00 UTC, so it is correctly before a June 17 00:00 UTC lower bound.
    const renderWith = (displayTimezone?: string) =>
      render(
        <DatePicker
          value="2026-06-17T00:00:00.000Z"
          disabled={[{ before: '2026-06-17T00:00:00.000Z' }, { after: '2026-06-20T00:00:00.000Z' }]}
          displayTimezone={displayTimezone}
        >
          <DatePicker.Input aria-label="날짜 선택" />
          <DatePicker.Popover>
            <DatePicker.Calendar />
          </DatePicker.Popover>
        </DatePicker>,
      );

    const user = userEvent.setup();

    // Asia/Seoul (+9): the calendar cell's civil-midnight instant is compared
    // directly to the bounds.
    const seoul = renderWith('Asia/Seoul');
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('button', { name: /June 16, 2026/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /June 17, 2026/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /June 20, 2026/ })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /June 21, 2026/ })).toBeDisabled();
    seoul.unmount();

    // Without a display timezone, grid coordinates are already the compared instants.
    renderWith(undefined);
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('button', { name: /June 16, 2026/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /June 17, 2026/ })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /June 21, 2026/ })).toBeDisabled();
  });

  it('blocks per-day disabled rules (dayOfWeek) and shows them as visually disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePicker
        value="2026-01-15T00:00:00.000Z"
        onChange={onChange}
        disabled={[{ dayOfWeek: [0, 6] }]}
      >
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>,
    );
    await user.click(screen.getByRole('combobox'));

    // 2026-01-10 is a Saturday → disabled. 2026-01-11 is Sunday → disabled. 2026-01-12 is Monday → enabled.
    const sat = screen.getByRole('button', { name: /January 10, 2026/ });
    const sun = screen.getByRole('button', { name: /January 11, 2026/ });
    const mon = screen.getByRole('button', { name: /January 12, 2026/ });
    expect(sat).toBeDisabled();
    expect(sun).toBeDisabled();
    expect(mon).not.toBeDisabled();
    expect(sat.closest('[role="gridcell"]')).toHaveAttribute('aria-disabled', 'true');

    await user.click(sat);
    expect(onChange).not.toHaveBeenCalled();

    await user.click(mon);
    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/^2026-01-12T/));
  });

  it('keyboard ArrowLeft skips disabled days (dayOfWeek)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePicker
        value="2026-01-12T00:00:00.000Z"
        onChange={onChange}
        disabled={[{ dayOfWeek: [0, 6] }]}
      >
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>,
    );
    await user.click(screen.getByRole('combobox'));
    // Initial focus on Jan 12 (Monday). ArrowLeft would normally land on Sun Jan 11
    // (disabled) — handler should keep stepping until it lands on Fri Jan 9.
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('button', { name: /January 9, 2026/ })).toHaveFocus();
  });
});

describe('DatePicker — value/prop transition edge cases', () => {
  it('renders with an initial value that lands on a disabled day (TC-M1)', () => {
    // 2026-01-04 is a Sunday (Jan 1 2026 is a Thursday). With Sundays disabled,
    // the controlled value itself sits on a disabled day. The component must
    // still render and display the value — disabled rules gate *selection*, not
    // the display of an externally-supplied value.
    const onChange = vi.fn();
    expect(() => {
      render(
        <DatePicker
          value="2026-01-04T00:00:00.000Z"
          onChange={onChange}
          disabled={[{ dayOfWeek: [0] }]}
        >
          <DatePicker.Input aria-label="날짜 선택" />
          <DatePicker.Popover>
            <DatePicker.Calendar />
          </DatePicker.Popover>
        </DatePicker>,
      );
    }).not.toThrow();

    // Input still shows the supplied (disabled) value.
    expect(screen.getByRole('combobox')).toHaveValue('2026-01-04');
    // onChange is NOT fired just for rendering a disabled value.
    expect(onChange).not.toHaveBeenCalled();
  });

  it('switching from controlled value to uncontrolled (value=undefined) does not crash and keeps a sensible value (TC-M2)', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <DatePicker value="2026-06-15T00:00:00.000Z" onChange={onChange}>
        <DatePicker.Input aria-label="날짜 선택" />
      </DatePicker>,
    );
    expect(screen.getByRole('combobox')).toHaveValue('2026-06-15');

    // React warns about a controlled→uncontrolled switch; the component must not
    // crash. Documented behavior: `isControlled` is latched at mount via a ref,
    // so the picker stays in controlled mode and `value ?? null` resolves to an
    // empty input rather than throwing.
    expect(() => {
      rerender(
        <DatePicker value={undefined} onChange={onChange}>
          <DatePicker.Input aria-label="날짜 선택" />
        </DatePicker>,
      );
    }).not.toThrow();

    // Sensible value: the input is now empty (controlled value resolved to null),
    // not stale and not garbage.
    expect(screen.getByRole('combobox')).toHaveValue('');
  });

  it('changing the disabled range while the popover is open updates day availability live (TC-M3)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <DatePicker
        value="2026-01-15T00:00:00.000Z"
        onChange={onChange}
        disabled={[{ before: '2026-01-10T00:00:00.000Z' }]}
      >
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>,
    );

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Jan 12 is currently enabled (after the before-boundary of Jan 10).
    expect(screen.getByRole('button', { name: /January 12, 2026/ })).not.toBeDisabled();

    // Tighten the range WITHOUT re-opening: now disable everything before Jan 14.
    rerender(
      <DatePicker
        value="2026-01-15T00:00:00.000Z"
        onChange={onChange}
        disabled={[{ before: '2026-01-14T00:00:00.000Z' }]}
      >
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>,
    );

    // Popover stayed open and Jan 12 is now disabled.
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /January 12, 2026/ })).toBeDisabled();
    // Jan 15 (the selected value, still after the new boundary) remains enabled.
    expect(screen.getByRole('button', { name: /January 15, 2026/ })).not.toBeDisabled();
  });
});

describe('DatePicker — SSR safety', () => {
  it('renderToString runs without errors on the server', async () => {
    const { renderToString } = await import('react-dom/server');
    expect(() => {
      renderToString(
        <DatePicker value="2026-01-15T00:00:00.000Z" onChange={vi.fn()}>
          <DatePicker.Input aria-label="날짜" />
        </DatePicker>,
      );
    }).not.toThrow();
  });

  // 2026-03-08 — US Eastern spring-forward (02:00 EST jumps to 03:00 EDT). A
  // controlled value on this day in `America/New_York` exercises every code path
  // that has to map UTC ↔ civil time across a DST seam. Two independent renders
  // must produce byte-identical output or hydration will mismatch.
  it('renders deterministic markup at a DST boundary with displayTimezone', async () => {
    const { renderToString } = await import('react-dom/server');
    const tree = (
      <DatePicker
        value="2026-03-08T07:00:00.000Z"
        displayTimezone="America/New_York"
        onChange={vi.fn()}
      >
        <DatePicker.Input aria-label="날짜" />
        <DatePicker.Popover>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>
    );
    expect(renderToString(tree)).toBe(renderToString(tree));
  });
});

describe('DatePicker.Popover — style merging', () => {
  it('preserves Floating UI positioning when user passes a style prop', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker value={null} onChange={vi.fn()}>
        <DatePicker.Input aria-label="date" />
        <DatePicker.Popover style={{ padding: 99, background: 'red' }}>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>,
    );

    await user.click(screen.getByRole('combobox'));
    const dialog = screen.getByRole('dialog');

    // User-provided styles still apply...
    expect(dialog.style.padding).toBe('99px');
    expect(dialog.style.background).toBe('red');
    // ...but Floating UI positioning is never overwritten.
    expect(dialog.style.position).toBe('absolute');
  });

  it('still positions when no style prop is provided', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker value={null} onChange={vi.fn()}>
        <DatePicker.Input aria-label="date" />
        <DatePicker.Popover>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>,
    );

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('dialog').style.position).toBe('absolute');
  });

  it('passes through className without affecting positioning', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker value={null} onChange={vi.fn()}>
        <DatePicker.Input aria-label="date" />
        <DatePicker.Popover className="my-popover">
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>,
    );

    await user.click(screen.getByRole('combobox'));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('my-popover');
    expect(dialog.style.position).toBe('absolute');
  });

  it('user style cannot overwrite position even when explicitly attempted', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker value={null} onChange={vi.fn()}>
        <DatePicker.Input aria-label="date" />
        <DatePicker.Popover style={{ position: 'fixed', top: 9999, left: 9999 }}>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>,
    );

    await user.click(screen.getByRole('combobox'));
    const dialog = screen.getByRole('dialog');
    // floatingStyles wins — user's `position: fixed` and bogus offsets are discarded.
    expect(dialog.style.position).toBe('absolute');
    expect(dialog.style.top).not.toBe('9999px');
    expect(dialog.style.left).not.toBe('9999px');
  });

  it('becomes visible once Floating UI has positioned (no permanent first-frame hide)', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker value={null} onChange={vi.fn()}>
        <DatePicker.Input aria-label="date" />
        <DatePicker.Popover>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>,
    );

    await user.click(screen.getByRole('combobox'));
    const dialog = screen.getByRole('dialog');
    // After Floating UI finishes positioning the visibility guard releases — the
    // popover must not stay permanently hidden. (Empty string or 'visible' both
    // mean "no inline visibility override".)
    expect(['', 'visible']).toContain(dialog.style.visibility);
  });
});

describe('DatePicker — weekStartsOn locale inference (B7)', () => {
  async function firstColumnHeader(locale: string, weekStartsOn?: 0 | 1) {
    const user = userEvent.setup();
    render(
      <DatePicker
        value="2026-01-15T00:00:00.000Z"
        onChange={vi.fn()}
        locale={locale}
        weekStartsOn={weekStartsOn}
      >
        <DatePicker.Input aria-label="date" />
        <DatePicker.Popover>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>,
    );
    await user.click(screen.getByRole('combobox'));
    return screen.getAllByRole('columnheader')[0];
  }

  it('starts the week on Monday for en-GB (Monday-first locale)', async () => {
    const header = await firstColumnHeader('en-GB');
    // en-GB weekInfo.firstDay = 1 (Monday). First column header is Monday.
    expect(header.getAttribute('aria-label') ?? header.textContent).toMatch(/Mon/i);
  });

  it('starts the week on Sunday for en-US (Sunday-first locale)', async () => {
    const header = await firstColumnHeader('en-US');
    // en-US weekInfo.firstDay = 7 (Sunday). First column header is Sunday.
    expect(header.getAttribute('aria-label') ?? header.textContent).toMatch(/Sun/i);
  });

  it('an explicit weekStartsOn prop overrides locale inference', async () => {
    // en-GB would infer Monday, but the explicit prop pins Sunday-first.
    const header = await firstColumnHeader('en-GB', 0);
    expect(header.getAttribute('aria-label') ?? header.textContent).toMatch(/Sun/i);
  });
});

describe('DatePicker — announce() live-region parity (B10 A-G1)', () => {
  it('exposes a polite live region from Root (survives Calendar unmount)', async () => {
    const user = userEvent.setup();
    renderDatePicker({ value: '2026-01-15T00:00:00.000Z' });
    // The live region is on Root, so it exists even before the calendar opens.
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');

    // Closing the popover unmounts Calendar but the region (and its message) persist.
    await user.click(screen.getByRole('combobox'));
    await user.keyboard('{Escape}');
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('announces month navigation', async () => {
    const user = userEvent.setup();
    renderDatePicker({ value: '2026-01-15T00:00:00.000Z' });
    await user.click(screen.getByRole('combobox'));

    // Next-month button label comes from DEFAULT_DATEPICKER_LABELS.nextMonth.
    await user.click(screen.getByRole('button', { name: /next month/i }));
    expect(screen.getByRole('status')).toHaveTextContent(/February 2026/i);
  });

  it('announces a date selection', async () => {
    const user = userEvent.setup();
    renderDatePicker({ value: '2026-01-15T00:00:00.000Z' });
    await user.click(screen.getByRole('combobox'));

    await user.click(screen.getByRole('button', { name: /January 20, 2026/i }));
    expect(screen.getByRole('status')).toHaveTextContent(/January 20, 2026/i);
  });
});

describe('DatePicker — RTL (dir="rtl")', () => {
  function renderRtl(onChange = vi.fn()) {
    render(
      <DatePicker value="2026-01-15T00:00:00.000Z" onChange={onChange} dir="rtl">
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>,
    );
    return { onChange };
  }

  it('marks the grid with dir="rtl"', async () => {
    const user = userEvent.setup();
    renderRtl();
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('grid')).toHaveAttribute('dir', 'rtl');
  });

  it('mirrors ArrowLeft/ArrowRight: ArrowLeft advances a day, ArrowRight goes back', async () => {
    const user = userEvent.setup();
    const { onChange } = renderRtl();
    await user.click(screen.getByRole('combobox'));

    // In RTL the physically-left cell is the *next* day.
    await user.keyboard('{ArrowLeft}{Enter}');
    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/^2026-01-16T/));

    onChange.mockClear();
    await user.click(screen.getByRole('combobox'));
    // ArrowRight moves back a day.
    await user.keyboard('{ArrowRight}{Enter}');
    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/^2026-01-14T/));
  });

  it('keeps ArrowUp/ArrowDown vertical (unaffected by direction)', async () => {
    const user = userEvent.setup();
    const { onChange } = renderRtl();
    await user.click(screen.getByRole('combobox'));

    // ArrowDown = +7 days regardless of layout direction.
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/^2026-01-22T/));
  });

  it('defaults to LTR when dir is not set', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePicker value="2026-01-15T00:00:00.000Z" onChange={onChange}>
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>,
    );
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('grid')).toHaveAttribute('dir', 'ltr');

    // LTR: ArrowLeft goes back a day.
    await user.keyboard('{ArrowLeft}{Enter}');
    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/^2026-01-14T/));
  });

  it('applies dir="rtl" to the MonthGrid element', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker value="2026-04-15T00:00:00.000Z" onChange={vi.fn()} dir="rtl">
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.MonthGrid />
        </DatePicker.Popover>
      </DatePicker>,
    );
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('grid')).toHaveAttribute('dir', 'rtl');
  });

  it('applies dir="rtl" to the YearGrid element and mirrors index navigation', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker value="2026-04-15T00:00:00.000Z" onChange={vi.fn()} dir="rtl">
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.YearGrid />
        </DatePicker.Popover>
      </DatePicker>,
    );
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('grid')).toHaveAttribute('dir', 'rtl');

    // 12-year block starts at 2016 (2026 - 2026%12 = 2016). Focus is 2026 (index 10).
    screen.getByRole('gridcell', { name: '2026' }).focus();
    // RTL: physically-left cell is the *next* (higher-index) year → 2027.
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('gridcell', { name: '2027' })).toHaveFocus();
  });
});
