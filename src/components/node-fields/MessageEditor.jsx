import { useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';

const SYSTEM_VARIABLES = [
  { key: '{caller_name}', label: 'Caller Name' },
  { key: '{caller_phone}', label: 'Caller Phone' },
  { key: '{business_name}', label: 'Business Name' },
  { key: '{business_phone}', label: 'Business Phone' },
  { key: '{current_time}', label: 'Current Time' },
  { key: '{current_date}', label: 'Current Date' },
  { key: '{day_of_week}', label: 'Day of Week' },
  { key: '{caller_intent}', label: 'Caller Intent' },
  { key: '{summary}', label: 'Call Summary' },
];

export default function MessageEditor({ value = '', onChange, rows = 3 }) {
  const textareaRef = useRef(null);

  const insertVariable = (varKey) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newVal = value.slice(0, start) + varKey + value.slice(end);
    onChange(newVal);
    // Restore cursor after the inserted variable
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + varKey.length, start + varKey.length);
    });
  };

  return (
    <div className="space-y-1.5">
      {/* Variable chips */}
      <div className="flex flex-wrap gap-1">
        {SYSTEM_VARIABLES.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => insertVariable(v.key)}
            className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-violet-50 text-violet-600 border border-violet-200 hover:bg-violet-100 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-violet-400"
            title={`Insert ${v.label}`}
          >
            {v.key}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="text-[13px] focus:ring-primary/30 focus:border-primary resize-none font-sans"
        placeholder="Type your message... click variables above to insert"
      />

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-text-light">Click a variable chip to insert at cursor</span>
        <span className="text-[11px] text-text-light">{value.length} chars</span>
      </div>
    </div>
  );
}
