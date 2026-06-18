import { describe, it, expect } from 'vitest';
import { runAdapterConformanceTests } from '@kalyx/core/test-helpers';
import { DayjsAdapter } from '../index.js';

// The dayjs adapter must satisfy the exact same DateAdapter contract as the
// reference date-fns adapter. This is the conformance suite's first SECOND
// implementation — proving the contract is portable, not date-fns-specific.
runAdapterConformanceTests(DayjsAdapter, { describe, it, expect });

// A couple of dayjs-specific sanity checks beyond the shared contract.
describe('DayjsAdapter — UTC mode sanity', () => {
  it('operates in UTC regardless of host timezone', () => {
    // 00:00 UTC must read back as day 15, not shifted into the local zone.
    expect(DayjsAdapter.getDate('2026-01-15T00:00:00.000Z')).toBe(15);
    expect(DayjsAdapter.format('2026-01-15T00:00:00.000Z', 'yyyy-MM-dd HH:mm')).toBe(
      '2026-01-15 00:00',
    );
  });

  it('round-trips a value through parse → format', () => {
    expect(DayjsAdapter.format(DayjsAdapter.parse('2026-07-04'), 'yyyy-MM-dd')).toBe('2026-07-04');
  });
});
