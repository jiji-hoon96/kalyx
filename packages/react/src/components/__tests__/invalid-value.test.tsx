import { describe, it, expect } from 'vitest';
import { render, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { DateFnsAdapter } from '@kalyx/adapter-date-fns';
import { DatePicker } from '../DatePicker/index.js';
import { RangePicker } from '../RangePicker/index.js';
import { MonthPicker } from '../MonthPicker/index.js';
import { YearPicker } from '../YearPicker/index.js';
import { WeekPicker } from '../WeekPicker/index.js';
import { DateTimePicker } from '../DateTimePicker/index.js';
import { TimePicker } from '../TimePicker/index.js';
import { useDatePicker } from '../../hooks/useDatePicker.js';
import { useRangePicker } from '../../hooks/useRangePicker.js';
import { useMonthPicker } from '../../hooks/useMonthPicker.js';
import { useYearPicker } from '../../hooks/useYearPicker.js';
import { useWeekPicker } from '../../hooks/useWeekPicker.js';
import { useDateTimePicker } from '../../hooks/useDateTimePicker.js';

/**
 * `value` / `defaultValue` normally arrive from a form field or a database row, so a
 * malformed or empty string is data — not a programming error. Seeding the calendar view
 * from one used to throw `RangeError: Invalid time value` straight out of the adapter and
 * unmount the whole React tree, which under `renderToString` turns a single bad row into
 * a 500. These lock the graceful fallback: the picker stays mounted and the view seeds to
 * today.
 */
const MALFORMED = [
  ['free text', 'not-a-date'],
  ['empty string', ''],
  ['non-existent day', '2026-02-30T00:00:00.000Z'],
  ['month 13', '2026-13-01T00:00:00.000Z'],
  ['stringified null', 'null'],
] as const;

describe('malformed controlled value does not crash the tree', () => {
  it.each(MALFORMED)('DatePicker — %s', (_label, value) => {
    expect(() =>
      render(
        <DatePicker value={value} onChange={() => {}}>
          <DatePicker.Input aria-label="date" />
          <DatePicker.Popover>
            <DatePicker.Calendar />
          </DatePicker.Popover>
        </DatePicker>,
      ),
    ).not.toThrow();
  });

  it.each(MALFORMED)('MonthPicker — %s', (_label, value) => {
    expect(() =>
      render(
        <MonthPicker value={value} onChange={() => {}}>
          <MonthPicker.Input aria-label="month" />
          <MonthPicker.Popover>
            <MonthPicker.Grid />
          </MonthPicker.Popover>
        </MonthPicker>,
      ),
    ).not.toThrow();
  });

  it.each(MALFORMED)('YearPicker — %s', (_label, value) => {
    expect(() =>
      render(
        <YearPicker value={value} onChange={() => {}}>
          <YearPicker.Input aria-label="year" />
          <YearPicker.Popover>
            <YearPicker.Grid />
          </YearPicker.Popover>
        </YearPicker>,
      ),
    ).not.toThrow();
  });

  it.each(MALFORMED)('DateTimePicker — %s', (_label, value) => {
    expect(() =>
      render(
        <DateTimePicker value={value} onChange={() => {}}>
          <DateTimePicker.Input aria-label="datetime" />
          <DateTimePicker.Popover>
            <DateTimePicker.Calendar />
          </DateTimePicker.Popover>
        </DateTimePicker>,
      ),
    ).not.toThrow();
  });

  it.each(MALFORMED)('TimePicker — %s', (_label, value) => {
    expect(() =>
      render(
        <TimePicker value={value} onChange={() => {}}>
          <TimePicker.Input aria-label="time" />
        </TimePicker>,
      ),
    ).not.toThrow();
  });

  it.each(MALFORMED)('RangePicker — %s', (_label, value) => {
    expect(() =>
      render(
        <RangePicker value={{ start: value, end: value }} onChange={() => {}}>
          <RangePicker.Input aria-label="range" />
          <RangePicker.Popover>
            <RangePicker.Calendar />
          </RangePicker.Popover>
        </RangePicker>,
      ),
    ).not.toThrow();
  });

  it.each(MALFORMED)('WeekPicker — %s', (_label, value) => {
    expect(() =>
      render(
        <WeekPicker value={{ start: value, end: value }} onChange={() => {}}>
          <WeekPicker.Input aria-label="week" />
          <WeekPicker.Popover>
            <WeekPicker.Calendar />
          </WeekPicker.Popover>
        </WeekPicker>,
      ),
    ).not.toThrow();
  });
});

/**
 * The grids above sit inside a closed `Popover`, so they never mount. The seed is not the
 * only consumer of the raw value — `Calendar` hands `ctx.value` to `getCalendarDays`
 * untouched (by design, so the value is echoed rather than rewritten), and under
 * `displayTimezone` that reaches `Intl.DateTimeFormat.formatToParts(Invalid Date)`. These
 * mount the grid directly so the comparison layer is actually exercised.
 */
describe('malformed value does not crash a mounted grid', () => {
  it.each(MALFORMED)('DatePicker.Calendar — %s', (_label, value) => {
    expect(() =>
      render(
        <DatePicker value={value} onChange={() => {}}>
          <DatePicker.Calendar />
        </DatePicker>,
      ),
    ).not.toThrow();
  });

  it.each(MALFORMED)('DatePicker.Calendar under displayTimezone — %s', (_label, value) => {
    expect(() =>
      render(
        <DatePicker value={value} onChange={() => {}} displayTimezone="America/New_York">
          <DatePicker.Calendar />
        </DatePicker>,
      ),
    ).not.toThrow();
  });

  it.each(MALFORMED)('DatePicker.MonthGrid / YearGrid — %s', (_label, value) => {
    expect(() =>
      render(
        <DatePicker value={value} onChange={() => {}} displayTimezone="Pacific/Kiritimati">
          <DatePicker.MonthGrid />
          <DatePicker.YearGrid />
        </DatePicker>,
      ),
    ).not.toThrow();
  });

  it.each(MALFORMED)('MonthPicker.Grid — %s', (_label, value) => {
    expect(() =>
      render(
        <MonthPicker value={value} onChange={() => {}} displayTimezone="America/New_York">
          <MonthPicker.Grid />
        </MonthPicker>,
      ),
    ).not.toThrow();
  });

  it.each(MALFORMED)('YearPicker.Grid — %s', (_label, value) => {
    expect(() =>
      render(
        <YearPicker value={value} onChange={() => {}} displayTimezone="America/New_York">
          <YearPicker.Grid />
        </YearPicker>,
      ),
    ).not.toThrow();
  });

  it.each(MALFORMED)('RangePicker.Calendar — %s', (_label, value) => {
    expect(() =>
      render(
        <RangePicker
          value={{ start: value, end: value }}
          onChange={() => {}}
          displayTimezone="America/New_York"
        >
          <RangePicker.Calendar />
        </RangePicker>,
      ),
    ).not.toThrow();
  });

  it.each(MALFORMED)('WeekPicker.Calendar — %s', (_label, value) => {
    expect(() =>
      render(
        <WeekPicker value={{ start: value, end: value }} onChange={() => {}}>
          <WeekPicker.Calendar />
        </WeekPicker>,
      ),
    ).not.toThrow();
  });

  it.each(MALFORMED)('TimePicker lists under displayTimezone — %s', (_label, value) => {
    expect(() =>
      render(
        <TimePicker value={value} onChange={() => {}} displayTimezone="America/New_York">
          <TimePicker.Input aria-label="time" />
          <TimePicker.HourList />
          <TimePicker.MinuteList />
          <TimePicker.AmPmToggle />
        </TimePicker>,
      ),
    ).not.toThrow();
  });

  it.each(MALFORMED)('DateTimePicker.Calendar — %s', (_label, value) => {
    expect(() =>
      render(
        <DateTimePicker value={value} onChange={() => {}} displayTimezone="America/New_York">
          <DateTimePicker.Calendar />
          <DateTimePicker.HourList />
          <DateTimePicker.MinuteList />
        </DateTimePicker>,
      ),
    ).not.toThrow();
  });
});

describe('malformed uncontrolled defaultValue does not crash the tree', () => {
  it.each(MALFORMED)('DatePicker — %s', (_label, value) => {
    expect(() =>
      render(
        <DatePicker defaultValue={value}>
          <DatePicker.Input aria-label="date" />
          <DatePicker.Calendar />
        </DatePicker>,
      ),
    ).not.toThrow();
  });

  it.each(MALFORMED)('MonthPicker — %s', (_label, value) => {
    expect(() =>
      render(
        <MonthPicker defaultValue={value}>
          <MonthPicker.Grid />
        </MonthPicker>,
      ),
    ).not.toThrow();
  });

  it.each(MALFORMED)('YearPicker — %s', (_label, value) => {
    expect(() =>
      render(
        <YearPicker defaultValue={value}>
          <YearPicker.Grid />
        </YearPicker>,
      ),
    ).not.toThrow();
  });

  it.each(MALFORMED)('DateTimePicker — %s', (_label, value) => {
    expect(() =>
      render(
        <DateTimePicker defaultValue={value}>
          <DateTimePicker.Calendar />
        </DateTimePicker>,
      ),
    ).not.toThrow();
  });

  it.each(MALFORMED)('RangePicker — %s', (_label, value) => {
    expect(() =>
      render(
        <RangePicker defaultValue={{ start: value, end: value }}>
          <RangePicker.Calendar />
        </RangePicker>,
      ),
    ).not.toThrow();
  });

  it.each(MALFORMED)('WeekPicker — %s', (_label, value) => {
    expect(() =>
      render(
        <WeekPicker defaultValue={{ start: value, end: value }}>
          <WeekPicker.Calendar />
        </WeekPicker>,
      ),
    ).not.toThrow();
  });
});

describe('malformed value does not break server rendering', () => {
  it.each(MALFORMED)('renderToString — %s', (_label, value) => {
    expect(() =>
      renderToString(
        <DatePicker value={value} onChange={() => {}}>
          <DatePicker.Input aria-label="date" />
        </DatePicker>,
      ),
    ).not.toThrow();
  });
});

describe('malformed value does not crash the headless hooks', () => {
  it.each(MALFORMED)('useDatePicker — %s', (_label, value) => {
    expect(() => renderHook(() => useDatePicker({ value, adapter: DateFnsAdapter }))).not.toThrow();
  });

  it.each(MALFORMED)('useMonthPicker — %s', (_label, value) => {
    expect(() =>
      renderHook(() => useMonthPicker({ value, adapter: DateFnsAdapter })),
    ).not.toThrow();
  });

  it.each(MALFORMED)('useYearPicker — %s', (_label, value) => {
    expect(() => renderHook(() => useYearPicker({ value, adapter: DateFnsAdapter }))).not.toThrow();
  });

  it.each(MALFORMED)('useDateTimePicker — %s', (_label, value) => {
    expect(() =>
      renderHook(() => useDateTimePicker({ value, adapter: DateFnsAdapter })),
    ).not.toThrow();
  });

  it.each(MALFORMED)('useRangePicker — %s', (_label, value) => {
    expect(() =>
      renderHook(() =>
        useRangePicker({ value: { start: value, end: value }, adapter: DateFnsAdapter }),
      ),
    ).not.toThrow();
  });

  it.each(MALFORMED)('useWeekPicker — %s', (_label, value) => {
    expect(() =>
      renderHook(() =>
        useWeekPicker({ value: { start: value, end: value }, adapter: DateFnsAdapter }),
      ),
    ).not.toThrow();
  });
});

describe('the fallback seeds the view to today, and the input still shows the raw text', () => {
  it('opens on the current month rather than an empty grid', () => {
    render(
      <DatePicker value="not-a-date" onChange={() => {}}>
        <DatePicker.Input aria-label="date" />
        <DatePicker.Calendar />
      </DatePicker>,
    );
    const today = new Date();
    const expected = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)));
    expect(document.body.textContent).toContain(expected);
  });

  it('does not silently replace the value the consumer passed', () => {
    render(
      <DatePicker value="not-a-date" onChange={() => {}}>
        <DatePicker.Input aria-label="date" />
      </DatePicker>,
    );
    expect((screenInput() as HTMLInputElement).value).toBe('not-a-date');
  });
});

function screenInput() {
  return document.querySelector('input[aria-label="date"]')!;
}
