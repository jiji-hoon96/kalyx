/**
 * Kalyx picker demo recorder.
 *
 * Drives the deployed Kalyx playground with Playwright, exercises each of the
 * seven headless pickers with natural-looking cursor motion, and records one
 * WebM per picker via Playwright's built-in `recordVideo`. The raw WebMs land
 * in `recordings/<picker>/*.webm`; `scripts/encode.sh` then turns each into an
 * optimized `.webm` and an animated `.avif` under `out/`.
 *
 * Why one context (and one video) per picker?
 *   - Clean, separately embeddable clips for a README table.
 *   - Playwright writes exactly one video file per browser context, so a fresh
 *     context per picker is the simplest way to get discrete files.
 *
 * Run:  DEMO_URL=... pnpm record          (all seven)
 *       ONLY=timepicker pnpm record       (just one)
 */
import { chromium, type Browser, type BrowserContext, type Page, type Locator } from '@playwright/test';
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { CONFIG, LABEL, PICKER_ORDER, SEL, type PickerId } from './selectors.js';

const OUT_DIR = path.resolve('recordings');

// Demo-only stylesheet injected into the page so the headless pickers look
// polished on camera. Loaded once from disk. THEME=none disables it (records
// the raw headless look instead).
const THEME_CSS_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), 'theme.css');
const THEME_CSS = CONFIG.theme === 'none' ? '' : readFileSync(THEME_CSS_PATH, 'utf8');

const pause = (ms: number = CONFIG.stepMs) => new Promise((r) => setTimeout(r, ms));

/** Move the cursor to the center of an element (tweened) then click it. */
async function moveAndClick(page: Page, target: Locator): Promise<void> {
  await target.scrollIntoViewIfNeeded();
  const box = await target.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
      steps: CONFIG.mouseSteps,
    });
    await pause(280);
  }
  await target.click();
  await pause();
}

/** Just glide the cursor over an element without clicking (for hover previews). */
async function moveOver(page: Page, target: Locator): Promise<void> {
  const box = await target.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
      steps: CONFIG.mouseSteps,
    });
    await pause(320);
  }
}

/**
 * Register the demo stylesheet as an init script so it is present from the
 * page's very first paint (before React hydration) — this prevents the brief
 * flash of unstyled, raw-headless pickers at the start of the recording.
 *
 * A MutationObserver re-appends the <style> tag if the SPA ever wipes <head>,
 * and re-stamps the theme attribute, so the styling survives client-side
 * re-renders (e.g. switching pickers in the playground).
 *
 * Must be called BEFORE page.goto(). No-op when THEME=none.
 */
async function installTheme(page: Page): Promise<void> {
  if (!THEME_CSS) return;
  // IMPORTANT: pass a plain STRING script, not a function. tsx/esbuild rewrites
  // inline function bodies (arrow helpers, optional chaining shims) which can
  // break once serialized into the page context, silently no-opping the whole
  // init script. A string is immune to transpilation.
  const script = `(() => {
    var ID = 'kx-demo-theme';
    var CSS = ${JSON.stringify(THEME_CSS)};
    var SCHEME = ${JSON.stringify(CONFIG.colorScheme)};
    function ensure() {
      if (!document.documentElement) return;
      document.documentElement.setAttribute('data-kx-theme', SCHEME);
      var tag = document.getElementById(ID);
      if (!tag) {
        tag = document.createElement('style');
        tag.id = ID;
        tag.textContent = CSS;
        (document.head || document.documentElement).appendChild(tag);
      }
    }
    ensure();
    function start() {
      ensure();
      new MutationObserver(ensure).observe(document.documentElement, { childList: true, subtree: true });
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
      start();
    }
  })();`;
  await page.addInitScript(script);
}

/**
 * Runtime fallback: inject the stylesheet directly into the current document.
 * addStyleTag ships the CSS as a plain string, so it also dodges transpilation.
 * Idempotent — safe to call repeatedly. No-op when THEME=none.
 */
async function applyTheme(page: Page): Promise<void> {
  if (!THEME_CSS) return;
  const has = await page.evaluate(() => !!document.getElementById('kx-demo-theme'));
  await page.evaluate((scheme) => {
    document.documentElement.setAttribute('data-kx-theme', scheme as string);
  }, CONFIG.colorScheme);
  if (!has) {
    await page.addStyleTag({ content: THEME_CSS });
    // addStyleTag doesn't set an id; tag it so installTheme's observer/idempotency see it.
    await page.evaluate(() => {
      const tags = document.querySelectorAll('style');
      const last = tags[tags.length - 1];
      if (last && !document.getElementById('kx-demo-theme')) last.id = 'kx-demo-theme';
    });
  }
}

/**
 * Wait until the demo theme is actually applied to the visible picker, so the
 * recording's trim point lands on a fully styled frame (no unstyled flash).
 * When THEME=none this only waits for the input to exist.
 */
