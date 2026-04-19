/**
 * Default English labels for ARIA attributes and accessible text.
 * Override via the `labels` prop on Root components.
 */

export interface DatePickerLabels {
  triggerOpen: string;
  triggerClose: string;
  popoverLabel: string;
  prevMonth: string;
  nextMonth: string;
  prevYear: string;
  nextYear: string;
  prevDecade: string;
  nextDecade: string;
  /** Used by DateTimePicker.Input (present only when DatePickerContext is provided by DateTimePickerRoot) */
  dateTimeInput?: string;
}

export interface RangePickerLabels extends DatePickerLabels {
  startInput: string;
  endInput: string;
  presetsGroup: string;
}

export interface TimePickerLabels {
  timeInput: string;
  hourList: string;
  minuteList: string;
  amPmToggle: string;
  hourOption: (hour: number) => string;
  minuteOption: (minute: number) => string;
}

export interface DateTimePickerLabels extends DatePickerLabels, TimePickerLabels {
  dateTimeInput: string;
}

export const DEFAULT_DATEPICKER_LABELS: DatePickerLabels = {
  triggerOpen: 'Open calendar',
  triggerClose: 'Close calendar',
  popoverLabel: 'Choose date',
  prevMonth: 'Previous month',
  nextMonth: 'Next month',
  prevYear: 'Previous year',
  nextYear: 'Next year',
  prevDecade: 'Previous decade',
  nextDecade: 'Next decade',
};

export const DEFAULT_RANGEPICKER_LABELS: RangePickerLabels = {
  ...DEFAULT_DATEPICKER_LABELS,
  popoverLabel: 'Choose date range',
  startInput: 'Start date',
  endInput: 'End date',
  presetsGroup: 'Date range presets',
};

export const DEFAULT_TIMEPICKER_LABELS: TimePickerLabels = {
  timeInput: 'Time',
  hourList: 'Hour',
  minuteList: 'Minute',
  amPmToggle: 'AM/PM',
  hourOption: (hour: number) => `${hour} hours`,
  minuteOption: (minute: number) => `${minute} minutes`,
};

export const DEFAULT_DATETIMEPICKER_LABELS: DateTimePickerLabels = {
  ...DEFAULT_DATEPICKER_LABELS,
  ...DEFAULT_TIMEPICKER_LABELS,
  dateTimeInput: 'Date and time',
};
