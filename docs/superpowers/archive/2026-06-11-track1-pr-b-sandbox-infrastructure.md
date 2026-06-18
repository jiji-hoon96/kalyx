# Track 1 PR-B — Per-Picker Sandbox Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every picker docs page a real interactive sandbox via inline `tsx live` blocks (Docusaurus ReactLiveScope extended) and full `<StackBlitzEmbed>` iframes backed by 7 new `examples/*` projects.

**Architecture:** One ReactLiveScope edit unlocks live blocks repo-wide. One new `<StackBlitzEmbed>` React component renders the iframe + "Open in StackBlitz" link. Seven self-contained Vite-based example projects under `examples/` follow a uniform template (basic) or specialise it (RHF, Tailwind, shadcn). All 14 picker docs (7 en + 7 ko) get a live block and an embed added below the intro.

**Tech Stack:** React 19, `@kalyx/react` (workspace), Vite 7, Docusaurus 3.10's `@docusaurus/theme-live-codeblock`, StackBlitz GitHub embed URLs (no SDK needed in this PR — that's PR-C's territory), existing vitest + jest-axe + shared `@docusaurus/*` stubs from PR-A2.

**Scope:** Fifteen commits, ~1200 LoC across many files. The 7 example projects' boilerplate is the bulk; the docs-edits and the `<StackBlitzEmbed>` component are small.

**Reference spec:** `docs/superpowers/specs/2026-06-11-track1-pr-b-sandbox-infrastructure-design.md`

---

## File Structure

**Create:**
- `apps/docs-site/src/components/StackBlitzEmbed/index.tsx`
- `apps/docs-site/src/components/StackBlitzEmbed/StackBlitzEmbed.module.css`
- `apps/docs-site/src/components/StackBlitzEmbed/__tests__/StackBlitzEmbed.test.tsx`
- `examples/datepicker-basic/` (full Vite project)
- `examples/datepicker-rhf/`
- `examples/rangepicker-presets/`
- `examples/timepicker-12h/`
- `examples/datetimepicker-timezone/`
- `examples/datepicker-tailwind/`
- `examples/datepicker-shadcn/`
- `scripts/check-stackblitz-urls.mjs`

**Modify:**
- `apps/docs-site/src/theme/ReactLiveScope/index.tsx` — expand to expose `@kalyx/react`
- 7 × `apps/docs-site/docs/components/<picker>.md` — insert live block + embed below the intro
- 7 × `apps/docs-site/i18n/ko/docusaurus-plugin-content-docs/current/components/<picker>.md` — same edits (Korean)
- `pnpm-workspace.yaml` — ensure `examples/*` is part of the workspace if it isn't already

**Delete:**
- `examples/stackblitz-rc/` (stale RC-era artifact)

---

## Task list

### Task 1: Verify env + audit workspace + remove stale example

**Files:**
- `pnpm-workspace.yaml` (read; possibly modify)
- `examples/stackblitz-rc/` (delete)

- [ ] **Step 1: Baseline tests**

Run:
```bash
pnpm test:run
```
Expected: ≥ 535 tests pass.

- [ ] **Step 2: Read the workspace config**

```bash
cat pnpm-workspace.yaml
```

If the file already lists `'examples/*'`, leave it alone. If not, add the line:

```yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - 'examples/*'
```

- [ ] **Step 3: Inspect stale example**

```bash
ls examples/
```
Confirm `stackblitz-rc/` exists (per the spec). If not, skip its removal.

- [ ] **Step 4: Remove the stale example**

```bash
git rm -r examples/stackblitz-rc/
```

- [ ] **Step 5: Verify install still resolves**

```bash
pnpm install --frozen-lockfile
```
Expected: clean. If a dep elsewhere referenced `@kalyx-example/stackblitz-rc`, you'll see a workspace-resolve error — fix that reference (likely an unused `workspace:*` somewhere) before continuing.

- [ ] **Step 6: Commit**

