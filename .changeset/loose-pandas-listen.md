---
'@kalyx/react': patch
---

Depend on `@kalyx/core` and `@kalyx/adapter-date-fns` with a caret range instead of an exact pin.

Previously these were declared as `workspace:*`, which pnpm substitutes with the exact sibling version at pack time — `@kalyx/react@1.4.3` shipped `"@kalyx/core": "1.4.2"`. A core-only patch could then only reach you by way of a new `@kalyx/react` release. They are now `workspace:^`, so the published range is `^1.4.2` and a core patch is picked up on your next resolve without waiting for a react release.

This cannot install a core older than the one your `@kalyx/react` was built against: the range is stamped at publish time from the sibling's version, so each react release floors core at whatever it shipped alongside.
