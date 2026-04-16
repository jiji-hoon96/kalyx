---
id: react-hook-form
title: React Hook Form
sidebar_position: 3
---

# React Hook Form

Kalyx stores values as ISO strings, which map cleanly to any form library. Here's the `react-hook-form` version.

## Live: the shape you submit

`react-hook-form` isn't available in this live editor, so the example below uses `useState` to show the exact flow — `onChange` hands you an `ISODateString | null`, which is what RHF would store in `field.value`.

```jsx live
function FormFlow() {
  const [state, setState] = React.useState({ date: null, submitted: null });
  return (
    <form
      className="kx-live-form"
      onSubmit={(e) => {
        e.preventDefault();
        setState((s) => ({ ...s, submitted: s.date }));
      }}
    >
      <label htmlFor="startDate">Start date</label>
      <DatePicker
        value={state.date}
        onChange={(iso) => setState((s) => ({ ...s, date: iso }))}
      >
        <div className="kx-live-row">
          <DatePicker.Input id="startDate" className="kx-live-input" placeholder="Required" />
          <DatePicker.Trigger className="kx-live-trigger" aria-label="Open calendar" />
        </div>
        <DatePicker.Popover className="kx-live-popover">
          <DatePicker.Calendar
            classNames={{
              header: 'kx-live-header',
              title: 'kx-live-title',
              navButton: 'kx-live-nav',
              grid: 'kx-live-grid',
              weekdayHeader: 'kx-live-weekday',
              day: 'live-day',
              daySelected: 'live-day-selected',
              dayToday: 'live-day-today',
              dayOutsideMonth: 'kx-live-outside',
            }}
          />
        </DatePicker.Popover>
      </DatePicker>
      {!state.date && (
        <span className="kx-live-form-error" role="alert">
          Please pick a start date
        </span>
      )}
      <button type="submit" className="kx-live-submit" disabled={!state.date}>
        Submit
      </button>
      <div className="kx-live-value">
        field.value: <code>{state.date ?? 'null'}</code>
        <br />
        submitted: <code>{state.submitted ?? '—'}</code>
      </div>
    </form>
  );
}
```

## Controlled with `<Controller>`

```tsx
import { useForm, Controller } from 'react-hook-form';
import { DatePicker, type ISODateString } from '@kalyx/react';

type BookingForm = {
  startDate: ISODateString | null;
};

export function BookingForm() {
  const { control, handleSubmit } = useForm<BookingForm>({
    defaultValues: { startDate: null },
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <Controller
        name="startDate"
        control={control}
        rules={{ required: 'Please pick a start date' }}
        render={({ field, fieldState }) => (
          <div>
            <label htmlFor="startDate">Start date</label>
            <DatePicker value={field.value} onChange={field.onChange}>
              <DatePicker.Input
                id="startDate"
                name={field.name}
                onBlur={field.onBlur}
                ref={field.ref}
              />
              <DatePicker.Popover>
                <DatePicker.Calendar />
              </DatePicker.Popover>
            </DatePicker>
            {fieldState.error && (
              <span role="alert">{fieldState.error.message}</span>
            )}
          </div>
        )}
      />
      <button type="submit">Book</button>
    </form>
  );
}
```

Since `onChange` receives an `ISODateString | null`, no transformation is needed before submit.

## RangePicker with validation

```tsx
<Controller
  name="dateRange"
  control={control}
  rules={{
    validate: (value) =>
      (value?.start && value?.end) || 'Select both dates',
  }}
  render={({ field, fieldState }) => (
    <RangePicker value={field.value} onChange={field.onChange}>
      <RangePicker.Input part="start" onBlur={field.onBlur} ref={field.ref} />
      <RangePicker.Input part="end" />
      <RangePicker.Popover>
        <RangePicker.Calendar />
      </RangePicker.Popover>
      {fieldState.error && <span role="alert">{fieldState.error.message}</span>}
    </RangePicker>
  )}
/>
```

## Uncontrolled (no Controller)

For native-form submits you can skip Controller entirely:

```tsx
<form action="/api/book" method="post">
  <DatePicker defaultValue="2026-04-15T00:00:00.000Z">
    <DatePicker.Input name="startDate" />
    <DatePicker.Popover>
      <DatePicker.Calendar />
    </DatePicker.Popover>
  </DatePicker>
  <button>Submit</button>
</form>
```

The `<input>`'s `value` is the formatted display string. If you want to POST the ISO string instead, mirror the state into a hidden field.

## Zod schema

```ts
import { z } from 'zod';

const isoString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, 'Invalid date');

const BookingSchema = z.object({
  startDate: isoString,
  endDate: isoString,
});
```

Plug in via `@hookform/resolvers/zod`.

## Related

- [Tailwind →](./tailwind.md)
- [ISO strings →](../concepts/iso-string.md)
