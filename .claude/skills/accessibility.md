---
name: accessibility
version: 1.0.0
description: DatePicker 접근성 구현 기준. WCAG 2.2, WAI-ARIA Calendar 패턴 기반.
triggers:
  - "ARIA 속성을 추가할 때"
  - "키보드 내비게이션을 구현할 때"
  - "접근성 버그를 수정할 때"
  - "axe 검사를 실행할 때"
  - "스크린리더 지원을 구현할 때"
standards:
  - WCAG 2.2 AA
  - WAI-ARIA 1.2
  - APG DatePicker Dialog Pattern
reference_url: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/
---

# Skill: 접근성 (Accessibility)

## 핵심 원칙

> 접근성은 나중에 추가하는 것이 아니다. 설계 시점부터 내장된다.

---

## 왜 DatePicker 접근성이 어려운가

Axess Lab 보고서에 따르면 "DatePicker는 보조 기술 사용자에게 가장 문제가 많은 UI 패턴 중 하나"이다. 주요 이유:

1. 복잡한 ARIA 역할 구조 (grid > row > gridcell)
2. 키보드 포커스 관리의 어려움 (포커스 트랩, 포커스 복원)
3. 동적 콘텐츠 변경 알림 (월 이동 시 스크린리더에 알려야 함)
4. 모달과 비모달의 이중 패턴

---

## ARIA 구조: 3개의 역할

### 1. Input — Combobox 패턴

```tsx
function DatePickerInput({ id, label, isOpen, calendarId, hasError }: ...) {
  const labelId = `${id}-label`;
  const descId  = `${id}-desc`;

  return (
    <div role="group" aria-labelledby={labelId}>
      <label id={labelId} htmlFor={id}>{label}</label>

      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-controls={calendarId}
          aria-autocomplete="none"
          aria-describedby={descId}
          aria-invalid={hasError || undefined}
        />

        {/* 아이콘 버튼 — 키보드 포커스 필수 */}
        <button
          type="button"
          tabIndex={0}
          aria-label={`${label} 캘린더 열기`}
          aria-expanded={isOpen}
          aria-controls={calendarId}
          onClick={togglePopover}
        >
          <CalendarIcon aria-hidden="true" focusable="false" />
        </button>
      </div>

      <span id={descId} style={srOnly}>
        날짜는 yyyy/MM/dd 형식으로 입력하세요
      </span>
    </div>
  );
}
```

### 2. Popover — Dialog 패턴

```tsx
function DatePickerPopover({ id, label, isOpen }: ...) {
  const descId = `${id}-dialog-desc`;

  return (
    <div
      id={id}
      role="dialog"
      aria-label={`${label} 날짜 선택`}
      aria-modal="true"
      aria-describedby={descId}
    >
      <p id={descId} style={srOnly}>
        방향키로 날짜를 이동하고 Enter로 선택하세요.
        Page Up/Down으로 월을 이동합니다.
        Escape로 닫습니다.
      </p>
      {/* 캘린더 내용 */}
    </div>
  );
}
```

### 3. Calendar — Grid 패턴

