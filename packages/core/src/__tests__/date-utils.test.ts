import { describe, it, expect } from 'vitest';
import { normalizeISO, parseInputValue } from '../utils/date.js';
import { DateFnsAdapter } from '../adapters/date-fns.js';

const adapter = DateFnsAdapter;

describe('normalizeISO', () => {
  it('converts YYYY-MM-DD to UTC midnight', () => {
    expect(normalizeISO('2026-01-15')).toBe('2026-01-15T00:00:00.000Z');
  });

  it('returns an ISO datetime unchanged', () => {
    expect(normalizeISO('2026-01-15T14:30:00.000Z')).toBe('2026-01-15T14:30:00.000Z');
  });

  it('returns an empty string for empty input', () => {
    expect(normalizeISO('')).toBe('');
  });
});

describe('parseInputValue', () => {
  it('parses yyyy-MM-dd format', () => {
    expect(parseInputValue('2026-01-15', 'yyyy-MM-dd', adapter)).toBe('2026-01-15T00:00:00.000Z');
  });

  it('parses yyyy/MM/dd by normalizing slashes to hyphens', () => {
    expect(parseInputValue('2026/01/15', 'yyyy-MM-dd', adapter)).toBe('2026-01-15T00:00:00.000Z');
  });

  it('parses an 8-digit numeric date', () => {
    expect(parseInputValue('20260115', 'yyyy-MM-dd', adapter)).toBe('2026-01-15T00:00:00.000Z');
  });

  it('returns null for empty or whitespace input', () => {
    expect(parseInputValue('', 'yyyy-MM-dd', adapter)).toBeNull();
    expect(parseInputValue('   ', 'yyyy-MM-dd', adapter)).toBeNull();
  });

  it('returns null for invalid input', () => {
    expect(parseInputValue('hello', 'yyyy-MM-dd', adapter)).toBeNull();
    expect(parseInputValue('2026-13-45', 'yyyy-MM-dd', adapter)).toBeNull();
  });
});
