---
"@kalyx/core": minor
"@kalyx/react": minor
---

Improve code quality, performance, and stability

- Enforce UTC timezone suffix in ISO regex
- Extract shared usePopover and useListboxNavigation hooks
- Add Intl.DateTimeFormat caching for locale/timezone utilities
- Memoize disabledRules to prevent unnecessary context re-creation
- Add try-catch around adapter.format() for error resilience
- Cancel requestAnimationFrame on unmount in listbox navigation
- Remove unused parseInputValue format parameter
- Boost test coverage: 87% → 92%
- Fix bundle size measurement to report both ESM and CJS
