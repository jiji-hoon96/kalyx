---
"@kalyx/react": patch
"@kalyx/core": patch
---

Resolve v1.0-rc release-blocking defects (P0):

- **`"use client"` directive** — bundle is now marked as a React Server Component client boundary via tsup banner. Next.js App Router consumers no longer have to wrap each import.
- **Stable `today()`/`now()` initialization** — `viewMonth`/`focusedDate` `useState` calls in `DatePicker`/`RangePicker`/`DateTimePicker` Roots now use lazy initializers, so the adapter isn't called on every render.
- **`@kalyx/core` version sync** — bumped from `1.0.0-rc.0` to `1.0.0-rc.1` to match `@kalyx/react`.
- **`@kalyx/core` package contents** — `LICENSE` and `CHANGELOG.md` are now included in the npm tarball (`files` field).
- **Form auto-submit blocked when calendar open** — pressing Enter inside `DatePicker.Input`/`RangePicker.Input`/`DateTimePicker.Input` while the popover is open no longer submits the surrounding `<form>`.
- **`aria-haspopup="dialog"` on Trigger** — completes the WAI-ARIA combobox/dialog pattern.
- **Disabled cells skipped during keyboard navigation** — Calendar arrow keys / PageUp/Down / Home / End now step over disabled days and stop only when no enabled day is reachable.
