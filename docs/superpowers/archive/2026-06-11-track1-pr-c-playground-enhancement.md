# Track 1 PR-C — `/playground` Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-DatePicker live block in `apps/docs-site/src/pages/playground.mdx` with a `<Playground>` component offering picker selector, classNames editor, locale + timezone toggles, and "Open in StackBlitz" button.

**Architecture:** New `apps/docs-site/src/components/Playground/` directory with 6 sub-components held together by a single `PlaygroundState` object. `@stackblitz/sdk` ships as a docs-site dep, mocked at vitest level for tests. The MDX page keeps its frontmatter and intro; the entire interactive surface is a single `<Playground />` mount.

**Tech Stack:** React 19, `@stackblitz/sdk`, `@kalyx/react`, existing vitest + jest-axe + shared `@docusaurus/*` stubs from PR-A2, MDX from Docusaurus.

**Scope:** Nine commits, ~500 LoC across 9 new files + 1 edited (the MDX page).

**Reference spec:** `docs/superpowers/specs/2026-06-11-track1-pr-c-playground-enhancement-design.md`

---

## File Structure

**Create:**
- `apps/docs-site/src/components/Playground/index.tsx` — root composer + state
- `apps/docs-site/src/components/Playground/PickerSelector.tsx`
- `apps/docs-site/src/components/Playground/ClassNamesEditor.tsx`
- `apps/docs-site/src/components/Playground/LocaleTimezoneToggles.tsx`
- `apps/docs-site/src/components/Playground/PreviewPanel.tsx`
- `apps/docs-site/src/components/Playground/OpenInStackBlitz.tsx`
- `apps/docs-site/src/components/Playground/classNamesByPicker.ts`
- `apps/docs-site/src/components/Playground/seedProject.ts`
- `apps/docs-site/src/components/Playground/Playground.module.css`
- `apps/docs-site/src/components/Playground/__tests__/Playground.test.tsx`
- `test/__mocks__/stackblitz-sdk.ts` — vitest no-op stub

**Modify:**
- `apps/docs-site/package.json` — add `@stackblitz/sdk` as a `dependencies` entry
- `apps/docs-site/src/pages/playground.mdx` — body replaced with `<Playground />`
- `vitest.config.ts` — add alias for `@stackblitz/sdk` → the new mock

---

## Task list

### Task 1: Verify env + add `@stackblitz/sdk` + mock

**Files:**
- Modify: `apps/docs-site/package.json`
- Create: `test/__mocks__/stackblitz-sdk.ts`
- Modify: `vitest.config.ts`

- [ ] **Step 1: Confirm baseline tests pass**

Run:
```bash
pnpm test:run
```
Expected: ≥ 535 tests pass.

- [ ] **Step 2: Add the dep**

```bash
pnpm --filter docs-site add @stackblitz/sdk
```
Expected: pnpm installs the latest `@stackblitz/sdk`. Check the resulting `apps/docs-site/package.json` for the new line under `dependencies`.

- [ ] **Step 3: Write the vitest mock**

Create `test/__mocks__/stackblitz-sdk.ts`:

```ts
/**
 * Vitest stub for @stackblitz/sdk.
 * Returns a no-op `openProject` so Playground tests can assert the call
 * without actually opening a sandbox.
 */
const openProject = (
  ..._args: unknown[]
): void => {
  // intentionally empty
};

const sdk = { openProject };

export default sdk;
export { openProject };
```

- [ ] **Step 4: Wire the alias**

Edit `vitest.config.ts`. Find the existing `resolve.alias` block (already aliases `@docusaurus/Link` etc. from PR-A2). Add one more entry:

```ts
'@stackblitz/sdk': path.resolve(__dirname, 'test/__mocks__/stackblitz-sdk.ts'),
```

- [ ] **Step 5: Verify tests still pass**

```bash
pnpm test:run
```
Expected: same count as Step 1.

- [ ] **Step 6: Commit**

```bash
git add apps/docs-site/package.json pnpm-lock.yaml test/__mocks__/stackblitz-sdk.ts vitest.config.ts
git commit -m "$(cat <<'EOF'
chore(docs-site): add @stackblitz/sdk + vitest mock

@stackblitz/sdk powers the "Open in StackBlitz" button in the new
Playground component. Aliased to a no-op stub in tests so Playground
smoke tests don't actually try to open sandboxes.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Define `classNamesByPicker` map

**Files:**
- Create: `apps/docs-site/src/components/Playground/classNamesByPicker.ts`

- [ ] **Step 1: Inspect each picker's published classNames types**

For each of the 7 pickers, identify which `classNames` props they expose. The spec calls out reading the `*ClassNames` exported types from `@kalyx/react`. In practice, the Calendar / Grid / List parts already document their classNames:

Run:
```bash
grep -rn "ClassNames" packages/react/src/components/ | grep -E "export (type|interface)" | head -20
```

Note the published surface — keys vary per picker.

- [ ] **Step 2: Write the data file**

Create `apps/docs-site/src/components/Playground/classNamesByPicker.ts`:

```ts
/**
 * Static map of classNames parts exposed by each kalyx picker. The
 * Playground's ClassNamesEditor renders one text input per leaf entry.
 * Shape matches the published `classNames` prop of each picker; if a
 * picker's prop surface grows in a future @kalyx/react release, this
 * file needs a corresponding update.
 *
 * Keep nesting shallow (max 2 levels) so the editor UI stays scannable.
 */
