import { useState } from 'react';
import { X, RotateCcw, Eye } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function VersionHistory({ versions, activeVersionId, onRestore, onClose }) {
  const [dateFilter, setDateFilter] = useState('all');

  const filterCutoff = () => {
    if (dateFilter === 'all') return null;
    const d = new Date();
    if (dateFilter === '7d') d.setDate(d.getDate() - 7);
    else if (dateFilter === '30d') d.setDate(d.getDate() - 30);
    else if (dateFilter === '90d') d.setDate(d.getDate() - 90);
    return d;
  };

  const cutoff = filterCutoff();
  const sorted = [...versions]
    .filter((v) => !cutoff || new Date(v.timestamp) >= cutoff)
    .sort((a, b) => b.version - a.version);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40 animate-in fade-in duration-150" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-[400px] bg-surface border-l border-border z-50 flex flex-col animate-in slide-in-from-right duration-200 shadow-xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-semibold text-text-dark">Version History</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-50 transition-colors duration-200 cursor-pointer focus:outline-none"
            >
              <X className="w-4.5 h-4.5 text-text-mid" />
            </button>
          </div>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="text-[12px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Version List */}
        <div className="flex-1 overflow-y-auto py-2">
          {sorted.map((ver) => {
            const isActive = ver.id === activeVersionId;
            return (
              <div
                key={ver.id}
                className={`px-6 py-4 border-b border-border last:border-b-0 ${isActive ? 'bg-primary/3' : ''}`}
              >
                <div className="flex items-start gap-3">
                  {/* Timeline dot */}
                  <div className="mt-1 shrink-0">
                    <div className={`w-3 h-3 rounded-full border-2 ${
                      isActive ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-300'
                    }`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] font-semibold text-text-dark">v{ver.version}</span>
                      <span className="text-[12px] text-text-light">—</span>
                      <span className="text-[12px] text-text-mid font-medium">{ver.author}</span>
                      {isActive && (
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-[12px] text-text-light mb-1.5">
                      {formatDate(ver.timestamp)} at {formatTime(ver.timestamp)}
                    </div>
                    {ver.note && (
                      <p className="text-[12px] text-text-mid italic leading-relaxed">"{ver.note}"</p>
                    )}

                    {/* Actions */}
                    {!isActive && (
                      <div className="flex items-center gap-3 mt-3">
                        <button className="flex items-center gap-1.5 text-[12px] font-medium text-text-mid hover:text-primary transition-colors duration-200 cursor-pointer focus:outline-none">
                          <Eye className="w-3.5 h-3.5" />
                          Preview
                        </button>
                        <button
                          onClick={() => onRestore(ver.id)}
                          className="flex items-center gap-1.5 text-[12px] font-medium text-primary hover:text-primary-dark transition-colors duration-200 cursor-pointer focus:outline-none"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Restore
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-3">
          <p className="text-[11px] text-text-light leading-relaxed">
            Restoring a version creates a new snapshot. Previous versions are never deleted.
          </p>
        </div>
      </div>
    </>
  );
}
