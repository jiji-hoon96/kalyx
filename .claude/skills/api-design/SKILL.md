---
name: api-design
description: 'DatePicker 컴포넌트 API 설계 원칙. 새 컴포넌트나 prop을 추가할 때 참조한다. 다음 상황에서 사용한다: "새 컴포넌트를 만들 때", "prop 설계를 고민할 때", "API 리뷰를 할 때", "컴포넌트 인터페이스를 정의할 때"'
---

# Skill: API 설계

## 언제 이 스킬을 읽는가

- 새 서브 컴포넌트 (`DatePicker.XXX`)를 만들 때
- 새 prop을 추가하려 할 때
- Hook 인터페이스를 설계할 때
- 기존 API를 리팩터링할 때

---

## 핵심 판단 기준: "이 기능은 prop인가, 서브 컴포넌트인가?"

```
기능이 선택적이고 독립적으로 교체 가능한가?
  → YES: 서브 컴포넌트
  → NO (항상 같이 필요함): prop

이 기능을 쓰지 않는 사용자도 있는가?
  → YES: 서브 컴포넌트 (tree-shaking 가능)
  → NO: Root prop
```

---

## 원칙 1: Composition > Configuration

```tsx
// ❌ Configuration — 금지
<DatePicker
  showTimeSelect={true}
  timeFormat="HH:mm"
  timeIntervals={15}
  showMonthDropdown={true}
/>

// ✅ Composition — 강제
<DateTimePicker value={date} onChange={setDate}>
  <DateTimePicker.Input />
  <DateTimePicker.Popover>
    <DateTimePicker.Calendar />
    <DateTimePicker.HourList />
    <DateTimePicker.MinuteList step={15} />
  </DateTimePicker.Popover>
</DateTimePicker>
```

**Composition이 옳은 이유:**
- `TimePicker`를 쓰지 않는 사람의 번들에 포함되지 않는다
- 각 파트를 독립적으로 커스텀 구현체로 교체할 수 있다
- 타입이 단순해진다

---

## 원칙 2: Root Props는 최대 6개

Root 컴포넌트(`DatePicker.Root`)의 props는 최소화한다.

```tsx
type DatePickerRootProps = {
  // 날짜 값 (제어)
  value?: string | null;             // ISO 8601 UTC
  defaultValue?: string;             // 비제어 초기값
  onChange?: (value: string | null) => void;

  // 표시 설정
  displayTimezone?: string;          // "Asia/Seoul" 등
  locale?: Locale;                   // date-fns Locale

  // 전체 상태
  disabled?: boolean;
  readOnly?: boolean;
};
// 7개를 넘으면 설계를 다시 검토한다
```

---

## 원칙 3: 서브 컴포넌트는 HTML 속성을 그대로 받는다

```tsx
// HTML input의 모든 속성 + 라이브러리 전용 props
type DatePickerInputProps =
  React.InputHTMLAttributes<HTMLInputElement> & {
    format?: string;      // 날짜 표시 포맷
    mask?: boolean;       // 입력 마스킹
    clearable?: boolean;  // 지우기 버튼
  };

// 사용자는 HTML 속성을 그대로 쓸 수 있다
<DatePicker.Input
  placeholder="날짜 선택"
  className="my-input"
  data-testid="date-input"
  onFocus={handleFocus}
  disabled={isLoading}
  aria-label="예약 날짜"
/>
```

---

## 원칙 4: asChild 패턴 지원

Radix UI의 `asChild` 패턴으로 트리거 요소 교체를 허용한다.

```tsx
// 기본: 라이브러리 제공 버튼
<DatePicker.Trigger>날짜 선택</DatePicker.Trigger>

// asChild: 완전히 다른 컴포넌트로 교체
<DatePicker.Trigger asChild>
  <Button variant="outline">
    <CalendarIcon />
    날짜 선택
  </Button>
</DatePicker.Trigger>
```

