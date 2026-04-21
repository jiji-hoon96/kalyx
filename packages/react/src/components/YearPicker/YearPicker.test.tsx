import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { YearPicker } from './index.js';

function renderYearPicker(props: {
  value?: string | null;
  defaultValue?: string;
  onChange?: (v: string | null) => void;
  disabled?: boolean;
  displayTimezone?: string;
} = {}) {
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
});