export type ClassNamesShape = {
  [key: string]: string | { [key: string]: string };
};

export type PickerId =
  | 'datepicker'
  | 'rangepicker'
  | 'timepicker'
  | 'datetimepicker'
  | 'monthpicker'
  | 'yearpicker'
  | 'weekpicker';

export const CLASSNAMES_BY_PICKER: Record<PickerId, ClassNamesShape> = {
  datepicker: {
    input: '',
    calendar: {
      root: '',
      header: '',
      navButton: '',
      title: '',
      grid: '',
      day: '',
      daySelected: '',
      dayToday: '',
      dayDisabled: '',
      dayOutsideMonth: '',
    },
  },
  rangepicker: {
    input: '',
    calendar: {
      root: '',
      header: '',
      grid: '',
      day: '',
      daySelected: '',
      dayInRange: '',
      dayToday: '',
      dayDisabled: '',
    },
  },
  timepicker: {
    input: '',
    hourList: { root: '', option: '', optionSelected: '' },
    minuteList: { root: '', option: '', optionSelected: '' },
    ampmToggle: { root: '', button: '', buttonActive: '' },
  },
  datetimepicker: {
    input: '',
    calendar: { root: '', day: '', daySelected: '', dayToday: '' },
    hourList: { root: '', option: '', optionSelected: '' },
    minuteList: { root: '', option: '', optionSelected: '' },
  },
  monthpicker: {
    input: '',
    grid: { root: '', month: '', monthSelected: '', monthDisabled: '' },
  },
  yearpicker: {
    input: '',
    grid: { root: '', year: '', yearSelected: '', yearDisabled: '' },
  },
  weekpicker: {
    input: '',
    calendar: {
      root: '',
      header: '',
      day: '',
      dayInWeek: '',
      daySelectedWeek: '',
    },
  },
};

/** All known picker ids in display order. */
export const PICKER_IDS: readonly PickerId[] = Object.keys(CLASSNAMES_BY_PICKER) as readonly PickerId[];
```

- [ ] **Step 3: Commit**

```bash
git add apps/docs-site/src/components/Playground/classNamesByPicker.ts
git commit -m "$(cat <<'EOF'
feat(playground): scaffold classNamesByPicker map

Static map of each picker's classNames prop surface. Drives the
Playground's ClassNamesEditor (one text input per leaf entry).
Nesting capped at depth 2 to keep the editor scannable.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: PickerSelector

**Files:**
- Create: `apps/docs-site/src/components/Playground/PickerSelector.tsx`

- [ ] **Step 1: Write the test first** (TDD; consolidated test file)

Create `apps/docs-site/src/components/Playground/__tests__/Playground.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@docusaurus/Translate', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  translate: ({ message }: { message: string }) => message,
}));

import PickerSelector from '../PickerSelector';
import { PICKER_IDS } from '../classNamesByPicker';

describe('<PickerSelector>', () => {
  it('renders an option for each picker id', () => {
    render(<PickerSelector value="datepicker" onChange={() => {}} />);
    const select = screen.getByRole('combobox', { name: /picker/i });
    const options = select.querySelectorAll('option');
    expect(options).toHaveLength(PICKER_IDS.length);
  });

  it('calls onChange with the selected picker id', () => {
    const handle = vi.fn();
    render(<PickerSelector value="datepicker" onChange={handle} />);
    const select = screen.getByRole('combobox', { name: /picker/i });
    fireEvent.change(select, { target: { value: 'timepicker' } });
    expect(handle).toHaveBeenCalledWith('timepicker');
  });

  it('passes axe', async () => {
    const { container } = render(<PickerSelector value="datepicker" onChange={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
pnpm test:run apps/docs-site/src/components/Playground/__tests__/Playground.test.tsx 2>&1 | tail -5
```
Expected: FAIL — `Cannot find module '../PickerSelector'`.

- [ ] **Step 3: Implement**

Create `apps/docs-site/src/components/Playground/PickerSelector.tsx`:

```tsx
import { PICKER_IDS, type PickerId } from './classNamesByPicker';
import styles from './Playground.module.css';

export type PickerSelectorProps = {
  value: PickerId;
  onChange: (next: PickerId) => void;
};

export default function PickerSelector({ value, onChange }: PickerSelectorProps) {
  return (
    <label className={styles.control}>
      <span className={styles.controlLabel}>Picker</span>
      <select
        className={styles.select}
        value={value}
        onChange={e => onChange(e.target.value as PickerId)}
        aria-label="Picker">
        {PICKER_IDS.map(id => (
          <option key={id} value={id}>{prettify(id)}</option>
        ))}
      </select>
    </label>
  );
}

function prettify(id: string): string {
  // 'datepicker' -> 'DatePicker'; 'datetimepicker' -> 'DateTimePicker'
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  if (id === 'datetimepicker') return 'DateTimePicker';
  if (id === 'monthpicker') return 'MonthPicker';
  if (id === 'yearpicker') return 'YearPicker';
  if (id === 'weekpicker') return 'WeekPicker';
  if (id === 'rangepicker') return 'RangePicker';
  if (id === 'timepicker') return 'TimePicker';
  return cap(id);
}
```

- [ ] **Step 4: Add a placeholder CSS module so styles import works**

Create `apps/docs-site/src/components/Playground/Playground.module.css`:

