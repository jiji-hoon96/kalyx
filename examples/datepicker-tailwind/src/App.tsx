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