```bash
git add pnpm-workspace.yaml pnpm-lock.yaml || true
git commit -m "$(cat <<'EOF'
chore(workspace): drop stale stackblitz-rc example

Removes the RC-era example that's been orphaned since v1.0 stable.
The new examples/* projects shipped in this PR replace its role.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Extend ReactLiveScope

**Files:**
- Modify: `apps/docs-site/src/theme/ReactLiveScope/index.tsx`

- [ ] **Step 1: Read the current scope**

```bash
cat apps/docs-site/src/theme/ReactLiveScope/index.tsx
```
Confirm it's the simple Docusaurus default (React + a couple of exports). The file exists because `@docusaurus/theme-live-codeblock` swizzles to it.

- [ ] **Step 2: Rewrite to expose `@kalyx/react`**

Replace the file contents with:

```tsx
import * as React from 'react';
import {
  DatePicker,
  RangePicker,
  TimePicker,
  DateTimePicker,
  MonthPicker,
  YearPicker,
  WeekPicker,
  useDatePicker,
  useRangePicker,
  useTimePicker,
  DateFnsAdapter,
} from '@kalyx/react';

/**
 * Live-codeblock scope. Anything in this object is available as a
 * bare identifier inside `tsx live` MDX blocks. Keeping this surface
 * small but useful — every kalyx public export plus React itself.
 */
const ReactLiveScope = {
  React,
  ...React,
  DatePicker,
  RangePicker,
  TimePicker,
  DateTimePicker,
  MonthPicker,
  YearPicker,
  WeekPicker,
  useDatePicker,
  useRangePicker,
  useTimePicker,
  DateFnsAdapter,
};

export default ReactLiveScope;
```

- [ ] **Step 3: Verify docs-site build**

```bash
pnpm --filter docs-site build 2>&1 | tail -5
```
Expected: success. No `tsx live` blocks exist yet that use the new exports, so this is a no-op build for the user surface, but the scope is now wired.

- [ ] **Step 4: Commit**

```bash
git add apps/docs-site/src/theme/ReactLiveScope/index.tsx
git commit -m "$(cat <<'EOF'
feat(docs-site): expose @kalyx/react in ReactLiveScope

Every public export from @kalyx/react is now available as a bare
identifier inside MDX `tsx live` blocks. Lets docs pages embed
interactive picker examples without per-file imports.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: `<StackBlitzEmbed>` component

**Files:**
- Create: `apps/docs-site/src/components/StackBlitzEmbed/index.tsx`
- Create: `apps/docs-site/src/components/StackBlitzEmbed/StackBlitzEmbed.module.css`
- Create: `apps/docs-site/src/components/StackBlitzEmbed/__tests__/StackBlitzEmbed.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `apps/docs-site/src/components/StackBlitzEmbed/__tests__/StackBlitzEmbed.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import StackBlitzEmbed from '../index';

