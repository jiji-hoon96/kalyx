/**
 * Central selector + config module.
 *
 * Every selector the demo depends on lives here so that if the Kalyx docs site
 * DOM changes, you only edit this one file — the recording flow in `demo.ts`
 * stays untouched.
 *
 * These were verified against the live playground at
 * https://kalyx-docs-site.vercel.app/playground (Docusaurus SPA). The playground
 * shows ONE picker at a time, switched via a `<select aria-label="Picker">`, and
 * renders it inside `[data-testid="preview-panel"][data-picker="<id>"]`.
 *
 * Kalyx is headless, so the stable contract is ARIA roles, not class names:
 *   Input     -> role="combobox"        (some pickers label it, e.g. "Date and time")
 *   Popover   -> role="dialog"
 *   Calendar  -> role="grid" with day <button> cells; outside-month days carry
 *                [data-outside-month] so we exclude them.
 *   Month/Year grid cells -> role="gridcell"
 *   TimePicker lists       -> role="listbox" (aria name "Hour"/"Minute"),
 *                             options role="option" (aria-label "N hours"/"N minutes"),
 *                             AM/PM -> role="radiogroup" with role="radio" AM/PM.
 */

export type PickerId =
  | 'datepicker'
  | 'rangepicker'
  | 'timepicker'
  | 'datetimepicker'
  | 'monthpicker'
  | 'yearpicker'
  | 'weekpicker';

/** Order the pickers are demoed in. */
export const PICKER_ORDER: PickerId[] = [
  'datepicker',
  'rangepicker',
  'timepicker',
  'datetimepicker',
  'monthpicker',
  'yearpicker',
  'weekpicker',
];

/** Runtime / recording configuration (env-overridable). */
export const CONFIG = {
  /** Target site. Override with DEMO_URL. Defaults to the deployed playground. */
  demoUrl: process.env.DEMO_URL ?? 'https://kalyx-docs-site.vercel.app/playground',
  /** Logical viewport (video size matches this). */
  viewport: { width: 1200, height: 720 },
  /** Retina crispness for the recording. */
  deviceScaleFactor: 2,
  /** Global slow-motion applied to every Playwright action (ms). */
  slowMo: Number(process.env.SLOWMO ?? 120),
  /** Base pause between demo steps (ms). Override with STEP_MS. */
  stepMs: Number(process.env.STEP_MS ?? 700),
  /** Steps used when tweening the cursor between targets — higher = smoother. */
  mouseSteps: Number(process.env.MOUSE_STEPS ?? 25),
  /** Record one picker only (its id) instead of all seven. Set via ONLY. */
  only: (process.env.ONLY as PickerId | undefined) || undefined,
  /** Force light/dark first paint. Playwright colorScheme. */
  colorScheme: (process.env.COLOR_SCHEME as 'light' | 'dark' | undefined) ?? 'light',
  /**
   * Demo styling. 'inject' (default) applies src/theme.css so the headless
   * pickers look polished on camera; 'none' records the raw unstyled look.
   */
  theme: (process.env.THEME as 'inject' | 'none' | undefined) ?? 'inject',
} as const;

/**
 * Selectors. Functions take arguments where a value is interpolated so callers
 * never build strings by hand.
 */
export const SEL = {
  /** The playground's picker switcher `<select>`. */
  pickerSwitch: 'select[aria-label="Picker"]',
  /** The live preview container; scope all picker queries under this. */
  previewPanel: '[data-testid="preview-panel"]',
  /** Preview scoped to a specific picker id (belt-and-suspenders). */
  previewFor: (id: PickerId) => `[data-testid="preview-panel"][data-picker="${id}"]`,

  /** Role names (used with page.getByRole). */
  role: {
    input: 'combobox',
    popover: 'dialog',
    grid: 'grid',
    gridcell: 'gridcell',
    listbox: 'listbox',
    option: 'option',
    radiogroup: 'radiogroup',
    radio: 'radio',
  },

  /** A calendar day button that belongs to the current month. */
  currentMonthDay: 'button:not([data-outside-month])',
  /** Regex matching a day-of-month label exactly (e.g. 15, not 150). */
  dayExact: (day: number) => new RegExp(`^${day}$`),
  /** Regex matching a full or abbreviated month label prefix (e.g. "Apr"). */
  monthPrefix: (label: string) => new RegExp(`^${label}`),
} as const;

/** Accessible label used by inputs that expose one. */
export const LABEL = {
  startDate: 'Start date',
  endDate: 'End date',
  dateAndTime: 'Date and time',
  time: 'Time',
  hourList: 'Hour',
  minuteList: 'Minute',
  ampm: 'AM/PM',
} as const;
