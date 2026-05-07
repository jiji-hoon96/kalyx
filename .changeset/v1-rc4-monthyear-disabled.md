---
"@kalyx/react": patch
---

`MonthPicker.Grid` and `YearPicker.Grid` now respect `before` / `after`
disabled rules — months/years that fall entirely outside the allowed range
are rendered with the `disabled` HTML attribute, `aria-disabled="true"`, the
new `monthDisabled` / `yearDisabled` className slots, and are skipped during
keyboard navigation.

This was deliberately deferred from PR #46 to keep that bundle under 14 KB;
it lands now with a 14 → 15 KB ceiling bump.

Behavioral details:
- A month is "fully disabled" only when every day in it is excluded by a
  `before` or `after` rule. `date` and `dayOfWeek` rules can never disable a
  whole month, so they remain a per-day concern.
- A year follows the same rule against `[Jan 1 00:00:00, Dec 31 23:59:59.999]`.
- Click and keyboard `Enter` / `Space` on a disabled cell are no-ops.
- Initial focus and post-PageUp/PageDown focus both re-anchor to the first
  enabled cell when the natural target is itself disabled. (A `disabled`
  HTML button can't receive DOM focus, so without the re-anchor the user
  would silently lose keyboard navigation.)

**Internal:** `useGridState` regains its optional `disabledFlags` parameter
plus a focus re-anchor effect; `isRangeFullyDisabled` is reintroduced as an
internal helper. Neither is exposed in the package public API.

**Bundle target:** raised 14 → 15 KB (measured 13.96 KB ESM / 14.21 KB CJS).
Same precedent as the 12 → 13 KB and 13 → 14 KB bumps when prior feature
work landed. Updated `scripts/check-bundle-size.js`, `pr-check.yml`, READMEs,
CLAUDE.md, PR template, and `check-bundle.md`.
