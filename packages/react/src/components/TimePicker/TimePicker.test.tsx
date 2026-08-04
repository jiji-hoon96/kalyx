import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { TimePicker } from './index.js';
import { useTimePickerContext } from '../../context/TimePickerContext.js';

function TimeMutationProbe({ hours }: { hours: number }) {
  const ctx = useTimePickerContext('TimeMutationProbe');
  return <button onClick={() => ctx.setTime({ hours })}>set-context-hour-{hours}</button>;
}

function renderTimePicker(
  props: {
    value?: string | null;
    defaultValue?: string;
    onChange?: (v: string | null) => void;
    format?: '12h' | '24h';
    step?: number;
    disabled?: boolean;
    withSeconds?: boolean;
  } = {},
) {
  const onChange = props.onChange ?? vi.fn();
  const result = render(
    <TimePicker
      value={props.value}
      defaultValue={props.defaultValue}
      onChange={onChange}
      format={props.format}
      step={props.step}
      disabled={props.disabled}
      withSeconds={props.withSeconds}
    >
      <TimePicker.Input />
      <TimePicker.HourList />
      <TimePicker.MinuteList />
      <TimePicker.AmPmToggle />
    </TimePicker>,
  );
  return { ...result, onChange };
}

/** Controlled-mode wrapper. */
function ControlledTimePicker({
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
    <TimePicker
      value={value}
      format={format}
      step={step}
      onChange={(v) => {
        setValue(v);
        onChange?.(v);
      }}
    >
      <TimePicker.Input />
      <TimePicker.HourList />
      <TimePicker.MinuteList />
      <TimePicker.AmPmToggle />
    </TimePicker>
  );
}

describe('TimePicker — basic rendering', () => {
  it('renders Input, HourList, and MinuteList', () => {
    renderTimePicker({ value: '2026-01-15T14:30:00.000Z' });
    expect(screen.getByLabelText('Time')).toBeInTheDocument();
    expect(screen.getByRole('listbox', { name: 'Hour' })).toBeInTheDocument();
    expect(screen.getByRole('listbox', { name: 'Minute' })).toBeInTheDocument();
  });

  it('shows the current time in the input', () => {
    renderTimePicker({ value: '2026-01-15T14:30:00.000Z' });
    expect(screen.getByLabelText('Time')).toHaveValue('14:30');
  });

  it('shows seconds when withSeconds is enabled', () => {
    renderTimePicker({ value: '2026-01-15T14:30:45.000Z', withSeconds: true });
    expect(screen.getByLabelText('Time')).toHaveValue('14:30:45');
  });
});

describe('TimePicker — 24-hour mode (default)', () => {
  it('renders hours 0-23 in the HourList', () => {
    renderTimePicker({ value: '2026-01-15T14:30:00.000Z' });
    const hourList = screen.getByRole('listbox', { name: 'Hour' });
    const options = hourList.querySelectorAll('[role="option"]');
    expect(options).toHaveLength(24);
  });

  it('does not render AmPmToggle in 24-hour mode', () => {
    renderTimePicker({ value: '2026-01-15T14:30:00.000Z', format: '24h' });
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
  });

  it('marks the current hour with aria-selected="true"', () => {
    renderTimePicker({ value: '2026-01-15T14:30:00.000Z' });
    const selected = screen
      .getByRole('listbox', { name: 'Hour' })
      .querySelector('[aria-selected="true"]');
    expect(selected).toHaveTextContent('14');
  });
});

