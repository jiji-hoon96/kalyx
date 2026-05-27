import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import type { DisabledRule } from '@kalyx/core';
import { YearPicker } from './index.js';

function renderYearPicker(
  props: {
    value?: string | null;
    defaultValue?: string;
    onChange?: (v: string | null) => void;
    disabled?: boolean | DisabledRule[];
    displayTimezone?: string;
  } = {},
) {
  const onChange = props.onChange ?? vi.fn();
  const result = render(
    <YearPicker
      value={props.value}
      defaultValue={props.defaultValue}
      onChange={onChange}
      disabled={props.disabled}
      displayTimezone={props.displayTimezone}
    >
      <YearPicker.Input aria-label="Select year" />
      <YearPicker.Popover>
        <YearPicker.Grid />
      </YearPicker.Popover>
    </YearPicker>,
  );
  return { ...result, onChange };
}

describe('YearPicker — basic interactions', () => {
  it('renders an input with combobox role', () => {
    renderYearPicker();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('formats the value as yyyy by default', () => {
    renderYearPicker({ value: '2026-04-01T00:00:00.000Z' });
    expect(screen.getByRole('combobox')).toHaveValue('2026');
  });

  it('opens a 12-year decade grid on input click', async () => {
    const user = userEvent.setup();
    renderYearPicker({ value: '2026-01-01T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));

    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(12);
    // Decade block for 2026 is 2016–2027 (2016 + 11)
    expect(cells[0]).toHaveTextContent('2016');
    expect(cells[11]).toHaveTextContent('2027');
  });

  it('marks the selected year as aria-selected', async () => {
    const user = userEvent.setup();
    renderYearPicker({ value: '2026-01-01T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));

    expect(screen.getByRole('gridcell', { name: '2026' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('gridcell', { name: '2025' })).not.toHaveAttribute('aria-selected');
  });

  it('commits year-start ISO when a year is clicked', async () => {
    const user = userEvent.setup();
    const { onChange } = renderYearPicker({ value: '2026-01-01T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('gridcell', { name: '2024' }));

    expect(onChange).toHaveBeenCalledWith('2024-01-01T00:00:00.000Z');
  });

  it('closes the popover after year selection', async () => {
    const user = userEvent.setup();
    renderYearPicker({ value: '2026-01-01T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('gridcell', { name: '2025' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('navigates decades with prev/next buttons', async () => {
    const user = userEvent.setup();
    renderYearPicker({ value: '2026-01-01T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', '2016–2027');

    await user.click(screen.getByRole('button', { name: 'Next decade' }));
    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', '2028–2039');

    await user.click(screen.getByRole('button', { name: 'Previous decade' }));
    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', '2016–2027');
  });
});

describe('YearPicker — controlled / uncontrolled', () => {
  it('reflects controlled value changes', () => {
    const { rerender } = render(
      <YearPicker value="2026-01-01T00:00:00.000Z" onChange={vi.fn()}>
        <YearPicker.Input aria-label="Select year" />
      </YearPicker>,
    );
    expect(screen.getByRole('combobox')).toHaveValue('2026');

    rerender(
      <YearPicker value="2030-01-01T00:00:00.000Z" onChange={vi.fn()}>
        <YearPicker.Input aria-label="Select year" />
      </YearPicker>,
    );
    expect(screen.getByRole('combobox')).toHaveValue('2030');
  });

  it('supports uncontrolled mode', async () => {
    const user = userEvent.setup();
    function Wrapper() {
      const [v, setV] = useState<string | null>('2026-01-01T00:00:00.000Z');
      return (
        <YearPicker value={v} onChange={setV}>
          <YearPicker.Input aria-label="Select year" />
          <YearPicker.Popover>
            <YearPicker.Grid />
          </YearPicker.Popover>
        </YearPicker>
      );
    }
    render(<Wrapper />);

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('gridcell', { name: '2022' }));
    expect(screen.getByRole('combobox')).toHaveValue('2022');
  });
});

describe('YearPicker — keyboard navigation (grid pattern)', () => {
  it('marks the selected year as the only focusable cell (roving tabIndex)', async () => {
    const user = userEvent.setup();
    renderYearPicker({ value: '2026-01-01T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));

    expect(screen.getByRole('gridcell', { name: '2026' })).toHaveAttribute('tabIndex', '0');
    expect(screen.getByRole('gridcell', { name: '2016' })).toHaveAttribute('tabIndex', '-1');
  });

  it('moves focus by ±1 with ArrowLeft/Right', async () => {
    const user = userEvent.setup();
    renderYearPicker({ value: '2026-01-01T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));
    screen.getByRole('gridcell', { name: '2026' }).focus();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('gridcell', { name: '2027' })).toHaveFocus();

    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(screen.getByRole('gridcell', { name: '2025' })).toHaveFocus();
  });

  it('moves focus by ±3 with ArrowUp/Down', async () => {
    const user = userEvent.setup();
    renderYearPicker({ value: '2026-01-01T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));
    // Decade 2016–2027, 2026 is at index 10 (row 3, col 2)
    screen.getByRole('gridcell', { name: '2026' }).focus();

    // 2026 (index 10) - 3 = index 7 = 2023
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('gridcell', { name: '2023' })).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('gridcell', { name: '2026' })).toHaveFocus();
  });

  it('Home/End jump to the first/last cell of the row', async () => {
    const user = userEvent.setup();
    renderYearPicker({ value: '2026-01-01T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));
    // 2026 = index 10, row 3 → first 2025, last 2027
    screen.getByRole('gridcell', { name: '2026' }).focus();

    await user.keyboard('{Home}');
    expect(screen.getByRole('gridcell', { name: '2025' })).toHaveFocus();

    await user.keyboard('{End}');
    expect(screen.getByRole('gridcell', { name: '2027' })).toHaveFocus();
  });

  it('PageUp/Down navigates ±1 decade and preserves the same-position focus', async () => {
    const user = userEvent.setup();
    renderYearPicker({ value: '2026-01-01T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));
    screen.getByRole('gridcell', { name: '2026' }).focus();

    await user.keyboard('{PageDown}');
    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', '2028–2039');
    // 2026 was index 10 in the 2016–2027 decade; same column-position cell in
    // the next decade is 2038. Stable index keys + auto-refocus keep DOM focus.
    expect(screen.getByRole('gridcell', { name: '2038' })).toHaveFocus();

    await user.keyboard('{PageUp}{PageUp}');
    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', '2004–2015');
    // Two decades back from 2028–2039 is 2004–2015; index 10 = 2014.
    expect(screen.getByRole('gridcell', { name: '2014' })).toHaveFocus();
  });

  it('commits the focused year with Enter and closes the popover', async () => {
    const user = userEvent.setup();
    const { onChange } = renderYearPicker({ value: '2026-01-01T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));
    screen.getByRole('gridcell', { name: '2026' }).focus();

    await user.keyboard('{ArrowLeft}{Enter}');

    expect(onChange).toHaveBeenCalledWith('2025-01-01T00:00:00.000Z');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('commits the focused year with Space', async () => {
    const user = userEvent.setup();
    const { onChange } = renderYearPicker({ value: '2026-01-01T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));
    screen.getByRole('gridcell', { name: '2026' }).focus();

    await user.keyboard('{ArrowLeft} ');

    expect(onChange).toHaveBeenCalledWith('2025-01-01T00:00:00.000Z');
  });
});

describe('YearPicker — disabled years (before/after rules)', () => {
  it('marks years that fall entirely before a min as disabled', async () => {
    const user = userEvent.setup();
    renderYearPicker({
      value: '2026-01-01T00:00:00.000Z',
      disabled: [{ before: '2024-01-01T00:00:00.000Z' }],
    });

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('gridcell', { name: '2016' })).toBeDisabled();
    expect(screen.getByRole('gridcell', { name: '2023' })).toBeDisabled();
    expect(screen.getByRole('gridcell', { name: '2024' })).not.toBeDisabled();
    expect(screen.getByRole('gridcell', { name: '2026' })).not.toBeDisabled();
  });

  it('marks years that fall entirely after a max as disabled', async () => {
    const user = userEvent.setup();
    renderYearPicker({
      value: '2026-01-01T00:00:00.000Z',
      disabled: [{ after: '2026-12-31T23:59:59.999Z' }],
    });

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('gridcell', { name: '2027' })).toBeDisabled();
    expect(screen.getByRole('gridcell', { name: '2026' })).not.toBeDisabled();
  });

  it('exposes aria-disabled on disabled cells', async () => {
    const user = userEvent.setup();
    renderYearPicker({
      value: '2026-01-01T00:00:00.000Z',
      disabled: [{ before: '2024-01-01T00:00:00.000Z' }],
    });

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('gridcell', { name: '2020' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('does not commit when a disabled year is clicked', async () => {
    const user = userEvent.setup();
    const { onChange } = renderYearPicker({
      value: '2026-01-01T00:00:00.000Z',
      disabled: [{ before: '2024-01-01T00:00:00.000Z' }],
    });

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('gridcell', { name: '2020' }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('falls back to the first enabled cell when value points to a disabled year', async () => {
    const user = userEvent.setup();
    // Value lands on 2020 (disabled). First enabled in this decade is 2024.
    renderYearPicker({
      value: '2020-01-01T00:00:00.000Z',
      disabled: [{ before: '2024-01-01T00:00:00.000Z' }],
    });

    await user.click(screen.getByRole('combobox'));

    expect(screen.getByRole('gridcell', { name: '2024' })).toHaveAttribute('tabIndex', '0');
    expect(screen.getByRole('gridcell', { name: '2020' })).toHaveAttribute('tabIndex', '-1');
    // Keyboard navigation works from the fallback cell.
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('gridcell', { name: '2025' })).toHaveFocus();
  });

  it('re-anchors focus when PageDown lands the focused cell on a now-disabled year', async () => {
    const user = userEvent.setup();
    // 2026 enabled, but the next decade (2028–2039) is all after the cutoff
    // except 2028 itself. PageDown into 2028–2039 should re-anchor focus
    // from index 10 (which would be 2038 — disabled) to 2028 (first enabled).
    renderYearPicker({
      value: '2026-01-01T00:00:00.000Z',
      disabled: [{ after: '2028-12-31T23:59:59.999Z' }],
    });

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('gridcell', { name: '2026' })).toHaveFocus();

    await user.keyboard('{PageDown}');
    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', '2028–2039');
    // Index 10 in this decade is 2038 — disabled. Focus re-anchors to 2028
    // (first enabled).
    expect(screen.getByRole('gridcell', { name: '2028' })).toHaveFocus();
  });

  it('keyboard ArrowLeft skips disabled years', async () => {
    const user = userEvent.setup();
    renderYearPicker({
      value: '2026-01-01T00:00:00.000Z',
      disabled: [{ before: '2024-01-01T00:00:00.000Z' }],
    });

    await user.click(screen.getByRole('combobox'));
    screen.getByRole('gridcell', { name: '2026' }).focus();

    // ArrowLeft 2026 → 2025
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('gridcell', { name: '2025' })).toHaveFocus();

    // ArrowLeft 2025 → 2024 (last enabled in this decade)
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('gridcell', { name: '2024' })).toHaveFocus();

    // ArrowLeft from 2024: 2023..2016 all disabled → focus stays.
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('gridcell', { name: '2024' })).toHaveFocus();
  });
});

describe('YearPicker — accessibility', () => {
  it('passes axe checks when closed', async () => {
    const { container } = renderYearPicker({ value: '2026-01-01T00:00:00.000Z' });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe checks when open', async () => {
    const user = userEvent.setup();
    const { container } = renderYearPicker({ value: '2026-01-01T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));

    const results = await axe(container, {
      rules: {
        'aria-command-name': { selector: ':not([data-floating-ui-focus-guard])' },
      },
    });
    expect(results).toHaveNoViolations();
  });
});

describe('YearPicker — SSR safety', () => {
  it('renderToString runs without errors', async () => {
    const { renderToString } = await import('react-dom/server');
    expect(() => {
      renderToString(
        <YearPicker value="2026-01-01T00:00:00.000Z" onChange={vi.fn()}>
          <YearPicker.Input aria-label="Select year" />
        </YearPicker>,
      );
    }).not.toThrow();
  });

  // A year value rendered with displayTimezone must be deterministic regardless
  // of the host process clock. The "decade grid" derived from the year exposes
  // any accidental clock-read in the render path.
  it('renders deterministic markup with a controlled value and displayTimezone', async () => {
    const { renderToString } = await import('react-dom/server');
    const tree = (
      <YearPicker
        value="2026-01-01T00:00:00.000Z"
        displayTimezone="America/New_York"
        onChange={vi.fn()}
      >
        <YearPicker.Input aria-label="Select year" />
        <YearPicker.Popover>
          <YearPicker.Grid />
        </YearPicker.Popover>
      </YearPicker>
    );
    expect(renderToString(tree)).toBe(renderToString(tree));
  });
});
