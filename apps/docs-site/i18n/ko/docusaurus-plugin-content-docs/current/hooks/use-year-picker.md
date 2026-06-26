---
id: use-year-picker
title: useYearPicker
sidebar_position: 5
---

# useYearPicker

`<YearPicker>` 뒤의 헤드리스 훅. 12년 단위 10년 블록과 내비게이션을 노출합니다.

:::info `/headless` 엔트리
**`@kalyx/react/headless`**(어댑터 비의존)에서 export됩니다. [날짜 어댑터 & `/headless` 엔트리](../guides/adapters.md) 참고.
:::

```tsx
import { useYearPicker } from '@kalyx/react/headless';
```

## 시그니처

```ts
function useYearPicker(options?: UseYearPickerOptions): UseYearPickerReturn;
```

### 옵션

| 필드 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `value` | `ISODateString \| null` | — | controlled 연도 (1월 1일 ISO로 저장). |
| `defaultValue` | `ISODateString` | — | uncontrolled 초기 연도. |
| `onChange` | `(value: ISODateString \| null) => void` | — | 연도가 바뀔 때 호출. |
| `disabled` | `DisabledRule[]` | `[]` | 연도는 완전히 배제될 때만 비활성. |
| `adapter` | `DateAdapter` | — | 날짜 어댑터 (`/headless`에서 필수). |
| `displayTimezone` | `string` | — | civil-day 비교용 IANA 존. |

### 반환

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `value` | `ISODateString \| null` | 현재 선택된 연도. |
| `isOpen` | `boolean` | popover 상태. |
| `open` / `close` / `toggle` | `() => void` | popover 제어. |
| `selectYear` | `(iso: ISODateString) => void` | 연도 커밋 (셀의 `isoString` 전달). |
| `decadeStart` | `number` | 표시 중인 12년 블록의 첫 해. |
| `previousDecade` / `nextDecade` | `() => void` | 그리드를 한 10년 블록 이동. |
| `years` | `YearCell[]` | 현재 블록의 12년 셀. |
| `pickerId` | `string` | ARIA 연결용 안정 ID. |
| `adapter` | `DateAdapter` | 해석된 어댑터. |

### `YearCell`

```ts
type YearCell = {
  isoString: ISODateString; // 1월 1일, UTC 자정
  year: number;
  isSelected: boolean;
  isCurrent: boolean;       // 현재 연도 (오늘)
  isDisabled: boolean;
};
```

## 예제

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

## 관련

- [YearPicker 컴포넌트 →](../components/yearpicker.md)
- [useMonthPicker →](./use-month-picker.md)
- [날짜 어댑터 →](../guides/adapters.md)