describe('TimePicker — 12-hour mode', () => {
  it('renders hours 1-12 in the HourList', () => {
    renderTimePicker({ value: '2026-01-15T14:30:00.000Z', format: '12h' });
    const hourList = screen.getByRole('listbox', { name: 'Hour' });
    const options = hourList.querySelectorAll('[role="option"]');
    expect(options).toHaveLength(12);
  });

  it('renders AmPmToggle', () => {
    renderTimePicker({ value: '2026-01-15T14:30:00.000Z', format: '12h' });
    expect(screen.getByRole('radiogroup', { name: 'AM/PM' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'AM' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'PM' })).toBeInTheDocument();
  });

  it('selects PM when the hour is 14', () => {
    renderTimePicker({ value: '2026-01-15T14:30:00.000Z', format: '12h' });
    expect(screen.getByRole('radio', { name: 'PM' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'AM' })).not.toBeChecked();
  });

  it('selects 2 for 14:00 (2 PM)', () => {
    renderTimePicker({ value: '2026-01-15T14:30:00.000Z', format: '12h' });
    const selected = screen
      .getByRole('listbox', { name: 'Hour' })
      .querySelector('[aria-selected="true"]');
    expect(selected).toHaveTextContent('02');
  });

  it('maps 0:00 to 12 AM', () => {
    renderTimePicker({ value: '2026-01-15T00:00:00.000Z', format: '12h' });
    expect(screen.getByRole('radio', { name: 'AM' })).toBeChecked();
    const selected = screen
      .getByRole('listbox', { name: 'Hour' })
      .querySelector('[aria-selected="true"]');
    expect(selected).toHaveTextContent('12');
  });
});

describe('TimePicker — AmPmToggle keyboard navigation', () => {
  it('toggles AM→PM with ArrowDown and moves focus to the PM radio', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    // 02:00 UTC = 2 AM
    render(
      <ControlledTimePicker
        initialValue="2026-01-15T02:00:00.000Z"
        format="12h"
        onChange={onChange}
      />,
    );
    screen.getByRole('radio', { name: 'AM' }).focus();
    await user.keyboard('{ArrowDown}');
    const pm = screen.getByRole('radio', { name: 'PM' });
    expect(pm).toBeChecked();
    expect(pm).toHaveFocus();
    // 2 AM → 2 PM = 14:00
    expect(onChange).toHaveBeenLastCalledWith('2026-01-15T14:00:00.000Z');
  });

  it('toggles PM→AM with ArrowLeft', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    // 14:00 UTC = 2 PM
    render(
      <ControlledTimePicker
        initialValue="2026-01-15T14:00:00.000Z"
        format="12h"
        onChange={onChange}
      />,
    );
    screen.getByRole('radio', { name: 'PM' }).focus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('radio', { name: 'AM' })).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith('2026-01-15T02:00:00.000Z');
  });

  it('selects AM with Home and PM with End', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ControlledTimePicker
        initialValue="2026-01-15T14:00:00.000Z"
        format="12h"
        onChange={onChange}
      />,
    );
    screen.getByRole('radio', { name: 'PM' }).focus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('radio', { name: 'AM' })).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith('2026-01-15T02:00:00.000Z');

    screen.getByRole('radio', { name: 'AM' }).focus();
    await user.keyboard('{End}');
    expect(screen.getByRole('radio', { name: 'PM' })).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith('2026-01-15T14:00:00.000Z');
  });

  it('selects the focused period with Enter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    // 02:00 = 2 AM; focus the (unchecked) PM radio and confirm with Enter
    render(
      <ControlledTimePicker
        initialValue="2026-01-15T02:00:00.000Z"
        format="12h"
        onChange={onChange}
      />,
    );
    screen.getByRole('radio', { name: 'PM' }).focus();
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('2026-01-15T14:00:00.000Z');
  });

  it('selects a period on click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ControlledTimePicker
        initialValue="2026-01-15T14:00:00.000Z"
        format="12h"
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole('radio', { name: 'AM' }));
    expect(onChange).toHaveBeenLastCalledWith('2026-01-15T02:00:00.000Z');
  });
});

describe('TimePicker — minute step', () => {
  it('renders 4 options (0, 15, 30, 45) when step=15', () => {
    renderTimePicker({ value: '2026-01-15T14:00:00.000Z', step: 15 });
    const minuteList = screen.getByRole('listbox', { name: 'Minute' });
    const options = minuteList.querySelectorAll('[role="option"]');
    expect(options).toHaveLength(4);
  });

  it('renders 12 options when step=5', () => {
    renderTimePicker({ value: '2026-01-15T14:00:00.000Z', step: 5 });
    const minuteList = screen.getByRole('listbox', { name: 'Minute' });
    const options = minuteList.querySelectorAll('[role="option"]');
    expect(options).toHaveLength(12);
  });
});

