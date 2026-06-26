---
id: use-month-picker
title: useMonthPicker
sidebar_position: 4
---

# useMonthPicker

`<MonthPicker>` 뒤의 헤드리스 훅. 12개월 그리드와 내비게이션을 노출합니다 — DOM 렌더링과 포커스/키보드 연결은 여러분의 몫입니다.

:::info `/headless` 엔트리
Month / Year / Week / DateTime 훅은 어댑터 비의존(date-fns 미번들)인 **`@kalyx/react/headless`** 엔트리에서 export됩니다. [날짜 어댑터 & `/headless` 엔트리](../guides/adapters.md) 참고.
:::

```tsx
import { useMonthPicker } from '@kalyx/react/headless';
```

## 시그니처

```ts
function useMonthPicker(options?: UseMonthPickerOptions): UseMonthPickerReturn;
```

### 옵션

| 필드 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `value` | `ISODateString \| null` | — | controlled 월 (월 시작 ISO로 저장). |
| `defaultValue` | `ISODateString` | — | uncontrolled 초기 월. |
| `onChange` | `(value: ISODateString \| null) => void` | — | 월이 바뀔 때 호출. |
| `disabled` | `DisabledRule[]` | `[]` | 월은 완전히 배제될 때만 비활성. |
| `adapter` | `DateAdapter` | — | 날짜 어댑터 (`/headless`에서 필수). |
| `displayTimezone` | `string` | — | civil-day 비교용 IANA 존. [타임존](../concepts/timezone.md) 참고. |
| `locale` | `string` | `'en-US'` | 월 이름용 BCP 47 locale. |

### 반환

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `value` | `ISODateString \| null` | 현재 선택된 월. |
| `isOpen` | `boolean` | popover 상태. |
| `open` / `close` / `toggle` | `() => void` | popover 제어. |
| `selectMonth` | `(iso: ISODateString) => void` | 월 커밋 (셀의 `isoString` 전달). |
| `viewYear` | `number` | 그리드에 표시 중인 연도. |
| `previousYear` / `nextYear` | `() => void` | 그리드를 1년 이동. |
| `months` | `MonthCell[]` | `viewYear`의 12개월 셀. |
| `pickerId` | `string` | ARIA 연결용 `useId` 기반 안정 ID. |
| `adapter` | `DateAdapter` | 해석된 어댑터. |

### `MonthCell`

```ts
type MonthCell = {
  isoString: ISODateString; // 월 시작 ISO (UTC)
  monthIndex: number;       // 0 = 1월
  label: string;            // 지역화된 월 이름
  isSelected: boolean;
  isCurrent: boolean;       // 현재 월 (오늘)
  isDisabled: boolean;
};
```

## 예제

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

## 관련

- [MonthPicker 컴포넌트 →](../components/monthpicker.md)
- [useYearPicker →](./use-year-picker.md)
- [날짜 어댑터 →](../guides/adapters.md)
