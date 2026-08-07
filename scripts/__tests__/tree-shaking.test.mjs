// @vitest-environment node
//
// Must run under node, not the repo-wide jsdom default: esbuild asserts that
// `new TextEncoder().encode('') instanceof Uint8Array`, which is false under
// jsdom's TextEncoder, and refuses to start.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';
import { beforeAll, describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '../..');
const KALYX_REACT_DIST = resolve(ROOT, 'packages/react/dist/index.js');
const KALYX_CORE_DIST = resolve(ROOT, 'packages/core/dist/index.js');

// Emit into the repo's own node_modules cache so the tree-shaken bundle can still
// resolve `react` (kept external) when we import it back.
const OUT_DIR = resolve(ROOT, 'node_modules/.cache/kalyx-tree-shaking');

/**
 * Bundles `entry` exactly as a consumer's bundler would, then hands back both the
 * size and a live module so a test can assert the *tree-shaken output still works*.
 */
async function bundle(name, entry, { minify = true } = {}) {
  const { build } = await import('esbuild');
  const result = await build({
    stdin: { contents: entry, resolveDir: ROOT, loader: 'ts' },
    bundle: true,
    minify,
    format: 'esm',
    target: 'es2022',
    platform: 'browser',
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    alias: { '@kalyx/react': KALYX_REACT_DIST, '@kalyx/core': KALYX_CORE_DIST },
    write: false,
    treeShaking: true,
    logLevel: 'error',
  });
  const contents = Buffer.from(result.outputFiles[0].contents);
  mkdirSync(OUT_DIR, { recursive: true });
  const file = resolve(OUT_DIR, `${name}.mjs`);
  writeFileSync(file, contents);
  return { gzip: gzipSync(contents).length, file };
}

const PICKERS = [
  { name: 'DatePicker', parts: ['Input', 'Trigger', 'Popover', 'Calendar', 'MonthGrid', 'YearGrid'] },
  { name: 'RangePicker', parts: ['Input', 'Popover', 'Calendar'] },
  { name: 'TimePicker', parts: ['Input', 'HourList', 'MinuteList', 'AmPmToggle'] },
  // Borrows Calendar from DatePicker and HourList/MinuteList from TimePicker, so it
  // depends on sub-components whose own picker's Object.assign may be dropped.
  { name: 'DateTimePicker', parts: ['Input', 'Popover', 'Calendar', 'HourList', 'MinuteList'] },
  { name: 'MonthPicker', parts: ['Input', 'Trigger', 'Popover', 'Grid'] },
  { name: 'YearPicker', parts: ['Input', 'Trigger', 'Popover', 'Grid'] },
  { name: 'WeekPicker', parts: ['Input', 'Popover', 'Calendar'] },
];

describe('per-picker tree-shaking', () => {
  const sizes = new Map();

  beforeAll(async () => {
    for (const { name } of PICKERS) {
      const { gzip } = await bundle(
        `only-${name}`,
        `import { ${name} } from '@kalyx/react';\nexport default ${name};`,
      );
      sizes.set(name, gzip);
    }
    const all = await bundle(
      'all',
      `import {
        DatePicker, RangePicker, TimePicker, DateTimePicker,
        MonthPicker, YearPicker, WeekPicker,
        useDatePicker, useRangePicker, useTimePicker,
      } from '@kalyx/react';
      export default { DatePicker, RangePicker, TimePicker, DateTimePicker, MonthPicker, YearPicker, WeekPicker, useDatePicker, useRangePicker, useTimePicker };`,
    );
    sizes.set('__all__', all.gzip);
  }, 120_000);

  // The safety net for `/*#__PURE__*/` on the dot-notation Object.assign calls.
  // Nothing else in the repo can catch a bad annotation: every other test imports
  // from source, where the call is never dropped. Only a bundled, tree-shaken,
  // then *executed* artifact exercises the path the annotation affects.
  it.each(PICKERS)('$name keeps its sub-components after tree-shaking', async ({ name, parts }) => {
    const { file } = await bundle(
      `exec-${name}`,
      `import { ${name} } from '@kalyx/react';\nexport default ${name};`,
      { minify: false },
    );
    const mod = await import(pathToFileURL(file).href);
    const picker = mod.default;

    // Sub-components are a mix of plain functions and `forwardRef` results, and
    // forwardRef returns an object — so this checks "is a renderable React type",
    // not "is a function".
    const isRenderable = (v) =>
      typeof v === 'function' || (typeof v === 'object' && v !== null && '$$typeof' in v);

    expect(isRenderable(picker), `${name} itself was dropped`).toBe(true);
    for (const part of parts) {
      expect(isRenderable(picker[part]), `${name}.${part} was dropped by tree-shaking`).toBe(true);
    }
  }, 120_000);

  // Relative, not absolute. An absolute byte threshold would need re-baselining on
  // every feature and would recreate the ceiling treadmill this fix exists to end.
  // The invariant that actually broke was relative: all seven pickers used to be
  // byte-identical to each other and within ~4% of importing the entire library.
  it('makes importing one picker meaningfully cheaper than importing everything', () => {
    const all = sizes.get('__all__');
    const largest = Math.max(...PICKERS.map(({ name }) => sizes.get(name)));
    const saving = 1 - largest / all;

    expect(
      saving,
      `largest single picker ${(largest / 1024).toFixed(2)}KB vs all ${(all / 1024).toFixed(2)}KB ` +
        `= ${(saving * 100).toFixed(1)}% saved; per-picker elimination is not working`,
    ).toBeGreaterThan(0.15);
  });

  it('differentiates between pickers of genuinely different weight', () => {
    // A TimePicker has no calendar grid; a DateTimePicker has a calendar *and* time
    // lists. If elimination works at all, their costs must visibly diverge. When it
    // was broken every picker measured within a rounding error of every other, so
    // set-distinctness alone was too weak to notice — this asserts the spread.
    const all = PICKERS.map(({ name }) => sizes.get(name));
    const spread = 1 - Math.min(...all) / Math.max(...all);

    expect(spread, `cheapest vs priciest picker differ by only ${(spread * 100).toFixed(1)}%`)
      .toBeGreaterThan(0.05);
  });
});