```tsx
function DatePickerCalendar({ month, year, focusedDate, selectedDate }: ...) {
  return (
    <table
      role="grid"
      aria-label={`${year}년 ${month}월`}
    >
      <thead>
        <tr role="row">
          {WEEKDAYS.map((day) => (
            <th
              key={day.short}
              role="columnheader"
              abbr={day.full}      // 스크린리더용 전체 이름
              aria-label={day.full}
              scope="col"
            >
              <span aria-hidden="true">{day.short}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week, i) => (
          <tr key={i} role="row">
            {week.map((day) => (
              <td
                key={day.isoString}
                role="gridcell"
                aria-selected={day.isSelected ? true : undefined}
                aria-disabled={day.isDisabled ? true : undefined}
                aria-current={day.isToday ? 'date' : undefined}
                tabIndex={day.isFocused ? 0 : -1}
              >
                <button
                  type="button"
                  disabled={day.isDisabled}
                  onClick={() => !day.isDisabled && selectDate(day.isoString)}
                  onKeyDown={(e) => handleCalendarKeyDown(e, day.isoString)}
                >
                  <span aria-hidden="true">{day.dayNumber}</span>
                  {/* 스크린리더 전용 전체 날짜 */}
                  <span style={srOnly}>
                    {format(parseISO(day.isoString), 'yyyy년 M월 d일 EEEE', { locale: ko })}
                    {day.isSelected && ' (선택됨)'}
                    {day.isToday && ' (오늘)'}
                    {day.isDisabled && ' (선택 불가)'}
                  </span>
                </button>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## 키보드 내비게이션 — 완전한 구현

```tsx
function handleCalendarKeyDown(
  e: React.KeyboardEvent,
  currentIso: string,
  { setFocused, selectDate, close, moveTo }: KeyboardHandlers
) {
  const actions: Record<string, () => void> = {
    ArrowLeft:  () => setFocused(adapter.addDays(currentIso, -1)),
    ArrowRight: () => setFocused(adapter.addDays(currentIso, 1)),
    ArrowUp:    () => setFocused(adapter.addDays(currentIso, -7)),
    ArrowDown:  () => setFocused(adapter.addDays(currentIso, 7)),
    PageUp:     () => moveTo(e.shiftKey
      ? adapter.addYears(currentIso, -1)
      : adapter.addMonths(currentIso, -1)
    ),
    PageDown:   () => moveTo(e.shiftKey
      ? adapter.addYears(currentIso, 1)
      : adapter.addMonths(currentIso, 1)
    ),
    Home: () => setFocused(adapter.startOfWeek(currentIso)),
    End:  () => setFocused(adapter.endOfWeek(currentIso)),
    Enter:   () => selectDate(currentIso),
    ' ':     () => selectDate(currentIso),  // Space
    Escape:  () => close(),
  };

  const action = actions[e.key];
  if (action) {
    e.preventDefault(); // 스크롤, 폼 제출 방지
    action();
  }
}
```

**필수 키 매핑:**

| 키 | 동작 |
|---|---|
| `←` `→` | 하루 이동 |
| `↑` `↓` | 일주일 이동 |
| `PageUp/Down` | 월 이동 |
| `Shift + PageUp/Down` | 년 이동 |
| `Home` / `End` | 주의 첫날/마지막날 |
| `Enter` / `Space` | 날짜 선택 |
| `Escape` | 팝오버 닫기 |
| `Tab` | 포커스 트랩 (팝오버 안에서 순환) |

---

## 포커스 관리

### 포커스 트랩

```tsx
function useFocusTrap(containerRef: RefObject<HTMLElement>, isActive: boolean) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    const el = containerRef.current;

    // WCAG 2.4.3: 포커스 이동이 논리적이어야 한다
    const focusable = el.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), ' +
      'select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    // 팝오버 열릴 때 → 캘린더 첫 번째 포커스 가능 요소로
    first?.focus();

    function trap(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }

    el.addEventListener('keydown', trap);
    return () => el.removeEventListener('keydown', trap);
  }, [isActive, containerRef]);
}
```

### 포커스 복원

```tsx
function useFocusRestore(isOpen: boolean) {
  const savedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // 열릴 때 현재 포커스 저장
      savedRef.current = document.activeElement as HTMLElement;
    } else if (savedRef.current) {
      // 닫힐 때 저장된 요소로 복원 (WCAG 2.4.3)
      savedRef.current.focus();
      savedRef.current = null;
    }
  }, [isOpen]);
}
```

---

## Live Region (동적 알림)

월이 바뀌거나 날짜가 선택될 때 스크린리더에 알린다.

```tsx
function DatePickerAnnouncer({ message }: { message: string }) {
  return (
    <div
      role="status"         // polite: 현재 읽기를 방해하지 않음
      aria-live="polite"
      aria-atomic="true"    // 전체 메시지를 한 번에 읽음
      style={srOnly}        // 시각적으로 숨김
    >
      {message}
    </div>
  );
}

// 사용
const [announcement, setAnnouncement] = useState('');

function handleMonthChange(newMonth: string) {
  navigateToMonth(newMonth);
  setAnnouncement(
    `${format(parseISO(newMonth), 'yyyy년 M월')}로 이동했습니다`
  );
}

function handleDateSelect(iso: string) {
  selectDate(iso);
  setAnnouncement(
    `${format(parseISO(iso), 'yyyy년 M월 d일')}을 선택했습니다`
  );
}
```

---

## 스크린리더 전용 텍스트 패턴

```tsx
// CSS-in-JS 없이 인라인 스타일로 시각 숨김
const srOnly: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

// classNames 기반 (Tailwind 사용자)
// className="sr-only"
```

---

## axe 접근성 테스트

```tsx
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

describe('접근성', () => {
  it('기본 DatePicker — axe 위반 없음', async () => {
    const { container } = render(
      <DatePicker value="2026-01-15T00:00:00.000Z" onChange={vi.fn()}>
        <DatePicker.Input aria-label="예약 날짜" />
        <DatePicker.Popover>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>
    );

    await userEvent.click(screen.getByRole('combobox'));
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Range DatePicker — axe 위반 없음', async () => {
    // ...
  });
});
```

---

## 접근성 체크리스트 (PR 전 필수)

- [ ] Calendar에 `role="grid"`, `aria-label={월년}`이 있는가?
- [ ] 날짜 셀에 `aria-selected`, `aria-disabled`, `aria-current` 있는가?
- [ ] 날짜 셀 `tabIndex`가 포커스된 날짜만 `0`, 나머지 `-1`인가?
- [ ] Input에 `role="combobox"`, `aria-expanded`, `aria-haspopup="dialog"` 있는가?
- [ ] 캘린더 아이콘 버튼에 `aria-label`, `tabIndex={0}` 있는가?
- [ ] Popover에 `role="dialog"`, `aria-modal="true"` 있는가?
- [ ] 포커스 트랩이 팝오버 안에서 동작하는가?
- [ ] 팝오버 닫힐 때 트리거로 포커스가 돌아오는가?
- [ ] 모든 키보드 키가 동작하는가? (특히 Arrow, Enter, Escape)
- [ ] Live region이 월 이동/날짜 선택을 알리는가?
- [ ] axe 검사를 통과하는가?
- [ ] 스크린리더 실제 테스트를 했는가? (VoiceOver on macOS)