#!/usr/bin/env node
/**
 * Capture the HeroDemo as an animated WebP.
 *
 * Usage:
 *   node scripts/record-hero.mjs --theme=light --out=img/hero-light.webp
 *   node scripts/record-hero.mjs --theme=dark  --out=img/hero-dark.webp
 *
 * Prerequisites:
 *   - cwebp + webpmux installed (Homebrew: `brew install webp`)
 *   - chromium installed (`pnpm exec playwright install chromium`)
 *   - docs-site dev server NOT already running on port 3100
 *
 * The script starts its own docusaurus dev server on port 3100, screenshots
 * each of the 7 frames at 960x540, then pipes the PNGs through cwebp into
 * a single animated WebP (loop=infinite, q=75).
 */

import { spawn, spawnSync } from 'node:child_process';
import { mkdir, rm } from 'node:fs/promises';
import { statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

const FRAMES = 7;
const FRAME_HOLD_MS = 850;       // must match FRAME_DURATION_MS in sequence.ts
const VIEWPORT = { width: 960, height: 540 };
const DOCS_PORT = 3100;
const SERVER_TIMEOUT_MS = 120_000;

const args = Object.fromEntries(
  process.argv.slice(2).map(a => {
    const [k, v = ''] = a.replace(/^--/, '').split('=');
    return [k, v];
  })
);

const theme = args.theme === 'dark' ? 'dark' : 'light';
const out = args.out ?? `img/hero-${theme}.webp`;
const outAbs = resolve(REPO_ROOT, out);

main().catch(err => {
  console.error('[record-hero]', err);
  process.exit(1);
});

async function main() {
  ensureCwebp();

  const tmpDir = resolve(REPO_ROOT, '.tmp-hero-frames');
  await rm(tmpDir, { recursive: true, force: true });
  await mkdir(tmpDir, { recursive: true });

  const server = startDocsSite();
  try {
    await waitForPort(DOCS_PORT, SERVER_TIMEOUT_MS);
    await captureFrames(tmpDir);
    await encodeWebp(tmpDir, outAbs);
    console.log(`[record-hero] wrote ${out}`);
    const stat = statSync(outAbs);
    console.log(`[record-hero] size: ${(stat.size / 1024).toFixed(1)} KB`);
  } finally {
    server.kill('SIGTERM');
    await rm(tmpDir, { recursive: true, force: true });
  }
}

function ensureCwebp() {
  const probeCwebp = spawnSync('cwebp', ['-version'], { encoding: 'utf-8' });
  if (probeCwebp.error || probeCwebp.status !== 0) {
    throw new Error(
      'cwebp is required. Install with: brew install webp (macOS) or apt install webp (Linux).'
    );
  }
  const probeWebpmux = spawnSync('webpmux', { encoding: 'utf-8' });
  // webpmux exits non-zero when called with no args but prints usage; treat
  // "command not found" (ENOENT) as the only fatal case.
  if (probeWebpmux.error && probeWebpmux.error.code === 'ENOENT') {
    throw new Error('webpmux is required. Ships in the same `webp` package as cwebp.');
  }
}

function startDocsSite() {
  console.log('[record-hero] starting docs-site dev server on port 3100...');
  return spawn(
    'pnpm',
    ['--filter', 'docs-site', 'start', '--port', String(DOCS_PORT), '--no-open'],
    { cwd: REPO_ROOT, stdio: ['ignore', 'pipe', 'inherit'] }
  );
}

async function waitForPort(port, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://localhost:${port}/recorder?frame=0`);
      if (res.ok) return;
    } catch { /* still starting */ }
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error(`docs-site did not start on port ${port} within ${timeoutMs}ms`);
}

async function captureFrames(tmpDir) {
  const browser = await chromium.launch();
  try {
    // Docusaurus is configured with `respectPrefersColorScheme: true`, so the
    // active theme on first paint is driven entirely by the OS color-scheme
    // media query — not by localStorage. Emulating it at the browser layer
    // is more robust than setting a (namespaced) localStorage key.
    const ctx = await browser.newContext({
      viewport: VIEWPORT,
      colorScheme: theme,
    });

    const page = await ctx.newPage();

    for (let i = 0; i < FRAMES; i++) {
      const url = `http://localhost:${DOCS_PORT}/recorder?frame=${i}&theme=${theme}`;
      await page.goto(url, { waitUntil: 'networkidle' });
      // Give the picker popovers/lists a moment to settle.
      await page.waitForTimeout(250);

      if (i === 0) {
        // One-shot diagnostic: confirms the FROZEN value actually lands as
        // data-selected on the calendar grid. If this attribute is missing,
        // every theme/screenshot tweak below is treating a symptom rather
        // than the bug.
        const selected = await page.evaluate(() => {
          const el = document.querySelector('[data-selected="true"]');
          return el?.textContent ?? null;
        });
        console.log(`[record-hero] data-selected sample: ${selected ?? 'NONE'}`);
      }

      const file = join(tmpDir, `frame-${String(i).padStart(2, '0')}.png`);
      await page.screenshot({ path: file, type: 'png' });
      console.log(`[record-hero] captured frame ${i}`);
    }
  } finally {
    await browser.close();
  }
}

async function encodeWebp(tmpDir, outAbs) {
  await mkdir(dirname(outAbs), { recursive: true });

  // Step 1: PNG -> WebP per frame.
  for (let i = 0; i < FRAMES; i++) {
    const png = join(tmpDir, `frame-${String(i).padStart(2, '0')}.png`);
    const webp = join(tmpDir, `frame-${String(i).padStart(2, '0')}.webp`);
    const r = spawnSync('cwebp', ['-q', '75', '-m', '6', png, '-o', webp], {
      encoding: 'utf-8',
    });
    if (r.status !== 0) {
      throw new Error(`cwebp failed for frame ${i}: ${r.stderr}`);
    }
  }

  // Step 2: combine into animated WebP via webpmux.
  // webpmux frame syntax requires the file path and the `+duration+x+y+...`
  // params as two separate argv tokens. Older webpmux tolerated `file+dur`
  // glued, but recent versions (1.4+) parse `file+dur` as a filename and
  // then read the next `-frame ...` as a duplicate input ("Multiple input
  // files specified").
  const frameArgs = [];
  for (let i = 0; i < FRAMES; i++) {
    const webp = join(tmpDir, `frame-${String(i).padStart(2, '0')}.webp`);
    frameArgs.push('-frame', webp, `+${FRAME_HOLD_MS}+0+0+1`);
  }
  frameArgs.push('-loop', '0', '-bgcolor', '255,255,255,255');
  frameArgs.push('-o', outAbs);

  const r = spawnSync('webpmux', frameArgs, { encoding: 'utf-8' });
  if (r.status !== 0) {
    throw new Error(`webpmux failed: ${r.stderr}`);
  }
}
