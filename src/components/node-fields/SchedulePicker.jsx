import { useState } from 'react';
import { cn } from '@/lib/utils';

const DAYS = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
];

const DEFAULT_HOURS = { start: '09:00', end: '17:00', enabled: true };

function getDefaultSchedule() {
  return {
    mon: { ...DEFAULT_HOURS },
    tue: { ...DEFAULT_HOURS },
    wed: { ...DEFAULT_HOURS },
    thu: { ...DEFAULT_HOURS },
    fri: { ...DEFAULT_HOURS },
    sat: { start: '10:00', end: '14:00', enabled: false },
    sun: { start: '09:00', end: '17:00', enabled: false },
  };
}

export default function SchedulePicker({ value, onChange }) {
  const schedule = value || getDefaultSchedule();

  const toggleDay = (dayKey) => {
    onChange({ ...schedule, [dayKey]: { ...schedule[dayKey], enabled: !schedule[dayKey].enabled } });
  };

  const updateTime = (dayKey, field, time) => {
    onChange({ ...schedule, [dayKey]: { ...schedule[dayKey], [field]: time } });
  };

  const copyMondayToWeekdays = () => {
    const mon = schedule.mon;
    const updated = { ...schedule };
    ['tue', 'wed', 'thu', 'fri'].forEach((d) => {
      updated[d] = { ...mon };
    });
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      {DAYS.map(({ key, label }) => {
        const day = schedule[key] || DEFAULT_HOURS;
        return (
          <div key={key} className="flex items-center gap-2">
            {/* Day toggle */}
            <button
              type="button"
              onClick={() => toggleDay(key)}
              className={cn(
                'w-10 text-[11px] font-semibold rounded-md py-1 transition-all duration-150 cursor-pointer focus:outline-none',
                day.enabled
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-text-light hover:bg-slate-200',
              )}
            >
              {label}
            </button>

            {day.enabled ? (
              <div className="flex items-center gap-1.5 flex-1">
                <input
                  type="time"
                  value={day.start}
                  onChange={(e) => updateTime(key, 'start', e.target.value)}
                  className="w-[90px] text-[12px] px-2 py-1 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/40 bg-white"
                />
                <span className="text-[11px] text-text-light">to</span>
                <input
                  type="time"
                  value={day.end}
                  onChange={(e) => updateTime(key, 'end', e.target.value)}
                  className="w-[90px] text-[12px] px-2 py-1 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/40 bg-white"
                />
              </div>
            ) : (
              <span className="text-[11px] text-text-light italic flex-1">Closed</span>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={copyMondayToWeekdays}
        className="text-[11px] text-primary hover:underline cursor-pointer focus:outline-none mt-1"
      >
        Copy Monday hours to all weekdays
      </button>
    </div>
  );
}
