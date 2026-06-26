---
id: use-month-picker
title: useMonthPicker
sidebar_position: 4
---

# useMonthPicker

The headless hook behind `<MonthPicker>`. Exposes the 12-month grid and navigation; you render the DOM and wire focus / keyboard.

:::info `/headless` entry
The Month / Year / Week / DateTime hooks are exported from the **`@kalyx/react/headless`** entry, which is adapter-agnostic (no bundled date-fns). See [Date adapters & the `/headless` entry](../guides/adapters.md).
:::

```tsx
import { useMonthPicker } from '@kalyx/react/headless';
```

## Signature

```ts
function useMonthPicker(options?: UseMonthPickerOptions): UseMonthPickerReturn;
```

### Options

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `ISODateString \| null` | — | Controlled month (stored as month-start ISO). |
| `defaultValue` | `ISODateString` | — | Uncontrolled initial month. |
| `onChange` | `(value: ISODateString \| null) => void` | — | Fires when the month changes. |
| `disabled` | `DisabledRule[]` | `[]` | A month is disabled only when fully excluded. |
| `adapter` | `DateAdapter` | — | Date adapter (required on `/headless`). |
| `displayTimezone` | `string` | — | IANA zone for civil-day comparison. See [Timezone](../concepts/timezone.md). |
| `locale` | `string` | `'en-US'` | BCP 47 locale for month names. |

### Return

| Field | Type | Description |
| --- | --- | --- |
| `value` | `ISODateString \| null` | Current selected month. |
| `isOpen` | `boolean` | Popover state. |
| `open` / `close` / `toggle` | `() => void` | Popover controls. |
| `selectMonth` | `(iso: ISODateString) => void` | Commit a month (pass a cell's `isoString`). |
| `viewYear` | `number` | Year currently shown in the grid. |
| `previousYear` / `nextYear` | `() => void` | Move the grid one year. |
| `months` | `MonthCell[]` | The 12 month cells for `viewYear`. |
| `pickerId` | `string` | Stable `useId`-based ID for ARIA wiring. |
| `adapter` | `DateAdapter` | The resolved adapter. |

### `MonthCell`

```ts
type MonthCell = {
  isoString: ISODateString; // month-start ISO (UTC)
  monthIndex: number;       // 0 = January
  label: string;            // localized month name
  isSelected: boolean;
  isCurrent: boolean;       // current month (today)
  isDisabled: boolean;
};
```

## Example

```tsx
import { useMonthPicker } from '@kalyx/react/headless';
import { DateFnsAdapter } from '@kalyx/adapter-date-fns';

export function MiniMonthGrid() {
  const { months, viewYear, previousYear, nextYear, selectMonth } =
    useMonthPicker({ adapter: DateFnsAdapter, onChange: (v) => console.log(v) });

  return (
    <div>
      <header>
        <button onClick={previousYear} aria-label="Previous year">◀</button>
        <span>{viewYear}</span>
        <button onClick={nextYear} aria-label="Next year">▶</button>
      </header>
      <div className="grid grid-cols-3">
        {months.map((m) => (
          <button
            key={m.isoString}
            aria-selected={m.isSelected}
            disabled={m.isDisabled}
            onClick={() => selectMonth(m.isoString)}>
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

## Related

- [MonthPicker component →](../components/monthpicker.md)
- [useYearPicker →](./use-year-picker.md)
- [Date adapters →](../guides/adapters.md)
