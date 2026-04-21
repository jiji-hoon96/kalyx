import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { DateTimePicker } from './index.js';

function renderDateTimePicker(props: {
  value?: string | null;
  defaultValue?: string;
  onChange?: (v: string | null) => void;
  format?: '12h' | '24h';
  step?: number;
  disabled?: boolean;
} = {}) {
  const onChange = props.onChange ?? vi.fn();
  const result = render(
    <DateTimePicker
      value={props.value}
      defaultValue={props.defaultValue}
      onChange={onChange}
      format={props.format}
      step={props.step}
      disabled={props.disabled}
    >
      <DateTimePicker.Input />
      <DateTimePicker.Popover>
        <DateTimePicker.Calendar />
        <DateTimePicker.HourList />
        <DateTimePicker.MinuteList />
        <DateTimePicker.AmPmToggle />
      </DateTimePicker.Popover>
    </DateTimePicker>,
  );
  return { ...result, onChange };
}

/** Controlled-mode wrapper. */
function ControlledDateTimePicker({
  initialValue,
  format = '24h',
  step = 1,
  onChange,
}: {
  initialValue: string;
  format?: '12h' | '24h';
  step?: number;
  onChange?: (v: string | null) => void;
}) {
  const [value, setValue] = useState<string | null>(initialValue);
  return (
    <DateTimePicker
      value={value}
      format={format}
      step={step}
      onChange={(v) => {
        setValue(v);
        onChange?.(v);
      }}
    >
      <DateTimePicker.Input />
      <DateTimePicker.Popover>
        <DateTimePicker.Calendar />
        <DateTimePicker.HourList />
        <DateTimePicker.MinuteList />
        <DateTimePicker.AmPmToggle />
      </DateTimePicker.Popover>
    </DateTimePicker>
  );
}

describe('DateTimePicker — basic rendering', () => {
  it('renders the input with combobox role', () => {
    renderDateTimePicker();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByLabelText('Date and time')).toBeInTheDocument();
  });

  it('keeps the popover closed on initial render', () => {
    renderDateTimePicker();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the popover with Calendar and TimeLists when the input is clicked', async () => {
    const user = userEvent.setup();
    renderDateTimePicker({ value: '2026-01-15T14:30:00.000Z' });

    await user.click(screen.getByLabelText('Date and time'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('grid')).toBeInTheDocument(); // Calendar
    expect(screen.getByRole('listbox', { name: 'Hour' })).toBeInTheDocument();
    expect(screen.getByRole('listbox', { name: 'Minute' })).toBeInTheDocument();
  });

  it('formats the value as "yyyy-MM-dd HH:mm" in the input', () => {
    renderDateTimePicker({ value: '2026-01-15T14:30:00.000Z' });
    expect(screen.getByLabelText('Date and time')).toHaveValue('2026-01-15 14:30');
  });

  it('renders an empty input when value is null', () => {
    renderDateTimePicker({ value: null });
    expect(screen.getByLabelText('Date and time')).toHaveValue('');
  });
});

describe('DateTimePicker — preserves date and time independently', () => {
  it('updates only the date and preserves the time when a day is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ControlledDateTimePicker
        initialValue="2026-01-15T14:30:00.000Z"
        onChange={onChange}
      />,
    );

    await user.click(screen.getByLabelText('Date and time'));

    const day20 = screen.getByRole('button', { name: /January 20, 2026/ });
    await user.click(day20);

    const newValue = onChange.mock.calls[0]![0] as string;
    // Date should change to the 20th
    expect(newValue).toMatch(/^2026-01-20T/);
    // Time (14:30) should be preserved
    expect(newValue).toMatch(/T14:30:00/);
  });

  it('updates only the hour and preserves the date and minutes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ControlledDateTimePicker
        initialValue="2026-01-15T14:30:00.000Z"
        onChange={onChange}
      />,
    );

    await user.click(screen.getByLabelText('Date and time'));

    const hour18 = screen.getByRole('option', { name: '18 hours' });
    await user.click(hour18);

    const newValue = onChange.mock.calls[0]![0] as string;
    // Date and minutes are preserved
    expect(newValue).toMatch(/^2026-01-15T/);
    expect(newValue).toMatch(/T18:30:/);
  });

  it('updates only the minute and preserves the date and hour', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ControlledDateTimePicker
        initialValue="2026-01-15T14:30:00.000Z"
        step={15}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByLabelText('Date and time'));

    const min45 = screen.getByRole('option', { name: '45 minutes' });
    await user.click(min45);

    const newValue = onChange.mock.calls[0]![0] as string;
    expect(newValue).toMatch(/^2026-01-15T14:45:/);
  });

  it('applies sequential date then hour then minute updates coherently', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ControlledDateTimePicker
        initialValue="2026-01-15T10:00:00.000Z"
        step={15}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByLabelText('Date and time'));

    // 1) Click day 20
    await user.click(screen.getByRole('button', { name: /January 20, 2026/ }));
    // 2) Click hour 18
    await user.click(screen.getByRole('option', { name: '18 hours' }));
    // 3) Click minute 30
    await user.click(screen.getByRole('option', { name: '30 minutes' }));

    const lastValue = onChange.mock.calls[onChange.mock.calls.length - 1]![0] as string;
    expect(lastValue).toMatch(/^2026-01-20T18:30:/);
  });
});

