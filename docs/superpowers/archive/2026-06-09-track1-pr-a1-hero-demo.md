# Track 1 PR-A1 — Hero Animated Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an animated 7-picker "seven primitives. one API." hero — both as an animated WebP for the GitHub README and as a live `<HeroDemo>` React component the docs-site landing can lazy-load in PR-A2.

**Architecture:** One sequence definition (`sequence.ts`) drives two renderings: (1) `<HeroDemo>` React component cycles through 7 frames on a timer with pause-on-hover and `prefers-reduced-motion` respect; (2) a local-only `/__recorder` route renders any frame deterministically (`?frame=N&theme=light|dark`), driven by Playwright in `scripts/record-hero.mjs` and piped through `cwebp` into `img/hero-{light,dark}.webp`.

**Tech Stack:** React 19, Docusaurus 3.10, Vitest + Testing Library (workspace root), Playwright (existing), cwebp (system tool, Homebrew: `brew install webp`).

**Scope:** PR-A1 only. This PR ships the recorder pipeline + the WebP artifacts + the `<HeroDemo>` component + the README integration. It does **NOT** modify the docs-site landing — that swap is PR-A2 and gets its own plan after this lands.

**Reference spec:** `docs/superpowers/specs/2026-06-09-track1-visuals-interactive-comparison-design.md` (sub-deliverable A.1 + A.2; PR-A1 row in the reconciliation table)

---

## File Structure

**Create:**
- `apps/docs-site/src/components/HeroDemo/index.tsx` — `<HeroDemo>` React component, default-exported for `React.lazy` consumers
- `apps/docs-site/src/components/HeroDemo/sequence.ts` — sequence definition (7 entries: id, label, render function)
- `apps/docs-site/src/components/HeroDemo/HeroDemo.module.css` — cross-fade animation + layout
- `apps/docs-site/src/components/HeroDemo/__tests__/sequence.test.ts` — invariant tests for the sequence
- `apps/docs-site/src/components/HeroDemo/__tests__/HeroDemo.test.tsx` — render + cycle behaviour
- `apps/docs-site/src/pages/__recorder.tsx` — local-only recorder route at `/__recorder`
- `scripts/record-hero.mjs` — Playwright + cwebp pipeline
- `scripts/check-hero-freshness.mjs` — CI check (file exists, ≤ 250 KB)
- `scripts/__tests__/check-hero-freshness.test.mjs` — script unit tests
- `img/hero-light.webp` — generated binary
- `img/hero-dark.webp` — generated binary

**Modify:**
- `README.md` — replace static hero `<img>` with `<picture>` (light/dark via `prefers-color-scheme`)
- `README.ko.md` — same
- `.github/workflows/pr-check.yml` — add `hero-freshness` job

