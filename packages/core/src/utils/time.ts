import type { ISODateString } from '../types.js';

/** Time-of-day value (24-hour clock) */
export interface TimeValue {
  hours: number; // 0-23
  minutes: number; // 0-59
  seconds: number; // 0-59
}

/**
 * Replaces the time portion of an ISO datetime.
 * Operates in UTC.
 */
export function setTime(iso: ISODateString, time: Partial<TimeValue>): ISODateString {
  const date = new Date(iso);
  if (time.hours !== undefined) date.setUTCHours(time.hours);
  if (time.minutes !== undefined) date.setUTCMinutes(time.minutes);
  if (time.seconds !== undefined) date.setUTCSeconds(time.seconds);
  return date.toISOString();
}

/**
 * Extracts the time portion of an ISO datetime.
 */
export function getTime(iso: ISODateString): TimeValue {
  const date = new Date(iso);
  return {
    hours: date.getUTCHours(),
    minutes: date.getUTCMinutes(),
    seconds: date.getUTCSeconds(),
  };
}

/**
 * Parses an "HH:MM" or "HH:MM:SS" string into a TimeValue.
 * Returns null on invalid input.
 */
export function parseTimeString(input: string): TimeValue | null {
  if (!input) return null;
  const match = input.trim().match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/);
  if (!match) return null;

  const hours = parseInt(match[1]!, 10);
  const minutes = parseInt(match[2]!, 10);
  const seconds = match[3] ? parseInt(match[3], 10) : 0;

  if (hours < 0 || hours > 23) return null;
  if (minutes < 0 || minutes > 59) return null;
  if (seconds < 0 || seconds > 59) return null;

  return { hours, minutes, seconds };
}

/**
 * Formats a TimeValue as "HH:MM" or "HH:MM:SS".
 */
export function formatTimeString(time: TimeValue, withSeconds = false): string {
  const hh = String(time.hours).padStart(2, '0');
  const mm = String(time.minutes).padStart(2, '0');
  if (withSeconds) {
    const ss = String(time.seconds).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }
  return `${hh}:${mm}`;
}

/**
 * Converts a 24-hour value to 12-hour form.
 * 0 → 12 AM, 12 → 12 PM
 */
export function to12Hour(hours24: number): { hours12: number; period: 'AM' | 'PM' } {
  const period: 'AM' | 'PM' = hours24 >= 12 ? 'PM' : 'AM';
  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12;
  return { hours12, period };
}

/**
 * Converts a 12-hour value to 24-hour form.
 */
export function to24Hour(hours12: number, period: 'AM' | 'PM'): number {
  if (period === 'AM') {
    return hours12 === 12 ? 0 : hours12;
  }
  return hours12 === 12 ? 12 : hours12 + 12;
}

/**
 * Builds an hours list (0-23 or 1-12).
 */
export function generateHours(format: '12h' | '24h' = '24h'): number[] {
  if (format === '12h') {
    return Array.from({ length: 12 }, (_, i) => i + 1); // 1..12
  }
  return Array.from({ length: 24 }, (_, i) => i); // 0..23
}

/**
 * Builds a minutes list at the given step.
 * step=1 → [0, 1, 2, ..., 59]
 * step=15 → [0, 15, 30, 45]
 * step=5 → [0, 5, 10, ..., 55]
 */
export function generateMinutes(step = 1): number[] {
  if (step < 1 || step > 30) {
    throw new Error(`[generateMinutes] step must be between 1 and 30, got ${step}`);
  }
  const result: number[] = [];
  for (let i = 0; i < 60; i += step) {
    result.push(i);
  }
  return result;
}

/**
 * Checks whether two TimeValues are identical (hours, minutes, and seconds).
 */
export function isSameTime(a: TimeValue, b: TimeValue): boolean {
  return a.hours === b.hours && a.minutes === b.minutes && a.seconds === b.seconds;
}

/**
 * Formats an ISO datetime as a time string (UTC based).
 * Accepts an adapter for API consistency.
 */
export function formatTimeFromISO(
  iso: ISODateString,
  format: 'HH:mm' | 'HH:mm:ss' | 'h:mm a' | 'h:mm:ss a',
): string {
  const time = getTime(iso);

  if (format === 'h:mm a' || format === 'h:mm:ss a') {
    const { hours12, period } = to12Hour(time.hours);
    const mm = String(time.minutes).padStart(2, '0');
    if (format === 'h:mm a') {
      return `${hours12}:${mm} ${period}`;
    }
    const ss = String(time.seconds).padStart(2, '0');
    return `${hours12}:${mm}:${ss} ${period}`;
  }

  return formatTimeString(time, format === 'HH:mm:ss');
}
