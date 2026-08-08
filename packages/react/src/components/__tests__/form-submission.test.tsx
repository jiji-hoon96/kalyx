import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DateTimePicker } from '../DateTimePicker/index.js';
import { RangePicker } from '../RangePicker/index.js';
import { TimePicker } from '../TimePicker/index.js';
import { WeekPicker } from '../WeekPicker/index.js';

const START = '2026-01-11T00:00:00.000Z';
const END = '2026-01-17T00:00:00.000Z';

function submittedValue(field: string): FormDataEntryValue | null {
  return new FormData(screen.getByTestId<HTMLFormElement>('form')).get(field);
}

describe('native form submission', () => {
  it('submits RangePicker endpoint values as ISO rather than formatted visible text', () => {
    render(
      <form data-testid="form">
        <RangePicker defaultValue={{ start: START, end: END }}>
          <RangePicker.Input part="start" name="start" />
          <RangePicker.Input part="end" name="end" />
        </RangePicker>
      </form>,
    );

    expect(submittedValue('start')).toBe(START);
    expect(submittedValue('end')).toBe(END);
  });

  it('submits WeekPicker endpoint values as ISO', () => {
    render(
      <form data-testid="form">
        <WeekPicker defaultValue={{ start: START, end: END }}>
          <WeekPicker.Input part="start" name="weekStart" />
        </WeekPicker>
      </form>,
    );

    expect(submittedValue('weekStart')).toBe(START);
  });

  it('submits TimePicker values as ISO rather than formatted visible text', () => {
    render(
      <form data-testid="form">
        <TimePicker defaultValue="2026-01-15T14:30:00.000Z">
          <TimePicker.Input name="time" />
        </TimePicker>
      </form>,
    );

    expect(submittedValue('time')).toBe('2026-01-15T14:30:00.000Z');
  });

  it('submits DateTimePicker values as ISO rather than formatted visible text', () => {
    render(
      <form data-testid="form">
        <DateTimePicker defaultValue="2026-01-15T14:30:00.000Z">
          <DateTimePicker.Input name="dateTime" />
        </DateTimePicker>
      </form>,
    );

    expect(submittedValue('dateTime')).toBe('2026-01-15T14:30:00.000Z');
  });
});
