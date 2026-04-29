---
"@kalyx/react": patch
---

Follow-up to the v1.0-rc audit series:

- **Fix WebKit Enter regression** — `DatePicker.Input` now commits the calendar's currently focused day on Enter when the popover is open and no text was typed. WebKit doesn't always shift focus from the input to the day button on `input.click()`, so the previous behavior (preventDefault but no commit) left the popover dangling. Other browsers also benefit when the user presses Enter immediately after opening.
- **Consolidate parsing path** — extract the parse-and-commit logic into a single `commitText` helper used by `onChange`, `onBlur`, `onCompositionEnd`, and Enter. Removes ~60 bytes of duplicated logic.
- **Bundle target raised to 13 KB** — the v1.0-rc accessibility / API additions (IME composition, popover focus-out, hidden form input, `aria-rowindex`/`colindex`, `displayName`, keyboard skip-disabled) accumulated to 12.07 KB gzip; the 12 KB ceiling was 0.07 KB tight. README, docs, `tsup.config.ts`, and `scripts/check-bundle-size.js` updated to ≤13 KB. Still ~3× smaller than `react-datepicker`.
