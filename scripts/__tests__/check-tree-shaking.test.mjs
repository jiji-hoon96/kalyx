import { describe, expect, it } from 'vitest';

import { assertCompleteScenarioResults } from '../check-tree-shaking.js';

describe('assertCompleteScenarioResults', () => {
  const scenarios = [{ name: 'DatePicker only' }, { name: 'All pickers' }];

  it('accepts exactly one successful result per scenario', () => {
    expect(() =>
      assertCompleteScenarioResults(scenarios, [
        { name: 'DatePicker only', raw: 1, gzip: 1 },
        { name: 'All pickers', raw: 2, gzip: 2 },
      ]),
    ).not.toThrow();
  });

  it('rejects failed or missing scenarios', () => {
    expect(() =>
      assertCompleteScenarioResults(scenarios, [
        { name: 'DatePicker only', error: new Error('bundle failed') },
      ]),
    ).toThrow(
      'Tree-shaking scenarios failed: DatePicker only: bundle failed; missing: All pickers',
    );
  });
});
