/**
 * Cross-component displayTimezone integration tests.
 *
 * The point is to verify that when `displayTimezone` is set on each Root, the public behavior
 * (onChange ISO emissions, Input formatting) reflects the chosen zone. Core math is exercised
 * more thoroughly in packages/core/src/__tests__/timezone.test.ts.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatePicker } from '../DatePicker/index.js';
import { RangePicker } from '../RangePicker/index.js';
import { TimePicker } from '../TimePicker/index.js';
import { DateTimePicker } from '../DateTimePicker/index.js';

describe('DatePicker — displayTimezone', () => {
  it('emits civil-midnight-in-tz ISO on selection (Asia/Seoul = UTC+9)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePicker value="2026-01-15T00:00:00.000Z" displayTimezone="Asia/Seoul" onChange={onChange}>
        <DatePicker.Input aria-label="date" />
        <DatePicker.Popover>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>,
    );
    await user.click(screen.getByRole('combobox'));
    // Click January 15 cell
    await user.click(screen.getByRole('button', { name: /January 15/ }));
    // Seoul Jan 15 00:00 = UTC Jan 14 15:00
    expect(onChange).toHaveBeenCalledWith('2026-01-14T15:00:00.000Z');
  });

  it('formats the Input using the display timezone', () => {
    render(
      <DatePicker value="2026-01-14T15:00:00.000Z" displayTimezone="Asia/Seoul">
        <DatePicker.Input aria-label="date" />
      </DatePicker>,
    );
    expect(screen.getByRole('combobox')).toHaveValue('2026-01-15');
  });
});

describe('RangePicker — displayTimezone', () => {
  it('emits civil-midnight-in-tz for start and end', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <RangePicker
        defaultValue={{ start: '2026-01-05T00:00:00.000Z', end: null }}
        displayTimezone="Asia/Seoul"
        onChange={onChange}
      >
        <RangePicker.Input part="start" />
        <RangePicker.Input part="end" />
        <RangePicker.Popover>
          <RangePicker.Calendar />
        </RangePicker.Popover>
      </RangePicker>,
    );
    await user.click(screen.getByLabelText('Start date'));
    await user.click(screen.getByRole('button', { name: /January 10/ }));
    await user.click(screen.getByRole('button', { name: /January 20/ }));

    const last = onChange.mock.calls.at(-1)?.[0];
    expect(last).toEqual({
      start: '2026-01-09T15:00:00.000Z',
      end: '2026-01-19T15:00:00.000Z',
    });
  });
});

describe('TimePicker — displayTimezone', () => {
  it('reads and writes the time-of-day in the requested timezone', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    // Start from UTC 00:00 Jan 15 (= KST 09:00 Jan 15). Pick hour 10 → KST 10:00 = UTC 01:00.
    render(
      <TimePicker value="2026-01-15T00:00:00.000Z" displayTimezone="Asia/Seoul" onChange={onChange}>
        <TimePicker.HourList />
        <TimePicker.MinuteList />
      </TimePicker>,
    );
    await user.click(screen.getByRole('option', { name: '10 hours' }));
    expect(onChange).toHaveBeenCalledWith('2026-01-15T01:00:00.000Z');
  });
});

describe('DateTimePicker — displayTimezone', () => {
  it('selecting a day preserves the tz-local time portion', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    // Start: UTC 2026-01-14T15:00Z (= Seoul Jan 15 00:00)
    render(
      <DateTimePicker
        value="2026-01-14T15:00:00.000Z"
        displayTimezone="Asia/Seoul"
        onChange={onChange}
      >
        <DateTimePicker.Input />
        <DateTimePicker.Popover>
          <DateTimePicker.Calendar />
          <DateTimePicker.HourList />
          <DateTimePicker.MinuteList />
        </DateTimePicker.Popover>
      </DateTimePicker>,
    );
    await user.click(screen.getByRole('combobox'));
    // Click Jan 20 → Seoul Jan 20 00:00 = UTC Jan 19 15:00
    await user.click(screen.getByRole('button', { name: /January 20/ }));
    expect(onChange).toHaveBeenCalledWith('2026-01-19T15:00:00.000Z');
  });
});