async function ensureStyled(page: Page, preview: Locator): Promise<void> {
  const input = preview.locator('input').first();
  await input.waitFor({ state: 'visible' }).catch(() => {});
  if (!THEME_CSS) {
    await pause(150);
    return;
  }
  // Poll until our themed border-radius (8px) has taken effect on the input.
  await page
    .waitForFunction(
      () => {
        const el = document.querySelector('[data-testid="preview-panel"] input');
        if (!el) return false;
        return parseFloat(getComputedStyle(el).borderRadius) >= 4;
      },
      undefined,
      { timeout: 5000 },
    )
    .catch(() => {});
  await pause(150);
}

/** Select a picker in the playground switcher and wait for it to render. */
async function choosePicker(page: Page, id: PickerId): Promise<Locator> {
  const select = page.locator(SEL.pickerSwitch);
  await select.selectOption(id);  const preview = page.locator(SEL.previewFor(id));
  await preview.waitFor({ state: 'visible' });
  await pause(500);
  return preview;
}

/** Handy scoped role query. */
const byRole = (scope: Page | Locator, role: string, opts?: { name?: string | RegExp }) =>
  scope.getByRole(role as never, opts as never);

// ----------------------------------------------------------------------------
// Per-picker demo flows. Each assumes the picker is already selected and takes
// the preview-scoped locator. Kept small and readable; add/adjust freely.
// ----------------------------------------------------------------------------

async function demoDatePicker(page: Page, preview: Locator): Promise<void> {
  const input = byRole(preview, SEL.role.input).first();
  await moveAndClick(page, input);
  const dialog = byRole(page, SEL.role.popover).first();
  await dialog.waitFor({ state: 'visible' });
  const day = dialog
    .locator(SEL.currentMonthDay)
    .filter({ hasText: SEL.dayExact(22) })
    .first();
  await moveAndClick(page, day);
  await pause();
}

async function demoRangePicker(page: Page, preview: Locator): Promise<void> {
  const start = preview.getByLabel(LABEL.startDate).first();
  await moveAndClick(page, start);
  const dialog = byRole(page, SEL.role.popover).first();
  await dialog.waitFor({ state: 'visible' });

  const day10 = dialog.locator(SEL.currentMonthDay).filter({ hasText: SEL.dayExact(10) }).first();
  await moveAndClick(page, day10);

  // Glide across a few days so the hover-preview range is visible on camera.
  for (const d of [13, 16, 20]) {
    const cell = dialog.locator(SEL.currentMonthDay).filter({ hasText: SEL.dayExact(d) }).first();
    await moveOver(page, cell);
  }
  const day20 = dialog.locator(SEL.currentMonthDay).filter({ hasText: SEL.dayExact(20) }).first();
  await moveAndClick(page, day20);
  await pause();
}

async function demoTimePicker(page: Page, preview: Locator): Promise<void> {
  // No popover — Hour/Minute lists + AM/PM render inline.
  const hour = byRole(preview, SEL.role.option, { name: '9 hours' }).first();
  await moveAndClick(page, hour);
  const minute = byRole(preview, SEL.role.option, { name: '45 minutes' }).first();
  await moveAndClick(page, minute);
  // Flip AM/PM if present (playground preview is 12h).
  const pm = byRole(preview, SEL.role.radio, { name: 'PM' }).first();
  if (await pm.count()) await moveAndClick(page, pm);
  await pause();
}

async function demoDateTimePicker(page: Page, preview: Locator): Promise<void> {
  const input = preview.getByLabel(LABEL.dateAndTime).first();
  await moveAndClick(page, input);
  const dialog = byRole(page, SEL.role.popover).first();
  await dialog.waitFor({ state: 'visible' });

  const day = dialog.locator(SEL.currentMonthDay).filter({ hasText: SEL.dayExact(18) }).first();
  await moveAndClick(page, day); // popover stays open for time selection

  const hour = dialog.getByRole('option', { name: '10 hours' }).first();
  if (await hour.count()) await moveAndClick(page, hour);
  const minute = dialog.getByRole('option', { name: '30 minutes' }).first();
  if (await minute.count()) await moveAndClick(page, minute);
  await pause();
}

async function demoMonthPicker(page: Page, preview: Locator): Promise<void> {
  const input = byRole(preview, SEL.role.input).first();
  await moveAndClick(page, input);
  const dialog = byRole(page, SEL.role.popover).first();
  await dialog.waitFor({ state: 'visible' });
  const sept = dialog
    .getByRole('gridcell')
    .filter({ hasText: SEL.monthPrefix('Sep') })
    .first();
  await moveAndClick(page, sept);
  await pause();
}