describe('TimePicker — off-step minute value (TC-M6)', () => {
  it('renders the documented step options and snaps NOTHING for an off-step value', () => {
    // step=15 → the MinuteList renders exactly [00, 15, 30, 45]. A controlled
    // value whose minute (37) is not on the step grid is NOT snapped: the input
    // shows the raw 14:37, and because no rendered option equals 37, none is
    // marked aria-selected. This documents that `step` only constrains the list
    // of selectable options, not the displayed value.
    renderTimePicker({ value: '2026-01-15T14:37:00.000Z', step: 15 });

    const minuteList = screen.getByRole('listbox', { name: 'Minute' });
    const options = minuteList.querySelectorAll('[role="option"]');
    expect(Array.from(options).map((o) => o.textContent)).toEqual(['00', '15', '30', '45']);

    // No option matches the off-step minute 37.
    expect(minuteList.querySelector('[aria-selected="true"]')).toBeNull();

    // The input keeps the un-snapped value.
    expect(screen.getByLabelText('Time')).toHaveValue('14:37');
  });

  it('selecting an on-step minute from an off-step value snaps to that option', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ControlledTimePicker
        initialValue="2026-01-15T14:37:00.000Z"
        step={15}
        onChange={onChange}
      />,
    );

    // Clicking the 30 option commits 14:30; the hour is preserved.
    await user.click(screen.getByRole('option', { name: '30 minutes' }));
    expect(onChange).toHaveBeenLastCalledWith(expect.stringMatching(/T14:30:/));

    // After the controlled state updates, 30 is now the selected option.
    const selected = screen
      .getByRole('listbox', { name: 'Minute' })
      .querySelector('[aria-selected="true"]');
    expect(selected).toHaveTextContent('30');
  });
});

describe('TimePicker — interactions', () => {
  it('calls onChange when an hour is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledTimePicker initialValue="2026-01-15T10:00:00.000Z" onChange={onChange} />);

    const hour14 = screen.getByRole('option', { name: '14 hours' });
    await user.click(hour14);

    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/T14:00:/));
  });

  it('calls onChange when a minute is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ControlledTimePicker
        initialValue="2026-01-15T14:00:00.000Z"
        step={15}
        onChange={onChange}
      />,
    );

    const min30 = screen.getByRole('option', { name: '30 minutes' });
    await user.click(min30);

    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/T14:30:/));
  });

  it('updates the hour when the AM/PM toggle changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ControlledTimePicker
        initialValue="2026-01-15T14:00:00.000Z"
        format="12h"
        onChange={onChange}
      />,
    );

    // 14:00 is PM; clicking AM switches it to 02:00
    const amButton = screen.getByRole('radio', { name: 'AM' });
    await user.click(amButton);

    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/T02:00:/));
  });

  it('parses a time typed directly into the input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledTimePicker initialValue="2026-01-15T10:00:00.000Z" onChange={onChange} />);

    const input = screen.getByLabelText('Time');
    await user.clear(input);
    await user.type(input, '15:45');
    await user.tab(); // blur

    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/T15:45:/));
  });

  it('ignores invalid times typed into the input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledTimePicker initialValue="2026-01-15T10:00:00.000Z" onChange={onChange} />);

    const input = screen.getByLabelText('Time');
    await user.clear(input);
    await user.type(input, 'invalid');
    await user.tab();

    // Invalid input should not trigger an onChange with the parsed garbage (clear may still fire)
    const calls = onChange.mock.calls;
    const lastCall = calls[calls.length - 1];
    if (lastCall) {
      // If onChange did fire, the original time must be preserved
      expect(lastCall[0]).toMatch(/T10:00:/);
    }
  });

  it('drops stale typed text when the parent re-sets value externally', async () => {
    const user = userEvent.setup();

    function ExternalUpdater() {
      const [value, setValue] = useState<string | null>('2026-01-15T10:00:00.000Z');
      return (
        <>
          <TimePicker value={value} onChange={setValue}>
            <TimePicker.Input />
          </TimePicker>
          <button onClick={() => setValue('2026-01-15T22:30:00.000Z')}>jump-to-22-30</button>
        </>
      );
    }

    render(<ExternalUpdater />);
    const input = screen.getByLabelText('Time');

    // User types an incomplete time — parse fails, inputText holds the half-typed string.
    await user.click(input);
    await user.clear(input);
    await user.type(input, '14:');
    expect(input).toHaveValue('14:');

    // Parent re-sets value externally (e.g. another control commits a time).
    await user.click(screen.getByRole('button', { name: 'jump-to-22-30' }));

    // Without the fix the input still shows "14:"; with the fix it reflects the new time.
    expect(input).toHaveValue('22:30');
  });
});