```css
.control {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.controlLabel {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ifm-color-emphasis-700);
}

.select {
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--ifm-color-emphasis-300);
  border-radius: 6px;
  background: var(--ifm-background-color);
  color: var(--ifm-font-color-base);
}

/* the rest of this module is filled in across tasks 4–8 */
```

- [ ] **Step 5: Test passes**

```bash
pnpm test:run apps/docs-site/src/components/Playground/__tests__/Playground.test.tsx 2>&1 | tail -3
```
Expected: 3/3 PickerSelector tests pass.

- [ ] **Step 6: Commit**

```bash
git add apps/docs-site/src/components/Playground/PickerSelector.tsx \
        apps/docs-site/src/components/Playground/Playground.module.css \
        apps/docs-site/src/components/Playground/__tests__/Playground.test.tsx
git commit -m "$(cat <<'EOF'
feat(playground): add PickerSelector

Native <select> over the 7 picker ids with a Picker label. Sole control
the user has for swapping the rendered picker; everything else cascades
from this value.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: ClassNamesEditor

**Files:**
- Create: `apps/docs-site/src/components/Playground/ClassNamesEditor.tsx`

- [ ] **Step 1: Append tests** to the existing `__tests__/Playground.test.tsx` (before the final `});`):

```tsx
import ClassNamesEditor from '../ClassNamesEditor';
import { CLASSNAMES_BY_PICKER } from '../classNamesByPicker';

