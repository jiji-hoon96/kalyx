export type Picker = {
  id: string;
  label: string;
  oneLineId: string;
  oneLineDefault: string;
};

export const PICKERS: readonly Picker[] = [
  {
    id: 'datepicker',
    label: 'DatePicker',
    oneLineId: 'home.pickerGrid.datepicker.oneLine',
    oneLineDefault: 'Single date with calendar popover.',
  },
  {
    id: 'rangepicker',
    label: 'RangePicker',
    oneLineId: 'home.pickerGrid.rangepicker.oneLine',
    oneLineDefault: 'Start-end range with hover preview + presets.',
  },
  {
    id: 'timepicker',
    label: 'TimePicker',
    oneLineId: 'home.pickerGrid.timepicker.oneLine',
    oneLineDefault: '12 / 24-hour hour-minute lists with AM/PM toggle.',
  },
  {
    id: 'datetimepicker',
    label: 'DateTimePicker',
    oneLineId: 'home.pickerGrid.datetimepicker.oneLine',
    oneLineDefault: 'Date + time as one ISO string. Composable parts.',
  },
  {
    id: 'monthpicker',
    label: 'MonthPicker',
    oneLineId: 'home.pickerGrid.monthpicker.oneLine',
    oneLineDefault: '12-month grid. Value = first day of the month.',
  },
  {
    id: 'yearpicker',
    label: 'YearPicker',
    oneLineId: 'home.pickerGrid.yearpicker.oneLine',
    oneLineDefault: '12-year decade grid. Value = Jan 1 of the year.',
  },
  {
    id: 'weekpicker',
    label: 'WeekPicker',
    oneLineId: 'home.pickerGrid.weekpicker.oneLine',
    oneLineDefault: 'Single-click whole-week selection. Value = DateRange.',
  },
] as const;
