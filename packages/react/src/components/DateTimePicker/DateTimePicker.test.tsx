import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { DateTimePicker } from './index.js';
import { DateTimePickerPreset, DateTimePickerPresets } from './Presets.js';
import { useTimePickerContext } from '../../context/TimePickerContext.js';
import { useDatePickerContext } from '../../context/DatePickerContext.js';
import { formatInTimezone } from '@kalyx/core';

function DateMutationProbe({ date }: { date: string }) {
  const ctx = useDatePickerContext('DateMutationProbe');
  return <button onClick={() => ctx.selectDate(date)}>set-context-date</button>;
}

function TimeMutationProbe({ hours }: { hours: number }) {
  const ctx = useTimePickerContext('TimeMutationProbe');
  return <button onClick={() => ctx.setTime({ hours })}>set-context-hour-{hours}</button>;
}

function renderDateTimePicker(
  props: {
    value?: string | null;
    defaultValue?: string;
    onChange?: (v: string | null) => void;
    format?: '12h' | '24h';
    step?: number;
    disabled?: boolean;
  } = {},
) {
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

describe('DateTimePicker — timezone calendar coordinates', () => {
  it('normalizes a time-bearing default-zone value before keyboard disabled checks', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const filter = vi.fn((iso: string) => iso === '2026-01-15T00:00:00.000Z');
    render(
      <DateTimePicker value="2026-01-15T14:30:00.000Z" disabled={[{ filter }]} onChange={onChange}>
        <DateTimePicker.Input />
        <DateTimePicker.Popover>
          <DateTimePicker.Calendar />
        </DateTimePicker.Popover>
      </DateTimePicker>,
    );

    await user.click(screen.getByRole('combobox'));
    filter.mockClear();
    fireEvent.keyDown(screen.getByRole('grid'), { key: 'Enter' });

    expect(filter.mock.calls).toEqual([['2026-01-15T00:00:00.000Z']]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('opens January and selects/focuses Seoul January 1 from its stored instant', async () => {
    const user = userEvent.setup();
    render(
      <DateTimePicker
        value="2025-12-31T15:00:00.000Z"
        displayTimezone="Asia/Seoul"
        onChange={vi.fn()}
      >
        <DateTimePicker.Input />
        <DateTimePicker.Popover>
          <DateTimePicker.Calendar />
        </DateTimePicker.Popover>
      </DateTimePicker>,
    );

    await user.click(screen.getByRole('combobox'));

    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', 'January 2026');
    const january1 = screen.getByRole('button', { name: /January 1, 2026/ });
    expect(january1).toHaveAttribute('data-selected', 'true');
    expect(january1).toHaveFocus();
  });
});

describe('DateTimePicker — preserves date and time independently', () => {
  it('updates only the date and preserves the time when a day is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ControlledDateTimePicker initialValue="2026-01-15T14:30:00.000Z" onChange={onChange} />,
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
      <ControlledDateTimePicker initialValue="2026-01-15T14:30:00.000Z" onChange={onChange} />,
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

/** Controlled wrapper that threads a displayTimezone through. */
function ControlledTzDateTimePicker({
  initialValue,
  displayTimezone,
  onChange,
}: {
  initialValue: string;
  displayTimezone: string;
  onChange?: (v: string | null) => void;
}) {
  const [value, setValue] = useState<string | null>(initialValue);
  return (
    <DateTimePicker
      value={value}
      displayTimezone={displayTimezone}
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
      </DateTimePicker.Popover>
    </DateTimePicker>
  );
}

describe('DateTimePicker — non-UTC displayTimezone round-trip (TC-M5)', () => {
  const TZ = 'Asia/Seoul'; // UTC+9, no DST

  it('a time edit keeps the Seoul civil date stable across the UTC-day boundary', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    // 2026-01-15T15:00:00Z = Seoul 2026-01-16 00:00 (midnight). Editing only the
    // hour in Seoul must keep the Seoul date on Jan 16 — a naive UTC setHours
    // would drift the UTC date and the Seoul day would slip.
    render(
      <ControlledTzDateTimePicker
        initialValue="2026-01-15T15:00:00.000Z"
        displayTimezone={TZ}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('combobox'));
    // Set Seoul hour to 10:00.
    await user.click(screen.getByRole('option', { name: '10 hours' }));

    const emitted = onChange.mock.calls.at(-1)![0] as string;
    // Seoul civil date unchanged (Jan 16); Seoul time is now 10:00.
    expect(formatInTimezone(emitted, 'yyyy-MM-dd', TZ)).toBe('2026-01-16');
    expect(formatInTimezone(emitted, 'HH:mm', TZ)).toBe('10:00');
  });

  it('a date edit keeps the Seoul wall-clock time stable', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    // Seoul 2026-01-16 00:00 again. Click a different calendar day; the Seoul
    // wall-clock time (00:00) must be preserved while only the civil date moves.
    render(
      <ControlledTzDateTimePicker
        initialValue="2026-01-15T15:00:00.000Z"
        displayTimezone={TZ}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('combobox'));
    // The grid is rendered in the Seoul civil month (January 2026). Click Jan 20.
    await user.click(screen.getByRole('button', { name: /January 20, 2026/ }));

    const emitted = onChange.mock.calls.at(-1)![0] as string;
    // Seoul date moved to Jan 20, Seoul time still midnight.
    expect(formatInTimezone(emitted, 'yyyy-MM-dd', TZ)).toBe('2026-01-20');
    expect(formatInTimezone(emitted, 'HH:mm', TZ)).toBe('00:00');
  });

  it('sequential date-then-time edits round-trip coherently in Seoul', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ControlledTzDateTimePicker
        initialValue="2026-01-15T15:00:00.000Z"
        displayTimezone={TZ}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('combobox'));
    // 1) Move the Seoul date to Jan 20.
    await user.click(screen.getByRole('button', { name: /January 20, 2026/ }));
    // 2) Then set the Seoul hour to 18.
    await user.click(screen.getByRole('option', { name: '18 hours' }));

    const emitted = onChange.mock.calls.at(-1)![0] as string;
    expect(formatInTimezone(emitted, 'yyyy-MM-dd HH:mm', TZ)).toBe('2026-01-20 18:00');
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

  it('restores focus to the input after closing with Escape from inside the grid (A-G4)', async () => {
    const user = userEvent.setup();
    renderDateTimePicker({ value: '2026-01-15T14:30:00.000Z' });

    const input = screen.getByLabelText('Date and time');
    await user.click(input);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Move focus off the input into the calendar grid, then Escape.
    await user.keyboard('{ArrowRight}');
    expect(input).not.toHaveFocus();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(input).toHaveFocus();
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

    expect(onCalendarNavigate).toHaveBeenLastCalledWith(expect.stringMatching(/^2026-02-01T/));
  });
});

describe('DateTimePicker — date rules and edge cases (CLAUDE.md §7)', () => {
  it('rejects a context date commit whose final merged datetime has a disabled civil date', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateTimePicker
        value="2026-01-15T01:30:00.000Z"
        displayTimezone="Asia/Seoul"
        disabled={[{ dayOfWeek: [6] }]}
        onChange={onChange}
      >
        <DateMutationProbe date="2026-01-17T00:00:00.000Z" />
      </DateTimePicker>,
    );

    await user.click(screen.getByRole('button', { name: 'set-context-date' }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('emits an ISO string when a leap-year day (Feb 29 2024) is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateTimePicker value="2024-02-15T10:30:00.000Z" onChange={onChange}>
        <DateTimePicker.Input />
        <DateTimePicker.Popover>
          <DateTimePicker.Calendar />
        </DateTimePicker.Popover>
      </DateTimePicker>,
    );

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('button', { name: /February 29, 2024/ }));

    // Date moved to Feb 29 2024, time preserved (10:30)
    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/^2024-02-29T10:30:/));
  });

  it('blocks clicks outside [before, after] (minDate/maxDate equivalent)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateTimePicker
        value="2026-01-15T10:00:00.000Z"
        onChange={onChange}
        disabled={[{ before: '2026-01-10T00:00:00.000Z' }, { after: '2026-01-20T00:00:00.000Z' }]}
      >
        <DateTimePicker.Input />
        <DateTimePicker.Popover>
          <DateTimePicker.Calendar />
        </DateTimePicker.Popover>
      </DateTimePicker>,
    );
    await user.click(screen.getByRole('combobox'));

    const day5 = screen.getByRole('button', { name: /January 5, 2026/ });
    expect(day5).toBeDisabled();
    await user.click(day5);
    expect(onChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /January 12, 2026/ }));
    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/^2026-01-12T10:00:/));
  });

  it('blocks per-day disabled rules (dayOfWeek)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateTimePicker
        value="2026-01-15T10:00:00.000Z"
        onChange={onChange}
        disabled={[{ dayOfWeek: [0, 6] }]}
      >
        <DateTimePicker.Input />
        <DateTimePicker.Popover>
          <DateTimePicker.Calendar />
        </DateTimePicker.Popover>
      </DateTimePicker>,
    );
    await user.click(screen.getByRole('combobox'));
    const sat = screen.getByRole('button', { name: /January 10, 2026/ });
    expect(sat).toBeDisabled();
    expect(sat.closest('[role="gridcell"]')).toHaveAttribute('aria-disabled', 'true');

    await user.click(sat);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('keyboard ArrowLeft skips disabled days', async () => {
    const user = userEvent.setup();
    render(
      <DateTimePicker
        value="2026-01-12T10:00:00.000Z"
        onChange={vi.fn()}
        disabled={[{ dayOfWeek: [0, 6] }]}
      >
        <DateTimePicker.Input />
        <DateTimePicker.Popover>
          <DateTimePicker.Calendar />
        </DateTimePicker.Popover>
      </DateTimePicker>,
    );
    await user.click(screen.getByRole('combobox'));
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('button', { name: /January 9, 2026/ })).toHaveFocus();
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

  // Both halves (date + time) must agree across renders at the 2026 US Eastern
  // spring-forward seam. This is the highest-risk component for hydration drift
  // since it combines DatePicker and TimePicker context graphs.
  it('renders deterministic markup at a DST boundary with displayTimezone', async () => {
    const { renderToString } = await import('react-dom/server');
    const tree = (
      <DateTimePicker
        value="2026-03-08T07:30:00.000Z"
        displayTimezone="America/New_York"
        onChange={vi.fn()}
      >
        <DateTimePicker.Input />
        <DateTimePicker.Popover>
          <DateTimePicker.Calendar />
          <DateTimePicker.HourList />
          <DateTimePicker.MinuteList />
        </DateTimePicker.Popover>
      </DateTimePicker>
    );
    expect(renderToString(tree)).toBe(renderToString(tree));
  });
});

