# @kalyx/core

> Platform-independent date logic powering the seven [Kalyx](https://github.com/jiji-hoon96/kalyx) pickers — single date, range, time, date+time, month, year, week. Types, adapters, and UTC-safe utilities.

[![npm](https://img.shields.io/npm/v/@kalyx/core?color=5b4fe1)](https://www.npmjs.com/package/@kalyx/core)
[![License](https://img.shields.io/badge/license-MIT-green)](https://github.com/jiji-hoon96/kalyx/blob/main/LICENSE)

Most users should install [`@kalyx/react`](https://www.npmjs.com/package/@kalyx/react) directly — it re-exports what you need. Install `@kalyx/core` only if you're building your own picker layer or a custom platform adapter.

**📚 Full docs:** [kalyx-docs-site.vercel.app/docs/api/core](https://kalyx-docs-site.vercel.app/docs/api/core)

## Install

```bash
pnpm add @kalyx/core
```

## What's inside

### Types

```ts
import type {
  ISODateString,
  DisabledRule,
  DateRange,
  CalendarDay,
  CalendarGrid,
  WeekStartsOn,
  CalendarOptions,
  DateAdapter,
  TimeValue,
} from '@kalyx/core';
```

### Adapter

`@kalyx/core` defines the `DateAdapter` interface but ships no implementation — the package is date-library-agnostic. Install a separate adapter package:

```bash
pnpm add @kalyx/core @kalyx/adapter-date-fns date-fns
```

```ts
import { DateFnsAdapter } from '@kalyx/adapter-date-fns';
// UTC-safe adapter built on date-fns v4.
```

Official adapters exist for dayjs and luxon as well — [`@kalyx/adapter-dayjs`](https://www.npmjs.com/package/@kalyx/adapter-dayjs) and [`@kalyx/adapter-luxon`](https://www.npmjs.com/package/@kalyx/adapter-luxon). For any other date library, implement the `DateAdapter` interface from `@kalyx/core` and validate it with the `@kalyx/core/test-helpers` conformance suite.

### Calendar utilities

```ts
import { getCalendarDays, isDateDisabled, minDate, maxDate } from '@kalyx/core';
```

### Date helpers

```ts
import { normalizeISO, parseInputValue } from '@kalyx/core';
```

### Time helpers

```ts
import {
  setTime, getTime,
  parseTimeString, formatTimeString, formatTimeFromISO,
  to12Hour, to24Hour,
  generateHours, generateMinutes,
  isSameTime,
} from '@kalyx/core';
```

### Locale helpers

```ts
import {
  getMonthName, formatMonthYear,
  getWeekdayNames, formatFullDate,
} from '@kalyx/core';
```

### Timezone helpers

DST-aware timezone utilities used by every picker when `displayTimezone` is set.

```ts
import {
  formatInTimezone,
  startOfDayInTimezone,
  isSameDayInTimezone,
  todayInTimezone,
  getTimezoneOffsetMinutes,
  civilMidnightFromUtcDay,
  getTimeInTimezone,
  setTimeInTimezone,
} from '@kalyx/core';
```

### Accessibility labels

Default ARIA labels (English). Override via the `labels` prop on any picker Root.

```ts
import {
  DEFAULT_DATEPICKER_LABELS,
  DEFAULT_RANGEPICKER_LABELS,
  DEFAULT_TIMEPICKER_LABELS,
  DEFAULT_DATETIMEPICKER_LABELS,
} from '@kalyx/core';
```

## Principles

- **All dates are ISO 8601 UTC strings** — never `Date` objects.
- **UTC-only arithmetic** — uses `getUTC*` methods, never local-timezone variants.
- **Adapter abstraction** — swap date engines by implementing `DateAdapter`.
- **Pure functions** — zero side effects, fully testable.

## License

[MIT](https://github.com/jiji-hoon96/kalyx/blob/main/LICENSE)
