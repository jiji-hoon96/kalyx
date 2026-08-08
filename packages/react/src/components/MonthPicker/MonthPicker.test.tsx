import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import type { DisabledRule } from '@kalyx/core';
import { MonthPicker } from './index.js';

function renderMonthPicker(
  props: {
    value?: string | null;
    defaultValue?: string;
    onChange?: (v: string | null) => void;
    disabled?: boolean | DisabledRule[];
    displayTimezone?: string;
    locale?: string;
  } = {},
) {
  const onChange = props.onChange ?? vi.fn();
  const result = render(
    <MonthPicker
      value={props.value}
      defaultValue={props.defaultValue}
      onChange={onChange}
      disabled={props.disabled}
      displayTimezone={props.displayTimezone}
      locale={props.locale}
    >
      <MonthPicker.Input aria-label="Select month" />
      <MonthPicker.Popover>
        <MonthPicker.Grid />
      </MonthPicker.Popover>
    </MonthPicker>,
  );
  return { ...result, onChange };
}

describe('MonthPicker — basic interactions', () => {
  it('renders an input with combobox role', () => {
    renderMonthPicker();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('formats the value as yyyy-MM by default', () => {
    renderMonthPicker({ value: '2026-04-01T00:00:00.000Z' });
    expect(screen.getByRole('combobox')).toHaveValue('2026-04');
  });

  it('opens the popover with a 12-month grid when the input is clicked', async () => {
    const user = userEvent.setup();
    renderMonthPicker({ value: '2026-04-01T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(12);
    expect(cells[0]).toHaveTextContent('January');
    expect(cells[11]).toHaveTextContent('December');
  });

  it('marks the selected month as aria-selected', async () => {
    const user = userEvent.setup();
    renderMonthPicker({ value: '2026-04-15T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));

    expect(screen.getByRole('gridcell', { name: 'April' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('gridcell', { name: 'January' })).not.toHaveAttribute('aria-selected');
  });

  it('commits the month-start ISO when a month is clicked', async () => {
    const user = userEvent.setup();
    const { onChange } = renderMonthPicker({ value: '2026-01-15T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('gridcell', { name: 'June' }));

    expect(onChange).toHaveBeenCalledWith('2026-06-01T00:00:00.000Z');
  });

  it('commits the month-start ISO when a full date is typed', () => {
    const { onChange } = renderMonthPicker({ defaultValue: '2026-04-01T00:00:00.000Z' });

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '2026-06-15' } });

    expect(onChange).toHaveBeenCalledWith('2026-06-01T00:00:00.000Z');
  });

  it('closes the popover after a month is selected', async () => {
    const user = userEvent.setup();
    renderMonthPicker({ value: '2026-01-15T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('gridcell', { name: 'March' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not propagate grid-keyboard Escape to parent handlers', async () => {
    // Exercises the _shared/grid-keyboard Escape path used by MonthPicker.Grid,
    // YearPicker.Grid, DatePicker.MonthGrid, DatePicker.YearGrid. Focus must
    // be on a gridcell (not the Input) for this path to trigger.
    const user = userEvent.setup();
    const parentKeyDown = vi.fn();

    render(
      <div onKeyDown={parentKeyDown}>
        <MonthPicker value="2026-04-15T00:00:00.000Z" onChange={vi.fn()}>
          <MonthPicker.Input aria-label="Select month" />
          <MonthPicker.Popover>
            <MonthPicker.Grid />
          </MonthPicker.Popover>
        </MonthPicker>
      </div>,
    );

    await user.click(screen.getByRole('combobox'));
    // Focus a month cell so grid-keyboard handles the next keypress.
    screen.getByRole('gridcell', { name: 'April' }).focus();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const escapeBubbles = parentKeyDown.mock.calls.filter(
      ([e]: [React.KeyboardEvent]) => e.key === 'Escape',
    );
    expect(escapeBubbles).toHaveLength(0);
  });

  it('navigates years with the prev/next buttons', async () => {
    const user = userEvent.setup();
    renderMonthPicker({ value: '2026-01-15T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', '2026 months');

    await user.click(screen.getByRole('button', { name: 'Next year' }));
    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', '2027 months');

    await user.click(screen.getByRole('button', { name: 'Previous year' }));
    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', '2026 months');
  });

  it('does not highlight any month when the viewed year differs from the value year', async () => {
    const user = userEvent.setup();
    renderMonthPicker({ value: '2026-04-01T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('button', { name: 'Next year' }));

    // Now viewing 2027, value is still April 2026 — no month should be selected
    const cells = screen.getAllByRole('gridcell');
    cells.forEach((cell) => {
      expect(cell).not.toHaveAttribute('aria-selected', 'true');
    });
  });
});

describe('MonthPicker — controlled / uncontrolled', () => {
  it('reflects controlled value changes', () => {
    const { rerender } = render(
      <MonthPicker value="2026-01-01T00:00:00.000Z" onChange={vi.fn()}>
        <MonthPicker.Input aria-label="Select month" />
      </MonthPicker>,
    );
    expect(screen.getByRole('combobox')).toHaveValue('2026-01');

    rerender(
      <MonthPicker value="2026-07-01T00:00:00.000Z" onChange={vi.fn()}>
        <MonthPicker.Input aria-label="Select month" />
      </MonthPicker>,
    );
    expect(screen.getByRole('combobox')).toHaveValue('2026-07');
  });

  it('supports uncontrolled mode via defaultValue', async () => {
    const user = userEvent.setup();
    function Wrapper() {
      const [v, setV] = useState<string | null>('2026-01-01T00:00:00.000Z');
      return (
        <MonthPicker value={v} onChange={setV}>
          <MonthPicker.Input aria-label="Select month" />
          <MonthPicker.Popover>
            <MonthPicker.Grid />
          </MonthPicker.Popover>
        </MonthPicker>
      );
    }
    render(<Wrapper />);

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('gridcell', { name: 'August' }));
    expect(screen.getByRole('combobox')).toHaveValue('2026-08');
  });
});

describe('MonthPicker — accessibility', () => {
  it('passes axe checks when closed', async () => {
    const { container } = renderMonthPicker({ value: '2026-01-01T00:00:00.000Z' });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe checks when open', async () => {
    const user = userEvent.setup();
    const { container } = renderMonthPicker({ value: '2026-01-01T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));

    const results = await axe(container, {
      rules: {
        'aria-command-name': { selector: ':not([data-floating-ui-focus-guard])' },
      },
    });
    expect(results).toHaveNoViolations();
  });
});

describe('MonthPicker — SSR safety', () => {
  it('renderToString runs without errors', async () => {
    const { renderToString } = await import('react-dom/server');
    expect(() => {
      renderToString(
        <MonthPicker value="2026-04-01T00:00:00.000Z" onChange={vi.fn()}>
          <MonthPicker.Input aria-label="Select month" />
        </MonthPicker>,
      );
    }).not.toThrow();
  });

  // March 2026 is the month containing the US Eastern spring-forward. Selecting
  // it and rendering twice must produce identical output regardless of any
  // implicit clock-reads during the render.
  it('renders deterministic markup at a DST-boundary month with displayTimezone', async () => {
    const { renderToString } = await import('react-dom/server');
    const tree = (
      <MonthPicker
        value="2026-03-01T05:00:00.000Z"
        displayTimezone="America/New_York"
        onChange={vi.fn()}
      >
        <MonthPicker.Input aria-label="Select month" />
        <MonthPicker.Popover>
          <MonthPicker.Grid />
        </MonthPicker.Popover>
      </MonthPicker>
    );
    expect(renderToString(tree)).toBe(renderToString(tree));
  });
});

describe('MonthPicker — keyboard navigation (grid pattern)', () => {
  it('marks the selected month as the only focusable cell (roving tabIndex)', async () => {
    const user = userEvent.setup();
    renderMonthPicker({ value: '2026-04-15T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));

    const april = screen.getByRole('gridcell', { name: 'April' });
    const january = screen.getByRole('gridcell', { name: 'January' });
    expect(april).toHaveAttribute('tabIndex', '0');
    expect(january).toHaveAttribute('tabIndex', '-1');
  });

  it('moves focus by ±1 with ArrowLeft/Right', async () => {
    const user = userEvent.setup();
    renderMonthPicker({ value: '2026-04-15T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));
    const april = screen.getByRole('gridcell', { name: 'April' });
    april.focus();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('gridcell', { name: 'May' })).toHaveFocus();

    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(screen.getByRole('gridcell', { name: 'March' })).toHaveFocus();
  });

  it('moves focus by ±3 with ArrowUp/Down', async () => {
    const user = userEvent.setup();
    renderMonthPicker({ value: '2026-04-15T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));
    screen.getByRole('gridcell', { name: 'April' }).focus();

    // April (index 3) + 3 = July (index 6)
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('gridcell', { name: 'July' })).toHaveFocus();

    // July (index 6) - 3 = April (index 3)
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('gridcell', { name: 'April' })).toHaveFocus();
  });

  it('Home/End jump to the first/last cell of the row', async () => {
    const user = userEvent.setup();
    renderMonthPicker({ value: '2026-05-15T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));
    // May = index 4 (row 1: Apr/May/Jun)
    screen.getByRole('gridcell', { name: 'May' }).focus();

    await user.keyboard('{Home}');
    expect(screen.getByRole('gridcell', { name: 'April' })).toHaveFocus();

    await user.keyboard('{End}');
    expect(screen.getByRole('gridcell', { name: 'June' })).toHaveFocus();
  });

  it('PageUp/Down navigates ±1 year and preserves the same-position focus', async () => {
    const user = userEvent.setup();
    renderMonthPicker({ value: '2026-04-15T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));
    screen.getByRole('gridcell', { name: 'April' }).focus();

    await user.keyboard('{PageDown}');
    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', '2027 months');
    // Same column position (April / index 3) keeps tabIndex=0 and DOM focus
    // across year nav (stable index keys + auto-refocus).
    expect(screen.getByRole('gridcell', { name: 'April' })).toHaveFocus();

    await user.keyboard('{PageUp}{PageUp}');
    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', '2025 months');
    expect(screen.getByRole('gridcell', { name: 'April' })).toHaveFocus();
  });

  it('commits the focused month with Enter and closes the popover', async () => {
    const user = userEvent.setup();
    const { onChange } = renderMonthPicker({ value: '2026-01-15T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));
    screen.getByRole('gridcell', { name: 'January' }).focus();

    // Move focus to March, then commit with Enter.
    await user.keyboard('{ArrowRight}{ArrowRight}{Enter}');

    expect(onChange).toHaveBeenCalledWith('2026-03-01T00:00:00.000Z');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('commits the focused month with Space', async () => {
    const user = userEvent.setup();
    const { onChange } = renderMonthPicker({ value: '2026-01-15T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));
    screen.getByRole('gridcell', { name: 'January' }).focus();

    await user.keyboard('{ArrowRight} ');

    expect(onChange).toHaveBeenCalledWith('2026-02-01T00:00:00.000Z');
  });
});

describe('MonthPicker — disabled months (before/after rules)', () => {
  it('marks months that fall entirely before a min as disabled', async () => {
    const user = userEvent.setup();
    renderMonthPicker({
      value: '2026-06-15T00:00:00.000Z',
      disabled: [{ before: '2026-04-01T00:00:00.000Z' }],
    });

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('gridcell', { name: 'January' })).toBeDisabled();
    expect(screen.getByRole('gridcell', { name: 'March' })).toBeDisabled();
    // The month containing the cutoff is partially-disabled (some days before
    // the cutoff, some after) so the whole month stays selectable.
    expect(screen.getByRole('gridcell', { name: 'April' })).not.toBeDisabled();
    expect(screen.getByRole('gridcell', { name: 'June' })).not.toBeDisabled();
  });

  it('marks months that fall entirely after a max as disabled', async () => {
    const user = userEvent.setup();
    renderMonthPicker({
      value: '2026-06-15T00:00:00.000Z',
      disabled: [{ after: '2026-09-30T23:59:59.999Z' }],
    });

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('gridcell', { name: 'October' })).toBeDisabled();
    expect(screen.getByRole('gridcell', { name: 'December' })).toBeDisabled();
    expect(screen.getByRole('gridcell', { name: 'September' })).not.toBeDisabled();
  });

  it('exposes aria-disabled on disabled cells', async () => {
    const user = userEvent.setup();
    renderMonthPicker({
      value: '2026-06-15T00:00:00.000Z',
      disabled: [{ before: '2026-04-01T00:00:00.000Z' }],
    });

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('gridcell', { name: 'February' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('does not commit when a disabled month is clicked', async () => {
    const user = userEvent.setup();
    const { onChange } = renderMonthPicker({
      value: '2026-06-15T00:00:00.000Z',
      disabled: [{ before: '2026-04-01T00:00:00.000Z' }],
    });

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('gridcell', { name: 'February' }));

    expect(onChange).not.toHaveBeenCalled();
    // The popover stays open because no commit happened
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('falls back to the first enabled cell when value points to a disabled month', async () => {
    const user = userEvent.setup();
    // Value lands on February (disabled). Initial focus should fall back to
    // April (first enabled). Disabled buttons can't receive DOM focus, so
    // without the fallback the user would have nowhere to navigate from.
    renderMonthPicker({
      value: '2026-02-15T00:00:00.000Z',
      disabled: [{ before: '2026-04-01T00:00:00.000Z' }],
    });

    await user.click(screen.getByRole('combobox'));

    expect(screen.getByRole('gridcell', { name: 'April' })).toHaveAttribute('tabIndex', '0');
    expect(screen.getByRole('gridcell', { name: 'February' })).toHaveAttribute('tabIndex', '-1');
    // Keyboard navigation works from the fallback cell.
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('gridcell', { name: 'May' })).toHaveFocus();
  });

  it('re-anchors focus when PageDown lands the focused cell on a now-disabled month', async () => {
    const user = userEvent.setup();
    // April 2026 enabled, but in 2027 only Jan-Mar are enabled (rest disabled
    // by `after`). PageDown into 2027 should re-anchor focus from April (now
    // disabled) to the first enabled cell (January).
    renderMonthPicker({
      value: '2026-04-15T00:00:00.000Z',
      disabled: [{ after: '2027-03-31T23:59:59.999Z' }],
    });

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('gridcell', { name: 'April' })).toHaveFocus();

    await user.keyboard('{PageDown}');
    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', '2027 months');
    // April 2027 is now after the cutoff → disabled. Focus re-anchors to
    // January (first enabled in this year).
    expect(screen.getByRole('gridcell', { name: 'January' })).toHaveFocus();
    expect(screen.getByRole('gridcell', { name: 'April' })).toHaveAttribute('tabIndex', '-1');
  });

  it('keyboard ArrowLeft skips disabled months', async () => {
    const user = userEvent.setup();
    renderMonthPicker({
      value: '2026-06-15T00:00:00.000Z',
      disabled: [{ before: '2026-04-01T00:00:00.000Z' }],
    });

    await user.click(screen.getByRole('combobox'));
    screen.getByRole('gridcell', { name: 'June' }).focus();

    // ArrowLeft from June → May (enabled).
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('gridcell', { name: 'May' })).toHaveFocus();

    // ArrowLeft from May → April (last enabled).
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('gridcell', { name: 'April' })).toHaveFocus();

    // ArrowLeft from April: Mar/Feb/Jan all disabled → focus stays.
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('gridcell', { name: 'April' })).toHaveFocus();
  });
});

describe('MonthPicker — localization', () => {
  it('displays month names in the requested locale', async () => {
    const user = userEvent.setup();
    renderMonthPicker({ value: '2026-01-15T00:00:00.000Z', locale: 'ko-KR' });

    await user.click(screen.getByRole('combobox'));
    const cells = screen.getAllByRole('gridcell');
    // ko-KR returns "1월", "2월" ...
    expect(cells[0]).toHaveTextContent('1월');
  });

  it('restores focus to the input after closing with Escape from inside the grid (A-G4)', async () => {
    const user = userEvent.setup();
    renderMonthPicker({ value: '2026-01-15T00:00:00.000Z' });

    const input = screen.getByRole('combobox');
    await user.click(input);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Move focus off the input into the month grid, then Escape.
    await user.keyboard('{ArrowRight}');
    expect(input).not.toHaveFocus();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(input).toHaveFocus();
  });
});

describe('MonthPicker — RTL (dir="rtl")', () => {
  it('mirrors ArrowLeft/ArrowRight in the month grid', async () => {
    const user = userEvent.setup();
    render(
      <MonthPicker value="2026-04-15T00:00:00.000Z" onChange={vi.fn()} dir="rtl">
        <MonthPicker.Input aria-label="Select month" />
        <MonthPicker.Popover>
          <MonthPicker.Grid />
        </MonthPicker.Popover>
      </MonthPicker>,
    );
    await user.click(screen.getByRole('combobox'));
    screen.getByRole('gridcell', { name: 'April' }).focus();

    // RTL: physically-left cell is the *next* (higher-index) month.
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('gridcell', { name: 'May' })).toHaveFocus();

    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(screen.getByRole('gridcell', { name: 'March' })).toHaveFocus();
  });

  it('keeps ArrowUp/ArrowDown vertical (±3) in RTL', async () => {
    const user = userEvent.setup();
    render(
      <MonthPicker value="2026-04-15T00:00:00.000Z" onChange={vi.fn()} dir="rtl">
        <MonthPicker.Input aria-label="Select month" />
        <MonthPicker.Popover>
          <MonthPicker.Grid />
        </MonthPicker.Popover>
      </MonthPicker>,
    );
    await user.click(screen.getByRole('combobox'));
    screen.getByRole('gridcell', { name: 'April' }).focus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('gridcell', { name: 'July' })).toHaveFocus();
  });

  it('marks the month grid element with dir="rtl"', async () => {
    const user = userEvent.setup();
    render(
      <MonthPicker value="2026-04-15T00:00:00.000Z" onChange={vi.fn()} dir="rtl">
        <MonthPicker.Input aria-label="Select month" />
        <MonthPicker.Popover>
          <MonthPicker.Grid />
        </MonthPicker.Popover>
      </MonthPicker>,
    );
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('grid')).toHaveAttribute('dir', 'rtl');
  });
});
