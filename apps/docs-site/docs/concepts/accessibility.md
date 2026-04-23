---
id: accessibility
title: Accessibility
sidebar_position: 5
---

# Accessibility

Every Kalyx component ships with WAI-ARIA roles, full keyboard support, and passes automated axe checks in our test suite. You don't *add* accessibility — you'd have to *remove* it.

## ARIA roles at a glance

| Element | Role / attributes |
| --- | --- |
| `DatePicker.Input` | `role="combobox"`, `aria-expanded`, `aria-haspopup="dialog"`, `aria-controls` |
| `DatePicker.Trigger` | `role="button"`, `aria-expanded`, `aria-controls` |
| `DatePicker.Popover` | `role="dialog"`, `aria-modal="false"` |
| `DatePicker.Calendar` | `role="grid"` with `role="row"`, `role="gridcell"` inside |
| `DatePicker.Calendar` day | `aria-selected`, `aria-disabled`, `aria-current="date"` for today |
| `TimePicker.HourList` / `.MinuteList` | `role="listbox"` with `role="option"` children |
| `TimePicker.AmPmToggle` | `role="radiogroup"` with `role="radio"` children |

All roles are present on the rendered DOM — no JS needed for screen readers to announce them.

## Keyboard — DatePicker.Calendar

| Key | Action |
| --- | --- |
| `←` / `→` | Move focus one day |
| `↑` / `↓` | Move focus one week |
| `PageUp` / `PageDown` | Previous / next month |
| `Shift` + `PageUp` / `PageDown` | Previous / next year |
| `Home` / `End` | Start / end of week |
| `Enter` / `Space` | Select focused date |
| `Escape` | Close popover, restore focus to input |

Focused dates have `tabIndex=0`; all other days have `tabIndex=-1` — a single tab stop.

## Keyboard — TimePicker lists

| Key | Action |
| --- | --- |
| `↑` / `↓` | Move focus between options |
| `Home` / `End` | First / last option |
| `Enter` / `Space` | Select option |

## Keyboard — Trigger and Input

- `Tab` moves through `Input → Trigger` in order.
- From the `Input`, `↓` opens the popover and moves focus to the selected (or today's) date.
- From the `Trigger`, `Enter` or `Space` toggles the popover.

## Focus management

- Opening the popover moves focus inside the calendar grid.
- Closing (by `Escape`, clicking outside, or selecting a date) restores focus to the element that opened it.
- The popover is **not** a focus trap — by design — to support pattern combinations with form submit buttons.

## Screen reader labelling

Provide an accessible name on the input, matching your form's label:

```tsx
<label htmlFor="checkIn">Check-in</label>
<DatePicker value={iso} onChange={setIso}>
  <DatePicker.Input id="checkIn" />
  <DatePicker.Trigger aria-label="Open calendar" />
  <DatePicker.Popover aria-label="Choose check-in date">
    <DatePicker.Calendar />
  </DatePicker.Popover>
</DatePicker>
```

For RangePicker, pair each input:

```tsx
<label htmlFor="from">From</label>
<RangePicker.Input id="from" part="start" />
<label htmlFor="to">To</label>
<RangePicker.Input id="to" part="end" />
```

### Built-in ARIA labels (`labels` prop)

Kalyx auto-applies English ARIA labels to triggers, navigation buttons, and popover dialogs. Override them for other languages via the `labels` prop on any Root component:

```tsx
<DatePicker
  labels={{ triggerOpen: '캘린더 열기', prevMonth: '이전 달', nextMonth: '���음 달' }}
  value={iso}
  onChange={setIso}
>
  {/* ... */}
</DatePicker>
```

See the full key reference in the [Internationalization guide →](./internationalization.md).

## Color contrast

Kalyx ships zero colors. **You own the palette** — which means you also own the contrast. A minimum of WCAG AA (4.5:1 for text, 3:1 for large text and focus indicators) is your responsibility. A few places to double-check:

- `daySelected` vs `dayToday` — users must distinguish both from unselected days.
- Disabled days — keep contrast above 3:1 for readability, but visibly dimmed.
- Focus outline — never remove `:focus-visible` styling.

## Testing your styling

We bundle axe checks for structure, but contrast is sensitive to your CSS. Add jest-axe to your component tests:

```ts
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

it('calendar is accessible', async () => {
  const { container } = render(<StyledCalendar />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Next

- [Composition →](./composition.md)
- [SSR safety →](./ssr.md)
