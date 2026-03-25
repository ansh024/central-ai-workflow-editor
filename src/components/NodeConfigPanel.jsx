import { useState, useRef } from 'react';
import { NODE_TYPES, NODE_CATEGORIES } from '../data/nodeDefinitions';
import { X, ChevronDown, ChevronRight, Trash2, Volume2, Plus, Check } from 'lucide-react';
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

// Shared field components
import TagChipsInput from './node-fields/TagChipsInput';
import DurationPicker from './node-fields/DurationPicker';
import MessageEditor from './node-fields/MessageEditor';
import SchedulePicker from './node-fields/SchedulePicker';
import ConditionBuilder from './node-fields/ConditionBuilder';
import PhoneListEditor from './node-fields/PhoneListEditor';
import KeyValueEditor from './node-fields/KeyValueEditor';
import IntegrationSelector from './node-fields/IntegrationSelector';
import ConnectionStatusBar from './node-fields/ConnectionStatusBar';

// Category accent colors — covers all 6 categories
const CATEGORY_ICON_STYLES = {
  trigger:     { bg: '#F3E8FF', stroke: '#8B5CF6' },
  core:        { bg: '#E5EEFF', stroke: '#407FF2' },
  logic:       { bg: '#FFF3CC', stroke: '#F5B900' },
  integration: { bg: '#DCFCE7', stroke: '#16A34A' },
  industry:    { bg: '#CCFBF1', stroke: '#14B8A6' },
  ai:          { bg: '#FFE4E6', stroke: '#E11D48' },
};

// Evaluate showWhen condition against current config
function isFieldVisible(field, config) {
  if (!field.showWhen) return true;
  const { key, equals, notEquals, includes: includesVal } = field.showWhen;
  const val = config?.[key];
  if (equals !== undefined) return val === equals;
  if (notEquals !== undefined) return val !== notEquals;
  if (includesVal !== undefined) return Array.isArray(val) && val.includes(includesVal);
  return true;
}

