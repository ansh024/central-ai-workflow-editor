import { useState } from 'react';
import { NODE_TYPES, NODE_CATEGORIES } from '../data/nodeDefinitions';
import { X, ChevronDown, ChevronRight, Trash2, Volume2, MousePointerClick } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

export default function NodeConfigPanel({ node, onUpdate, onDelete, onClose }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
            <Label className="text-[13px] font-medium text-text-dark mb-1.5 block">{field.label}</Label>
            <Input
              type="text"
              value={value || ''}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              className="text-[13px] focus:ring-primary/30 focus:border-primary"
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          </div>
        );
      case 'textarea':
        return (
          <div key={field.key} className="mb-4">
            <Label className="text-[13px] font-medium text-text-dark mb-1.5 block">{field.label}</Label>
            <Textarea
              value={value || ''}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              rows={3}
              className="text-[13px] focus:ring-primary/30 focus:border-primary resize-none"
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
            <Label className="text-[13px] font-medium text-text-dark mb-1.5 block">{field.label}</Label>
            <Select value={value || ''} onValueChange={(v) => handleFieldChange(field.key, v)}>
              <SelectTrigger className="text-[13px] focus:ring-primary/30 focus:border-primary">
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {(field.options || []).map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case 'toggle':
        return (
          <div key={field.key} className="mb-4 flex items-center justify-between py-1">
            <Label
              htmlFor={`toggle-${field.key}`}
              className="text-[13px] font-medium text-text-dark cursor-pointer"
            >
              {field.label}
            </Label>
            <Switch
              id={`toggle-${field.key}`}
              checked={!!value}
              onCheckedChange={(checked) => handleFieldChange(field.key, checked)}
            />
          </div>
        );
      case 'number':
        return (
          <div key={field.key} className="mb-4">
            <Label className="text-[13px] font-medium text-text-dark mb-1.5 block">{field.label}</Label>
            <Input
              type="number"
              value={value ?? ''}
              onChange={(e) => handleFieldChange(field.key, Number(e.target.value))}
              className="text-[13px] focus:ring-primary/30 focus:border-primary"
            />
          </div>
        );
      case 'multiselect':
        return (
          <div key={field.key} className="mb-4">
            <Label className="text-[13px] font-medium text-text-dark mb-2 block">{field.label}</Label>
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
      <ScrollArea className="flex-1">
        <div className="p-4">
          {nodeDef.configFields.map(renderField)}

          {/* Preview button for greeting/record nodes */}
          {(node.type === 'greeting' || node.type === 'record_message') && (
            <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-border text-[13px] text-text-mid hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 mb-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30">
              <Volume2 className="w-4 h-4 text-primary" />
              <span>Hear this greeting</span>
            </button>
          )}

          {/* Advanced Settings — shadcn Collapsible */}
          {nodeDef.advancedFields && nodeDef.advancedFields.length > 0 && (
            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <div className="border-t border-border pt-4 mt-2">
                <CollapsibleTrigger className="flex items-center gap-2 text-[13px] font-medium text-text-mid hover:text-text-dark transition-colors duration-200 mb-3 cursor-pointer focus:outline-none w-full text-left">
                  {showAdvanced ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  Advanced Settings
                </CollapsibleTrigger>
                <CollapsibleContent className="animate-in slide-in-from-top-1 duration-200">
                  {nodeDef.advancedFields.map(renderField)}
                </CollapsibleContent>
              </div>
            </Collapsible>
          )}
        </div>
      </ScrollArea>

      {/* Delete */}
      <div className="px-4 py-3 border-t border-border">
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-[13px] text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-200"
        >
          <Trash2 className="w-4 h-4" />
          Delete Node
        </button>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this node?</AlertDialogTitle>
            <AlertDialogDescription>
              The <strong>{nodeDef.label}</strong> node and its configuration will be removed from the flow. This action can be undone with Ctrl+Z.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                setShowDeleteConfirm(false);
                onDelete(node.id);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
