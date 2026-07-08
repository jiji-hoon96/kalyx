import { describe, it, expect } from 'vitest';
import { runAdapterConformanceTests } from '@kalyx/core/test-helpers';
import { LuxonAdapter } from '../index.js';

// The luxon adapter must satisfy the exact same DateAdapter contract as the
// reference date-fns adapter and the dayjs adapter. Running the shared
// conformance suite against a third backend proves the contract is genuinely
// portable, not tied to any one date library.
runAdapterConformanceTests(LuxonAdapter, { describe, it, expect });

// A couple of luxon-specific sanity checks beyond the shared contract.
describe('LuxonAdapter — UTC mode sanity', () => {
  it('operates in UTC regardless of host timezone', () => {
    // 00:00 UTC must read back as day 15, not shifted into the local zone.
    expect(LuxonAdapter.getDate('2026-01-15T00:00:00.000Z')).toBe(15);
    expect(LuxonAdapter.format('2026-01-15T00:00:00.000Z', 'yyyy-MM-dd HH:mm')).toBe(
      '2026-01-15 00:00',
    );
  });

  it('emits a "Z"-suffixed ISO string, not "+00:00"', () => {
    expect(LuxonAdapter.addDays('2026-01-15T00:00:00.000Z', 1)).toBe('2026-01-16T00:00:00.000Z');
  });

  it('round-trips a value through parse → format', () => {
    expect(LuxonAdapter.format(LuxonAdapter.parse('2026-07-04'), 'yyyy-MM-dd')).toBe('2026-07-04');
  });
});
