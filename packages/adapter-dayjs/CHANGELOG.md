# @kalyx/adapter-dayjs

## 0.1.1

### Patch Changes

- 503396d: Reject impossible adapter dates and out-of-range programmatic time values, keep every picker and headless hook usable when external state contains an invalid date, enforce month-start/year-start values for typed MonthPicker and YearPicker commits, reject weeks containing any disabled civil day, submit ISO values from every named picker input, and include the advertised license in every adapter tarball.
- Updated dependencies [503396d]
  - @kalyx/core@1.4.6

## 0.1.0

### Minor Changes

- dd238a8: New package: **`@kalyx/adapter-dayjs`** — a dayjs-backed `DateAdapter`, drop-in for the ~half of the ecosystem (Mantine and others) already shipping dayjs. It runs dayjs in UTC mode for the same UTC / ISO-8601 semantics as `@kalyx/adapter-date-fns`, delegates all timezone-aware operations to `@kalyx/core` (the correctness moat lives in core, not the adapter), and is validated against the full `@kalyx/core/test-helpers` conformance suite — the suite's first second implementation, proving the `DateAdapter` contract is portable rather than date-fns-specific.

### Patch Changes

- Updated dependencies [96993f5]
- Updated dependencies [eb44024]
  - @kalyx/core@1.1.0