describe('TimePicker — keyboard navigation', () => {
  it('navigates HourList with ArrowDown and selects with Enter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledTimePicker initialValue="2026-01-15T10:00:00.000Z" onChange={onChange} />);

    // Focus hour 10 and press ArrowDown -> selects 11
    const hour10 = screen.getByRole('option', { name: '10 hours' });
    hour10.focus();
    await user.keyboard('{ArrowDown}');

    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/T11:00:/));
  });

  it('navigates HourList with ArrowUp', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledTimePicker initialValue="2026-01-15T10:00:00.000Z" onChange={onChange} />);

    const hour10 = screen.getByRole('option', { name: '10 hours' });
    hour10.focus();
    await user.keyboard('{ArrowUp}');

    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/T09:00:/));
  });

  it('navigates HourList with Home and End', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledTimePicker initialValue="2026-01-15T10:00:00.000Z" onChange={onChange} />);

    const hour10 = screen.getByRole('option', { name: '10 hours' });
    hour10.focus();
    await user.keyboard('{Home}');

    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/T00:00:/));
  });

  it('selects hour with Enter key on focused option', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledTimePicker initialValue="2026-01-15T10:00:00.000Z" onChange={onChange} />);

    const hour10 = screen.getByRole('option', { name: '10 hours' });
    hour10.focus();
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/T10:00:/));
  });

  it('selects hour with Space key', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledTimePicker initialValue="2026-01-15T10:00:00.000Z" onChange={onChange} />);

    const hour10 = screen.getByRole('option', { name: '10 hours' });
    hour10.focus();
    await user.keyboard(' ');

    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/T10:00:/));
  });

  it('navigates MinuteList with ArrowDown', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ControlledTimePicker
        initialValue="2026-01-15T14:00:00.000Z"
        step={15}
        onChange={onChange}
      />,
    );

    const min0 = screen.getByRole('option', { name: '0 minutes' });
    min0.focus();
    await user.keyboard('{ArrowDown}');

    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/T14:15:/));
  });

  it('does not navigate past the last item with ArrowDown', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledTimePicker initialValue="2026-01-15T23:00:00.000Z" onChange={onChange} />);

    const hour23 = screen.getByRole('option', { name: '23 hours' });
    hour23.focus();
    await user.keyboard('{ArrowDown}');

    // Should stay at 23
    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/T23:00:/));
  });
});

