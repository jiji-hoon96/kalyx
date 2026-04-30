import type { DateAdapter } from '../types.js';

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

/**
 * Normalizes a date string to ISO 8601 UTC form.
 * "2026-01-15" → "2026-01-15T00:00:00.000Z"
 *
 * Full datetime strings must include a timezone suffix (Z or ±HH:MM).
 * Strings without a timezone suffix are treated as-is (not matched as datetime).
 */
export function normalizeISO(value: string): string {
  if (!value) return '';
  if (ISO_DATETIME_REGEX.test(value)) return value;
  if (ISO_DATE_REGEX.test(value)) return `${value}T00:00:00.000Z`;
  return value;
}

/**
 * Parses user input text into an ISO string.
 * Returns null on failure.
 */
export function parseInputValue(input: string, adapter: DateAdapter): string | null {
  if (!input.trim()) return null;

  // Default format: yyyy-MM-dd or yyyy/MM/dd
  const cleaned = input.replace(/\//g, '-').trim();

  if (ISO_DATE_REGEX.test(cleaned)) {
    const normalized = normalizeISO(cleaned);
    if (adapter.isValid(normalized)) {
      return normalized;
    }
  }

  // 8-digit form without separators: 20260115 → 2026-01-15
  if (/^\d{8}$/.test(cleaned)) {
    const formatted = `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`;
    const normalized = normalizeISO(formatted);
    if (adapter.isValid(normalized)) {
      return normalized;
    }
  }

  return null;
}
