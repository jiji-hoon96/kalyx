#!/usr/bin/env node
// scripts/check-tree-shaking.js
//
// Measures per-scenario bundle size as a consumer would actually experience it.
// Feeds synthetic entry files into esbuild (bundle + minify + tree-shake) and
// reports raw and gzipped output for each scenario.
//
// Run: pnpm exec node scripts/check-tree-shaking.js

import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const esbuild = require('esbuild');

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const SCENARIOS = [
  {
    name: 'Baseline (types only)',
    entry: `import type { ISODateString } from '@kalyx/react';\nexport type _ = ISODateString;`,
  },
  {
    name: 'DatePicker only',
    entry: `import { DatePicker } from '@kalyx/react';\nexport default DatePicker;`,
  },
  {
    name: 'RangePicker only',
    entry: `import { RangePicker } from '@kalyx/react';\nexport default RangePicker;`,
  },
  {
    name: 'TimePicker only',
    entry: `import { TimePicker } from '@kalyx/react';\nexport default TimePicker;`,
  },
  {
    name: 'DateTimePicker only',
    entry: `import { DateTimePicker } from '@kalyx/react';\nexport default DateTimePicker;`,
  },
  {
    name: 'MonthPicker only',
    entry: `import { MonthPicker } from '@kalyx/react';\nexport default MonthPicker;`,
  },
  {
    name: 'YearPicker only',
    entry: `import { YearPicker } from '@kalyx/react';\nexport default YearPicker;`,
  },
  {
    name: 'WeekPicker only',
    entry: `import { WeekPicker } from '@kalyx/react';\nexport default WeekPicker;`,
  },
  {
    name: 'useDatePicker hook only',
    entry: `import { useDatePicker } from '@kalyx/react';\nexport default useDatePicker;`,
  },
  {
    name: 'All pickers + hooks',
    entry: `import {
  DatePicker, RangePicker, TimePicker, DateTimePicker,
  MonthPicker, YearPicker, WeekPicker,
  useDatePicker, useRangePicker, useTimePicker,
} from '@kalyx/react';
export default { DatePicker, RangePicker, TimePicker, DateTimePicker, MonthPicker, YearPicker, WeekPicker, useDatePicker, useRangePicker, useTimePicker };`,
  },
];

function kb(bytes) {
  return (bytes / 1024).toFixed(2);
}

const KALYX_REACT_DIST = resolve(ROOT, 'packages/react/dist/index.js');
const KALYX_CORE_DIST = resolve(ROOT, 'packages/core/dist/index.js');

async function measure(entry) {
  const result = await esbuild.build({
    stdin: {
      contents: entry,
      resolveDir: ROOT,
      loader: 'ts',
    },
    bundle: true,
    minify: true,
    format: 'esm',
    target: 'es2022',
    platform: 'browser',
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    alias: {
      '@kalyx/react': KALYX_REACT_DIST,
      '@kalyx/core': KALYX_CORE_DIST,
    },
    write: false,
    treeShaking: true,
    logLevel: 'error',
  });

  const output = result.outputFiles[0].contents;
  const gzip = gzipSync(Buffer.from(output));
  return { raw: output.length, gzip: gzip.length };
}

async function main() {
  console.log('\n🌳 Tree-shaking Bundle Report');
  console.log('─'.repeat(70));
  console.log(
    `  ${'Scenario'.padEnd(32)} ${'Raw'.padStart(10)} ${'Gzip'.padStart(10)}`,
  );
  console.log('─'.repeat(70));

  const results = [];
  for (const scenario of SCENARIOS) {
    try {
      const { raw, gzip } = await measure(scenario.entry);
      results.push({ name: scenario.name, raw, gzip });
      console.log(
        `  ${scenario.name.padEnd(32)} ${(kb(raw) + ' KB').padStart(10)} ${(kb(gzip) + ' KB').padStart(10)}`,
      );
    } catch (err) {
      console.error(`  ${scenario.name.padEnd(32)} ❌ ${err.message}`);
    }
  }

  console.log('─'.repeat(70));
  console.log('  Excludes react, react-dom (peer deps).');
  console.log('  Minified + gzipped as a consumer bundler would ship it.');
  console.log(
    "  Baseline = shared deps (Floating UI + date-fns). Per-picker cost = scenario - baseline.",
  );
  console.log('');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
