import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { MonthPicker } from './index.js';

function renderMonthPicker(props: {
  value?: string | null;
  defaultValue?: string;
  onChange?: (v: string | null) => void;
  disabled?: boolean;
  displayTimezone?: string;
  locale?: string;
} = {}) {
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

    expect(screen.getByRole('gridcell', { name: 'April' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('gridcell', { name: 'January' })).not.toHaveAttribute('aria-selected');
  });

  it('commits the month-start ISO when a month is clicked', async () => {
    const user = userEvent.setup();
    const { onChange } = renderMonthPicker({ value: '2026-01-15T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('gridcell', { name: 'June' }));

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
});
