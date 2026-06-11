/**
 * Static map of classNames parts exposed by each kalyx picker. The
 * Playground's ClassNamesEditor renders one text input per leaf entry.
 * Shape matches the published `classNames` prop of each picker; if a
 * picker's prop surface grows in a future @kalyx/react release, this
 * file needs a corresponding update.
 *
 * Keep nesting shallow (max 2 levels) so the editor UI stays scannable.
 */
export type ClassNamesShape = {
  [key: string]: string | { [key: string]: string };
};

export type PickerId =
  | 'datepicker'
  | 'rangepicker'
  | 'timepicker'
  | 'datetimepicker'
  | 'monthpicker'
  | 'yearpicker'
  | 'weekpicker';

export const CLASSNAMES_BY_PICKER: Record<PickerId, ClassNamesShape> = {
  datepicker: {
    input: '',
    calendar: {
      root: '',
      header: '',
      navButton: '',
      title: '',
      grid: '',
      day: '',
      daySelected: '',
      dayToday: '',
      dayDisabled: '',
      dayOutsideMonth: '',
    },
  },
  rangepicker: {
    input: '',
    calendar: {
      root: '',
      header: '',
      grid: '',
      day: '',
      daySelected: '',
      dayInRange: '',
      dayToday: '',
      dayDisabled: '',
    },
  },
  timepicker: {
    input: '',
    hourList: { root: '', option: '', optionSelected: '' },
    minuteList: { root: '', option: '', optionSelected: '' },
    ampmToggle: { root: '', option: '', optionSelected: '' },
  },
  datetimepicker: {
    input: '',
    calendar: { root: '', day: '', daySelected: '', dayToday: '' },
    hourList: { root: '', option: '', optionSelected: '' },
    minuteList: { root: '', option: '', optionSelected: '' },
  },
  monthpicker: {
    input: '',
    grid: { root: '', month: '', monthSelected: '', monthDisabled: '' },
  },
  yearpicker: {
    input: '',
    grid: { root: '', year: '', yearSelected: '', yearDisabled: '' },
  },
  weekpicker: {
    input: '',
    calendar: {
      root: '',
      header: '',
      day: '',
      dayInRange: '',
      dayRangeStart: '',
      dayRangeEnd: '',
    },
  },
};

/** All known picker ids in display order. */
export const PICKER_IDS: readonly PickerId[] = Object.keys(CLASSNAMES_BY_PICKER) as readonly PickerId[];
