import { RangePickerRoot } from './Root.js';
import { RangePickerInput } from './Input.js';
import { RangePickerPopover } from './Popover.js';
import { RangePickerCalendar } from './Calendar.js';
import { RangePickerPresets, RangePickerPreset } from './Presets.js';

import type { RangePickerRootProps } from './Root.js';
import type { RangePickerInputProps, RangeInputPart } from './Input.js';
import type { RangePickerPopoverProps } from './Popover.js';
import type {
  RangePickerCalendarProps,
  RangePickerCalendarClassNames,
} from './Calendar.js';
import type {
  RangePickerPresetsProps,
  RangePickerPresetsClassNames,
  RangePickerPresetProps,
  PresetKey,
} from './Presets.js';

/**
 * RangePicker — Headless date-range picker component
 *
 * @example Basic
 * ```tsx
 * <RangePicker value={range} onChange={setRange}>
 *   <RangePicker.Input part="start" />
 *   <RangePicker.Input part="end" />
 *   <RangePicker.Popover>
 *     <RangePicker.Calendar />
 *   </RangePicker.Popover>
 * </RangePicker>
 * ```
 *
 * @example Presets (dashboard)
 * ```tsx
 * <RangePicker value={range} onChange={setRange}>
 *   <RangePicker.Input part="start" />
 *   <RangePicker.Input part="end" />
 *   <RangePicker.Popover>
 *     <RangePicker.Presets>
 *       <RangePicker.Preset value="last7days">Last 7 days</RangePicker.Preset>
 *       <RangePicker.Preset value="last30days">Last 30 days</RangePicker.Preset>
 *       <RangePicker.Preset value="thisMonth">This month</RangePicker.Preset>
 *     </RangePicker.Presets>
 *     <RangePicker.Calendar />
 *   </RangePicker.Popover>
 * </RangePicker>
 * ```
 */
export const RangePicker = Object.assign(RangePickerRoot, {
  Input: RangePickerInput,
  Popover: RangePickerPopover,
  Calendar: RangePickerCalendar,
  Presets: RangePickerPresets,
  Preset: RangePickerPreset,
});

export type {
  RangePickerRootProps,
  RangePickerInputProps,
  RangeInputPart,
  RangePickerPopoverProps,
  RangePickerCalendarProps,
  RangePickerCalendarClassNames,
  RangePickerPresetsProps,
  RangePickerPresetsClassNames,
  RangePickerPresetProps,
  PresetKey,
};
