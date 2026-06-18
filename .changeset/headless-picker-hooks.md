---
"@kalyx/react": minor
---

Add headless hooks for the remaining four pickers — `useMonthPicker`, `useYearPicker`, `useWeekPicker`, and `useDateTimePicker` — closing the API-symmetry gap (previously only Date/Range/Time had a hook). Each exposes the picker's state, grid data, and actions for fully custom UIs and is DOM-free to preserve the React Native seam. They ship on the **`@kalyx/react/headless`** entry only, so the budgeted default `@kalyx/react` bundle is byte-for-byte unchanged (ESM 15.78 / CJS 15.88 KB).
