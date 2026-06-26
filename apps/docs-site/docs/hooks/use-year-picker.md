---
id: use-year-picker
title: useYearPicker
sidebar_position: 5
---

# useYearPicker

The headless hook behind `<YearPicker>`. Exposes a 12-year decade block and navigation.

:::info `/headless` entry
Exported from **`@kalyx/react/headless`** (adapter-agnostic). See [Date adapters & the `/headless` entry](../guides/adapters.md).
:::

```tsx
import { useYearPicker } from '@kalyx/react/headless';
```

## Signature

```ts
function useYearPicker(options?: UseYearPickerOptions): UseYearPickerReturn;
```

### Options

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `ISODateString \| null` | — | Controlled year (stored as Jan 1 ISO). |
| `defaultValue` | `ISODateString` | — | Uncontrolled initial year. |
| `onChange` | `(value: ISODateString \| null) => void` | — | Fires when the year changes. |
| `disabled` | `DisabledRule[]` | `[]` | A year is disabled only when fully excluded. |
| `adapter` | `DateAdapter` | — | Date adapter (required on `/headless`). |
| `displayTimezone` | `string` | — | IANA zone for civil-day comparison. |

### Return

| Field | Type | Description |
| --- | --- | --- |
| `value` | `ISODateString \| null` | Current selected year. |
| `isOpen` | `boolean` | Popover state. |
| `open` / `close` / `toggle` | `() => void` | Popover controls. |
| `selectYear` | `(iso: ISODateString) => void` | Commit a year (pass a cell's `isoString`). |
| `decadeStart` | `number` | First year of the displayed 12-year block. |
| `previousDecade` / `nextDecade` | `() => void` | Move the grid one decade block. |
| `years` | `YearCell[]` | The 12 year cells for the current block. |
| `pickerId` | `string` | Stable ID for ARIA wiring. |
| `adapter` | `DateAdapter` | The resolved adapter. |

### `YearCell`

```ts
type YearCell = {
  isoString: ISODateString; // Jan 1, UTC midnight
  year: number;
  isSelected: boolean;
  isCurrent: boolean;       // current year (today)
  isDisabled: boolean;
};
```

## Example

```tsx
import { useYearPicker } from '@kalyx/react/headless';
import { DateFnsAdapter } from '@kalyx/adapter-date-fns';

export function MiniYearGrid() {
  const { years, decadeStart, previousDecade, nextDecade, selectYear } =
    useYearPicker({ adapter: DateFnsAdapter });

  return (
    <div>
      <header>
        <button onClick={previousDecade} aria-label="Previous decade">◀</button>
        <span>{decadeStart}–{decadeStart + 11}</span>
        <button onClick={nextDecade} aria-label="Next decade">▶</button>
      </header>
      <div className="grid grid-cols-3">
        {years.map((y) => (
          <button
            key={y.isoString}
            aria-selected={y.isSelected}
            disabled={y.isDisabled}
            onClick={() => selectYear(y.isoString)}>
            {y.year}
          </button>
        ))}
      </div>
    </div>
  );
}
```

## Related

- [YearPicker component →](../components/yearpicker.md)
- [useMonthPicker →](./use-month-picker.md)
- [Date adapters →](../guides/adapters.md)