**Not modified in this PR (PR-A2's job):**
- `apps/docs-site/src/pages/index.tsx` — landing still uses static JPEG until PR-A2

---

## Task list

### Task 1: Verify dev environment prerequisites

**Files:** none (verification only)

- [ ] **Step 1: Verify cwebp is installed**

Run:
```bash
cwebp -version
```
Expected: prints a version number (e.g., `1.3.2`). If not installed:
```bash
brew install webp
```

- [ ] **Step 2: Verify Playwright browsers are installed**

Run:
```bash
pnpm exec playwright install chromium --with-deps
```
Expected: either "browsers already installed" or installs chromium successfully.

- [ ] **Step 3: Verify the dev server starts on docs-site**

Run:
```bash
pnpm --filter docs-site start --port 3100
```
Expected: docusaurus opens on `http://localhost:3100`. Stop with Ctrl-C once verified.

Note: port 3100 (not 3000) because `apps/docs` uses 3000.

---

### Task 2: Define the sequence type + data

**Files:**
- Create: `apps/docs-site/src/components/HeroDemo/sequence.ts`
- Test: `apps/docs-site/src/components/HeroDemo/__tests__/sequence.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/docs-site/src/components/HeroDemo/__tests__/sequence.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { sequence, FRAME_COUNT, FRAME_DURATION_MS } from '../sequence';

describe('hero sequence', () => {
  it('has exactly 7 frames', () => {
    expect(sequence).toHaveLength(7);
    expect(FRAME_COUNT).toBe(7);
  });

  it('each frame has a unique id', () => {
    const ids = sequence.map(f => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('frame ids match the 7 kalyx pickers in order', () => {
    expect(sequence.map(f => f.id)).toEqual([
      'datepicker',
      'rangepicker',
      'timepicker',
      'datetimepicker',
      'monthpicker',
      'yearpicker',
      'weekpicker',
    ]);
  });

  it('each frame has a non-empty label', () => {
    for (const frame of sequence) {
      expect(frame.label).toBeTruthy();
      expect(frame.label.length).toBeGreaterThan(0);
    }
  });

  it('frame duration is a positive integer in milliseconds', () => {
    expect(FRAME_DURATION_MS).toBeGreaterThan(0);
    expect(Number.isInteger(FRAME_DURATION_MS)).toBe(true);
  });

  it('total cycle duration fits the 6-second budget (±1s tolerance)', () => {
    const total = FRAME_DURATION_MS * FRAME_COUNT;
    expect(total).toBeGreaterThanOrEqual(5000);
    expect(total).toBeLessThanOrEqual(7000);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:
```bash
pnpm test:run apps/docs-site/src/components/HeroDemo/__tests__/sequence.test.ts
```
Expected: FAIL — "Cannot find module '../sequence'".

- [ ] **Step 3: Implement the sequence module**

Create `apps/docs-site/src/components/HeroDemo/sequence.ts`:

```typescript
import type { ReactNode } from 'react';

/**
 * One frame in the hero demo cycle. Each frame corresponds to one of the
 * 7 kalyx picker primitives. The `render` function returns the JSX to
 * display for that frame; it is called fresh every cycle so component
 * state (input focus, popover open) resets cleanly.
 */
export type HeroFrame = {
  id: string;
  label: string;
  render: () => ReactNode;
};

/** Milliseconds each frame is visible before the cycle advances. */
export const FRAME_DURATION_MS = 850;

/** Number of frames in the sequence (== sequence.length, exposed for tests). */
export const FRAME_COUNT = 7;

// Frame render functions are wired up in HeroDemo/index.tsx where the
// kalyx picker imports live. sequence.ts is intentionally render-free
// so the tests (and CI) can validate invariants without importing React.
// `render` is set to a placeholder here; HeroDemo replaces it at module
// load time. (We keep a single source-of-truth for ids/labels/order.)
export const sequence: HeroFrame[] = [
  { id: 'datepicker',     label: 'DatePicker',     render: () => null },
  { id: 'rangepicker',    label: 'RangePicker',    render: () => null },
  { id: 'timepicker',     label: 'TimePicker',     render: () => null },
  { id: 'datetimepicker', label: 'DateTimePicker', render: () => null },
  { id: 'monthpicker',    label: 'MonthPicker',    render: () => null },
  { id: 'yearpicker',     label: 'YearPicker',     render: () => null },
  { id: 'weekpicker',     label: 'WeekPicker',     render: () => null },
];
```

- [ ] **Step 4: Run the test again to verify it passes**

Run:
```bash
pnpm test:run apps/docs-site/src/components/HeroDemo/__tests__/sequence.test.ts
```
Expected: PASS (6 passing tests).

- [ ] **Step 5: Commit**

```bash
git add apps/docs-site/src/components/HeroDemo/sequence.ts \
        apps/docs-site/src/components/HeroDemo/__tests__/sequence.test.ts
git commit -m "$(cat <<'EOF'
feat(docs-site): scaffold HeroDemo sequence definition

7-frame sequence with id/label/render shape, plus invariant tests
(unique ids, fixed order, total cycle within 5-7s budget).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Skeleton `<HeroDemo>` component with cycle timer

**Files:**
- Create: `apps/docs-site/src/components/HeroDemo/index.tsx`
- Create: `apps/docs-site/src/components/HeroDemo/HeroDemo.module.css`
- Test: `apps/docs-site/src/components/HeroDemo/__tests__/HeroDemo.test.tsx`

- [ ] **Step 1: Write the failing test for initial render + cycle advance**

Create `apps/docs-site/src/components/HeroDemo/__tests__/HeroDemo.test.tsx`:

```tsx
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import HeroDemo from '../index';
import { FRAME_DURATION_MS, sequence } from '../sequence';

describe('<HeroDemo>', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the first frame initially', () => {
    render(<HeroDemo />);
    // The current frame's label is rendered (data-testid on the label element).
    expect(screen.getByTestId('hero-demo-label')).toHaveTextContent(
      sequence[0].label
    );
  });

  it('advances to the next frame after FRAME_DURATION_MS', () => {
    render(<HeroDemo />);
    expect(screen.getByTestId('hero-demo-label')).toHaveTextContent(
      sequence[0].label
    );

    act(() => {
      vi.advanceTimersByTime(FRAME_DURATION_MS);
    });

    expect(screen.getByTestId('hero-demo-label')).toHaveTextContent(
      sequence[1].label
    );
  });

  it('wraps from the last frame back to the first', () => {
    render(<HeroDemo />);

    // Advance through all 7 frames -> we should be back at frame 0.
    act(() => {
      vi.advanceTimersByTime(FRAME_DURATION_MS * sequence.length);
    });

    expect(screen.getByTestId('hero-demo-label')).toHaveTextContent(
      sequence[0].label
    );
  });

  it('exposes the current frame index via data attribute', () => {
    render(<HeroDemo />);
    const root = screen.getByTestId('hero-demo-root');
    expect(root.getAttribute('data-frame')).toBe('0');

    act(() => {
      vi.advanceTimersByTime(FRAME_DURATION_MS * 3);
    });

    expect(root.getAttribute('data-frame')).toBe('3');
  });

  it('respects an explicit initialFrame prop (used by the recorder)', () => {
    render(<HeroDemo initialFrame={4} autoplay={false} />);
    expect(screen.getByTestId('hero-demo-root').getAttribute('data-frame')).toBe('4');

    // autoplay=false means timers do NOT advance the frame.
    act(() => {
      vi.advanceTimersByTime(FRAME_DURATION_MS * 5);
    });
    expect(screen.getByTestId('hero-demo-root').getAttribute('data-frame')).toBe('4');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:
```bash
pnpm test:run apps/docs-site/src/components/HeroDemo/__tests__/HeroDemo.test.tsx
```
Expected: FAIL — "Cannot find module '../index'".

- [ ] **Step 3: Implement the component skeleton**

Create `apps/docs-site/src/components/HeroDemo/HeroDemo.module.css`:

```css
.root {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  display: grid;
  place-items: center;
  background: var(--kalyx-surface, #fff);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
}

.frame {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  opacity: 0;
  transition: opacity 300ms ease;
}

.frameActive {
  opacity: 1;
}

.label {
  position: absolute;
  bottom: 1rem;
  left: 1.25rem;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--kalyx-text-muted, #666);
}

.cycleHint {
  position: absolute;
  bottom: 1rem;
  right: 1.25rem;
  font-size: 0.75rem;
  color: var(--kalyx-text-muted, #888);
}
```

Create `apps/docs-site/src/components/HeroDemo/index.tsx`:

```tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './HeroDemo.module.css';
import { FRAME_DURATION_MS, sequence, type HeroFrame } from './sequence';

export type HeroDemoProps = {
  /** Start at a specific frame (used by the recorder). Default 0. */
  initialFrame?: number;
  /** When false, do not advance the frame on a timer (used by the recorder). Default true. */
  autoplay?: boolean;
};

/**
 * Animated 7-frame "seven primitives. one API." hero demo.
 *
 * Default export so it can be wrapped in React.lazy() by the landing page
 * without an extra hop.
 */
export default function HeroDemo({
  initialFrame = 0,
  autoplay = true,
}: HeroDemoProps) {
  const [frame, setFrame] = useState(initialFrame);
  const [paused, setPaused] = useState(false);
  const reduced = usePrefersReducedMotion();
  const frames = useFrames();

  useEffect(() => {
    if (!autoplay || paused || reduced) return;
    const id = setInterval(() => {
      setFrame(f => (f + 1) % sequence.length);
    }, FRAME_DURATION_MS);
    return () => clearInterval(id);
  }, [autoplay, paused, reduced]);

  return (
    <div
      data-testid="hero-demo-root"
      data-frame={frame}
      data-paused={paused || undefined}
      data-reduced-motion={reduced || undefined}
      className={styles.root}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {frames.map((f, i) => (
        <div
          key={f.id}
          data-frame-id={f.id}
          aria-hidden={i !== frame}
          className={`${styles.frame} ${i === frame ? styles.frameActive : ''}`}
        >
          {f.render()}
        </div>
      ))}
      <span data-testid="hero-demo-label" className={styles.label}>
        {sequence[frame].label}
      </span>
      <span className={styles.cycleHint}>seven primitives. one API.</span>
    </div>
  );
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, []);
  return reduced;
}

/**
 * Returns the sequence with real render functions wired in. Memoised so we
 * don't recreate the picker JSX every state change.
 *
 * NOTE: actual picker rendering is added in Task 4. For this skeleton we
 * use a labelled placeholder so the timer/cycle tests pass first.
 */
function useFrames(): HeroFrame[] {
  return useMemo(
    () =>
      sequence.map(f => ({
        ...f,
        render: () => <div data-placeholder-for={f.id}>{f.label}</div>,
      })),
    []
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run:
```bash
pnpm test:run apps/docs-site/src/components/HeroDemo/__tests__/HeroDemo.test.tsx
```
Expected: PASS (5 passing tests).

- [ ] **Step 5: Commit**

```bash
git add apps/docs-site/src/components/HeroDemo/
git commit -m "$(cat <<'EOF'
feat(docs-site): add HeroDemo component with cycle timer

Skeleton component with timer-driven frame cycling, pause-on-hover,
prefers-reduced-motion respect, and initialFrame/autoplay props for
deterministic recording. Picker render bodies are placeholders;
real picker JSX wired in next task.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Wire the 7 real picker render bodies

**Files:**
- Modify: `apps/docs-site/src/components/HeroDemo/index.tsx` (replace the placeholder `useFrames`)

- [ ] **Step 1: Update the test to assert real picker DOM is rendered**

Edit `apps/docs-site/src/components/HeroDemo/__tests__/HeroDemo.test.tsx` and add at the end of the `describe` block:

```tsx
  it('renders a real kalyx DatePicker on frame 0', () => {
    render(<HeroDemo autoplay={false} />);
    // The DatePicker root sets role="combobox" on its trigger button.
    // For the hero we just want to assert the frame contains something
    // resembling the actual kalyx component, not a placeholder.
    const root = screen.getByTestId('hero-demo-root');
    expect(root.querySelector('[data-placeholder-for]')).toBeNull();
    expect(root.querySelector('[data-frame-id="datepicker"]')).not.toBeNull();
  });
```

- [ ] **Step 2: Run the test to verify it fails**

Run:
```bash
pnpm test:run apps/docs-site/src/components/HeroDemo/__tests__/HeroDemo.test.tsx
```
Expected: FAIL on the new test — `[data-placeholder-for]` element still present.

- [ ] **Step 3: Wire in real picker render bodies**

In `apps/docs-site/src/components/HeroDemo/index.tsx`, replace the `useFrames` function with:

```tsx
import {
  DatePicker,
  RangePicker,
  TimePicker,
  DateTimePicker,
  MonthPicker,
  YearPicker,
  WeekPicker,
} from '@kalyx/react';

const FROZEN_NOW = '2026-06-15T00:00:00.000Z';
const FROZEN_RANGE = { start: '2026-06-15T00:00:00.000Z', end: '2026-06-19T00:00:00.000Z' };
const FROZEN_WEEK = { start: '2026-06-14T00:00:00.000Z', end: '2026-06-20T00:00:00.000Z' };
const FROZEN_TIME = '14:30';

function useFrames(): HeroFrame[] {
  return useMemo(
    () => [
      {
        id: 'datepicker',
        label: 'DatePicker',
        render: () => (
          <DatePicker value={FROZEN_NOW} onChange={() => {}}>
            <DatePicker.Popover defaultOpen>
              <DatePicker.Calendar />
            </DatePicker.Popover>
          </DatePicker>
        ),
      },
      {
        id: 'rangepicker',
        label: 'RangePicker',
        render: () => (
          <RangePicker value={FROZEN_RANGE} onChange={() => {}}>
            <RangePicker.Popover defaultOpen>
              <RangePicker.Calendar />
            </RangePicker.Popover>
          </RangePicker>
        ),
      },
      {
        id: 'timepicker',
        label: 'TimePicker',
        render: () => (
          <TimePicker value={FROZEN_TIME} onChange={() => {}} format="12h">
            <TimePicker.HourList />
            <TimePicker.MinuteList />
            <TimePicker.AmPmToggle />
          </TimePicker>
        ),
      },
      {
        id: 'datetimepicker',
        label: 'DateTimePicker',
        render: () => (
          <DateTimePicker value={FROZEN_NOW} onChange={() => {}}>
            <DateTimePicker.Popover defaultOpen>
              <DateTimePicker.Calendar />
              <DateTimePicker.HourList />
              <DateTimePicker.MinuteList />
            </DateTimePicker.Popover>
          </DateTimePicker>
        ),
      },
      {
        id: 'monthpicker',
        label: 'MonthPicker',
        render: () => (
          <MonthPicker value={FROZEN_NOW} onChange={() => {}}>
            <MonthPicker.Popover defaultOpen>
              <MonthPicker.Grid />
            </MonthPicker.Popover>
          </MonthPicker>
        ),
      },
      {
        id: 'yearpicker',
        label: 'YearPicker',
        render: () => (
          <YearPicker value={FROZEN_NOW} onChange={() => {}}>
            <YearPicker.Popover defaultOpen>
              <YearPicker.Grid />
            </YearPicker.Popover>
          </YearPicker>
        ),
      },
      {
        id: 'weekpicker',
        label: 'WeekPicker',
        render: () => (
          <WeekPicker value={FROZEN_WEEK} onChange={() => {}}>
            <WeekPicker.Popover defaultOpen>
              <WeekPicker.Calendar />
            </WeekPicker.Popover>
          </WeekPicker>
        ),
      },
    ],
    []
  );
}
```

Note: the imports for the 7 kalyx components must move to the top of the file. Each picker uses a `defaultOpen` popover (or a flat list for TimePicker) so the recorder captures the open state. If `defaultOpen` is not the correct prop name for these components, check the component API in `packages/react/src/components/<picker>/types.ts` and adjust.

- [ ] **Step 4: Run the test to verify it passes**

Run:
```bash
pnpm test:run apps/docs-site/src/components/HeroDemo/__tests__/HeroDemo.test.tsx
```
Expected: PASS (6 passing tests). If any picker prop name is wrong (e.g., `defaultOpen` doesn't exist on `DatePicker.Popover`), fix it by checking the actual props in `packages/react/src/components/<picker>/index.tsx`.

- [ ] **Step 5: Commit**

```bash
git add apps/docs-site/src/components/HeroDemo/
git commit -m "$(cat <<'EOF'
feat(docs-site): render real kalyx pickers in HeroDemo frames

Each frame now uses the actual @kalyx/react component with a frozen
value so the recorder captures deterministic output.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Recorder route at `/__recorder`

**Files:**
- Create: `apps/docs-site/src/pages/__recorder.tsx`

- [ ] **Step 1: Read the URL query API Docusaurus exposes**

There is no test for this route — it's exercised by the recorder script in Task 7. Inspect `apps/docs-site/src/pages/playground.mdx:28` for the `queryString` pattern Docusaurus already uses (it's just `window.location.search`).

- [ ] **Step 2: Implement the recorder route**

Create `apps/docs-site/src/pages/__recorder.tsx`:

```tsx
import { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import HeroDemo from '../components/HeroDemo';

/**
 * Local-only recorder route. Driven by Playwright in scripts/record-hero.mjs
 * to produce hero-light.webp / hero-dark.webp.
 *
 * Query params:
 *   ?frame=N        — render HeroDemo with initialFrame=N, autoplay=false
 *   ?theme=light|dark — sets [data-theme] on <html> so dark-mode styles apply
 *
 * Hidden from production search engines via noindex meta. Not linked from
 * anywhere in the docs sidebar/nav.
 */
export default function RecorderRoute() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const n = Number(params.get('frame'));
    if (Number.isInteger(n) && n >= 0 && n < 7) {
      setFrame(n);
    }
    const theme = params.get('theme');
    if (theme === 'light' || theme === 'dark') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, []);

  return (
    <Layout
      title="hero recorder (local)"
      noFooter
      wrapperClassName="hero-recorder-page">
      <meta name="robots" content="noindex,nofollow" />
      <div
        style={{
          width: 960,
          height: 540,
          margin: '0 auto',
          padding: 20,
          background: 'var(--ifm-background-color)',
        }}>
        <HeroDemo initialFrame={frame} autoplay={false} />
      </div>
    </Layout>
  );
}
```

- [ ] **Step 3: Verify the route renders in dev**

Run:
```bash
pnpm --filter docs-site start --port 3100
```
Open `http://localhost:3100/__recorder?frame=2&theme=dark` in a browser. Expected: page renders, theme is dark, TimePicker frame is visible (frame 2 in the sequence). Stop the dev server with Ctrl-C.

- [ ] **Step 4: Commit**

```bash
git add apps/docs-site/src/pages/__recorder.tsx
git commit -m "$(cat <<'EOF'
feat(docs-site): add /__recorder route for hero capture

Reads ?frame=N&theme=light|dark, renders HeroDemo deterministically
at the requested frame. noindex meta keeps it out of search; not
linked from any nav surface.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Recorder script — Playwright frame capture

**Files:**
- Create: `scripts/record-hero.mjs`

- [ ] **Step 1: Write the recorder script (skeleton + arg parsing)**

Create `scripts/record-hero.mjs`:

```javascript
#!/usr/bin/env node
/**
 * Capture the HeroDemo as an animated WebP.
 *
 * Usage:
 *   node scripts/record-hero.mjs --theme=light --out=img/hero-light.webp
 *   node scripts/record-hero.mjs --theme=dark  --out=img/hero-dark.webp
 *
 * Prerequisites:
 *   - cwebp installed (Homebrew: `brew install webp`)
 *   - chromium installed (`pnpm exec playwright install chromium`)
 *   - docs-site dev server NOT already running on port 3100
 *
 * The script starts its own docusaurus dev server on port 3100, screenshots
 * each of the 7 frames at 960x540, then pipes the PNGs through cwebp into
 * a single animated WebP (loop=infinite, q=75).
 */

import { spawn, spawnSync } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

const FRAMES = 7;
const FRAME_HOLD_MS = 850;       // must match FRAME_DURATION_MS in sequence.ts
const VIEWPORT = { width: 960, height: 540 };
const DOCS_PORT = 3100;

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
    await waitForPort(DOCS_PORT, 60_000);
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
  const probe = spawnSync('cwebp', ['-version'], { encoding: 'utf-8' });
  if (probe.error || probe.status !== 0) {
    throw new Error(
      'cwebp is required. Install with: brew install webp (macOS) or apt install webp (Linux).'
    );
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
      const res = await fetch(`http://localhost:${port}/__recorder?frame=0`);
      if (res.ok) return;
    } catch { /* still starting */ }
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error(`docs-site did not start on port ${port} within ${timeoutMs}ms`);
}

async function captureFrames(tmpDir) {
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({ viewport: VIEWPORT });
    const page = await ctx.newPage();

    for (let i = 0; i < FRAMES; i++) {
      const url = `http://localhost:${DOCS_PORT}/__recorder?frame=${i}&theme=${theme}`;
      await page.goto(url, { waitUntil: 'networkidle' });
      // Give the picker popovers/lists a moment to settle.
      await page.waitForTimeout(150);
      const file = join(tmpDir, `frame-${String(i).padStart(2, '0')}.png`);
      await page.screenshot({ path: file, type: 'png' });
      console.log(`[record-hero] captured frame ${i}`);
    }
  } finally {
    await browser.close();
  }
}

async function encodeWebp(tmpDir, outAbs) {
  // Build webpmux input: each frame held for FRAME_HOLD_MS, infinite loop.
  // First convert each PNG to a WebP, then combine with webpmux.
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
  const frameArgs = [];
  for (let i = 0; i < FRAMES; i++) {
    const webp = join(tmpDir, `frame-${String(i).padStart(2, '0')}.webp`);
    frameArgs.push('-frame', `${webp}+${FRAME_HOLD_MS}+0+0+1`);
  }
  frameArgs.push('-loop', '0', '-bgcolor', '255,255,255,255');
  frameArgs.push('-o', outAbs);

  const r = spawnSync('webpmux', frameArgs, { encoding: 'utf-8' });
  if (r.status !== 0) {
    throw new Error(`webpmux failed: ${r.stderr}`);
  }
}
```

- [ ] **Step 2: Make the script executable**

Run:
```bash
chmod +x scripts/record-hero.mjs
```

- [ ] **Step 3: Commit (artifact generation in Task 8)**

```bash
git add scripts/record-hero.mjs
git commit -m "$(cat <<'EOF'
feat(scripts): add hero recorder (Playwright + cwebp + webpmux)

Captures 7 frames from /__recorder, encodes each as WebP via cwebp,
combines into an animated WebP via webpmux. Supports --theme=light|dark
and --out=<path>. Manual run only — CI verifies the output artifact,
does not re-record.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: CI freshness check script

**Files:**
- Create: `scripts/check-hero-freshness.mjs`
- Test: `scripts/__tests__/check-hero-freshness.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `scripts/__tests__/check-hero-freshness.test.mjs`:

```javascript
import { describe, expect, it } from 'vitest';
import { evaluate, MAX_BYTES, MAX_AGE_DAYS } from '../check-hero-freshness.mjs';

describe('check-hero-freshness', () => {
  it('passes for a recent, small file', () => {
    const result = evaluate({
      exists: true,
      sizeBytes: 100_000,
      mtimeMs: Date.now() - 5 * 86_400_000,
    });
    expect(result.ok).toBe(true);
  });

  it('fails when file is missing', () => {
    const result = evaluate({ exists: false, sizeBytes: 0, mtimeMs: 0 });
    expect(result.ok).toBe(false);
    expect(result.reasons).toContain('file does not exist');
  });

  it('fails when size exceeds 250 KB', () => {
    const result = evaluate({
      exists: true,
      sizeBytes: MAX_BYTES + 1,
      mtimeMs: Date.now(),
    });
    expect(result.ok).toBe(false);
    expect(result.reasons.some(r => r.includes('exceeds 250 KB'))).toBe(true);
  });

  it('warns (but does not fail) when older than MAX_AGE_DAYS', () => {
    const result = evaluate({
      exists: true,
      sizeBytes: 100_000,
      mtimeMs: Date.now() - (MAX_AGE_DAYS + 1) * 86_400_000,
    });
    expect(result.ok).toBe(true);
    expect(result.warnings.some(w => w.includes('older than'))).toBe(true);
  });

  it('reports MAX_BYTES = 250 * 1024', () => {
    expect(MAX_BYTES).toBe(250 * 1024);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:
```bash
pnpm test:run scripts/__tests__/check-hero-freshness.test.mjs
```
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the script**

Create `scripts/check-hero-freshness.mjs`:

```javascript
#!/usr/bin/env node
/**
 * Verify the hero WebP artifacts:
 *   - both img/hero-light.webp and img/hero-dark.webp exist
 *   - each is <= 250 KB (the spec's size budget)
 *   - warn if older than 90 days (PR-A1 success criterion)
 *
 * Exits with code 1 on any hard failure, 0 (with stderr warning) on a stale
 * artifact. Used by .github/workflows/pr-check.yml.
 *
 * Exports `evaluate` as pure logic so it can be unit-tested without touching
 * the filesystem.
 */

import { existsSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

export const MAX_BYTES = 250 * 1024;
export const MAX_AGE_DAYS = 90;

const FILES = [
  'img/hero-light.webp',
  'img/hero-dark.webp',
];

export function evaluate({ exists, sizeBytes, mtimeMs }) {
  const reasons = [];
  const warnings = [];

  if (!exists) {
    reasons.push('file does not exist');
    return { ok: false, reasons, warnings };
  }

  if (sizeBytes > MAX_BYTES) {
    reasons.push(
      `size ${(sizeBytes / 1024).toFixed(1)} KB exceeds 250 KB budget`
    );
  }

  const ageDays = (Date.now() - mtimeMs) / 86_400_000;
  if (ageDays > MAX_AGE_DAYS) {
    warnings.push(
      `older than ${MAX_AGE_DAYS} days (${ageDays.toFixed(0)} days); regenerate via scripts/record-hero.mjs`
    );
  }

  return { ok: reasons.length === 0, reasons, warnings };
}

function main() {
  let hardFail = false;
  for (const rel of FILES) {
    const abs = resolve(REPO_ROOT, rel);
    const exists = existsSync(abs);
    const stat = exists ? statSync(abs) : { size: 0, mtimeMs: 0 };
    const result = evaluate({
      exists,
      sizeBytes: stat.size,
      mtimeMs: stat.mtimeMs,
    });

    if (!result.ok) {
      hardFail = true;
      console.error(`✗ ${rel}: ${result.reasons.join(', ')}`);
    } else {
      console.log(`✓ ${rel}: ${(stat.size / 1024).toFixed(1)} KB`);
      for (const w of result.warnings) {
        console.warn(`  ⚠ ${rel}: ${w}`);
      }
    }
  }
  process.exit(hardFail ? 1 : 0);
}

// Only run main() when invoked as a script (not when imported by the test).
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run:
```bash
pnpm test:run scripts/__tests__/check-hero-freshness.test.mjs
```
Expected: PASS (5 passing tests).

- [ ] **Step 5: Commit**

```bash
chmod +x scripts/check-hero-freshness.mjs
git add scripts/check-hero-freshness.mjs scripts/__tests__/check-hero-freshness.test.mjs
git commit -m "$(cat <<'EOF'
feat(scripts): add hero WebP freshness/size check for CI

Verifies both hero-light.webp and hero-dark.webp exist and are
<= 250 KB. Warns (does not fail) when older than 90 days.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Generate the actual WebP artifacts

**Files:**
- Create: `img/hero-light.webp` (binary)
- Create: `img/hero-dark.webp` (binary)

- [ ] **Step 1: Generate the light-theme WebP**

Run:
```bash
node scripts/record-hero.mjs --theme=light --out=img/hero-light.webp
```
Expected: script logs `captured frame N` for N=0..6, then `wrote img/hero-light.webp` with a `size: XX.X KB` line where XX.X ≤ 250.

If the script fails because chromium is not installed:
```bash
pnpm exec playwright install chromium --with-deps
```
and retry.

If a frame looks broken in the captured WebP (open via `open img/hero-light.webp`), the most likely cause is a wrong picker prop name in Task 4. Fix the prop in `apps/docs-site/src/components/HeroDemo/index.tsx`, re-run the recorder.

- [ ] **Step 2: Generate the dark-theme WebP**

Run:
```bash
node scripts/record-hero.mjs --theme=dark --out=img/hero-dark.webp
```
Expected: same as light, but dark mode applied.

- [ ] **Step 3: Verify the freshness check accepts the new files**

Run:
```bash
node scripts/check-hero-freshness.mjs
```
Expected:
```
✓ img/hero-light.webp: XX.X KB
✓ img/hero-dark.webp: XX.X KB
```
Exit code 0.

- [ ] **Step 4: Visually inspect both files**

Run:
```bash
open img/hero-light.webp img/hero-dark.webp
```
Expected: macOS Preview opens both, plays the animation. All 7 pickers visible in order, no rendering bugs.

If pickers look mis-styled, root cause is in `HeroDemo.module.css` or the picker render bodies (Task 3/4). Fix and re-run from Step 1.

- [ ] **Step 5: Commit the binary artifacts**

```bash
git add img/hero-light.webp img/hero-dark.webp
git commit -m "$(cat <<'EOF'
chore(img): generate hero-light.webp and hero-dark.webp

7-frame animated WebP cycling through all kalyx pickers, captured
via scripts/record-hero.mjs. Regenerate by running:
  node scripts/record-hero.mjs --theme=light --out=img/hero-light.webp
  node scripts/record-hero.mjs --theme=dark  --out=img/hero-dark.webp

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Swap the README hero `<img>` for a `<picture>` element

**Files:**
- Modify: `README.md`
- Modify: `README.ko.md`

- [ ] **Step 1: Inspect the current README hero**

Run:
```bash
head -10 README.md
```
Expected: the top of the file shows `<img src="./img/main.jpeg" alt="..." width="720" />` inside a centered `<div align="center">` block.

- [ ] **Step 2: Replace `<img>` with `<picture>` in README.md**

Edit `README.md`, replacing the existing hero `<img>` line with:

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./img/hero-dark.webp">
  <img src="./img/hero-light.webp" alt="Kalyx — seven date primitives, one API" width="720">
</picture>
```

The surrounding `<div align="center">` and any sibling content (title, badges) stay intact.

- [ ] **Step 3: Do the same in README.ko.md**

Same edit in `README.ko.md` if it has a hero image. (Inspect first; if it shares the same image, swap to `<picture>` the same way.)

- [ ] **Step 4: Verify the README renders**

Push to a feature branch and view on GitHub.com — the `<picture>` element renders the appropriate variant based on the visitor's GitHub theme. (No local equivalent for GitHub's renderer.)

For local verification:
```bash
ls -la img/hero-light.webp img/hero-dark.webp
```
Expected: both files exist and are < 256000 bytes.

- [ ] **Step 5: Commit**

```bash
git add README.md README.ko.md
git commit -m "$(cat <<'EOF'
docs(readme): replace static hero JPEG with animated WebP picture

<picture> with prefers-color-scheme:dark switches between
hero-light.webp and hero-dark.webp depending on the viewer's
GitHub theme.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: Wire the freshness check into pr-check.yml

**Files:**
- Modify: `.github/workflows/pr-check.yml`

- [ ] **Step 1: Read the current pr-check.yml structure**

Run:
```bash
grep -n "^  [a-z].*:" .github/workflows/pr-check.yml
```
Expected: lists the existing job names (`typecheck`, `lint`, `test`, `build`, `bundle-size`, possibly `all-pass`).

- [ ] **Step 2: Add a `hero-freshness` job**

Edit `.github/workflows/pr-check.yml`. After the `bundle-size` job (and before `all-pass` if present), insert:

```yaml
  hero-freshness:
    name: Hero WebP freshness
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: pnpm/action-setup@v6
      - uses: actions/setup-node@v6
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: node scripts/check-hero-freshness.mjs
```

- [ ] **Step 3: If `all-pass` exists, add `hero-freshness` to its `needs`**

If the workflow has an `all-pass` aggregator job, add `hero-freshness` to its `needs:` list so branch-protection rules see it as required.

- [ ] **Step 4: Validate the workflow syntax**

Run:
```bash
pnpm exec js-yaml .github/workflows/pr-check.yml > /dev/null
```
Expected: no output (valid YAML). If js-yaml is not installed, use any YAML validator (`yq`, `python -c 'import yaml; yaml.safe_load(open("..."))'`).

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/pr-check.yml
git commit -m "$(cat <<'EOF'
ci(pr-check): add hero WebP freshness/size verification

Fails the PR if either hero WebP is missing or > 250 KB.
Warns (does not fail) when artifacts are > 90 days old.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Full unit test suite passes**

Run:
```bash
pnpm test:run
```
Expected: all tests pass, including the new `sequence.test.ts`, `HeroDemo.test.tsx`, and `check-hero-freshness.test.mjs`.

- [ ] **Step 2: Typecheck passes (whole repo + docs-site)**

Run:
```bash
pnpm typecheck
```
Expected: no errors. If `apps/docs-site/tsc` complains about the new `index.tsx` (e.g., missing `@kalyx/react` types), confirm `apps/docs-site` is using the workspace alias.

- [ ] **Step 3: Lint passes**

Run:
```bash
pnpm lint
```
Expected: no errors.

- [ ] **Step 4: docs-site builds**

Run:
```bash
pnpm --filter docs-site build
```
Expected: build completes. `/__recorder` should be in the built sitemap (acceptable — it has `noindex` meta) or excluded if you wired up a programmatic exclusion.

- [ ] **Step 5: Verify success criteria from the spec**

Per `docs/superpowers/specs/2026-06-09-track1-visuals-interactive-comparison-design.md` (A.1 + A.2):

- [ ] Both `img/hero-light.webp` and `img/hero-dark.webp` exist
- [ ] Each ≤ 250 KB (verify via `ls -la img/hero-*.webp` or `node scripts/check-hero-freshness.mjs`)
- [ ] README renders inline on GitHub (push to feature branch, view on github.com)
- [ ] `<picture>` switches based on `prefers-color-scheme` (toggle GitHub theme to verify)
- [ ] `<HeroDemo>` exists, cycles through all 7 pickers (Vitest assertions cover this; defer landing integration to PR-A2)
- [ ] `<HeroDemo>` is the default export (so PR-A2 can `React.lazy()` it cleanly)
- [ ] `@kalyx/react` bundle is unchanged (no library code was modified — only `apps/docs-site` and `scripts/`)

If all check, proceed to PR creation.

- [ ] **Step 6: Open the PR**

Run:
```bash
git log --oneline main..HEAD
```
Expected: 9 new commits (Tasks 2-10).

Run:
```bash
gh pr create --base main --title "feat(track1): PR-A1 — hero animated demo (WebP + HeroDemo component)" --body "$(cat <<'EOF'
## Summary

First PR in Track 1 of the v1.0.0 post-ship roadmap.

- Adds `<HeroDemo>` React component (cycle timer, pause-on-hover, prefers-reduced-motion, frozen-frame mode for recording)
- Adds `/__recorder` local route + `scripts/record-hero.mjs` capture pipeline
- Generates `img/hero-light.webp` and `img/hero-dark.webp` (7-frame animated WebP, ≤ 250 KB each)
- Replaces the static README hero with a `<picture>` element
- Adds `hero-freshness` CI check

Spec: `docs/superpowers/specs/2026-06-09-track1-visuals-interactive-comparison-design.md` (A.1, A.2)
Plan: `docs/superpowers/plans/2026-06-09-track1-pr-a1-hero-demo.md`

The landing page (`apps/docs-site/src/pages/index.tsx`) is NOT modified in this PR — that swap is PR-A2, which depends on `<HeroDemo>` being default-exported (it is).

## Test plan

- [ ] All vitest suites pass (sequence invariants, HeroDemo cycle, freshness script)
- [ ] `pnpm typecheck` and `pnpm lint` pass
- [ ] `pnpm --filter docs-site build` succeeds
- [ ] `node scripts/check-hero-freshness.mjs` exits 0
- [ ] Visually inspect both WebPs in macOS Preview — all 7 pickers visible, no rendering bugs
- [ ] Open the PR's README preview on github.com, toggle theme, confirm `<picture>` swaps correctly

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
Expected: PR URL printed.

---

## Notes for the executor

**If a step fails:** do not skip ahead. Each task's commit is independent — fix the failure in place, re-run the test/build, then re-commit (amend or new commit).

**If a picker render in Task 4 fails because of a wrong prop name:** check the actual props in `packages/react/src/components/<picker>/index.tsx` and adjust. The plan uses `defaultOpen` for popovers; if a different name is used (e.g., `open`, `initialOpen`), substitute it. The TimePicker may not have a Popover — use the flat layout shown in the plan.

**If the recorder script hangs:** most likely cause is the docusaurus dev server not starting in time. Increase `waitForPort` timeout from 60_000 to 120_000.

**If WebP file size exceeds 250 KB:** drop `cwebp -q 75` to `-q 65`. If still too large, reduce viewport from 960×540 to 800×450.

**If `apps/docs-site` does not have its own vitest config:** workspace-root vitest discovers `**/*.test.{ts,tsx}` automatically. No new config needed. Existing `vitest.config.ts:include` covers test files; the coverage `include` explicitly excludes `apps/**`, which is correct (this is presentational code, not library code under the 85% threshold).

**Next plans (not part of this PR):**
- PR-A2 — landing hero swap (small): `docs/superpowers/plans/<future>-track1-pr-a2-landing-swap.md`
- PR-B — sandbox infra + 7 examples: `docs/superpowers/plans/<future>-track1-pr-b-sandbox.md`
- PR-C — playground deltas: `docs/superpowers/plans/<future>-track1-pr-c-playground.md`
- PR-D — comparison page: `docs/superpowers/plans/<future>-track1-pr-d-comparison.md`

Each will be written after the previous one merges.
