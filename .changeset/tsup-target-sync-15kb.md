---
"@kalyx/react": patch
---

Internal: sync the `tsup` onSuccess bundle-size budget from `13 KB` to `15 KB` so the per-build warning matches the actual CI gate (`scripts/check-bundle-size.js`, `pr-check.yml`, `release.yml`). No runtime change; the published artifact is byte-identical.

This was a leftover from the 13 → 14 → 15 KB ceiling raises during RC (PR #46 / PR #48); only the tsup-side TARGET_KB was missed during those bumps, so local `pnpm build` printed a spurious `⚠️` even though CI passed.
