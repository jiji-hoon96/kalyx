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

/**
 * Default classNames for each picker. These are Tailwind utility strings so the
 * Playground preview looks polished out of the box (Tailwind Play CDN is loaded
 * and scoped to `.tw-enable`, which the preview panel carries). Users can edit
 * or clear any field to see the headless picker react live — the whole point of
 * the editor — while the defaults double as a copy-pasteable Tailwind recipe.
 *
 * Kalyx itself ships zero CSS; nothing here lives in the library.
 */
const INPUT =
  'w-52 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200';

const DAY =
  'flex h-9 w-9 items-center justify-center rounded-md text-sm text-slate-700 transition hover:bg-slate-100';
const DAY_SELECTED = 'bg-indigo-600 text-white hover:bg-indigo-600';
const DAY_TODAY = 'font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-300';
const DAY_DISABLED = 'text-slate-300 line-through hover:bg-transparent cursor-not-allowed';
const DAY_OUTSIDE = 'text-slate-300';
const DAY_IN_RANGE = 'bg-indigo-100 text-slate-800 rounded-none hover:bg-indigo-100';

const CAL_ROOT = 'rounded-xl border border-slate-200 bg-white p-3 shadow-lg';
const CAL_HEADER = 'mb-2 flex items-center justify-between';
const CAL_NAVBTN =
  'flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-100';
const CAL_TITLE = 'text-sm font-semibold text-slate-800';
const CAL_GRID = 'border-separate [border-spacing:4px]';

const CELL_BTN =
  'flex h-9 min-w-[3.5rem] items-center justify-center rounded-md px-2 text-sm text-slate-700 transition hover:bg-slate-100';
const CELL_SELECTED = 'bg-indigo-600 text-white hover:bg-indigo-600';
const CELL_DISABLED = 'text-slate-300 line-through cursor-not-allowed hover:bg-transparent';

const LIST_ROOT =
  'h-44 w-16 overflow-y-auto rounded-md border border-slate-200 bg-white p-1 shadow-sm';
const LIST_OPTION =
  'flex cursor-pointer items-center justify-center rounded py-1.5 text-sm text-slate-700 transition hover:bg-slate-100';
const LIST_OPTION_SELECTED = 'bg-indigo-600 text-white hover:bg-indigo-600';

const AMPM_ROOT = 'flex flex-col gap-1.5 p-1';
const AMPM_OPTION =
  'cursor-pointer rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100';
const AMPM_OPTION_SELECTED = 'border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-600';

export const CLASSNAMES_BY_PICKER: Record<PickerId, ClassNamesShape> = {
  datepicker: {
    input: INPUT,
    calendar: {
      root: CAL_ROOT,
      header: CAL_HEADER,
      navButton: CAL_NAVBTN,
      title: CAL_TITLE,
      grid: CAL_GRID,
      day: DAY,
      daySelected: DAY_SELECTED,
      dayToday: DAY_TODAY,
      dayDisabled: DAY_DISABLED,
      dayOutsideMonth: DAY_OUTSIDE,
    },
  },
  rangepicker: {
    input: INPUT,
    calendar: {
      root: CAL_ROOT,
      header: CAL_HEADER,
      grid: CAL_GRID,
      day: DAY,
      daySelected: DAY_SELECTED,
      dayInRange: DAY_IN_RANGE,
      dayToday: DAY_TODAY,
      dayDisabled: DAY_DISABLED,
    },
  },
  timepicker: {
    input: INPUT,
    hourList: { root: LIST_ROOT, option: LIST_OPTION, optionSelected: LIST_OPTION_SELECTED },
    minuteList: { root: LIST_ROOT, option: LIST_OPTION, optionSelected: LIST_OPTION_SELECTED },
    ampmToggle: { root: AMPM_ROOT, option: AMPM_OPTION, optionSelected: AMPM_OPTION_SELECTED },
  },
  datetimepicker: {
    input: INPUT,
    calendar: { root: CAL_ROOT, day: DAY, daySelected: DAY_SELECTED, dayToday: DAY_TODAY },
    hourList: { root: LIST_ROOT, option: LIST_OPTION, optionSelected: LIST_OPTION_SELECTED },
    minuteList: { root: LIST_ROOT, option: LIST_OPTION, optionSelected: LIST_OPTION_SELECTED },
  },
  monthpicker: {
    input: INPUT,
    grid: { root: CAL_ROOT, month: CELL_BTN, monthSelected: CELL_SELECTED, monthDisabled: CELL_DISABLED },
  },
  yearpicker: {
    input: INPUT,
    grid: { root: CAL_ROOT, year: CELL_BTN, yearSelected: CELL_SELECTED, yearDisabled: CELL_DISABLED },
  },
  weekpicker: {
    input: INPUT,
    calendar: {
      root: CAL_ROOT,
      header: CAL_HEADER,
      day: DAY,
      dayInRange: DAY_IN_RANGE,
      dayRangeStart: DAY_SELECTED,
      dayRangeEnd: DAY_SELECTED,
    },
  },
};

/** All known picker ids in display order. */
export const PICKER_IDS: readonly PickerId[] = Object.keys(CLASSNAMES_BY_PICKER) as readonly PickerId[];