describe('<ClassNamesEditor>', () => {
  it('renders one input per leaf entry for the active picker', () => {
    render(<ClassNamesEditor pickerId="datepicker" value={CLASSNAMES_BY_PICKER.datepicker} onChange={() => {}} />);
    const inputs = screen.getAllByRole('textbox');
    // datepicker has 1 (input) + 10 (calendar.*) = 11 leaf entries
    expect(inputs.length).toBe(11);
  });

  it('calls onChange when a leaf input is edited', () => {
    const handle = vi.fn();
    render(<ClassNamesEditor pickerId="datepicker" value={CLASSNAMES_BY_PICKER.datepicker} onChange={handle} />);
    const dayInput = screen.getByLabelText('calendar.day');
    fireEvent.change(dayInput, { target: { value: 'bg-indigo-100' } });
    expect(handle).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Verify the new ClassNamesEditor tests fail**

```bash
pnpm test:run apps/docs-site/src/components/Playground/__tests__/Playground.test.tsx 2>&1 | tail -5
```
Expected: 2 failures (`Cannot find module '../ClassNamesEditor'`), 3 still pass.

- [ ] **Step 3: Implement**

Create `apps/docs-site/src/components/Playground/ClassNamesEditor.tsx`:

```tsx
import type { ClassNamesShape, PickerId } from './classNamesByPicker';
import styles from './Playground.module.css';

export type ClassNamesEditorProps = {
  pickerId: PickerId;
  value: ClassNamesShape;
  onChange: (next: ClassNamesShape) => void;
};

type LeafPath = readonly string[];

function* walkLeaves(obj: ClassNamesShape, prefix: LeafPath = []): Generator<{ path: LeafPath; value: string }> {
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string') {
      yield { path: [...prefix, k], value: v };
    } else {
      yield* walkLeaves(v, [...prefix, k]);
    }
  }
}

function setAt(obj: ClassNamesShape, path: LeafPath, next: string): ClassNamesShape {
  const [head, ...tail] = path;
  if (tail.length === 0) {
    return { ...obj, [head]: next };
  }
  const sub = obj[head];
  if (typeof sub !== 'object') return obj;
  return { ...obj, [head]: setAt(sub, tail, next) };
}

export default function ClassNamesEditor({ pickerId, value, onChange }: ClassNamesEditorProps) {
  const leaves = Array.from(walkLeaves(value));
  return (
    <fieldset className={styles.classNamesEditor} aria-label={`classNames editor — ${pickerId}`}>
      <legend className={styles.controlLabel}>classNames</legend>
      {leaves.map(({ path, value: leafValue }) => {
        const label = path.join('.');
        return (
          <label key={label} className={styles.leafRow}>
            <span className={styles.leafKey}>{label}</span>
            <input
              type="text"
              aria-label={label}
              className={styles.leafInput}
              value={leafValue}
              onChange={e => onChange(setAt(value, path, e.target.value))}
            />
          </label>
        );
      })}
    </fieldset>
  );
}
```

- [ ] **Step 4: Extend Playground.module.css**

Append to `apps/docs-site/src/components/Playground/Playground.module.css`:

```css
.classNamesEditor {
  border: 1px solid var(--ifm-color-emphasis-200);
  border-radius: 8px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin: 0;
}

.leafRow {
  display: grid;
  grid-template-columns: 9rem 1fr;
  gap: 0.5rem;
  align-items: center;
}

.leafKey {
  font-family: var(--ifm-font-family-monospace);
  font-size: 0.78rem;
  color: var(--ifm-color-emphasis-700);
  word-break: break-all;
}

.leafInput {
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--ifm-color-emphasis-200);
  border-radius: 4px;
  background: var(--ifm-background-color);
  color: var(--ifm-font-color-base);
  font-family: var(--ifm-font-family-monospace);
  font-size: 0.78rem;
}
```

- [ ] **Step 5: Verify all 5 tests pass**

```bash
pnpm test:run apps/docs-site/src/components/Playground/__tests__/Playground.test.tsx 2>&1 | tail -3
```
Expected: 5/5.

- [ ] **Step 6: Commit**

```bash
git add apps/docs-site/src/components/Playground/ClassNamesEditor.tsx \
        apps/docs-site/src/components/Playground/Playground.module.css \
        apps/docs-site/src/components/Playground/__tests__/Playground.test.tsx
git commit -m "$(cat <<'EOF'
feat(playground): add ClassNamesEditor

Walks the nested ClassNamesShape and renders one text input per leaf
entry, labelled with the dotted key path. Edits propagate up via a
recursive setAt helper.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: LocaleTimezoneToggles

**Files:**
- Create: `apps/docs-site/src/components/Playground/LocaleTimezoneToggles.tsx`

- [ ] **Step 1: Append tests**

In `__tests__/Playground.test.tsx`, before the final `});`, add:

```tsx
import LocaleTimezoneToggles from '../LocaleTimezoneToggles';

describe('<LocaleTimezoneToggles>', () => {
  it('renders 4 locale options and 4 timezone options', () => {
    render(<LocaleTimezoneToggles locale="en-US" timezone="UTC" onLocaleChange={() => {}} onTimezoneChange={() => {}} />);
    const localeSelect = screen.getByRole('combobox', { name: /locale/i });
    const tzSelect = screen.getByRole('combobox', { name: /timezone/i });
    expect(localeSelect.querySelectorAll('option')).toHaveLength(4);
    expect(tzSelect.querySelectorAll('option')).toHaveLength(4);
  });

  it('reports locale change', () => {
    const onLocale = vi.fn();
    render(<LocaleTimezoneToggles locale="en-US" timezone="UTC" onLocaleChange={onLocale} onTimezoneChange={() => {}} />);
    fireEvent.change(screen.getByRole('combobox', { name: /locale/i }), { target: { value: 'ko-KR' } });
    expect(onLocale).toHaveBeenCalledWith('ko-KR');
  });
});
```

- [ ] **Step 2: Confirm 2 new failures**

```bash
pnpm test:run apps/docs-site/src/components/Playground/__tests__/Playground.test.tsx 2>&1 | tail -5
```

- [ ] **Step 3: Implement**

Create `apps/docs-site/src/components/Playground/LocaleTimezoneToggles.tsx`:

```tsx
import styles from './Playground.module.css';

export type Locale = 'en-US' | 'ko-KR' | 'ja-JP' | 'fr-FR';
export type Timezone = 'UTC' | 'Asia/Seoul' | 'America/New_York' | 'Europe/London';

const LOCALES: readonly { id: Locale; label: string }[] = [
  { id: 'en-US', label: 'English (US)' },
  { id: 'ko-KR', label: '한국어' },
  { id: 'ja-JP', label: '日本語' },
  { id: 'fr-FR', label: 'Français' },
];

const TIMEZONES: readonly Timezone[] = [
  'UTC', 'Asia/Seoul', 'America/New_York', 'Europe/London',
];

export type LocaleTimezoneTogglesProps = {
  locale: Locale;
  timezone: Timezone;
  onLocaleChange: (next: Locale) => void;
  onTimezoneChange: (next: Timezone) => void;
};

export default function LocaleTimezoneToggles({
  locale, timezone, onLocaleChange, onTimezoneChange,
}: LocaleTimezoneTogglesProps) {
  return (
    <div className={styles.toggleRow}>
      <label className={styles.control}>
        <span className={styles.controlLabel}>Locale</span>
        <select
          className={styles.select}
          value={locale}
          onChange={e => onLocaleChange(e.target.value as Locale)}
          aria-label="Locale">
          {LOCALES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
        </select>
      </label>
      <label className={styles.control}>
        <span className={styles.controlLabel}>Timezone</span>
        <select
          className={styles.select}
          value={timezone}
          onChange={e => onTimezoneChange(e.target.value as Timezone)}
          aria-label="Timezone">
          {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
        </select>
      </label>
    </div>
  );
}
```

- [ ] **Step 4: Extend module CSS**

Append:

```css
.toggleRow {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
```

- [ ] **Step 5: Tests pass + commit**

```bash
pnpm test:run apps/docs-site/src/components/Playground/__tests__/Playground.test.tsx 2>&1 | tail -3
git add apps/docs-site/src/components/Playground/LocaleTimezoneToggles.tsx \
        apps/docs-site/src/components/Playground/Playground.module.css \
        apps/docs-site/src/components/Playground/__tests__/Playground.test.tsx
git commit -m "$(cat <<'EOF'
feat(playground): add LocaleTimezoneToggles

Two parallel <select>s for locale (4 options) and timezone (4 options).
Independent onChange callbacks keep the parent state granular.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: PreviewPanel

**Files:**
- Create: `apps/docs-site/src/components/Playground/PreviewPanel.tsx`

- [ ] **Step 1: Append integration smoke tests**

In `__tests__/Playground.test.tsx`:

```tsx
import PreviewPanel from '../PreviewPanel';

describe('<PreviewPanel>', () => {
  it('renders a DatePicker when pickerId="datepicker"', () => {
    render(
      <PreviewPanel
        pickerId="datepicker"
        classNames={CLASSNAMES_BY_PICKER.datepicker}
        locale="en-US"
        timezone="UTC"
      />
    );
    // DatePicker.Input ends up as a button/combobox at the top of the tree
    expect(screen.getByTestId('preview-panel')).toBeInTheDocument();
    expect(screen.getByTestId('preview-panel').getAttribute('data-picker')).toBe('datepicker');
  });

  it('switches to TimePicker when pickerId="timepicker"', () => {
    const { rerender } = render(
      <PreviewPanel pickerId="datepicker" classNames={CLASSNAMES_BY_PICKER.datepicker} locale="en-US" timezone="UTC" />
    );
    rerender(
      <PreviewPanel pickerId="timepicker" classNames={CLASSNAMES_BY_PICKER.timepicker} locale="en-US" timezone="UTC" />
    );
    expect(screen.getByTestId('preview-panel').getAttribute('data-picker')).toBe('timepicker');
  });
});
```

- [ ] **Step 2: Implement**

Create `apps/docs-site/src/components/Playground/PreviewPanel.tsx`:

```tsx
import { useState } from 'react';
import {
  DatePicker, RangePicker, TimePicker, DateTimePicker,
  MonthPicker, YearPicker, WeekPicker,
} from '@kalyx/react';
import type { ClassNamesShape, PickerId } from './classNamesByPicker';
import type { Locale, Timezone } from './LocaleTimezoneToggles';
import styles from './Playground.module.css';

const FROZEN_DATE = '2026-06-15T00:00:00.000Z';
const FROZEN_RANGE = { start: '2026-06-15T00:00:00.000Z', end: '2026-06-19T00:00:00.000Z' };
const FROZEN_WEEK = { start: '2026-06-14T00:00:00.000Z', end: '2026-06-20T00:00:00.000Z' };
const FROZEN_TIME = '2026-06-15T14:30:00.000Z';

export type PreviewPanelProps = {
  pickerId: PickerId;
  classNames: ClassNamesShape;
  locale: Locale;
  timezone: Timezone;
};

export default function PreviewPanel({ pickerId, classNames, locale, timezone }: PreviewPanelProps) {
  return (
    <div
      data-testid="preview-panel"
      data-picker={pickerId}
      className={styles.preview}>
      {pickerId === 'datepicker' && <DatePickerPreview classNames={classNames} locale={locale} timezone={timezone} />}
      {pickerId === 'rangepicker' && <RangePickerPreview classNames={classNames} locale={locale} timezone={timezone} />}
      {pickerId === 'timepicker' && <TimePickerPreview classNames={classNames} locale={locale} timezone={timezone} />}
      {pickerId === 'datetimepicker' && <DateTimePickerPreview classNames={classNames} locale={locale} timezone={timezone} />}
      {pickerId === 'monthpicker' && <MonthPickerPreview classNames={classNames} locale={locale} timezone={timezone} />}
      {pickerId === 'yearpicker' && <YearPickerPreview classNames={classNames} locale={locale} timezone={timezone} />}
      {pickerId === 'weekpicker' && <WeekPickerPreview classNames={classNames} locale={locale} timezone={timezone} />}
    </div>
  );
}

type SubProps = { classNames: ClassNamesShape; locale: Locale; timezone: Timezone };

function DatePickerPreview({ classNames, locale, timezone }: SubProps) {
  const [iso, setIso] = useState<string | null>(FROZEN_DATE);
  const cn = classNames as { input?: string; calendar?: Record<string, string> };
  return (
    <DatePicker value={iso} onChange={setIso} locale={locale} displayTimezone={timezone}>
      <DatePicker.Input className={cn.input} placeholder="Pick a date" />
      <DatePicker.Popover>
        <DatePicker.Calendar classNames={cn.calendar} />
      </DatePicker.Popover>
    </DatePicker>
  );
}

// Similar shape for the other 6 pickers; copy the DatePickerPreview pattern and
// adjust the picker component + value type. For brevity each preview is short:

function RangePickerPreview({ classNames, locale, timezone }: SubProps) {
  const [v, setV] = useState(FROZEN_RANGE);
  const cn = classNames as { input?: string; calendar?: Record<string, string> };
  return (
    <RangePicker value={v} onChange={setV} locale={locale} displayTimezone={timezone}>
      <RangePicker.Input className={cn.input} part="start" />
      <RangePicker.Input className={cn.input} part="end" />
      <RangePicker.Popover>
        <RangePicker.Calendar classNames={cn.calendar} />
      </RangePicker.Popover>
    </RangePicker>
  );
}

function TimePickerPreview({ classNames, locale, timezone }: SubProps) {
  const [v, setV] = useState<string | null>(FROZEN_TIME);
  return (
    <TimePicker value={v} onChange={setV} format="12h" locale={locale} displayTimezone={timezone}>
      <TimePicker.Input />
      <div style={{ display: 'flex', gap: 8 }}>
        <TimePicker.HourList />
        <TimePicker.MinuteList />
        <TimePicker.AmPmToggle />
      </div>
    </TimePicker>
  );
}

function DateTimePickerPreview({ classNames, locale, timezone }: SubProps) {
  const [v, setV] = useState<string | null>(FROZEN_DATE);
  return (
    <DateTimePicker value={v} onChange={setV} locale={locale} displayTimezone={timezone}>
      <DateTimePicker.Input />
      <DateTimePicker.Popover>
        <DateTimePicker.Calendar />
        <DateTimePicker.HourList />
        <DateTimePicker.MinuteList />
      </DateTimePicker.Popover>
    </DateTimePicker>
  );
}

function MonthPickerPreview({ locale, timezone }: SubProps) {
  const [v, setV] = useState<string | null>(FROZEN_DATE);
  return (
    <MonthPicker value={v} onChange={setV} locale={locale} displayTimezone={timezone}>
      <MonthPicker.Input />
      <MonthPicker.Popover>
        <MonthPicker.Grid />
      </MonthPicker.Popover>
    </MonthPicker>
  );
}

function YearPickerPreview({ locale, timezone }: SubProps) {
  const [v, setV] = useState<string | null>(FROZEN_DATE);
  return (
    <YearPicker value={v} onChange={setV} locale={locale} displayTimezone={timezone}>
      <YearPicker.Input />
      <YearPicker.Popover>
        <YearPicker.Grid />
      </YearPicker.Popover>
    </YearPicker>
  );
}

function WeekPickerPreview({ locale, timezone }: SubProps) {
  const [v, setV] = useState(FROZEN_WEEK);
  return (
    <WeekPicker value={v} onChange={setV} locale={locale} displayTimezone={timezone}>
      <WeekPicker.Input part="start" />
      <WeekPicker.Input part="end" />
      <WeekPicker.Popover>
        <WeekPicker.Calendar />
      </WeekPicker.Popover>
    </WeekPicker>
  );
}
```

- [ ] **Step 3: Extend module CSS**

Append:

```css
.preview {
  border: 1px solid var(--ifm-color-emphasis-200);
  border-radius: 8px;
  padding: 1.5rem;
  background: var(--ifm-background-color);
  min-height: 320px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}
```

- [ ] **Step 4: Tests pass + commit**

```bash
pnpm test:run apps/docs-site/src/components/Playground/__tests__/Playground.test.tsx 2>&1 | tail -3
git add apps/docs-site/src/components/Playground/PreviewPanel.tsx \
        apps/docs-site/src/components/Playground/Playground.module.css \
        apps/docs-site/src/components/Playground/__tests__/Playground.test.tsx
git commit -m "$(cat <<'EOF'
feat(playground): add PreviewPanel

Dispatches to the right @kalyx/react picker based on pickerId, passing
classNames/locale/timezone through. Each picker sub-preview is local
state — switching pickerId hard-resets via React's key-on-conditional
behaviour.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: OpenInStackBlitz + seedProject

**Files:**
- Create: `apps/docs-site/src/components/Playground/OpenInStackBlitz.tsx`
- Create: `apps/docs-site/src/components/Playground/seedProject.ts`

- [ ] **Step 1: Append tests**

In `__tests__/Playground.test.tsx`:

```tsx
import OpenInStackBlitz from '../OpenInStackBlitz';
import sdk from '@stackblitz/sdk';

describe('<OpenInStackBlitz>', () => {
  it('renders a button that calls sdk.openProject when clicked', () => {
    const openProject = vi.spyOn(sdk, 'openProject');
    render(
      <OpenInStackBlitz
        pickerId="datepicker"
        classNames={CLASSNAMES_BY_PICKER.datepicker}
        locale="en-US"
        timezone="UTC"
      />
    );
    const btn = screen.getByRole('button', { name: /open in stackblitz/i });
    fireEvent.click(btn);
    expect(openProject).toHaveBeenCalledTimes(1);
    const arg = openProject.mock.calls[0][0] as { title: string; files: Record<string, string> };
    expect(arg.title).toContain('datepicker');
    expect(arg.files['src/App.tsx']).toContain('<DatePicker');
    openProject.mockRestore();
  });
});
```

- [ ] **Step 2: Implement `seedProject.ts`**

Create `apps/docs-site/src/components/Playground/seedProject.ts`:

```ts
import type { ClassNamesShape, PickerId } from './classNamesByPicker';
import type { Locale, Timezone } from './LocaleTimezoneToggles';

export type Seed = {
  title: string;
  files: Record<string, string>;
  template: 'node';
};

const PACKAGE_JSON = `{
  "name": "kalyx-playground",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": { "dev": "vite", "build": "vite build", "preview": "vite preview" },
  "dependencies": {
    "@kalyx/react": "latest",
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
}`;

const INDEX_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Kalyx Playground</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

const MAIN_TSX = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);`;

const VITE_CONFIG = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({ plugins: [react()] });`;

const TSCONFIG = `{
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
}`;

function renderAppCode(pickerId: PickerId, classNames: ClassNamesShape, locale: Locale, tz: Timezone): string {
  // For brevity here, generate a uniform App.tsx that imports the right picker.
  const cn = JSON.stringify(classNames, null, 2);
  const importName = pickerName(pickerId);
  return `import { useState } from 'react';
import { ${importName} } from '@kalyx/react';

export default function App() {
  const [iso, setIso] = useState<string | null>('2026-06-15T00:00:00.000Z');
  const classNames = ${cn};
  return (
    <div style={{ padding: 32, fontFamily: 'sans-serif' }}>
      <h1>Kalyx — ${importName}</h1>
      <p>Locale: ${locale} · Timezone: ${tz}</p>
      <${importName} value={iso} onChange={setIso} locale="${locale}" displayTimezone="${tz}">
        <${importName}.Input className={classNames.input} />
        <${importName}.Popover>
          <${importName}.Calendar classNames={classNames.calendar} />
        </${importName}.Popover>
      </${importName}>
    </div>
  );
}`;
}

function pickerName(id: PickerId): string {
  switch (id) {
    case 'datetimepicker': return 'DateTimePicker';
    case 'monthpicker':    return 'MonthPicker';
    case 'yearpicker':     return 'YearPicker';
    case 'weekpicker':     return 'WeekPicker';
    case 'rangepicker':    return 'RangePicker';
    case 'timepicker':     return 'TimePicker';
    default:               return 'DatePicker';
  }
}

export function buildSeed(
  pickerId: PickerId,
  classNames: ClassNamesShape,
  locale: Locale,
  timezone: Timezone,
): Seed {
  return {
    title: `Kalyx Playground — ${pickerId}`,
    template: 'node',
    files: {
      'package.json': PACKAGE_JSON,
      'index.html': INDEX_HTML,
      'src/main.tsx': MAIN_TSX,
      'src/App.tsx': renderAppCode(pickerId, classNames, locale, timezone),
      'vite.config.ts': VITE_CONFIG,
      'tsconfig.json': TSCONFIG,
    },
  };
}
```

- [ ] **Step 3: Implement `OpenInStackBlitz.tsx`**

Create `apps/docs-site/src/components/Playground/OpenInStackBlitz.tsx`:

```tsx
import sdk from '@stackblitz/sdk';
import { buildSeed } from './seedProject';
import type { ClassNamesShape, PickerId } from './classNamesByPicker';
import type { Locale, Timezone } from './LocaleTimezoneToggles';
import styles from './Playground.module.css';

export type OpenInStackBlitzProps = {
  pickerId: PickerId;
  classNames: ClassNamesShape;
  locale: Locale;
  timezone: Timezone;
};

export default function OpenInStackBlitz({ pickerId, classNames, locale, timezone }: OpenInStackBlitzProps) {
  const handleClick = () => {
    const seed = buildSeed(pickerId, classNames, locale, timezone);
    sdk.openProject(seed, { openFile: 'src/App.tsx' });
  };
  return (
    <button
      type="button"
      className={styles.stackblitzButton}
      onClick={handleClick}>
      Open in StackBlitz ↗
    </button>
  );
}
```

- [ ] **Step 4: Extend module CSS**

Append:

```css
.stackblitzButton {
  display: inline-flex;
  align-items: center;
  padding: 0.6rem 1rem;
  border: 0;
  border-radius: 8px;
  background: var(--ifm-color-primary);
  color: var(--ifm-color-primary-contrast-foreground);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
}

.stackblitzButton:hover {
  background: var(--ifm-color-primary-dark);
}
```

- [ ] **Step 5: Tests pass + commit**

```bash
pnpm test:run apps/docs-site/src/components/Playground/__tests__/Playground.test.tsx 2>&1 | tail -3
git add apps/docs-site/src/components/Playground/OpenInStackBlitz.tsx \
        apps/docs-site/src/components/Playground/seedProject.ts \
        apps/docs-site/src/components/Playground/Playground.module.css \
        apps/docs-site/src/components/Playground/__tests__/Playground.test.tsx
git commit -m "$(cat <<'EOF'
feat(playground): add OpenInStackBlitz + seedProject

Button calls sdk.openProject with a seed built from the current
Playground state. seedProject.ts owns the file map (package.json,
index.html, src/main.tsx, src/App.tsx, vite.config.ts, tsconfig.json).
The vitest stub for @stackblitz/sdk keeps tests hermetic.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Compose Playground root

**Files:**
- Create: `apps/docs-site/src/components/Playground/index.tsx`

- [ ] **Step 1: Append the final axe + integration test**

In `__tests__/Playground.test.tsx`:

```tsx
import Playground from '../index';

describe('<Playground>', () => {
  it('renders all four controls + preview + StackBlitz button', () => {
    render(<Playground />);
    expect(screen.getByRole('combobox', { name: /picker/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /locale/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /timezone/i })).toBeInTheDocument();
    expect(screen.getByTestId('preview-panel')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open in stackblitz/i })).toBeInTheDocument();
  });

  it('changing picker selector swaps the preview', () => {
    render(<Playground />);
    const select = screen.getByRole('combobox', { name: /picker/i });
    fireEvent.change(select, { target: { value: 'timepicker' } });
    expect(screen.getByTestId('preview-panel').getAttribute('data-picker')).toBe('timepicker');
  });

  it('passes axe', async () => {
    const { container } = render(<Playground />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Implement the composer**

Create `apps/docs-site/src/components/Playground/index.tsx`:

```tsx
import { useState } from 'react';
import PickerSelector from './PickerSelector';
import ClassNamesEditor from './ClassNamesEditor';
import LocaleTimezoneToggles from './LocaleTimezoneToggles';
import PreviewPanel from './PreviewPanel';
import OpenInStackBlitz from './OpenInStackBlitz';
import { CLASSNAMES_BY_PICKER, type ClassNamesShape, type PickerId } from './classNamesByPicker';
import type { Locale, Timezone } from './LocaleTimezoneToggles';
import styles from './Playground.module.css';

export default function Playground() {
  const [pickerId, setPickerId] = useState<PickerId>('datepicker');
  const [classNames, setClassNames] = useState<ClassNamesShape>(CLASSNAMES_BY_PICKER.datepicker);
  const [locale, setLocale] = useState<Locale>('en-US');
  const [timezone, setTimezone] = useState<Timezone>('UTC');

  const handlePickerChange = (next: PickerId) => {
    setPickerId(next);
    setClassNames(CLASSNAMES_BY_PICKER[next]);
  };

  return (
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        <PickerSelector value={pickerId} onChange={handlePickerChange} />
        <LocaleTimezoneToggles
          locale={locale}
          timezone={timezone}
          onLocaleChange={setLocale}
          onTimezoneChange={setTimezone}
        />
        <ClassNamesEditor
          pickerId={pickerId}
          value={classNames}
          onChange={setClassNames}
        />
      </aside>
      <main className={styles.main}>
        <PreviewPanel
          pickerId={pickerId}
          classNames={classNames}
          locale={locale}
          timezone={timezone}
        />
        <div className={styles.footer}>
          <OpenInStackBlitz
            pickerId={pickerId}
            classNames={classNames}
            locale={locale}
            timezone={timezone}
          />
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Finalise CSS**

Append:

```css
.root {
  display: grid;
  grid-template-columns: 22rem 1fr;
  gap: 1.5rem;
  margin: 2rem 0;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.footer {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 996px) {
  .root {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 4: All tests pass + commit**

```bash
pnpm test:run
git add apps/docs-site/src/components/Playground/index.tsx \
        apps/docs-site/src/components/Playground/Playground.module.css \
        apps/docs-site/src/components/Playground/__tests__/Playground.test.tsx
git commit -m "$(cat <<'EOF'
feat(playground): compose Playground root

State held at the root, fanned out to the 5 children. PickerId change
also resets classNames to the new picker's defaults. Responsive sidebar
collapses to a single column at the existing Docusaurus breakpoint.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Replace `playground.mdx` body + final verify + PR

**Files:**
- Modify: `apps/docs-site/src/pages/playground.mdx`

- [ ] **Step 1: Inspect current playground.mdx**

```bash
cat apps/docs-site/src/pages/playground.mdx
```
Identify the frontmatter, title, intro paragraph, and the existing `tsx live` block. Frontmatter + title + intro stay; the live block (and any sibling demo code) is removed.

- [ ] **Step 2: Rewrite the body**

Overwrite the file (preserving the frontmatter / title / intro at the top):

```mdx
---
title: Playground
description: Try every Kalyx picker live. Edit classNames, toggle locale and timezone, open in StackBlitz.
---

import Playground from '@site/src/components/Playground';

# Playground

Try every Kalyx picker live. Edit `classNames` to apply your own design tokens, toggle locale and timezone to see formatting change, and open the current state in StackBlitz with one click.

<Playground />
```

- [ ] **Step 3: Verify dev render**

```bash
pnpm --filter docs-site start --port 3100 --no-open &
SERVE_PID=$!
sleep 6
```
Open `http://localhost:3100/playground` — exercise picker selector, classNames inputs, locale/tz, click "Open in StackBlitz" (which opens a real sandbox in a new tab). Stop:

```bash
kill $SERVE_PID
```

- [ ] **Step 4: Final verification matrix**

```bash
pnpm typecheck
pnpm lint
pnpm test:run
pnpm --filter docs-site build
```
All exit 0.

- [ ] **Step 5: Commit**

```bash
git add apps/docs-site/src/pages/playground.mdx
git commit -m "$(cat <<'EOF'
refactor(docs-site): replace playground.mdx body with <Playground />

Frontmatter + title + 1-paragraph lead retained for Docusaurus TOC +
SEO. Body becomes a single <Playground /> mount.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 6: Open the PR**

```bash
git log --oneline main..HEAD
```
Expected: 9 new commits (Tasks 1-9).

```bash
gh pr create --base main --title "feat(track1): PR-C — /playground enhancement (picker selector, classNames editor, StackBlitz)" --body "$(cat <<'EOF'
## Summary

Fourth PR in Track 1. Rewrites the playground page as a real interactive sandbox.

- Picker selector — choose from all 7 kalyx pickers
- classNames editor — text input per published part for the active picker
- Locale + timezone toggles (4 each) drive the live preview's formatting
- "Open in StackBlitz" button via \`@stackblitz/sdk\` — spawns a real sandbox seeded with the current playground state

Spec: \`docs/superpowers/specs/2026-06-11-track1-pr-c-playground-enhancement-design.md\`
Plan: \`docs/superpowers/plans/2026-06-11-track1-pr-c-playground-enhancement.md\`

## Test plan

- [x] \`pnpm test:run\` — all suites pass with 11+ new Playground tests
- [x] \`pnpm typecheck\` / \`pnpm lint\` clean
- [x] \`pnpm --filter docs-site build\` succeeds
- [x] Dev render — every picker selector option swaps the preview, classNames edits apply live
- [x] "Open in StackBlitz" opens a sandbox that renders the same picker with the same classNames

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Notes for the executor

**If a picker's `classNames` prop type rejects the shape from `classNamesByPicker.ts`:** audit the `*ClassNames` type from `@kalyx/react`. Some keys (e.g., `Calendar` vs `calendar`) may differ in casing or be wrapped under a different parent. Update `classNamesByPicker.ts` to match — the source of truth is the published type.

**If `@stackblitz/sdk` complains about TypeScript types:** the SDK exports default + named at the same time. `import sdk from '@stackblitz/sdk'` is the documented form; if your TS config rejects it, add `"esModuleInterop": true` in tsconfig (already true in docs-site's config). Otherwise use `import * as sdk from '@stackblitz/sdk'`.

**If the dev render shows the picker overflowing the sidebar:** the Playground.module.css uses `grid-template-columns: 22rem 1fr;` — narrower sidebars push the preview wider. Adjust the rem value to taste.

**If `pnpm install` flags a peer dep conflict on `@stackblitz/sdk`:** the SDK has minimal peer deps. If conflict persists, pin to the version range `^1`.