**구현 패턴:**
```tsx
import { Slot } from '@radix-ui/react-slot'; // 또는 직접 구현

function DatePickerTrigger({ asChild, children, ...props }) {
  const Component = asChild ? Slot : 'button';
  return <Component {...props}>{children}</Component>;
}
```

---

## 원칙 5: classNames prop으로 Headless 스타일링

모든 서브 컴포넌트는 `classNames` prop을 갖는다.

```tsx
// 타입 정의 패턴
type DatePickerCalendarClassNames = {
  root?: string;
  header?: string;
  navButton?: string;
  grid?: string;
  gridRow?: string;
  gridCell?: string;
  day?: string;
  daySelected?: string;
  dayToday?: string;
  dayDisabled?: string;
  dayOutsideMonth?: string;
  dayRangeStart?: string;    // RangePicker용
  dayRangeEnd?: string;
  dayInRange?: string;
};

// 적용 패턴
function DatePickerDay({ classNames, isSelected, isToday, ... }) {
  return (
    <td
      className={cn(
        classNames?.day,
        isSelected && classNames?.daySelected,
        isToday && classNames?.dayToday,
      )}
    >
      ...
    </td>
  );
}
```

---

## 원칙 6: Hook으로 완전 탈출구 제공

모든 컴포넌트는 동등한 훅을 갖는다.

```tsx
// 컴포넌트 방식 (90% 케이스)
<DatePicker value={date} onChange={setDate}>
  <DatePicker.Input />
  <DatePicker.Calendar />
</DatePicker>

// Hook 방식 (완전 커스텀, 10% 케이스)
function MySpecialDatePicker() {
  const {
    value, isOpen, calendar,
    open, close, selectDate,
  } = useDatePicker({ value: date, onChange: setDate });

  return (
    <div>
      <button onClick={open}>내 커스텀 트리거</button>
      {isOpen && (
        <MyCustomCalendarUI
          calendar={calendar}
          onSelect={selectDate}
        />
      )}
    </div>
  );
}
```

---

## 원칙 7: 에러 메시지는 사용법을 알려줘야 한다

```tsx
// ❌ 나쁜 에러
throw new Error('Context is null');

// ✅ 좋은 에러 — 어떻게 쓰는지 알려준다
if (!context) {
  throw new Error(
    '[DatePicker.Calendar] DatePicker.Root 내부에서 사용해야 합니다.\n\n' +
    '올바른 사용법:\n' +
    '  <DatePicker.Root>\n' +
    '    <DatePicker.Calendar />\n' +
    '  </DatePicker.Root>\n\n' +
    '자세한 내용: https://your-docs.com/components/calendar'
  );
}
```

---

## API 설계 체크리스트

새 컴포넌트/prop 추가 전:

- [ ] Root의 필수 props가 6개 이하인가?
- [ ] Composition으로 기능을 선택적으로 추가하는가?
- [ ] HTML 요소 속성을 그대로 받는가? (`...props` spread)
- [ ] `asChild` 패턴을 지원하는가? (Trigger 계열)
- [ ] `classNames` prop이 있는가? (스타일 가능한 파트별로)
- [ ] 제어/비제어 모두 지원하는가?
- [ ] 동등한 Hook이 있는가?
- [ ] 잘못된 사용 시 명확한 에러 메시지가 있는가?
- [ ] 날짜를 ISO string으로 주고받는가?

---

## 외부 참조

이 스킬과 함께 참고할 것:
- [alirezarezvani/claude-skills: engineering/api-design-reviewer](https://github.com/alirezarezvani/claude-skills/tree/main/engineering) — REST API 설계 원칙 (컴포넌트 API에도 적용 가능)
- [Radix UI 설계 철학](https://www.radix-ui.com/primitives/docs/guides/composition) — asChild 패턴 기준
- [TanStack Form API 설계](https://tanstack.com/form) — Composition API 실제 사례

---

## 출처

- 버전: 1.0.0
- 참고: engineering/api-design-reviewer (alirezarezvani/claude-skills)
