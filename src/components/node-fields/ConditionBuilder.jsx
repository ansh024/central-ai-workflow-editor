import { Plus, Trash2 } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const FIELD_OPTIONS = [
  'caller_name', 'caller_phone', 'caller_intent', 'current_time', 'current_date', 'day_of_week', 'custom',
];

const OPERATORS = [
  { value: 'equals', label: '=' },
  { value: 'not_equals', label: '≠' },
  { value: 'contains', label: 'contains' },
  { value: 'not_contains', label: "doesn't contain" },
  { value: 'greater_than', label: '>' },
  { value: 'less_than', label: '<' },
  { value: 'is_empty', label: 'is empty' },
  { value: 'is_not_empty', label: 'is not empty' },
];

const NO_VALUE_OPS = ['is_empty', 'is_not_empty'];

function ConditionRow({ condition, index, onChange, onRemove, showLogic }) {
  const update = (key, val) => onChange(index, { ...condition, [key]: val });

  return (
    <div className="space-y-1.5">
      {showLogic && (
        <div className="flex gap-1">
          {['AND', 'OR'].map((logic) => (
            <button
              key={logic}
              type="button"
              onClick={() => update('logic', logic)}
              className={`px-2 py-0.5 text-[10px] font-semibold rounded border cursor-pointer focus:outline-none transition-all ${
                (condition.logic || 'AND') === logic
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-text-mid border-border hover:bg-slate-50'
              }`}
            >
              {logic}
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-1.5 items-center">
        <Select value={condition.field || ''} onValueChange={(v) => update('field', v)}>
          <SelectTrigger className="flex-1 text-[12px] h-8">
            <SelectValue placeholder="Field" />
          </SelectTrigger>
          <SelectContent>
            {FIELD_OPTIONS.map((f) => (
              <SelectItem key={f} value={f}>{f}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={condition.operator || 'equals'} onValueChange={(v) => update('operator', v)}>
          <SelectTrigger className="w-28 text-[12px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OPERATORS.map((op) => (
              <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!NO_VALUE_OPS.includes(condition.operator) && (
          <input
            type="text"
            value={condition.value || ''}
            onChange={(e) => update('value', e.target.value)}
            placeholder="Value"
            className="flex-1 h-8 px-2 text-[12px] border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/30 bg-white"
          />
        )}

        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-1.5 text-text-light hover:text-red-500 transition-colors cursor-pointer focus:outline-none"
          aria-label="Remove condition"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function ConditionBuilder({ value = [], onChange }) {
  const addRow = () => onChange([...value, { field: '', operator: 'equals', value: '', logic: 'AND' }]);
  const updateRow = (i, updated) => {
    const next = [...value];
    next[i] = updated;
    onChange(next);
  };
  const removeRow = (i) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      {value.length === 0 && (
        <p className="text-[12px] text-text-light italic">No conditions yet. Click below to add one.</p>
      )}
      {value.map((cond, i) => (
        <ConditionRow
          key={i}
          condition={cond}
          index={i}
          onChange={updateRow}
          onRemove={removeRow}
          showLogic={i > 0}
        />
      ))}
      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1.5 text-[12px] text-primary hover:text-primary/80 transition-colors cursor-pointer focus:outline-none"
      >
        <Plus className="w-3.5 h-3.5" />
        Add condition
      </button>
    </div>
  );
}
