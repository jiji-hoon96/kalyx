# @kalyx/react

## 0.2.1

### Patch Changes

- fe0e63e: Add full documentation site (Docusaurus, EN/KO), rewrite READMEs for npm, fix CI pnpm version to 10
- Updated dependencies [fe0e63e]
  - @kalyx/core@0.2.1

## 0.2.0

### Minor Changes

- e9bb9e8: Initial release of Kalyx — headless, SSR-safe React DatePicker library.

  Features:

  - DatePicker: single date selection with Calendar, Input, Trigger, Popover
  - RangePicker: date range selection with auto-swap and hover preview
  - TimePicker: 12h/24h mode, minute step, HourList/MinuteList/AmPmToggle
  - DateTimePicker: combined date+time via context bridging (reuses existing components)
  - useDatePicker, useRangePicker, useTimePicker hooks for custom UIs
  - WAI-ARIA compliant: grid, dialog, combobox, listbox, radiogroup patterns
  - SSR safe: verified with Next.js 15 App Router
  - Zero CSS: style with classNames prop and data-\* attributes
  - ISO 8601 UTC strings only (no native Date objects)
  - Bundle: 7.71KB gzip (target ≤12KB)
  - 185 unit/integration tests passing

### Patch Changes

- Updated dependencies [e9bb9e8]
  - @kalyx/core@0.2.0
