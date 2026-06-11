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
