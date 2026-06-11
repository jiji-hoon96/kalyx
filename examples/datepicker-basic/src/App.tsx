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
