import { Plus, Trash2 } from 'lucide-react';

export default function KeyValueEditor({
  value = [],
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
}) {
  const addRow = () => onChange([...value, { key: '', value: '' }]);

  const updateRow = (i, field, val) => {
    const next = [...value];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };

  const removeRow = (i) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-1.5">
      {value.length > 0 && (
        <>
          <div className="grid grid-cols-[1fr_1fr_24px] gap-1.5 px-0.5">
            <span className="text-[10px] font-semibold text-text-light uppercase tracking-wide">{keyPlaceholder}</span>
            <span className="text-[10px] font-semibold text-text-light uppercase tracking-wide">{valuePlaceholder}</span>
            <span />
          </div>
          {value.map((row, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_24px] gap-1.5 items-center">
              <input
                type="text"
                value={row.key || ''}
                onChange={(e) => updateRow(i, 'key', e.target.value)}
                placeholder={keyPlaceholder}
                className="h-7 px-2 text-[12px] border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/30 bg-white"
              />
              <input
                type="text"
                value={row.value || ''}
                onChange={(e) => updateRow(i, 'value', e.target.value)}
                placeholder={valuePlaceholder}
                className="h-7 px-2 text-[12px] border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/30 bg-white"
              />
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="p-1 text-text-light hover:text-red-500 transition-colors cursor-pointer focus:outline-none"
                aria-label="Remove row"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </>
      )}
      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1.5 text-[12px] text-primary hover:text-primary/80 transition-colors cursor-pointer focus:outline-none"
      >
        <Plus className="w-3.5 h-3.5" />
        Add row
      </button>
    </div>
  );
}
