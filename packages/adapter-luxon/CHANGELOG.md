# @kalyx/adapter-luxon

## 0.1.1

### Patch Changes

- 503396d: Reject impossible adapter dates and out-of-range programmatic time values, keep every picker and headless hook usable when external state contains an invalid date, enforce month-start/year-start values for typed MonthPicker and YearPicker commits, reject weeks containing any disabled civil day, submit ISO values from every named picker input, and include the advertised license in every adapter tarball.
- Updated dependencies [503396d]
  - @kalyx/core@1.4.6

## 0.1.0

### Minor Changes

- 03f1037: New package: **`@kalyx/adapter-luxon`** — a luxon-backed `DateAdapter`, drop-in for teams already shipping luxon (common in enterprise / timezone-heavy stacks). It parses every value as a UTC `DateTime` for the same UTC / ISO-8601 semantics as `@kalyx/adapter-date-fns` and `@kalyx/adapter-dayjs`, delegates all timezone-aware operations to `@kalyx/core` (the correctness moat lives in core, not the adapter), and is validated against the full `@kalyx/core/test-helpers` conformance suite — the suite's third backend, further proving the `DateAdapter` contract is portable rather than tied to any one date library.
