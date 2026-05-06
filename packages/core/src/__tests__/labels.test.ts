import { describe, it, expect } from 'vitest';
import {
  DEFAULT_DATEPICKER_LABELS,
  DEFAULT_RANGEPICKER_LABELS,
  DEFAULT_TIMEPICKER_LABELS,
  DEFAULT_DATETIMEPICKER_LABELS,
} from '../utils/labels.js';

describe('labels — defaults', () => {
  it('DatePicker exposes the documented label keys', () => {
    expect(DEFAULT_DATEPICKER_LABELS).toMatchObject({
      triggerOpen: expect.any(String),
      triggerClose: expect.any(String),
      popoverLabel: expect.any(String),
      prevMonth: expect.any(String),
      nextMonth: expect.any(String),
      prevYear: expect.any(String),
      nextYear: expect.any(String),
      prevDecade: expect.any(String),
      nextDecade: expect.any(String),
    });
  });

  it('RangePicker extends DatePicker labels and adds range-specific keys', () => {
    expect(DEFAULT_RANGEPICKER_LABELS.prevMonth).toBe(DEFAULT_DATEPICKER_LABELS.prevMonth);
    expect(DEFAULT_RANGEPICKER_LABELS.popoverLabel).toBe('Choose date range');
    expect(DEFAULT_RANGEPICKER_LABELS).toMatchObject({
      startInput: expect.any(String),
      endInput: expect.any(String),
      presetsGroup: expect.any(String),
    });
  });

  it('TimePicker exposes hour/minute formatters that produce strings', () => {
    expect(DEFAULT_TIMEPICKER_LABELS.timeInput).toBe('Time');
    expect(DEFAULT_TIMEPICKER_LABELS.hourOption(9)).toBe('9 hours');
    expect(DEFAULT_TIMEPICKER_LABELS.minuteOption(30)).toBe('30 minutes');
  });

  it('DateTimePicker merges DatePicker + TimePicker and adds dateTimeInput', () => {
    expect(DEFAULT_DATETIMEPICKER_LABELS.prevMonth).toBe(DEFAULT_DATEPICKER_LABELS.prevMonth);
    expect(DEFAULT_DATETIMEPICKER_LABELS.timeInput).toBe(DEFAULT_TIMEPICKER_LABELS.timeInput);
    expect(DEFAULT_DATETIMEPICKER_LABELS.dateTimeInput).toBe('Date and time');
  });

  it('DateTimePicker hourOption/minuteOption are inherited from TimePicker', () => {
    expect(DEFAULT_DATETIMEPICKER_LABELS.hourOption(0)).toBe(
      DEFAULT_TIMEPICKER_LABELS.hourOption(0),
    );
    expect(DEFAULT_DATETIMEPICKER_LABELS.minuteOption(45)).toBe(
      DEFAULT_TIMEPICKER_LABELS.minuteOption(45),
    );
  });

  it('default label objects do not share mutable state across pickers', () => {
    // Mutating the DatePicker default must not leak into RangePicker / DateTimePicker.
    const before = DEFAULT_RANGEPICKER_LABELS.prevMonth;
    (DEFAULT_DATEPICKER_LABELS as { prevMonth: string }).prevMonth = '__mutated__';
    expect(DEFAULT_RANGEPICKER_LABELS.prevMonth).toBe(before);
    // restore
    (DEFAULT_DATEPICKER_LABELS as { prevMonth: string }).prevMonth = 'Previous month';
  });
});