async function demoYearPicker(page: Page, preview: Locator): Promise<void> {
  const input = byRole(preview, SEL.role.input).first();
  await moveAndClick(page, input);
  const dialog = byRole(page, SEL.role.popover).first();
  await dialog.waitFor({ state: 'visible' });
  // Cells are 4-digit years for the current decade snapshot; pick a middle one.
  const cell = dialog.getByRole('gridcell').nth(6);
  await moveAndClick(page, cell);
  await pause();
}

async function demoWeekPicker(page: Page, preview: Locator): Promise<void> {
  const start = preview.getByLabel(LABEL.startDate).first();
  await moveAndClick(page, start);
  const dialog = byRole(page, SEL.role.popover).first();
  await dialog.waitFor({ state: 'visible' });
  // A single click on any day commits the whole surrounding week.
  const day = dialog.locator(SEL.currentMonthDay).filter({ hasText: SEL.dayExact(16) }).first();
  await moveOver(page, day);
  await moveAndClick(page, day);
  await pause();
}

const FLOWS: Record<PickerId, (page: Page, preview: Locator) => Promise<void>> = {
  datepicker: demoDatePicker,
  rangepicker: demoRangePicker,
  timepicker: demoTimePicker,
  datetimepicker: demoDateTimePicker,
  monthpicker: demoMonthPicker,
  yearpicker: demoYearPicker,
  weekpicker: demoWeekPicker,
};

// ----------------------------------------------------------------------------

/** Record a single picker into its own WebM file, returning the final path. */
async function recordPicker(browser: Browser, id: PickerId): Promise<string> {
  const dir = path.join(OUT_DIR, id);
  mkdirSync(dir, { recursive: true });

  const context: BrowserContext = await browser.newContext({
    viewport: CONFIG.viewport,
    deviceScaleFactor: CONFIG.deviceScaleFactor,
    colorScheme: CONFIG.colorScheme,
    recordVideo: { dir, size: CONFIG.viewport },
  });
  const page = await context.newPage();
  // Register the theme BEFORE navigating so the first painted frame is styled.
  await installTheme(page);

  const recStart = Date.now();
  let readyOffsetMs = 0;

  try {
    await page.goto(CONFIG.demoUrl, { waitUntil: 'networkidle', timeout: 60_000 });
    await applyTheme(page); // runtime guarantee on top of the init script
    await pause(900);

    const preview = await choosePicker(page, id);
    await applyTheme(page); // re-assert after the playground re-renders
    // Everything before this point is page-load + hydration (blank screen and a
    // possible flash of unstyled picker). Mark it so the encoder can trim it,
    // leaving a clip that starts on a stable, styled picker.
    await ensureStyled(page, preview);
    readyOffsetMs = Date.now() - recStart;

    await FLOWS[id](page, preview);
    await pause(600);
  } finally {
    // Video is finalized only after the context closes.
    await context.close();
  }

  // Write the trim offset (seconds) next to the video for encode.sh to consume.
  // Back off a touch so we never clip into the first styled frame.
  const trimSec = Math.max(0, readyOffsetMs / 1000 - 0.25);
  writeFileSync(path.join(dir, `${id}.trim`), trimSec.toFixed(2));

  // Rename Playwright's random video filename to `<id>.webm`.
  const files = readdirSync(dir).filter((f) => f.endsWith('.webm'));
  const raw = files.find((f) => f !== `${id}.webm`) ?? files[0];
  const finalPath = path.join(dir, `${id}.webm`);
  if (raw && raw !== `${id}.webm`) {
    if (existsSync(finalPath)) {
      // stale from a previous run — overwrite
      renameSync(path.join(dir, raw), finalPath);
    } else {
      renameSync(path.join(dir, raw), finalPath);
    }
  }
  return finalPath;
}

async function main(): Promise<void> {
  const targets: PickerId[] = CONFIG.only ? [CONFIG.only] : PICKER_ORDER;

  console.log('Kalyx demo recorder');
  console.log(`  URL      : ${CONFIG.demoUrl}`);
  console.log(`  viewport : ${CONFIG.viewport.width}x${CONFIG.viewport.height} @${CONFIG.deviceScaleFactor}x`);
  console.log(`  theme    : ${CONFIG.colorScheme}`);
  console.log(`  pickers  : ${targets.join(', ')}`);
  console.log();

  const browser = await chromium.launch({ slowMo: CONFIG.slowMo });
  try {
    for (const id of targets) {
      process.stdout.write(`  → recording ${id} ... `);
      const out = await recordPicker(browser, id);
      console.log(`done  (${path.relative(process.cwd(), out)})`);
    }
  } finally {
    await browser.close();
  }

  console.log('\nRaw recordings written to recordings/. Run `pnpm encode` to optimize.');
}

main().catch((err) => {
  console.error('\nRecording failed:', err);
  process.exit(1);
});