export default function NodeConfigPanel({ node, onUpdate, onDelete, onClose }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notesEditing, setNotesEditing] = useState(false);
  const [notesValue, setNotesValue] = useState(node?.meta?.notes || '');

  if (!node) return null;

  const nodeDef = NODE_TYPES[node.type];
  if (!nodeDef) return null;
  const cat = NODE_CATEGORIES[nodeDef.category];
  const IconComponent = Icons[nodeDef.icon] || Icons.Circle;
  const iconStyle = CATEGORY_ICON_STYLES[nodeDef.category] || CATEGORY_ICON_STYLES.core;

  const handleFieldChange = (key, value) => {
    onUpdate({ ...node, config: { ...node.config, [key]: value } });
  };

  const saveNotes = () => {
    onUpdate({ ...node, meta: { ...node.meta, notes: notesValue } });
    setNotesEditing(false);
  };

  const renderField = (field) => {
    if (!isFieldVisible(field, node.config)) return null;
    const value = node.config?.[field.key] ?? field.default;

    const helpText = field.helpText ? (
      <p className="text-[10px] text-gray-400 mt-1">{field.helpText}</p>
    ) : null;

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
            {helpText}
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
            {helpText}
          </div>
        );

      case 'richtext':
        return (
          <div key={field.key} className="mb-4">
            <Label className="text-[12px] font-medium text-gray-700 mb-1.5 block">
              {field.label}
            </Label>
            <MessageEditor
              value={value || ''}
              onChange={(v) => handleFieldChange(field.key, v)}
            />
            {helpText}
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
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {(field.options || []).map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {helpText}
          </div>
        );

      case 'toggle':
        return (
          <div key={field.key} className="mb-4 flex items-center justify-between py-1.5 px-3 rounded-lg bg-gray-50 border border-gray-100">
            <Label htmlFor={`toggle-${field.key}`} className="text-[12px] font-medium text-gray-700 cursor-pointer">
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
            <Label className="text-[12px] font-medium text-gray-700 mb-1.5 block">
              {field.label}
            </Label>
            <Input
              type="number"
              value={value ?? ''}
              onChange={(e) => handleFieldChange(field.key, Number(e.target.value))}
              className="text-[13px] bg-gray-50 border-gray-200 focus:bg-white focus:ring-blue-500/20 focus:border-blue-300 transition-all"
            />
            {helpText}
          </div>
        );

      case 'slider': {
        const min = field.min ?? 0;
        const max = field.max ?? 100;
        const step = field.step ?? 1;
        return (
          <div key={field.key} className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-[12px] font-medium text-gray-700">{field.label}</Label>
              <span className="text-[12px] font-semibold text-blue-600">{value ?? min}{field.unit || ''}</span>
            </div>
            <input
              type="range"
              min={min} max={max} step={step}
              value={value ?? min}
              onChange={(e) => handleFieldChange(field.key, Number(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
              <span>{min}{field.unit || ''}</span>
              <span>{max}{field.unit || ''}</span>
            </div>
            {helpText}
          </div>
        );
      }

      case 'percentage': {
        const pctVal = value ?? 50;
        return (
          <div key={field.key} className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-[12px] font-medium text-gray-700">{field.label}</Label>
              <span className="text-[12px] font-semibold text-blue-600">{pctVal}%</span>
            </div>
            <input
              type="range"
              min={0} max={100} step={1}
              value={pctVal}
              onChange={(e) => handleFieldChange(field.key, Number(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="mt-1.5 h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pctVal}%` }} />
            </div>
            {helpText}
          </div>
        );
      }

      case 'multiselect':
        return (
          <div key={field.key} className="mb-4">
            <Label className="text-[12px] font-medium text-gray-700 mb-2 block">{field.label}</Label>
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
            {helpText}
          </div>
        );

      case 'tag_chips':
      case 'zipcode_list':
        return (
          <div key={field.key} className="mb-4">
            <Label className="text-[12px] font-medium text-gray-700 mb-1.5 block">{field.label}</Label>
            <TagChipsInput
              value={value || []}
              onChange={(v) => handleFieldChange(field.key, v)}
              placeholder={field.placeholder || (field.type === 'zipcode_list' ? 'Add zip code...' : 'Add tag...')}
              validate={field.type === 'zipcode_list' ? (v) => /^\d{5}(-\d{4})?$/.test(v.trim()) : undefined}
            />
            {helpText}
          </div>
        );

      case 'duration':
        return (
          <div key={field.key} className="mb-4">
            <Label className="text-[12px] font-medium text-gray-700 mb-1.5 block">{field.label}</Label>
            <DurationPicker
              value={value}
              onChange={(v) => handleFieldChange(field.key, v)}
            />
            {helpText}
          </div>
        );

      case 'schedule':
        return (
          <div key={field.key} className="mb-4">
            <Label className="text-[12px] font-medium text-gray-700 mb-1.5 block">{field.label}</Label>
            <SchedulePicker
              value={value}
              onChange={(v) => handleFieldChange(field.key, v)}
            />
            {helpText}
          </div>
        );

      case 'condition':
        return (
          <div key={field.key} className="mb-4">
            <Label className="text-[12px] font-medium text-gray-700 mb-1.5 block">{field.label}</Label>
            <ConditionBuilder
              value={value || []}
              onChange={(v) => handleFieldChange(field.key, v)}
              fields={field.conditionFields || []}
            />
            {helpText}
          </div>
        );

      case 'phone_list':
        return (
          <div key={field.key} className="mb-4">
            <Label className="text-[12px] font-medium text-gray-700 mb-1.5 block">{field.label}</Label>
            <PhoneListEditor
              value={value || []}
              onChange={(v) => handleFieldChange(field.key, v)}
            />
            {helpText}
          </div>
        );

      case 'key_value':
        return (
          <div key={field.key} className="mb-4">
            <Label className="text-[12px] font-medium text-gray-700 mb-1.5 block">{field.label}</Label>
            <KeyValueEditor
              value={value || []}
              onChange={(v) => handleFieldChange(field.key, v)}
              keyPlaceholder={field.keyPlaceholder}
              valuePlaceholder={field.valuePlaceholder}
            />
            {helpText}
          </div>
        );

      case 'integration':
        return (
          <div key={field.key} className="mb-4">
            <Label className="text-[12px] font-medium text-gray-700 mb-1.5 block">{field.label}</Label>
            <IntegrationSelector
              value={value || ''}
              options={field.options || []}
              onChange={(v) => handleFieldChange(field.key, v)}
            />
            {helpText}
          </div>
        );

      case 'file_upload':
        return (
          <div key={field.key} className="mb-4">
            <Label className="text-[12px] font-medium text-gray-700 mb-1.5 block">{field.label}</Label>
            <label className="flex flex-col items-center gap-2 px-4 py-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 cursor-pointer hover:bg-white hover:border-gray-300 transition-all">
              <Icons.Upload className="w-5 h-5 text-gray-400" />
              <span className="text-[12px] text-gray-500">
                {value ? (value.name || 'File selected') : 'Click to upload'}
              </span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => handleFieldChange(field.key, e.target.files?.[0] || null)}
                accept={field.accept}
              />
            </label>
            {helpText}
          </div>
        );

      case 'color_select': {
        const colors = field.options || ['green', 'yellow', 'red'];
        const colorMap = { green: '#22C55E', yellow: '#F59E0B', red: '#EF4444', blue: '#3B82F6', gray: '#9CA3AF' };
        return (
          <div key={field.key} className="mb-4">
            <Label className="text-[12px] font-medium text-gray-700 mb-2 block">{field.label}</Label>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => handleFieldChange(field.key, c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer focus:outline-none ${value === c ? 'border-gray-800 scale-110' : 'border-transparent hover:border-gray-300'}`}
                  style={{ backgroundColor: colorMap[c] || c }}
                  title={c}
                />
              ))}
            </div>
            {helpText}
          </div>
        );
      }

      default:
        return null;
    }
  };

  const visibleConfig = (nodeDef.configFields || []).filter((f) => isFieldVisible(f, node.config));
  const visibleAdvanced = (nodeDef.advancedFields || []).filter((f) => isFieldVisible(f, node.config));

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
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: iconStyle.stroke }} />
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
        {nodeDef.description && (
          <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">{nodeDef.description}</p>
        )}
      </div>

      {/* Connection status bar for integration nodes */}
      {nodeDef.requiresIntegration && (
        <ConnectionStatusBar integrations={[nodeDef.requiresIntegration]} />
      )}

      {/* Fields */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {visibleConfig.map(renderField)}

          {/* Preview button for audio nodes */}
          {(node.type === 'greeting' || node.type === 'record_message') && (
            <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-[13px] text-gray-600 hover:bg-white hover:border-gray-300 hover:shadow-sm transition-all duration-200 mb-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <Volume2 className="w-4 h-4 text-blue-500" />
              <span>Preview audio</span>
            </button>
          )}

          {/* Advanced Settings */}
          {visibleAdvanced.length > 0 && (
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
                  {visibleAdvanced.map(renderField)}
                </CollapsibleContent>
              </div>
            </Collapsible>
          )}

          {/* Output Ports / Branches */}
          {node.branches && node.branches.length > 0 && (
            <div className="border-t border-gray-100 pt-4 mt-2">
              <div className="text-[12px] font-medium text-gray-500 mb-2">Output Ports</div>
              <div className="space-y-1.5">
                {node.branches.map((branch, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                    <span className="text-[12px] text-gray-700 flex-1">{branch.label}</span>
                    {branch.nodes?.length > 0 && (
                      <span className="text-[10px] text-gray-400">{branch.nodes.length} node{branch.nodes.length !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Node Notes */}
          <div className="border-t border-gray-100 pt-4 mt-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] font-medium text-gray-500">Notes</span>
              {!notesEditing ? (
                <button
                  onClick={() => setNotesEditing(true)}
                  className="text-[11px] text-blue-500 hover:text-blue-600 cursor-pointer focus:outline-none"
                >
                  Edit
                </button>
              ) : (
                <button
                  onClick={saveNotes}
                  className="flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 cursor-pointer focus:outline-none"
                >
                  <Check className="w-3 h-3" />Save
                </button>
              )}
            </div>
            {notesEditing ? (
              <Textarea
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                rows={2}
                placeholder="Add a note about this node..."
                className="text-[12px] bg-gray-50 border-gray-200 focus:bg-white resize-none"
                autoFocus
              />
            ) : (
              <p
                className={`text-[12px] leading-relaxed cursor-pointer rounded-lg px-2 py-1.5 -mx-2 hover:bg-gray-50 transition-colors ${notesValue ? 'text-gray-600' : 'text-gray-300 italic'}`}
                onClick={() => setNotesEditing(true)}
              >
                {notesValue || 'No notes yet. Click to add...'}
              </p>
            )}
          </div>
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
