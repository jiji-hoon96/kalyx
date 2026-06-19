---
"@kalyx/react": minor
---

Add `DateTimePicker.Presets` / `DateTimePicker.Preset` to the `@kalyx/react/headless` entry (B5).

One-click presets that commit a **full datetime** (date + time) atomically — unlike `DateTimePicker.Calendar`, which preserves the existing time. Pass a complete ISO value:

```tsx
import { DateTimePicker } from '@kalyx/react/headless';

<DateTimePicker.Presets>
  <DateTimePicker.Preset value="2026-01-19T09:00:00.000Z">Mon 9 AM</DateTimePicker.Preset>
</DateTimePicker.Presets>
```

These ship on the `/headless` entry only. The default `@kalyx/react` bundle is at its 16KB ceiling, so adding the preset components there would break the budget; `/headless` is measured separately. The supporting `selectDateTime` Root method (a small atomic date+time setter, exposed via `DatePickerContext`) is present on both entries.
