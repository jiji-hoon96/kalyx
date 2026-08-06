// DateTimePicker for the `@kalyx/react/headless` entry — identical to the default
// export plus `.Presets` / `.Preset`. These live on the headless entry alone so the
// budgeted default `@kalyx/react` bundle stays under its gzip ceiling (the preset
// resolver + extra component would push it over). The two entries are built with
// tsup `splitting: false`, so this object is a distinct instance from the default
// one and the Object.assign here doesn't mutate the default export.
import { DateTimePicker as DateTimePickerBase } from './index.js';
import { DateTimePickerPresets, DateTimePickerPreset } from './Presets.js';

export const DateTimePicker = Object.assign(DateTimePickerBase, {
  Presets: DateTimePickerPresets,
  Preset: DateTimePickerPreset,
});

export type {
  DateTimePickerPresetsProps,
  DateTimePickerPresetsClassNames,
  DateTimePickerPresetProps,
} from './Presets.js';
