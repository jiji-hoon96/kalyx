---
"@kalyx/react": patch
---

docs: clarify `TimePicker.filterTime` polarity. The predicate returns `true` to mark a slot **unselectable** — same polarity as MUI X's `shouldDisableTime`, and the **inverse** of react-datepicker's `filterTime` (which returns `true` to *keep* a slot). Earlier JSDoc/changelog called it "equivalent to react-datepicker's `filterTime`", which is misleading because the polarity is reversed; react-datepicker migrators must invert their predicate. No runtime behavior change — JSDoc, the published package description (≤16 KB), and docs only.
