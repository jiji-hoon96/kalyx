import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const publicCopy = [
  'README.md',
  'README.ko.md',
  'packages/react/README.md',
  'apps/docs-site/docs/api/react.md',
  'apps/docs-site/i18n/ko/docusaurus-plugin-content-docs/current/api/react.md',
  'apps/docs-site/docs/concepts/composition.md',
  'apps/docs-site/i18n/ko/docusaurus-plugin-content-docs/current/concepts/composition.md',
  'apps/docs-site/i18n/ko/code.json',
  'apps/docs-site/src/components/FeatureGrid/data.ts',
]
  .map((path) => readFileSync(resolve(root, path), 'utf8'))
  .join('\n');

describe('public bundle claims', () => {
  // Per-picker elimination DOES work now (see scripts/__tests__/tree-shaking.test.mjs),
  // so it is fair to say unused pickers are dropped. These phrases stay banned anyway
  // because they claim something stronger and still false: that cost scales with what
  // you use. It doesn't — the pickers share a large base, so one picker is ~16-20 KB
  // against ~25 KB for all seven, not a seventh of it. Quote the measured numbers
  // instead of reaching for "pay for what you use".
  it('does not promise cost that scales with what you render', () => {
    expect(publicCopy).not.toMatch(/pay only for (?:the components|what) you (?:render|import)/i);
    expect(publicCopy).not.toContain('쓰는 것만 비용 부담');
    expect(publicCopy).not.toContain('임포트한 만큼만 비용');
    expect(publicCopy).not.toMatch(/using only `TimePicker` drops DatePicker code/i);
    expect(publicCopy).not.toMatch(/Tree-shaking removes what isn't on the page/i);
    expect(publicCopy).not.toContain('You pay for what you render');
    expect(publicCopy).not.toContain('렌더링한 만큼만 비용');
  });
});
