import type {
  CalendarDay,
  CalendarGrid,
  CalendarOptions,
  DateAdapter,
  DisabledRule,
} from '../types.js';

/**
 * 특정 월의 캘린더 그리드를 생성한다.
 * 6주(42일) 또는 해당 월에 필요한 만큼의 주를 반환한다.
 */
export function getCalendarDays(
  monthISO: string,
  adapter: DateAdapter,
  options: CalendarOptions = {},
): CalendarGrid {
  const {
    weekStartsOn = 0,
    today,
    selected,
    focusedDate,
    disabled = [],
  } = options;

  const todayISO = today ?? adapter.today();
  const monthStart = adapter.startOfMonth(monthISO);
  const monthEnd = adapter.endOfMonth(monthISO);

  // 캘린더 그리드의 시작: 해당 월 첫째 날이 속한 주의 시작
  const gridStart = adapter.startOfWeek(monthStart, weekStartsOn);

  const weeks: CalendarGrid = [];
  let current = gridStart;

  // 최대 6주 (42일)
  for (let week = 0; week < 6; week++) {
    const days: CalendarDay[] = [];

    for (let day = 0; day < 7; day++) {
      const isCurrentMonth = adapter.isSameMonth(current, monthISO);
      const isTodayDate = adapter.isSameDay(current, todayISO);
      const isSelected_ = selected ? adapter.isSameDay(current, selected) : false;
      const isFocused_ = focusedDate ? adapter.isSameDay(current, focusedDate) : false;
      const isDisabled_ = isDateDisabled(current, disabled, adapter);

      days.push({
        isoString: current,
        dayNumber: adapter.getDate(current),
        isCurrentMonth,
        isToday: isTodayDate,
        isSelected: isSelected_,
        isDisabled: isDisabled_,
        isFocused: isFocused_,
      });

      current = adapter.addDays(current, 1);
    }

    weeks.push(days);

    // 다음 주의 시작이 이미 다음 달이면 그리드 종료
    if (!adapter.isSameMonth(current, monthISO) && week >= 3) {
      break;
    }
  }

  return weeks;
}

/**
 * 주어진 날짜가 비활성화 규칙에 해당하는지 검사한다.
 */
export function isDateDisabled(
  iso: string,
  rules: DisabledRule[],
  adapter: DateAdapter,
): boolean {
  for (const rule of rules) {
    if ('date' in rule) {
      if (adapter.isSameDay(iso, rule.date)) return true;
    } else if ('before' in rule) {
      if (adapter.isBefore(iso, rule.before)) return true;
    } else if ('after' in rule) {
      if (adapter.isAfter(iso, rule.after)) return true;
    } else if ('dayOfWeek' in rule) {
      if (rule.dayOfWeek.includes(adapter.getDay(iso))) return true;
    }
  }
  return false;
}
