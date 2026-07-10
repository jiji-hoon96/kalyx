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
    <!-- Tailwind Play CDN: the default classNames below are Tailwind utilities.
         Swap this for your own build in a real project. -->
    <script src="https://cdn.tailwindcss.com"></script>
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
  // Each picker has a different child shape. Dispatch per id so the
  // generated App.tsx compiles in the sandbox.
  const cn = JSON.stringify(classNames, null, 2);
  const importName = pickerName(pickerId);
  const header = `import { useState } from 'react';
import { ${importName} } from '@kalyx/react';

export default function App() {`;
  const footer = `}`;
  const wrapperOpen = `  return (
    <div style={{ padding: 32, fontFamily: 'sans-serif' }}>
      <h1>Kalyx — ${importName}</h1>
      <p>Locale: ${locale} · Timezone: ${tz}</p>`;
  const wrapperClose = `    </div>
  );`;

  switch (pickerId) {
    case 'timepicker':
      return `${header}
  const [iso, setIso] = useState<string | null>('2026-06-15T14:30:00.000Z');
  const classNames = ${cn};
${wrapperOpen}
      <${importName} value={iso} onChange={setIso} format="12h" locale="${locale}" displayTimezone="${tz}">
        <${importName}.Input className={classNames.input} />
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <${importName}.HourList />
          <${importName}.MinuteList />
          <${importName}.AmPmToggle />
        </div>
      </${importName}>
${wrapperClose}
${footer}`;

    case 'monthpicker':
    case 'yearpicker':
      return `${header}
  const [iso, setIso] = useState<string | null>('2026-06-15T00:00:00.000Z');
  const classNames = ${cn};
${wrapperOpen}
      <${importName} value={iso} onChange={setIso} locale="${locale}" displayTimezone="${tz}">
        <${importName}.Input className={classNames.input} />
        <${importName}.Popover>
          <${importName}.Grid classNames={classNames.grid} />
        </${importName}.Popover>
      </${importName}>
${wrapperClose}
${footer}`;

    case 'rangepicker':
      return `${header}
  const [range, setRange] = useState({
    start: '2026-06-15T00:00:00.000Z',
    end: '2026-06-19T00:00:00.000Z',
  });
  const classNames = ${cn};
${wrapperOpen}
      <${importName} value={range} onChange={setRange} locale="${locale}" displayTimezone="${tz}">
        <${importName}.Input className={classNames.input} part="start" />
        <${importName}.Input className={classNames.input} part="end" />
        <${importName}.Popover>
          <${importName}.Calendar classNames={classNames.calendar} />
        </${importName}.Popover>
      </${importName}>
${wrapperClose}
${footer}`;

    case 'weekpicker':
      return `${header}
  const [range, setRange] = useState({
    start: '2026-06-14T00:00:00.000Z',
    end: '2026-06-20T00:00:00.000Z',
  });
  const classNames = ${cn};
${wrapperOpen}
      <${importName} value={range} onChange={setRange} locale="${locale}" displayTimezone="${tz}">
        <${importName}.Input className={classNames.input} part="start" />
        <${importName}.Input className={classNames.input} part="end" />
        <${importName}.Popover>
          <${importName}.Calendar classNames={classNames.calendar} />
        </${importName}.Popover>
      </${importName}>
${wrapperClose}
${footer}`;

    case 'datetimepicker':
      return `${header}
  const [iso, setIso] = useState<string | null>('2026-06-15T14:30:00.000Z');
  const classNames = ${cn};
${wrapperOpen}
      <${importName} value={iso} onChange={setIso} locale="${locale}" displayTimezone="${tz}">
        <${importName}.Input className={classNames.input} />
        <${importName}.Popover>
          <${importName}.Calendar classNames={classNames.calendar} />
          <div style={{ display: 'flex', gap: 12 }}>
            <${importName}.HourList />
            <${importName}.MinuteList />
          </div>
        </${importName}.Popover>
      </${importName}>
${wrapperClose}
${footer}`;

    case 'datepicker':
    default:
      return `${header}
  const [iso, setIso] = useState<string | null>('2026-06-15T00:00:00.000Z');
  const classNames = ${cn};
${wrapperOpen}
      <${importName} value={iso} onChange={setIso} locale="${locale}" displayTimezone="${tz}">
        <${importName}.Input className={classNames.input} />
        <${importName}.Popover>
          <${importName}.Calendar classNames={classNames.calendar} />
        </${importName}.Popover>
      </${importName}>
${wrapperClose}
${footer}`;
  }
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
