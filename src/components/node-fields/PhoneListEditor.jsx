import { Plus, Trash2, GripVertical } from 'lucide-react';

export default function PhoneListEditor({ value = [], onChange }) {
  const addRow = () =>
    onChange([...value, { name: '', phone: '', label: '' }]);

  const updateRow = (i, field, val) => {
    const next = [...value];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };

  const removeRow = (i) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="space-y-1.5">
          {/* Header */}
          <div className="grid grid-cols-[16px_1fr_1fr_80px_24px] gap-1.5 px-0.5">
            <span />
            <span className="text-[10px] font-semibold text-text-light uppercase tracking-wide">Name</span>
            <span className="text-[10px] font-semibold text-text-light uppercase tracking-wide">Phone</span>
            <span className="text-[10px] font-semibold text-text-light uppercase tracking-wide">Label</span>
            <span />
          </div>

          {value.map((row, i) => (
            <div key={i} className="grid grid-cols-[16px_1fr_1fr_80px_24px] gap-1.5 items-center">
              <GripVertical className="w-3.5 h-3.5 text-text-light" />
              <input
                type="text"
                value={row.name || ''}
                onChange={(e) => updateRow(i, 'name', e.target.value)}
                placeholder="Name"
                className="h-7 px-2 text-[12px] border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/30 bg-white"
              />
              <input
                type="tel"
                value={row.phone || ''}
                onChange={(e) => updateRow(i, 'phone', e.target.value)}
                placeholder="+1-555-..."
                className="h-7 px-2 text-[12px] border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/30 bg-white"
              />
              <input
                type="text"
                value={row.label || ''}
                onChange={(e) => updateRow(i, 'label', e.target.value)}
                placeholder="Mobile"
                className="h-7 px-2 text-[12px] border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/30 bg-white"
              />
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="p-1 text-text-light hover:text-red-500 transition-colors cursor-pointer focus:outline-none"
                aria-label="Remove"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1.5 text-[12px] text-primary hover:text-primary/80 transition-colors cursor-pointer focus:outline-none"
      >
        <Plus className="w-3.5 h-3.5" />
        Add contact
      </button>
    </div>
  );
}
