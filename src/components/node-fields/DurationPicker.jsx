import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const UNITS = ['minutes', 'hours', 'days', 'weeks'];

const SUMMARIES = {
  minutes: (v) => `${v} minute${v === 1 ? '' : 's'}`,
  hours: (v) => `${v} hour${v === 1 ? '' : 's'}`,
  days: (v) => `${v} day${v === 1 ? '' : 's'}`,
  weeks: (v) => `${v} week${v === 1 ? '' : 's'}`,
};

export default function DurationPicker({ value = { value: 1, unit: 'hours' }, onChange }) {
  const numVal = value?.value ?? 1;
  const unitVal = value?.unit ?? 'hours';

  const update = (key, newVal) => onChange({ ...value, [key]: newVal });

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <input
          type="number"
          value={numVal}
          min={1}
          onChange={(e) => update('value', Math.max(1, Number(e.target.value)))}
          className="w-20 px-3 py-1.5 text-[13px] border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
        />
        <Select value={unitVal} onValueChange={(v) => update('unit', v)}>
          <SelectTrigger className="flex-1 text-[13px] focus:ring-primary/30 focus:border-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {UNITS.map((u) => (
              <SelectItem key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p className="text-[11px] text-text-light">
        Wait {SUMMARIES[unitVal]?.(numVal) ?? `${numVal} ${unitVal}`}
      </p>
    </div>
  );
}