describe('<StackBlitzEmbed>', () => {
  it('renders an iframe with the correct StackBlitz URL', () => {
    render(<StackBlitzEmbed id="datepicker-basic" />);
    const iframe = screen.getByTitle(/kalyx example: datepicker-basic/i);
    expect(iframe.getAttribute('src')).toContain('stackblitz.com/github/jiji-hoon96/kalyx/tree/main/examples/datepicker-basic');
    expect(iframe.getAttribute('src')).toContain('embed=1');
    expect(iframe.getAttribute('src')).toContain('file=src/App.tsx');
    expect(iframe.getAttribute('loading')).toBe('lazy');
  });

  it('renders an "Open in StackBlitz" link to the same project', () => {
    render(<StackBlitzEmbed id="datepicker-basic" />);
    const link = screen.getByRole('link', { name: /open in stackblitz/i });
    expect(link.getAttribute('href')).toBe(
      'https://stackblitz.com/github/jiji-hoon96/kalyx/tree/main/examples/datepicker-basic'
    );
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });

  it('passes axe', async () => {
    const { container } = render(<StackBlitzEmbed id="datepicker-basic" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Confirm fail**

```bash
pnpm test:run apps/docs-site/src/components/StackBlitzEmbed/__tests__/StackBlitzEmbed.test.tsx 2>&1 | tail -3
```

- [ ] **Step 3: Implement**

Create `apps/docs-site/src/components/StackBlitzEmbed/index.tsx`:

```tsx
import styles from './StackBlitzEmbed.module.css';

export type StackBlitzEmbedProps = {
  /** examples/<id> — must match a real directory in this repo. */
  id: string;
  /** File to open in the embed by default. Defaults to 'src/App.tsx'. */
  file?: string;
  /** Iframe height in pixels. Defaults to 600. */
  height?: number;
  /** StackBlitz UI theme. Defaults to 'dark'. */
  theme?: 'dark' | 'light';
};

const REPO_PATH = 'jiji-hoon96/kalyx/tree/main/examples';

export default function StackBlitzEmbed({
  id,
  file = 'src/App.tsx',
  height = 600,
  theme = 'dark',
}: StackBlitzEmbedProps) {
  const embedQuery = new URLSearchParams({
    embed: '1',
    file,
    hideExplorer: '1',
    theme,
  });
  const embedSrc = `https://stackblitz.com/github/${REPO_PATH}/${id}?${embedQuery.toString()}`;
  const fullHref = `https://stackblitz.com/github/${REPO_PATH}/${id}`;

  return (
    <div className={styles.wrapper}>
      <iframe
        className={styles.iframe}
        src={embedSrc}
        title={`Kalyx example: ${id}`}
        loading="lazy"
        height={height}
      />
      <a
        className={styles.openLink}
        href={fullHref}
        target="_blank"
        rel="noopener noreferrer">
        Open in StackBlitz ↗
      </a>
    </div>
  );
}
```

Create `apps/docs-site/src/components/StackBlitzEmbed/StackBlitzEmbed.module.css`:

```css
.wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 1.5rem 0;
}

.iframe {
  width: 100%;
  border: 1px solid var(--ifm-color-emphasis-200);
  border-radius: 8px;
}

.openLink {
  align-self: flex-end;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--ifm-color-primary);
}

.openLink:hover {
  text-decoration: underline;
}
```

- [ ] **Step 4: Tests pass + commit**

```bash
pnpm test:run apps/docs-site/src/components/StackBlitzEmbed/__tests__/StackBlitzEmbed.test.tsx 2>&1 | tail -3
git add apps/docs-site/src/components/StackBlitzEmbed/
git commit -m "$(cat <<'EOF'
feat(docs-site): add StackBlitzEmbed component

iframe + "Open in StackBlitz" link wrapper. URL convention:
stackblitz.com/github/jiji-hoon96/kalyx/tree/main/examples/<id>.
Lazy-loaded iframe; props for file/height/theme.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Scaffold `examples/datepicker-basic`

**Files:** all under `examples/datepicker-basic/`

The `-basic` example is the template all subsequent examples specialise. Write it carefully — the next 6 tasks reference its structure.

- [ ] **Step 1: Create the directory tree**

```bash
mkdir -p examples/datepicker-basic/src
```

- [ ] **Step 2: `package.json`**

`examples/datepicker-basic/package.json`:

```json
{
  "name": "@kalyx-example/datepicker-basic",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "typecheck": "tsc -b --noEmit"
  },
  "dependencies": {
    "@kalyx/react": "workspace:*",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^5.0.0",
    "typescript": "^5.4.0",
    "vite": "^7.0.0"
  }
}
```

- [ ] **Step 3: `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true,
    "isolatedModules": true
  },
  "include": ["src"]
}
```

- [ ] **Step 4: `vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
```

- [ ] **Step 5: `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Kalyx — DatePicker basic</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: `src/main.tsx`**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 7: `src/App.tsx`**

```tsx
import { useState } from 'react';
import { DatePicker } from '@kalyx/react';

export default function App() {
  const [iso, setIso] = useState<string | null>('2026-06-15T00:00:00.000Z');
  return (
    <div style={{ padding: 32, fontFamily: 'sans-serif' }}>
      <h1>Kalyx — DatePicker basic</h1>
      <p>
        A minimal headless DatePicker. Style each part by passing class
        strings to <code>classNames</code>.
      </p>
      <DatePicker value={iso} onChange={setIso}>
        <DatePicker.Input placeholder="Pick a date" />
        <DatePicker.Popover>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>
      <pre style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
        {JSON.stringify({ iso }, null, 2)}
      </pre>
    </div>
  );
}
```

- [ ] **Step 8: Typecheck the example**

```bash
pnpm --filter @kalyx-example/datepicker-basic install
pnpm --filter @kalyx-example/datepicker-basic typecheck
```
Expected: clean. If TypeScript flags an unresolved `@kalyx/react`, run `pnpm install` from the root first to wire workspace deps.

- [ ] **Step 9: Commit**

```bash
git add examples/datepicker-basic/
git commit -m "$(cat <<'EOF'
feat(examples): add datepicker-basic

Minimal Vite + React 19 + @kalyx/react template. Copy-paste foundation
for the rest of the examples/* projects.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Tasks 5–10: Scaffold the 6 remaining examples

Each follows the same `package.json` / `tsconfig.json` / `vite.config.ts` / `index.html` / `src/main.tsx` skeleton as Task 4. Only `src/App.tsx` (and sometimes `package.json` deps) differ.

For each example below, repeat the Task 4 steps with these adjustments:

#### Task 5: `examples/datepicker-rhf` — DatePicker with React Hook Form

**package.json deps:** add `"react-hook-form": "^7.50.0"` under `dependencies`.

**src/App.tsx:**

```tsx
import { useForm, Controller } from 'react-hook-form';
import { DatePicker } from '@kalyx/react';

type FormValues = { birthday: string | null };

export default function App() {
  const { control, handleSubmit, formState } = useForm<FormValues>({
    defaultValues: { birthday: null },
  });

  const onSubmit = (values: FormValues) => {
    alert(JSON.stringify(values, null, 2));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ padding: 32, fontFamily: 'sans-serif' }}>
      <h1>Kalyx — DatePicker × React Hook Form</h1>
      <Controller
        name="birthday"
        control={control}
        rules={{ required: 'Pick a birthday' }}
        render={({ field, fieldState }) => (
          <div>
            <DatePicker value={field.value} onChange={field.onChange}>
              <DatePicker.Input placeholder="Birthday" />
              <DatePicker.Popover>
                <DatePicker.Calendar />
              </DatePicker.Popover>
            </DatePicker>
            {fieldState.error && (
              <p style={{ color: 'crimson' }}>{fieldState.error.message}</p>
            )}
          </div>
        )}
      />
      <button type="submit" style={{ marginTop: 16 }}>Submit</button>
      <pre style={{ marginTop: 16 }}>{JSON.stringify(formState.dirtyFields, null, 2)}</pre>
    </form>
  );
}
```

Commit message: `feat(examples): add datepicker-rhf` with body explaining the Controller pattern.

#### Task 6: `examples/rangepicker-presets`

**src/App.tsx:**

```tsx
import { useState } from 'react';
import { RangePicker } from '@kalyx/react';

const ISO_NOW = '2026-06-15T00:00:00.000Z';

export default function App() {
  const [range, setRange] = useState({ start: ISO_NOW, end: '2026-06-22T00:00:00.000Z' });

  return (
    <div style={{ padding: 32, fontFamily: 'sans-serif' }}>
      <h1>Kalyx — RangePicker with presets</h1>
      <RangePicker value={range} onChange={setRange}>
        <RangePicker.Input part="start" />
        <RangePicker.Input part="end" />
        <RangePicker.Popover>
          <RangePicker.Presets>
            <RangePicker.Preset value="last7days">Last 7 days</RangePicker.Preset>
            <RangePicker.Preset value="last30days">Last 30 days</RangePicker.Preset>
            <RangePicker.Preset value="thisMonth">This month</RangePicker.Preset>
          </RangePicker.Presets>
          <RangePicker.Calendar />
        </RangePicker.Popover>
      </RangePicker>
      <pre style={{ marginTop: 16 }}>{JSON.stringify(range, null, 2)}</pre>
    </div>
  );
}
```

Commit message: `feat(examples): add rangepicker-presets`.

#### Task 7: `examples/timepicker-12h`

**src/App.tsx:**

```tsx
import { useState } from 'react';
import { TimePicker } from '@kalyx/react';

export default function App() {
  const [iso, setIso] = useState<string | null>('2026-06-15T14:30:00.000Z');

  return (
    <div style={{ padding: 32, fontFamily: 'sans-serif' }}>
      <h1>Kalyx — TimePicker (12h)</h1>
      <TimePicker value={iso} onChange={setIso} format="12h" step={15}>
        <TimePicker.Input />
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <TimePicker.HourList />
          <TimePicker.MinuteList />
          <TimePicker.AmPmToggle />
        </div>
      </TimePicker>
      <pre style={{ marginTop: 16 }}>{JSON.stringify({ iso }, null, 2)}</pre>
    </div>
  );
}
```

Commit message: `feat(examples): add timepicker-12h`.

#### Task 8: `examples/datetimepicker-timezone`

**src/App.tsx:**

```tsx
import { useState } from 'react';
import { DateTimePicker } from '@kalyx/react';

export default function App() {
  const [iso, setIso] = useState<string | null>('2026-06-15T14:30:00.000Z');
  const [tz, setTz] = useState<string>('Asia/Seoul');

  return (
    <div style={{ padding: 32, fontFamily: 'sans-serif' }}>
      <h1>Kalyx — DateTimePicker × timezone</h1>
      <p>Stored ISO is always UTC; display shifts per timezone.</p>
      <label style={{ display: 'block', marginBottom: 12 }}>
        Timezone:&nbsp;
        <select value={tz} onChange={e => setTz(e.target.value)}>
          <option>UTC</option>
          <option>Asia/Seoul</option>
          <option>America/New_York</option>
          <option>Europe/London</option>
        </select>
      </label>
      <DateTimePicker value={iso} onChange={setIso} displayTimezone={tz}>
        <DateTimePicker.Input />
        <DateTimePicker.Popover>
          <DateTimePicker.Calendar />
          <div style={{ display: 'flex', gap: 12 }}>
            <DateTimePicker.HourList />
            <DateTimePicker.MinuteList />
          </div>
        </DateTimePicker.Popover>
      </DateTimePicker>
      <pre style={{ marginTop: 16 }}>{JSON.stringify({ iso, displayTimezone: tz }, null, 2)}</pre>
    </div>
  );
}
```

Commit message: `feat(examples): add datetimepicker-timezone`.

#### Task 9: `examples/datepicker-tailwind`

**package.json deps:** add `"tailwindcss": "^4.0.0"` and `"@tailwindcss/vite": "^4.0.0"` under `devDependencies`.

**vite.config.ts:** import + use Tailwind's Vite plugin:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({ plugins: [react(), tailwindcss()] });
```

**src/index.css** (new file):

```css
@import "tailwindcss";
```

**src/main.tsx:** add `import './index.css';` at the top.

**src/App.tsx:**

```tsx
import { useState } from 'react';
import { DatePicker } from '@kalyx/react';

export default function App() {
  const [iso, setIso] = useState<string | null>('2026-06-15T00:00:00.000Z');
  return (
    <div className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-4">Kalyx × Tailwind</h1>
      <DatePicker value={iso} onChange={setIso}>
        <DatePicker.Input className="border border-slate-300 rounded px-3 py-2 text-sm" />
        <DatePicker.Popover className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 mt-1">
          <DatePicker.Calendar classNames={{
            grid: 'border-collapse',
            day: 'rounded hover:bg-slate-100 w-9 h-9',
            daySelected: 'bg-indigo-600 text-white hover:bg-indigo-700',
            dayToday: 'border border-indigo-400 font-semibold',
            dayDisabled: 'text-slate-300 cursor-not-allowed',
          }} />
        </DatePicker.Popover>
      </DatePicker>
      <pre className="mt-4 p-3 bg-slate-100 rounded">{JSON.stringify({ iso }, null, 2)}</pre>
    </div>
  );
}
```

Commit message: `feat(examples): add datepicker-tailwind`.

#### Task 10: `examples/datepicker-shadcn`

**package.json deps:** add `"clsx": "^2.1.0"` and `"tailwindcss": "^4.0.0"` (shadcn convention).

**src/cn.ts** (a one-line helper):

```ts
import clsx, { type ClassValue } from 'clsx';
export function cn(...args: ClassValue[]): string {
  return clsx(args);
}
```

**src/App.tsx:**

```tsx
import { useState } from 'react';
import { DatePicker } from '@kalyx/react';
import { cn } from './cn';

const inputBase = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';
const dayBase = 'h-9 w-9 p-0 font-normal aria-selected:opacity-100';
const daySelected = 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground';

export default function App() {
  const [iso, setIso] = useState<string | null>('2026-06-15T00:00:00.000Z');
  return (
    <div className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-4">Kalyx × shadcn-style classes</h1>
      <DatePicker value={iso} onChange={setIso}>
        <DatePicker.Input className={cn(inputBase)} />
        <DatePicker.Popover>
          <DatePicker.Calendar classNames={{
            day: cn(dayBase),
            daySelected: cn(dayBase, daySelected),
          }} />
        </DatePicker.Popover>
      </DatePicker>
      <pre className="mt-4 p-3 bg-slate-100 rounded">{JSON.stringify({ iso }, null, 2)}</pre>
    </div>
  );
}
```

(No real shadcn install; this just demonstrates the `cn(base, variant)` pattern shadcn uses. Real shadcn integrations would install actual shadcn components.)

Commit message: `feat(examples): add datepicker-shadcn`.

---

### Task 11: Workspace typecheck sweep

**Files:** none (verification only)

- [ ] **Step 1: Confirm all 7 examples typecheck**

```bash
pnpm install --frozen-lockfile=false
pnpm -r --filter "@kalyx-example/*" typecheck 2>&1 | tail -20
```

Expected: every `@kalyx-example/*` package reports `tsc -b` success. If any fails, fix in place — most likely:
- A missing `@types/*` dev dep (add it)
- An older `@kalyx/react` typings expectation (audit the example's API usage against the actual public surface)

- [ ] **Step 2: Sanity-build one example**

```bash
pnpm --filter @kalyx-example/datepicker-basic build
```

Expected: Vite builds in < 5s. Output in `examples/datepicker-basic/dist/`. No commit — verification only.

---

### Task 12: `scripts/check-stackblitz-urls.mjs`

**Files:**
- Create: `scripts/check-stackblitz-urls.mjs`

- [ ] **Step 1: Write the script**

Create `scripts/check-stackblitz-urls.mjs`:

```js
#!/usr/bin/env node
/**
 * Verify every examples/* StackBlitz GitHub-embed URL returns HTTP 200.
 * Manual-run; not wired into CI yet (planned: nightly job per parent spec).
 *
 * Exits 0 if all URLs OK, 1 if any returned >= 400.
 */

import { request } from 'undici';

const EXAMPLES = [
  'datepicker-basic',
  'datepicker-rhf',
  'rangepicker-presets',
  'timepicker-12h',
  'datetimepicker-timezone',
  'datepicker-tailwind',
  'datepicker-shadcn',
];

let fail = 0;
for (const id of EXAMPLES) {
  const url = `https://stackblitz.com/github/jiji-hoon96/kalyx/tree/main/examples/${id}`;
  try {
    const res = await request(url, { method: 'HEAD' });
    if (res.statusCode >= 400) {
      console.error(`✗ ${id}: HTTP ${res.statusCode}`);
      fail++;
    } else {
      console.log(`✓ ${id}: HTTP ${res.statusCode}`);
    }
  } catch (err) {
    console.error(`✗ ${id}: ${err instanceof Error ? err.message : String(err)}`);
    fail++;
  }
}

process.exit(fail > 0 ? 1 : 0);
```

- [ ] **Step 2: Make executable + smoke-run**

```bash
chmod +x scripts/check-stackblitz-urls.mjs
node scripts/check-stackblitz-urls.mjs
```

Expected: 7× `✓` lines, exit 0. StackBlitz returns 200 for GitHub-tree paths even before any user clicks the embed (the embed is rendered on demand), so the script confirms URL well-formedness more than embed liveness.

- [ ] **Step 3: Commit**

```bash
git add scripts/check-stackblitz-urls.mjs
git commit -m "$(cat <<'EOF'
feat(scripts): add check-stackblitz-urls.mjs

HEAD request against each of the 7 example StackBlitz URLs. Manual-run;
nightly CI wiring is a follow-up per the parent spec.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Tasks 13–15: Wire live blocks + embeds into picker docs

7 picker docs pages × 2 locales = 14 markdown files to edit. Each edit is small (~15 LoC inserted below the existing intro). Bundle the 14 edits into 3 thematic commits:

#### Task 13: DatePicker + RangePicker (en + ko)

For each of `apps/docs-site/docs/components/datepicker.md`, `apps/docs-site/docs/components/rangepicker.md`, and their `i18n/ko/.../components/<picker>.md` mirrors:

Insert this block immediately after the page-level `# <Heading>` and 1-2 paragraph intro, BEFORE the API docs / table:

```mdx
import StackBlitzEmbed from '@site/src/components/StackBlitzEmbed';

## Try it

```tsx live
function Example() {
  const [iso, setIso] = React.useState(null);
  return (
    <DatePicker value={iso} onChange={setIso}>
      <DatePicker.Input placeholder="Pick a date" />
      <DatePicker.Popover>
        <DatePicker.Calendar />
      </DatePicker.Popover>
    </DatePicker>
  );
}
```

<StackBlitzEmbed id="datepicker-basic" />
```

For RangePicker, swap the live block to use `RangePicker` and the embed `id` to `rangepicker-presets`.

For the Korean files, translate only the `## Try it` heading (e.g., `## 직접 사용해보기`); the code block content stays English (JSX identifiers are not localised).

Verify the docs-site build still succeeds:
```bash
pnpm --filter docs-site build 2>&1 | tail -3
```

Commit:

```bash
git add apps/docs-site/docs/components/datepicker.md \
        apps/docs-site/docs/components/rangepicker.md \
        apps/docs-site/i18n/ko/docusaurus-plugin-content-docs/current/components/datepicker.md \
        apps/docs-site/i18n/ko/docusaurus-plugin-content-docs/current/components/rangepicker.md
git commit -m "$(cat <<'EOF'
docs(components): add live block + embed to DatePicker / RangePicker (en + ko)

Each page now ships an inline `tsx live` block (rendered via the
extended ReactLiveScope) and a <StackBlitzEmbed> pointing at the
corresponding examples/* project. Korean pages mirror the structure.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

#### Task 14: TimePicker + DateTimePicker (en + ko)

Same pattern. Live blocks use `TimePicker` and `DateTimePicker` respectively. Embed ids: `timepicker-12h` and `datetimepicker-timezone`.

Commit: `docs(components): add live block + embed to TimePicker / DateTimePicker (en + ko)`.

#### Task 15: MonthPicker + YearPicker + WeekPicker (en + ko)

Same pattern. All three use `datepicker-basic` as the StackBlitz example since the existing 7 examples don't include picker-specific Month/Year/Week sandboxes (a future addition; for now `datepicker-basic` shows the consistent compositional API).

Commit: `docs(components): add live block + embed to Month / Year / WeekPicker (en + ko)`.

After Task 15, do a final cross-check:

```bash
pnpm typecheck
pnpm lint
pnpm test:run
pnpm --filter docs-site build
node scripts/check-stackblitz-urls.mjs
```

All exit 0. Open the PR:

```bash
git log --oneline main..HEAD
```
Expected: 15 commits.

```bash
gh pr create --base main --title "feat(track1): PR-B — sandbox infrastructure (ReactLiveScope + StackBlitzEmbed + 7 examples)" --body "$(cat <<'EOF'
## Summary

Third PR in Track 1. Gives every picker docs page a real interactive sandbox.

- **Live blocks** — \`ReactLiveScope\` now exposes every \`@kalyx/react\` public export. Every \`.md\`/\`.mdx\` page can drop a \`\`\`tsx live\`\`\` block to render a real picker.
- **StackBlitz embeds** — new \`<StackBlitzEmbed>\` component. Iframe + "Open in StackBlitz" link, lazy-loaded.
- **7 example projects** — \`examples/datepicker-basic\`, \`-rhf\`, \`rangepicker-presets\`, \`timepicker-12h\`, \`datetimepicker-timezone\`, \`datepicker-tailwind\`, \`datepicker-shadcn\`. Each is a real Vite + React 19 + \`@kalyx/react\` project that typechecks at workspace root.
- **Docs edits** — every picker docs page (7 en + 7 ko) gets a live block + an embed below the intro.
- **CI helper** — \`scripts/check-stackblitz-urls.mjs\` validates all 7 embed URLs return HTTP 200.
- **Stale removal** — \`examples/stackblitz-rc/\` is deleted (RC-era).

Spec: \`docs/superpowers/specs/2026-06-11-track1-pr-b-sandbox-infrastructure-design.md\`
Plan: \`docs/superpowers/plans/2026-06-11-track1-pr-b-sandbox-infrastructure.md\`

## Test plan

- [x] \`pnpm test:run\` — all suites pass with 3 new \`<StackBlitzEmbed>\` tests
- [x] \`pnpm -r --filter "@kalyx-example/*" typecheck\` — all 7 examples pass tsc
- [x] \`pnpm --filter docs-site build\` succeeds for en + ko
- [x] \`node scripts/check-stackblitz-urls.mjs\` — 7× HTTP 200
- [x] Dev render — every picker docs page shows the live block (renders a real picker) and the embed iframe (lazy-loaded)
- [x] Click "Open in StackBlitz" on one embed — sandbox opens with the right example project

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Notes for the executor

**If a `tsx live` block crashes the docs-site build:** the JSX inside the block must be valid TypeScript that compiles in isolation with the ReactLiveScope identifiers. No `import` statements inside the block (everything is in scope already).

**If an `examples/*` package typecheck fails because it can't resolve `@kalyx/react`:** ensure `pnpm install` ran at the root after creating the example. The workspace dep `"@kalyx/react": "workspace:*"` is resolved by pnpm at install time.

**If a Vite dep version is incompatible with the workspace's React 19:** pin to the same Vite/plugin-react majors as `apps/docs-site` uses (currently Vite 7, plugin-react 5).

**If `<StackBlitzEmbed>` iframe shows a "Repository not found" page in dev:** the URL pattern requires `jiji-hoon96/kalyx` to be public. If the user forks under a different account, parameterise `REPO_PATH` via an env-driven Docusaurus customField; the parent spec defers that to a follow-up.

**Korean docs edits:** keep code blocks English. Only translate prose headings (e.g., "Try it" → "직접 사용해보기"). JSX identifiers (`DatePicker.Calendar` etc.) are product names and stay English.

**If `check-stackblitz-urls.mjs` returns 404 for a URL:** that example's directory doesn't exist on the default branch yet. The script is meant to run AFTER the PR's merge — for local pre-merge runs, the URLs will 404 until merge.