/**
 * Test-only probe that exposes TimePickerContext for verification. Renders nothing visible —
 * just emits a hidden span with the relevant fields serialized so assertions can read them.
 */
function TimeContextProbe({ id }: { id: string }) {
  const ctx = useTimePickerContext('TimeContextProbe');
  return (
    <span
      data-testid={id}
      data-with-seconds={String(ctx.withSeconds)}
      data-current-hours={String(ctx.currentTime.hours)}
      data-current-minutes={String(ctx.currentTime.minutes)}
      data-current-seconds={String(ctx.currentTime.seconds)}
      data-has-filter-time={String(typeof ctx.filterTime === 'function')}
    />
  );
}

describe('DateTimePicker — composition API forwarding to TimePickerContext', () => {
  it('forwards withSeconds=true through to TimePickerContext', () => {
    render(
      <DateTimePicker value="2026-01-15T14:30:45.000Z" onChange={vi.fn()} withSeconds>
        <TimeContextProbe id="probe" />
      </DateTimePicker>,
    );
    const probe = screen.getByTestId('probe');
    expect(probe.getAttribute('data-with-seconds')).toBe('true');
  });

  it('defaults withSeconds to false when the prop is omitted', () => {
    render(
      <DateTimePicker value="2026-01-15T14:30:00.000Z" onChange={vi.fn()}>
        <TimeContextProbe id="probe" />
      </DateTimePicker>,
    );
    expect(screen.getByTestId('probe').getAttribute('data-with-seconds')).toBe('false');
  });

  it('forwards filterTime through to TimePickerContext (HourList reflects disabled hour)', async () => {
    const user = userEvent.setup();
    const filterTime = (h: number) => h === 12;
    render(
      <DateTimePicker
        value="2026-01-15T10:00:00.000Z"
        onChange={vi.fn()}
        step={15}
        filterTime={filterTime}
      >
        <DateTimePicker.Input />
        <DateTimePicker.Popover>
          <DateTimePicker.HourList />
        </DateTimePicker.Popover>
      </DateTimePicker>,
    );
    await user.click(screen.getByRole('combobox'));

    const hour12 = screen.getByRole('option', { name: '12 hours' });
    expect(hour12).toHaveAttribute('aria-disabled', 'true');
    const hour11 = screen.getByRole('option', { name: '11 hours' });
    expect(hour11).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('blocks click on a filterTime-disabled hour and never fires onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateTimePicker
        value="2026-01-15T10:00:00.000Z"
        onChange={onChange}
        step={15}
        filterTime={(h) => h === 12}
      >
        <DateTimePicker.Input />
        <DateTimePicker.Popover>
          <DateTimePicker.HourList />
        </DateTimePicker.Popover>
      </DateTimePicker>,
    );
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '12 hours' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('rejects a context time mutation using the final merged time', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateTimePicker
        value="2026-01-15T10:30:00.000Z"
        onChange={onChange}
        filterTime={(hours, minutes) => hours === 12 && minutes === 30}
      >
        <TimeMutationProbe hours={12} />
      </DateTimePicker>,
    );

    await user.click(screen.getByRole('button', { name: 'set-context-hour-12' }));

    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('DateTimePicker — preset policy boundary', () => {
  it('rejects a filtered full preset without closing and still invokes the click callback', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onClick = vi.fn();
    render(
      <DateTimePicker
        value="2026-01-15T10:30:00.000Z"
        onChange={onChange}
        filterTime={(hours, minutes) => hours === 12 && minutes === 30}
      >
        <DateTimePicker.Input />
        <DateTimePicker.Popover>
          <DateTimePickerPresets>
            <DateTimePickerPreset value="2026-01-15T12:30:00.000Z" onClick={onClick}>
              Blocked lunch
            </DateTimePickerPreset>
          </DateTimePickerPresets>
        </DateTimePicker.Popover>
      </DateTimePicker>,
    );

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('button', { name: 'Blocked lunch' }));

    expect(onChange).not.toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});

describe('DateTimePicker — hydration-safe currentTime fallback', () => {
  it('exposes a deterministic {0,0,0} time fallback when value is null', () => {
    render(
      <DateTimePicker value={null} onChange={vi.fn()}>
        <TimeContextProbe id="probe" />
      </DateTimePicker>,
    );
    const probe = screen.getByTestId('probe');
    expect(probe.getAttribute('data-current-hours')).toBe('0');
    expect(probe.getAttribute('data-current-minutes')).toBe('0');
    expect(probe.getAttribute('data-current-seconds')).toBe('0');
  });

  it('produces identical render output across two independent renders when value is null', () => {
    // The render-path no longer calls adapter.today(), so two renders must agree on the
    // currentTime even if a day boundary were to pass between them.
    const first = render(
      <DateTimePicker value={null} onChange={vi.fn()}>
        <TimeContextProbe id="probe" />
      </DateTimePicker>,
    );
    const firstHtml = first.container.innerHTML;
    first.unmount();

    const second = render(
      <DateTimePicker value={null} onChange={vi.fn()}>
        <TimeContextProbe id="probe" />
      </DateTimePicker>,
    );
    expect(second.container.innerHTML).toBe(firstHtml);
  });
});

describe('DateTimePicker — announce() live-region parity (B10 A-G1)', () => {
  it('exposes a polite live region from Root and announces month navigation', async () => {
    const user = userEvent.setup();
    renderDateTimePicker({ value: '2026-01-15T14:30:00.000Z' });

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');

    await user.click(screen.getByLabelText('Date and time'));
    await user.click(screen.getByRole('button', { name: /next month/i }));
    expect(screen.getByRole('status')).toHaveTextContent(/February 2026/i);
  });
});
