import type { WeekStartsOn } from '../types.js';

export interface WeekdayInfo {
  /** 짧은 이름 (예: "Su", "일") */
  short: string;
  /** 전체 이름 (예: "Sunday", "일요일") */
  full: string;
}

/**
 * Intl.DateTimeFormat으로 월 이름을 반환한다.
 * @param month 0-indexed (0 = January)
 * @param year 표시에만 사용 (일부 locale은 년 포함)
 * @param locale BCP 47 locale string (예: "en-US", "ko-KR", "ja-JP")
 */
export function getMonthName(month: number, locale = 'en-US'): string {
  // 2026년 고정 (어떤 해든 월 이름은 같음)
  const date = new Date(Date.UTC(2026, month, 1));
  return new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' }).format(date);
}

/**
 * "2026년 1월" 또는 "January 2026" 같은 월+년 문자열을 반환한다.
 */
export function formatMonthYear(year: number, month: number, locale = 'en-US'): string {
  const date = new Date(Date.UTC(year, month, 1));
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(date);
}

/**
 * Intl.DateTimeFormat으로 주의 요일 이름 배열을 반환한다.
 * weekStartsOn에 맞춰 정렬.
 *
 * @param locale BCP 47 locale string
 * @param weekStartsOn 0 = Sunday, 1 = Monday
 * @returns 7개의 WeekdayInfo 배열
 */
export function getWeekdayNames(
  locale = 'en-US',
  weekStartsOn: WeekStartsOn = 0,
): WeekdayInfo[] {
  // 2026-01-04 = Sunday (기준점)
  const shortFormatter = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    timeZone: 'UTC',
  });
  const fullFormatter = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    timeZone: 'UTC',
  });

  const days: WeekdayInfo[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(Date.UTC(2026, 0, 4 + i)); // Sun..Sat
    days.push({
      short: shortFormatter.format(date),
      full: fullFormatter.format(date),
    });
  }

  // weekStartsOn에 맞게 회전
  if (weekStartsOn === 1) {
    const sunday = days.shift()!;
    days.push(sunday);
  }

  return days;
}

/**
 * Intl.DateTimeFormat으로 날짜의 전체 텍스트를 반환한다 (스크린리더용).
 * 예: "2026년 1월 15일 목요일"
 */
export function formatFullDate(iso: string, locale = 'en-US'): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    timeZone: 'UTC',
  }).format(date);
}
