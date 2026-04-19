import { describe, it, expect } from 'vitest';
import { normalizeISO, parseInputValue } from '../utils/date.js';
import { DateFnsAdapter } from '../adapters/date-fns.js';

const adapter = DateFnsAdapter;

describe('normalizeISO', () => {
  it('converts YYYY-MM-DD to UTC midnight', () => {
    expect(normalizeISO('2026-01-15')).toBe('2026-01-15T00:00:00.000Z');
  });

  it('returns an ISO datetime with Z suffix unchanged', () => {
    expect(normalizeISO('2026-01-15T14:30:00.000Z')).toBe('2026-01-15T14:30:00.000Z');
  });

  it('returns an ISO datetime with timezone offset unchanged', () => {
    expect(normalizeISO('2026-01-15T14:30:00+09:00')).toBe('2026-01-15T14:30:00+09:00');
  });

  it('does not match a datetime without timezone suffix', () => {
    // Without Z or offset, it should NOT be recognized as a full datetime
    // and should be returned as-is (not normalized to T00:00:00.000Z)
    expect(normalizeISO('2026-01-15T14:30:00')).toBe('2026-01-15T14:30:00');
  });

  it('returns an empty string for empty input', () => {
    expect(normalizeISO('')).toBe('');
  });
});

describe('parseInputValue', () => {
  it('parses yyyy-MM-dd format', () => {
    expect(parseInputValue('2026-01-15', adapter)).toBe('2026-01-15T00:00:00.000Z');
  });

  it('parses yyyy/MM/dd by normalizing slashes to hyphens', () => {
    expect(parseInputValue('2026/01/15', adapter)).toBe('2026-01-15T00:00:00.000Z');
  });

  it('parses an 8-digit numeric date', () => {
    expect(parseInputValue('20260115', adapter)).toBe('2026-01-15T00:00:00.000Z');
  });

  it('returns null for empty or whitespace input', () => {
    expect(parseInputValue('', adapter)).toBeNull();
    expect(parseInputValue('   ', adapter)).toBeNull();
  });

  it('returns null for invalid input', () => {
    expect(parseInputValue('hello', adapter)).toBeNull();
    expect(parseInputValue('2026-13-45', adapter)).toBeNull();
  });
});
