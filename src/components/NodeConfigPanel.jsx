import { useState } from 'react';
import { NODE_TYPES, NODE_CATEGORIES } from '../data/nodeDefinitions';
import { X, ChevronDown, ChevronRight, Trash2, Volume2 } from 'lucide-react';
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

// Category accent colors
const CATEGORY_ICON_STYLES = {
  core: { bg: '#E5EEFF', stroke: '#407FF2' },
  logic: { bg: '#FFF3CC', stroke: '#F5B900' },
  integration: { bg: '#DCFCE7', stroke: '#16A34A' },
  ai: { bg: '#FFE4E6', stroke: '#E11D48' },
};

export default function NodeConfigPanel({ node, onUpdate, onDelete, onClose }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!node) return null;

  const nodeDef = NODE_TYPES[node.type];
  if (!nodeDef) return null;
  const cat = NODE_CATEGORIES[nodeDef.category];
  const IconComponent = Icons[nodeDef.icon] || Icons.Circle;
  const iconStyle = CATEGORY_ICON_STYLES[nodeDef.category] || CATEGORY_ICON_STYLES.core;

  const handleFieldChange = (key, value) => {
    onUpdate({ ...node, config: { ...node.config, [key]: value } });
  };

  const renderField = (field) => {
    const value = node.config?.[field.key] ?? field.default;

    switch (field.type) {
      case 'text':
        return (
          <div key={field.key} className="mb-4">
            <Label className="text-[12px] font-medium text-gray-700 mb-1.5 block">
              {field.label}
            </Label>
            <Input
              type="text"
              value={value || ''}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              className="text-[13px] bg-gray-50 border-gray-200 focus:bg-white focus:ring-blue-500/20 focus:border-blue-300 transition-all"
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          </div>
        );
      case 'textarea':
        return (
          <div key={field.key} className="mb-4">
            <Label className="text-[12px] font-medium text-gray-700 mb-1.5 block">
              {field.label}
            </Label>
            <Textarea
              value={value || ''}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              rows={3}
              className="text-[13px] bg-gray-50 border-gray-200 focus:bg-white focus:ring-blue-500/20 focus:border-blue-300 resize-none transition-all"
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10px] text-gray-400">
                Use {'{'}variable{'}'} for dynamic content
              </span>
              <span className="text-[10px] text-gray-400">
                {(value || '').length} chars
              </span>
            </div>
          </div>
        );
      case 'select':
        return (
          <div key={field.key} className="mb-4">
            <Label className="text-[12px] font-medium text-gray-700 mb-1.5 block">
              {field.label}
            </Label>
            <Select
              value={value || ''}
              onValueChange={(v) => handleFieldChange(field.key, v)}
            >
              <SelectTrigger className="text-[13px] bg-gray-50 border-gray-200 focus:ring-blue-500/20 focus:border-blue-300">
                <SelectValue
                  placeholder={`Select ${field.label.toLowerCase()}`}
                />
              </SelectTrigger>
              <SelectContent>
                {(field.options || []).map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case 'toggle':
        return (
          <div
            key={field.key}
            className="mb-4 flex items-center justify-between py-1.5 px-3 rounded-lg bg-gray-50 border border-gray-100"
          >
            <Label
              htmlFor={`toggle-${field.key}`}
              className="text-[12px] font-medium text-gray-700 cursor-pointer"
            >
              {field.label}
            </Label>
            <Switch
              id={`toggle-${field.key}`}
              checked={!!value}
              onCheckedChange={(checked) =>
                handleFieldChange(field.key, checked)
              }
            />
          </div>
        );
      case 'number':
        return (
          <div key={field.key} className="mb-4">
            <Label className="text-[12px] font-medium text-gray-700 mb-1.5 block">
              {field.label}
            </Label>
            <Input
              type="number"
              value={value ?? ''}
              onChange={(e) =>
                handleFieldChange(field.key, Number(e.target.value))
              }
              className="text-[13px] bg-gray-50 border-gray-200 focus:bg-white focus:ring-blue-500/20 focus:border-blue-300 transition-all"
            />
          </div>
        );
      case 'multiselect':
        return (
          <div key={field.key} className="mb-4">
            <Label className="text-[12px] font-medium text-gray-700 mb-2 block">
              {field.label}
            </Label>
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
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                      selected
                        ? 'bg-blue-50 border-blue-200 text-blue-600 font-medium'
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300'
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
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: iconStyle.bg }}
          >
            <IconComponent
              className="w-[18px] h-[18px]"
              style={{ color: iconStyle.stroke }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-semibold text-gray-900">
              {nodeDef.label}
            </div>
            <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: iconStyle.stroke }}
              />
              {cat.label}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer focus:outline-none"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Fields */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {nodeDef.configFields.map(renderField)}

          {/* Preview button for audio nodes */}
          {(node.type === 'greeting' || node.type === 'record_message') && (
            <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-[13px] text-gray-600 hover:bg-white hover:border-gray-300 hover:shadow-sm transition-all duration-200 mb-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <Volume2 className="w-4 h-4 text-blue-500" />
              <span>Preview audio</span>
            </button>
          )}

          {/* Advanced Settings */}
          {nodeDef.advancedFields && nodeDef.advancedFields.length > 0 && (
            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <div className="border-t border-gray-100 pt-4 mt-2">
                <CollapsibleTrigger className="flex items-center gap-2 text-[12px] font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200 mb-3 cursor-pointer focus:outline-none w-full text-left">
                  {showAdvanced ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                  Advanced Settings
                </CollapsibleTrigger>
                <CollapsibleContent>
                  {nodeDef.advancedFields.map(renderField)}
                </CollapsibleContent>
              </div>
            </Collapsible>
          )}
        </div>
      </ScrollArea>

      {/* Delete */}
      <div className="px-4 py-3 border-t border-gray-100">
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[13px] text-red-500 border border-transparent hover:bg-red-50 hover:border-red-100 hover:text-red-600 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-200"
        >
          <Trash2 className="w-4 h-4" />
          Delete Node
        </button>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this node?</AlertDialogTitle>
            <AlertDialogDescription>
              The <strong>{nodeDef.label}</strong> node and its configuration
              will be removed from the flow. This action can be undone with
              Ctrl+Z.
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
