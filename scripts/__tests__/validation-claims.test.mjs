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
  it('does not promise unsupported per-picker tree-shaking', () => {
    expect(publicCopy).not.toMatch(/pay only for (?:the components|what) you (?:render|import)/i);
    expect(publicCopy).not.toContain('쓰는 것만 비용 부담');
    expect(publicCopy).not.toContain('임포트한 만큼만 비용');
    expect(publicCopy).not.toMatch(/using only `TimePicker` drops DatePicker code/i);
    expect(publicCopy).not.toMatch(/Tree-shaking removes what isn't on the page/i);
    expect(publicCopy).not.toContain('You pay for what you render');
    expect(publicCopy).not.toContain('렌더링한 만큼만 비용');
  });
});