describe('DateTimePicker — auto-close is disabled', () => {
  it('keeps the popover open after a date is selected', async () => {
    const user = userEvent.setup();
    render(<ControlledDateTimePicker initialValue="2026-01-15T10:00:00.000Z" />);

    await user.click(screen.getByLabelText('Date and time'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /January 20, 2026/ }));

    // Unlike DatePicker, the popover should stay open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('keeps the popover open after a time is selected', async () => {
    const user = userEvent.setup();
    render(<ControlledDateTimePicker initialValue="2026-01-15T10:00:00.000Z" />);

    await user.click(screen.getByLabelText('Date and time'));

    await user.click(screen.getByRole('option', { name: '18 hours' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes the popover when Escape is pressed', async () => {
    const user = userEvent.setup();
    renderDateTimePicker({ value: '2026-01-15T10:00:00.000Z' });

    await user.click(screen.getByLabelText('Date and time'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('DateTimePicker — 12-hour mode', () => {
  it('renders AmPmToggle in 12-hour mode', async () => {
    const user = userEvent.setup();
    renderDateTimePicker({ value: '2026-01-15T14:30:00.000Z', format: '12h' });
    await user.click(screen.getByLabelText('Date and time'));

    expect(screen.getByRole('radiogroup', { name: 'AM/PM' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'PM' })).toBeChecked();
  });

  it('syncs the hour when AM/PM changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ControlledDateTimePicker
        initialValue="2026-01-15T14:30:00.000Z"
        format="12h"
        onChange={onChange}
      />,
    );

    await user.click(screen.getByLabelText('Date and time'));
    await user.click(screen.getByRole('radio', { name: 'AM' }));

    // 14:30 PM -> 02:30 AM
    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/T02:30:/));
  });
});

describe('DateTimePicker — disabled state', () => {
  it('disables the input when disabled=true', () => {
    renderDateTimePicker({ value: '2026-01-15T14:30:00.000Z', disabled: true });
    expect(screen.getByLabelText('Date and time')).toBeDisabled();
  });
});

describe('DateTimePicker — uncontrolled mode', () => {
  it('shows defaultValue as the initial value', () => {
    renderDateTimePicker({ defaultValue: '2026-03-20T09:15:00.000Z' });
    expect(screen.getByLabelText('Date and time')).toHaveValue('2026-03-20 09:15');
  });
});

describe('DateTimePicker — accessibility', () => {
  it('sets the correct ARIA attributes on the input', () => {
    renderDateTimePicker();
    const input = screen.getByLabelText('Date and time');
    expect(input).toHaveAttribute('role', 'combobox');
    expect(input).toHaveAttribute('aria-haspopup', 'dialog');
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('passes axe checks (closed state)', async () => {
    const { container } = renderDateTimePicker({ value: '2026-01-15T14:30:00.000Z' });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe checks (open state, 24-hour)', async () => {
    const user = userEvent.setup();
    const { container } = renderDateTimePicker({
      value: '2026-01-15T14:30:00.000Z',
      format: '24h',
    });
    await user.click(screen.getByLabelText('Date and time'));

    const results = await axe(container, {
      rules: {
        'aria-command-name': { selector: ':not([data-floating-ui-focus-guard])' },
      },
    });
    expect(results).toHaveNoViolations();
  });
});

describe('DateTimePicker — event callbacks', () => {
  it('fires onOpenChange(true/false) when the popover opens and closes', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <DateTimePicker
        value="2026-01-15T14:30:00.000Z"
        onChange={vi.fn()}
        onOpenChange={onOpenChange}
      >
        <DateTimePicker.Input />
        <DateTimePicker.Popover>
          <DateTimePicker.Calendar />
        </DateTimePicker.Popover>
      </DateTimePicker>,
    );

    await user.click(screen.getByRole('combobox'));
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('fires onCalendarNavigate when the user navigates months', async () => {
    const user = userEvent.setup();
    const onCalendarNavigate = vi.fn();
    render(
      <DateTimePicker
        value="2026-01-15T14:30:00.000Z"
        onChange={vi.fn()}
        onCalendarNavigate={onCalendarNavigate}
      >
        <DateTimePicker.Input />
        <DateTimePicker.Popover>
          <DateTimePicker.Calendar />
        </DateTimePicker.Popover>
      </DateTimePicker>,
    );

    await user.click(screen.getByRole('combobox'));
    onCalendarNavigate.mockClear();

    await user.click(screen.getByRole('button', { name: 'Next month' }));

    expect(onCalendarNavigate).toHaveBeenLastCalledWith(
      expect.stringMatching(/^2026-02-01T/),
    );
  });
});

describe('DateTimePicker — SSR safety', () => {
  it('renderToString runs without errors on the server', async () => {
    const { renderToString } = await import('react-dom/server');
    expect(() => {
      renderToString(
        <DateTimePicker value="2026-01-15T14:30:00.000Z" onChange={vi.fn()}>
          <DateTimePicker.Input />
        </DateTimePicker>,
      );
    }).not.toThrow();
  });
});