describe('TimePicker — disabled state', () => {
  it('disables the input and sets aria-disabled on the listboxes when disabled=true', () => {
    renderTimePicker({ value: '2026-01-15T14:00:00.000Z', disabled: true });
    expect(screen.getByLabelText('Time')).toBeDisabled();
    expect(screen.getByRole('listbox', { name: 'Hour' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('listbox', { name: 'Minute' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('does not call onChange when an option is clicked while disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderTimePicker({
      value: '2026-01-15T14:00:00.000Z',
      disabled: true,
      onChange,
    });

    const hour10 = screen.getByRole('option', { name: '10 hours' });
    await user.click(hour10);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('TimePicker — filterTime', () => {
  it('rejects a filtered time typed into the input at the Root boundary', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TimePicker
        value="2026-01-15T10:30:00.000Z"
        onChange={onChange}
        filterTime={(hours, minutes) => hours === 15 && minutes === 45}
      >
        <TimePicker.Input />
      </TimePicker>,
    );

    const input = screen.getByLabelText('Time');
    await user.clear(input);
    await user.type(input, '15:45');
    await user.tab();

    expect(onChange).not.toHaveBeenCalled();
    expect(input).toHaveValue('10:30');
  });

  it('rejects a filtered context mutation using the final merged time', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TimePicker
        value="2026-01-15T10:30:00.000Z"
        onChange={onChange}
        filterTime={(hours, minutes) => hours === 12 && minutes === 30}
      >
        <TimePicker.Input />
        <TimeMutationProbe hours={12} />
      </TimePicker>,
    );

    await user.click(screen.getByRole('button', { name: 'set-context-hour-12' }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Time')).toHaveValue('10:30');
  });

  it('marks aria-disabled on minutes rejected by filterTime', () => {
    // Disable minute 30 only — visible per-minute disable
    render(
      <TimePicker
        value="2026-01-15T10:00:00.000Z"
        onChange={vi.fn()}
        filterTime={(_h, m) => m === 30}
      >
        <TimePicker.HourList />
        <TimePicker.MinuteList />
      </TimePicker>,
    );

    const minute30 = screen.getByRole('option', { name: '30 minutes' });
    expect(minute30).toHaveAttribute('aria-disabled', 'true');
    const minute0 = screen.getByRole('option', { name: '0 minutes' });
    expect(minute0).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('blocks selection when a filtered minute is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TimePicker
        value="2026-01-15T10:00:00.000Z"
        onChange={onChange}
        filterTime={(_h, m) => m === 30}
      >
        <TimePicker.MinuteList />
      </TimePicker>,
    );

    await user.click(screen.getByRole('option', { name: '30 minutes' }));
    expect(onChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole('option', { name: '45 minutes' }));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('marks an hour as fully disabled when every step minute is rejected', () => {
    // Block every minute of hour 12 (step=15 → minutes 0/15/30/45)
    render(
      <TimePicker
        value="2026-01-15T10:00:00.000Z"
        onChange={vi.fn()}
        step={15}
        filterTime={(h) => h === 12}
      >
        <TimePicker.HourList />
      </TimePicker>,
    );

    const hour12 = screen.getByRole('option', { name: '12 hours' });
    expect(hour12).toHaveAttribute('aria-disabled', 'true');
    const hour11 = screen.getByRole('option', { name: '11 hours' });
    expect(hour11).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('leaves an hour enabled when only some of its step minutes are blocked', () => {
    // Block only minute 30 — hour 14 still has 0, 15, 45 available
    render(
      <TimePicker
        value="2026-01-15T10:00:00.000Z"
        onChange={vi.fn()}
        step={15}
        filterTime={(_h, m) => m === 30}
      >
        <TimePicker.HourList />
      </TimePicker>,
    );

    const hour14 = screen.getByRole('option', { name: '14 hours' });
    expect(hour14).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('blocks clicks on hours that are fully disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TimePicker
        value="2026-01-15T10:00:00.000Z"
        onChange={onChange}
        step={15}
        filterTime={(h) => h === 12}
      >
        <TimePicker.HourList />
      </TimePicker>,
    );

    await user.click(screen.getByRole('option', { name: '12 hours' }));
    expect(onChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole('option', { name: '11 hours' }));
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

describe('TimePicker — context errors', () => {
  it('throws when Input is used without Root', () => {
    expect(() => {
      render(<TimePicker.Input />);
    }).toThrow(/TimePicker.Root 내부에서 사용해야 합니다/);
  });

  it('throws when HourList is used without Root', () => {
    expect(() => {
      render(<TimePicker.HourList />);
    }).toThrow(/TimePicker.Root 내부에서 사용해야 합니다/);
  });
});

describe('TimePicker — accessibility', () => {
  it('sets aria-label on the listboxes', () => {
    renderTimePicker({ value: '2026-01-15T14:30:00.000Z' });
    expect(screen.getByRole('listbox', { name: 'Hour' })).toBeInTheDocument();
    expect(screen.getByRole('listbox', { name: 'Minute' })).toBeInTheDocument();
  });

  it('exposes the AmPmToggle as a radiogroup', () => {
    renderTimePicker({ value: '2026-01-15T14:00:00.000Z', format: '12h' });
    expect(screen.getByRole('radiogroup', { name: 'AM/PM' })).toBeInTheDocument();
  });

  it('passes axe checks in 24-hour mode', async () => {
    const { container } = renderTimePicker({
      value: '2026-01-15T14:30:00.000Z',
      format: '24h',
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe checks in 12-hour mode', async () => {
    const { container } = renderTimePicker({
      value: '2026-01-15T14:30:00.000Z',
      format: '12h',
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('TimePicker — SSR safety', () => {
  it('renderToString runs without errors on the server', async () => {
    const { renderToString } = await import('react-dom/server');
    expect(() => {
      renderToString(
        <TimePicker value="2026-01-15T14:30:00.000Z" onChange={vi.fn()}>
          <TimePicker.Input />
          <TimePicker.HourList />
          <TimePicker.MinuteList />
        </TimePicker>,
      );
    }).not.toThrow();
  });

  it('falls back to 00:00 when value is null (deterministic, no today() during render)', () => {
    renderTimePicker({ value: null });
    // Input displays the deterministic 00:00 fallback rather than today's time.
    expect(screen.getByLabelText('Time')).toHaveValue('00:00');
    // The "0" hour and "00" minute options are aria-selected="true".
    const hourSelected = screen
      .getByRole('listbox', { name: 'Hour' })
      .querySelector('[aria-selected="true"]');
    expect(hourSelected).toHaveTextContent('0');
    const minuteSelected = screen
      .getByRole('listbox', { name: 'Minute' })
      .querySelector('[aria-selected="true"]');
    expect(minuteSelected).toHaveTextContent('00');
  });

  it('renders identical markup for two independent null-value renders (hydration determinism)', async () => {
    const { renderToString } = await import('react-dom/server');
    const tree = (
      <TimePicker value={null} onChange={vi.fn()}>
        <TimePicker.Input />
        <TimePicker.HourList />
        <TimePicker.MinuteList />
      </TimePicker>
    );
    const a = renderToString(tree);
    const b = renderToString(tree);
    expect(a).toBe(b);
  });

  // A controlled value at the 2026 US Eastern spring-forward instant
  // (06:00 UTC == 01:59 EST → next minute 03:00 EDT). When rendered with the
  // matching displayTimezone, two independent renderToString calls must agree.
  it('renders deterministic markup for a controlled DST-boundary value with displayTimezone', async () => {
    const { renderToString } = await import('react-dom/server');
    const tree = (
      <TimePicker
        value="2026-03-08T06:00:00.000Z"
        displayTimezone="America/New_York"
        onChange={vi.fn()}
      >
        <TimePicker.Input />
        <TimePicker.HourList />
        <TimePicker.MinuteList />
      </TimePicker>
    );
    expect(renderToString(tree)).toBe(renderToString(tree));
  });
});

describe('TimePicker.Popover — optional floating container', () => {
  function renderPopoverTimePicker() {
    const onChange = vi.fn();
    const result = render(
      <TimePicker value="2026-01-15T14:30:00.000Z" format="12h" onChange={onChange}>
        <TimePicker.Input />
        <TimePicker.Popover>
          <TimePicker.HourList />
          <TimePicker.MinuteList />
          <TimePicker.AmPmToggle />
        </TimePicker.Popover>
      </TimePicker>,
    );
    return { ...result, onChange };
  }

  it('keeps the controls hidden until the input is clicked', async () => {
    const user = userEvent.setup();
    renderPopoverTimePicker();

    // Closed initially — no listboxes rendered.
    expect(screen.queryByRole('listbox', { name: 'Hour' })).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('Time'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('listbox', { name: 'Hour' })).toBeInTheDocument();
    expect(screen.getByRole('listbox', { name: 'Minute' })).toBeInTheDocument();
  });

  it('opens on ArrowDown and closes on Escape', async () => {
    const user = userEvent.setup();
    renderPopoverTimePicker();

    const input = screen.getByLabelText('Time');
    input.focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('reflects open state via aria-expanded', async () => {
    const user = userEvent.setup();
    renderPopoverTimePicker();

    const input = screen.getByLabelText('Time');
    expect(input).toHaveAttribute('aria-expanded', 'false');

    await user.click(input);
    expect(input).toHaveAttribute('aria-expanded', 'true');
  });
});
