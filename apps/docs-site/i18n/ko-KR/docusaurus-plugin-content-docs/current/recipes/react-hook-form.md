---
id: react-hook-form
title: React Hook Form
sidebar_position: 3
---

# React Hook Form

Kalyx는 값을 ISO 문자열로 저장하므로 어떤 폼 라이브러리와도 깔끔하게 매핑됩니다. `react-hook-form` 버전입니다.

## `<Controller>`로 제어

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
        rules={{ required: '시작 날짜를 선택해 주세요' }}
        render={({ field, fieldState }) => (
          <div>
            <label htmlFor="startDate">시작 날짜</label>
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
      <button type="submit">예약</button>
    </form>
  );
}
```

`onChange`가 `ISODateString | null`을 넘기므로 제출 전 변환이 필요 없습니다.

## RangePicker + 검증

```tsx
<Controller
  name="dateRange"
  control={control}
  rules={{
    validate: (value) =>
      (value?.start && value?.end) || '시작과 종료를 모두 선택하세요',
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

## 비제어 (Controller 없음)

네이티브 폼 제출에선 Controller 없이도 됩니다.

```tsx
<form action="/api/book" method="post">
  <DatePicker defaultValue="2026-04-15T00:00:00.000Z">
    <DatePicker.Input name="startDate" />
    <DatePicker.Popover>
      <DatePicker.Calendar />
    </DatePicker.Popover>
  </DatePicker>
  <button>제출</button>
</form>
```

`<input>`의 `value`는 포맷된 표시 문자열입니다. ISO 문자열을 POST하고 싶다면 상태를 hidden 필드로 미러하세요.

## Zod 스키마

```ts
import { z } from 'zod';

const isoString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, '올바른 날짜가 아닙니다');

const BookingSchema = z.object({
  startDate: isoString,
  endDate: isoString,
});
```

`@hookform/resolvers/zod`로 연결하세요.

## 관련

- [Tailwind →](./tailwind.md)
- [ISO 문자열 →](../concepts/iso-string.md)
