/**
 * @kalyx/core 타입 정의
 *
 * 모든 날짜 값은 ISO 8601 UTC string으로 표현한다.
 * native Date 객체는 사용하지 않는다.
 */

/** ISO 8601 UTC 날짜 문자열. 예: "2026-01-15T00:00:00.000Z" */
export type ISODateString = string;

/** 날짜 비활성화 규칙 */
export type DisabledRule =
  | { date: ISODateString }
  | { before: ISODateString }
  | { after: ISODateString }
  | { dayOfWeek: number[] };

/** 캘린더 그리드의 하루를 표현하는 타입 */
export interface CalendarDay {
  /** ISO 8601 UTC string */
  isoString: ISODateString;
  /** 날짜 숫자 (1-31) */
  dayNumber: number;
  /** 현재 표시 중인 달에 속하는지 */
  isCurrentMonth: boolean;
  /** 오늘인지 */
  isToday: boolean;
  /** 선택된 날짜인지 */
  isSelected: boolean;
  /** 비활성화 상태인지 */
  isDisabled: boolean;
  /** 포커스된 날짜인지 */
  isFocused: boolean;
}

/** 캘린더 그리드: 주(week) 배열 → 일(day) 배열 */
export type CalendarWeek = CalendarDay[];
export type CalendarGrid = CalendarWeek[];

/** 날짜 라이브러리 어댑터 인터페이스 */
export interface DateAdapter {
  // ─── 파싱 ───
  /** 어떤 형식이든 → ISO 8601 UTC string */
  parse(value: string, format?: string): string;

  // ─── 포맷팅 ───
  /** ISO string → 화면 표시용 string */
  format(iso: string, formatStr: string, timezone?: string): string;

  // ─── 날짜 계산 (항상 ISO string 입출력) ───
  addDays(iso: string, n: number): string;
  addMonths(iso: string, n: number): string;
  addYears(iso: string, n: number): string;

  // ─── 비교 ───
  isBefore(a: string, b: string): boolean;
  isAfter(a: string, b: string): boolean;
  isSameDay(a: string, b: string, timezone?: string): boolean;
  isSameMonth(a: string, b: string): boolean;

  // ─── 경계 ───
  startOfDay(iso: string, timezone?: string): string;
  startOfMonth(iso: string): string;
  endOfMonth(iso: string): string;
  startOfWeek(iso: string, weekStartsOn?: 0 | 1): string;
  endOfWeek(iso: string, weekStartsOn?: 0 | 1): string;

  // ─── 현재 ───
  now(): string;
  today(timezone?: string): string;

  // ─── 유효성 ───
  isValid(value: string): boolean;

  // ─── 정보 ───
  getYear(iso: string): number;
  getMonth(iso: string): number;
  getDate(iso: string): number;
  getDay(iso: string): number;
}

/** 주 시작 요일 */
export type WeekStartsOn = 0 | 1;

/** 캘린더 그리드 생성 옵션 */
export interface CalendarOptions {
  weekStartsOn?: WeekStartsOn;
  today?: ISODateString;
  selected?: ISODateString | null;
  focusedDate?: ISODateString;
  disabled?: DisabledRule[];
}
