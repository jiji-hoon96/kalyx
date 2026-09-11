---
'@kalyx/react': patch
---

훅 7종이 파생 데이터를 불필요하게 다시 만들던 문제를 고쳤다. 소비자 쪽의 무관한 리렌더(형제 입력, 부모 스토어 갱신, 라우트 전환)에서 결과가 참조로 유지된다.

결함은 두 가지였다. `useDatePicker` / `useRangePicker` / `useWeekPicker` / `useDateTimePicker` 는 `getCalendarDays` 를 memo 없이 호출해 42셀 그리드를 매 렌더 다시 만들었다(`displayTimezone` 사용 시 렌더당 약 940µs). 그리고 6개 훅 전부 `disabled` 옵션 기본값을 새 `[]` 리터럴로 두어, 이를 의존성으로 나열한 memo 가 규칙을 넘기지 않는 기본 사용에서 매번 빗나갔다. `useMonthPicker.months` 와 `useYearPicker.years` 는 `useMemo` 로 감싸져 있었지만 이 때문에 실제로는 동작하지 않았다.

동작은 동일하다. 같은 입력에는 같은 값이 나오며, 달라진 것은 참조 안정성뿐이다. 컴포넌트 경로(`DatePicker.Calendar` 등)는 이미 memo 를 쓰고 있었으므로 훅이 그 동작에 맞춰진 것이다.

controlled 모드에서 `value` 로 객체 리터럴을 인라인으로 넘기는 `useRangePicker` 소비자는 매 렌더 새 입력을 주는 것이므로 memo 이득을 받지 못한다. 이는 소비자가 안정화할 부분이다.
