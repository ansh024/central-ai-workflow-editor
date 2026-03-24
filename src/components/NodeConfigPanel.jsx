import { useState } from 'react';
import { NODE_TYPES, NODE_CATEGORIES } from '../data/nodeDefinitions';
import { X, ChevronDown, ChevronRight, Trash2, Volume2, MousePointerClick } from 'lucide-react';
import * as Icons from 'lucide-react';

export default function NodeConfigPanel({ node, onUpdate, onDelete, onClose }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!node) {
    return (
      <div className="w-80 border-l border-border bg-surface flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
            <MousePointerClick className="w-6 h-6 text-text-light" />
          </div>
          <p className="text-sm font-medium text-text-mid mb-1">Select a node</p>
          <p className="text-[12px] text-text-light leading-relaxed max-w-[180px] mx-auto">Click any node on the canvas to view and edit its configuration</p>
        </div>
      </div>
    );
  }

  const nodeDef = NODE_TYPES[node.type];
  if (!nodeDef) return null;
  const cat = NODE_CATEGORIES[nodeDef.category];
  const IconComponent = Icons[nodeDef.icon] || Icons.Circle;

  const handleFieldChange = (key, value) => {
    onUpdate({ ...node, config: { ...node.config, [key]: value } });
  };

  const renderField = (field) => {
    const value = node.config?.[field.key] ?? field.default;

    switch (field.type) {
      case 'text':
        return (
          <div key={field.key} className="mb-4">
            <label className="block text-[13px] font-medium text-text-dark mb-1.5">{field.label}</label>
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border text-[13px] text-text-dark bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 placeholder:text-placeholder"
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          </div>
        );
      case 'textarea':
        return (
          <div key={field.key} className="mb-4">
            <label className="block text-[13px] font-medium text-text-dark mb-1.5">{field.label}</label>
            <textarea
              value={value || ''}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-border text-[13px] text-text-dark bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 resize-none placeholder:text-placeholder"
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
            <div className="flex items-center justify-between mt-1">
              <span className="text-[11px] text-text-light">Use {'{'}variable{'}'} for dynamic content</span>
              <span className="text-[11px] text-text-light">{(value || '').length} chars</span>
            </div>
          </div>
        );
      case 'select':
        return (
          <div key={field.key} className="mb-4">
            <label className="block text-[13px] font-medium text-text-dark mb-1.5">{field.label}</label>
            <select
              value={value || ''}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border text-[13px] text-text-dark bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 cursor-pointer appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
            >
              {(field.options || []).map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        );
      case 'toggle':
        return (
          <div key={field.key} className="mb-4 flex items-center justify-between py-1">
            <label className="text-[13px] font-medium text-text-dark cursor-pointer" onClick={() => handleFieldChange(field.key, !value)}>
              {field.label}
            </label>
            <button
              onClick={() => handleFieldChange(field.key, !value)}
              role="switch"
              aria-checked={!!value}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 ${value ? 'bg-primary' : 'bg-slate-200'}`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${value ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
        );
      case 'number':
        return (
          <div key={field.key} className="mb-4">
            <label className="block text-[13px] font-medium text-text-dark mb-1.5">{field.label}</label>
            <input
              type="number"
              value={value ?? ''}
              onChange={(e) => handleFieldChange(field.key, Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-lg border border-border text-[13px] text-text-dark bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
            />
          </div>
        );
      case 'multiselect':
        return (
          <div key={field.key} className="mb-4">
            <label className="block text-[13px] font-medium text-text-dark mb-2">{field.label}</label>
            <div className="flex flex-wrap gap-1.5">
              {(field.options || []).map((opt) => {
                const selected = (value || []).includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => {
                      const newVal = selected
                        ? (value || []).filter((v) => v !== opt)
                        : [...(value || []), opt];
                      handleFieldChange(field.key, newVal);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-[12px] border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                      selected
                        ? 'bg-primary/10 border-primary/30 text-primary font-medium shadow-sm'
                        : 'bg-surface border-border text-text-mid hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-80 border-l border-border bg-surface flex flex-col shrink-0">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: cat.colorHex + '12' }}>
          <IconComponent className="w-4.5 h-4.5" style={{ color: cat.colorHex }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-semibold text-text-dark">{nodeDef.label}</div>
          <div className="text-[11px] text-text-light flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.colorHex }} />
            {cat.label} Node
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
          aria-label="Close configuration panel"
        >
          <X className="w-4 h-4 text-text-light" />
        </button>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto p-4">
        {nodeDef.configFields.map(renderField)}

        {/* Preview button for greeting/record nodes */}
        {(node.type === 'greeting' || node.type === 'record_message') && (
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-border text-[13px] text-text-mid hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 mb-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30">
            <Volume2 className="w-4 h-4 text-primary" />
            <span>Hear this greeting</span>
          </button>
        )}

        {/* Advanced Settings */}
        {nodeDef.advancedFields && nodeDef.advancedFields.length > 0 && (
          <div className="border-t border-border pt-4 mt-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-[13px] font-medium text-text-mid hover:text-text-dark transition-colors duration-200 mb-3 cursor-pointer focus:outline-none"
            >
              {showAdvanced ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              Advanced Settings
            </button>
            {showAdvanced && (
              <div className="animate-in slide-in-from-top-1 duration-200">
                {nodeDef.advancedFields.map(renderField)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete */}
      <div className="px-4 py-3 border-t border-border">
        <button
          onClick={() => onDelete(node.id)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-[13px] text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-200"
        >
          <Trash2 className="w-4 h-4" />
          Delete Node
        </button>
      </div>
    </div>
  );
}
