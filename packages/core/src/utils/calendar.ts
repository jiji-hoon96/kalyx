import type {
  CalendarDay,
  CalendarGrid,
  CalendarOptions,
  DateAdapter,
  DateRange,
  DisabledRule,
  ISODateString,
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
    range,
    rangeHover,
  } = options;

  const todayISO = today ?? adapter.today();
  const monthStart = adapter.startOfMonth(monthISO);

  // 캘린더 그리드의 시작: 해당 월 첫째 날이 속한 주의 시작
  const gridStart = adapter.startOfWeek(monthStart, weekStartsOn);

  // 범위 계산용 정규화 (start <= end 보장)
  const normalizedRange = normalizeRangeForDisplay(range, rangeHover, adapter);

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

      const rangeFlags = computeRangeFlags(current, normalizedRange, adapter);

      days.push({
        isoString: current,
        dayNumber: adapter.getDate(current),
        isCurrentMonth,
        isToday: isTodayDate,
        isSelected: isSelected_,
        isDisabled: isDisabled_,
        isFocused: isFocused_,
        ...rangeFlags,
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
 * Range가 한 쪽만 선택된 경우 hover 날짜로 임시 범위를 만들어 표시한다.
 * start > end인 경우 정렬한다.
 */
function normalizeRangeForDisplay(
  range: DateRange | null | undefined,
  hover: ISODateString | null | undefined,
  adapter: DateAdapter,
): { start: ISODateString | null; end: ISODateString | null } {
  if (!range) return { start: null, end: null };

  const { start, end } = range;

  // 둘 다 선택됨 → 정렬해서 반환
  if (start && end) {
    if (adapter.isAfter(start, end)) {
      return { start: end, end: start };
    }
    return { start, end };
  }

  // 시작만 선택됨 + hover 있음 → hover까지 미리보기
  if (start && !end && hover) {
    if (adapter.isAfter(start, hover)) {
      return { start: hover, end: start };
    }
    return { start, end: hover };
  }

  // 시작만 선택됨, hover 없음
  if (start && !end) {
    return { start, end: null };
  }

  return { start: null, end: null };
}

interface RangeFlags {
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isInRange: boolean;
}

function computeRangeFlags(
  iso: ISODateString,
  range: { start: ISODateString | null; end: ISODateString | null },
  adapter: DateAdapter,
): RangeFlags {
  const { start, end } = range;

  if (!start) {
    return { isRangeStart: false, isRangeEnd: false, isInRange: false };
  }

  const isRangeStart = adapter.isSameDay(iso, start);

  if (!end) {
    return { isRangeStart, isRangeEnd: false, isInRange: false };
  }

  const isRangeEnd = adapter.isSameDay(iso, end);
  const isInRange =
    !isRangeStart &&
    !isRangeEnd &&
    adapter.isAfter(iso, start) &&
    adapter.isBefore(iso, end);

  return { isRangeStart, isRangeEnd, isInRange };
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

/**
 * 두 날짜 중 더 이른 것을 반환한다.
 */
export function minDate(
  a: ISODateString,
  b: ISODateString,
  adapter: DateAdapter,
): ISODateString {
  return adapter.isBefore(a, b) ? a : b;
}

/**
 * 두 날짜 중 더 늦은 것을 반환한다.
 */
export function maxDate(
  a: ISODateString,
  b: ISODateString,
  adapter: DateAdapter,
): ISODateString {
  return adapter.isAfter(a, b) ? a : b;
}
