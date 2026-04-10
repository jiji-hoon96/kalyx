import type { DateAdapter } from '../types.js';

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

/**
 * 날짜 문자열을 ISO 8601 UTC 형식으로 정규화한다.
 * "2026-01-15" → "2026-01-15T00:00:00.000Z"
 */
export function normalizeISO(value: string): string {
  if (!value) return '';
  if (ISO_DATETIME_REGEX.test(value)) return value;
  if (ISO_DATE_REGEX.test(value)) return `${value}T00:00:00.000Z`;
  return value;
}

/**
 * 사용자 입력 텍스트를 ISO string으로 파싱한다.
 * 실패 시 null을 반환한다.
 */
export function parseInputValue(
  input: string,
  format: string,
  adapter: DateAdapter,
): string | null {
  if (!input.trim()) return null;

  // 기본 포맷: yyyy-MM-dd 또는 yyyy/MM/dd
  const cleaned = input.replace(/\//g, '-').trim();

  if (ISO_DATE_REGEX.test(cleaned)) {
    const normalized = normalizeISO(cleaned);
    if (adapter.isValid(normalized)) {
      return normalized;
    }
  }

  // 구분자 없는 8자리 숫자: 20260115 → 2026-01-15
  if (/^\d{8}$/.test(cleaned)) {
    const formatted = `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`;
    const normalized = normalizeISO(formatted);
    if (adapter.isValid(normalized)) {
      return normalized;
    }
  }

  return null;
}

/** 주어진 달의 이름을 반환한다 (기본 영어) */
export const WEEKDAY_LABELS = {
  short: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const,
  full: [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ] as const,
};

/** 주 시작 요일에 맞춰 요일 배열을 정렬한다 */
export function getOrderedWeekdays(weekStartsOn: 0 | 1 = 0) {
  const days = WEEKDAY_LABELS.short.map((short, i) => ({
    short,
    full: WEEKDAY_LABELS.full[i]!,
  }));

  if (weekStartsOn === 1) {
    const sunday = days.shift()!;
    days.push(sunday);
  }

  return days;
}
