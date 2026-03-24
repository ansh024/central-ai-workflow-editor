import { useState } from 'react';
import { TEMPLATES, BUSINESS_TYPES, getTemplatesByType } from '../data/templates';
import { Search, Plus, Clock, ArrowRight, Workflow, Sparkles, Check } from 'lucide-react';
import * as Icons from 'lucide-react';

export default function TemplateGallery({ onSelectTemplate, onStartScratch, savedFlows = [], embedded = false }) {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('dental');

  const typeTemplates = getTemplatesByType(selectedType);
  const filtered = search
    ? typeTemplates.filter(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.description.toLowerCase().includes(search.toLowerCase())
      )
    : typeTemplates;

  const selectedBusiness = BUSINESS_TYPES.find((b) => b.id === selectedType);

  return (
    <div className={`${embedded ? 'h-full overflow-y-auto' : 'min-h-screen'} bg-bg`}>
      {/* Header — only shown when standalone */}
      {!embedded && (
        <header className="border-b border-border bg-surface px-8 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                <Workflow className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[15px] font-semibold text-text-dark tracking-tight">Central AI</span>
                <span className="text-xs text-text-light ml-2 hidden sm:inline">Workflow Builder</span>
              </div>
            </div>
            <button
              onClick={onStartScratch}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-text-mid hover:bg-slate-50 hover:text-text-dark hover:border-slate-300 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
            >
              <Plus className="w-4 h-4" />
              New Workflow
            </button>
          </div>
        </header>
      )}

      <div className="max-w-6xl mx-auto px-8 py-10">
        {/* Saved Flows */}
        {savedFlows.length > 0 && (
          <div className="mb-12">
            <h2 className="text-[13px] font-semibold text-text-dark uppercase tracking-wider mb-4">Your Flows</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedFlows.map((flow) => (
                <button
                  key={flow.id}
                  onClick={() => onSelectTemplate(flow)}
                  className="text-left bg-surface border border-border rounded-xl p-5 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-text-dark group-hover:text-primary transition-colors duration-200">{flow.name}</span>
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                      flow.status === 'Published' ? 'bg-emerald-50 text-emerald-700' :
                      flow.status === 'Modified' ? 'bg-amber-50 text-amber-700' :
                      'bg-slate-100 text-text-mid'
                    }`}>
                      {flow.status || 'Draft'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-light">
                    <Workflow className="w-3.5 h-3.5" />
                    <span>{flow.nodeCount || 0} nodes</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Activate New Workflow */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-semibold text-text-dark tracking-tight">Activate New Workflow</h1>
            </div>
            <p className="text-text-mid text-[14px] leading-relaxed max-w-xl">
              Select your business type, then choose a pre-built workflow to activate. Fully customizable after deployment.
            </p>
          </div>
          {embedded && (
            <button
              onClick={onStartScratch}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-text-mid hover:bg-slate-50 hover:text-text-dark hover:border-slate-300 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              New Workflow
            </button>
          )}
        </div>

        {/* Business Type Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {BUSINESS_TYPES.map((type) => {
            const TypeIcon = Icons[type.icon] || Icons.Building2;
            const isActive = selectedType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => { setSelectedType(type.id); setSearch(''); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                  isActive
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-surface border-border text-text-mid hover:border-slate-300 hover:bg-slate-50 hover:text-text-dark'
                }`}
              >
                <TypeIcon className="w-4 h-4" />
                {type.label}
                {isActive && <Check className="w-3.5 h-3.5 ml-0.5" />}
              </button>
            );
          })}
        </div>

        {/* Search within selected type */}
        <div className="relative max-w-sm mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
          <input
            type="text"
            placeholder={`Search ${selectedBusiness?.label || ''} workflows...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
          />
        </div>

        {/* Workflow Cards for Selected Business Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((template) => (
            <div
              key={template.id}
              role="button"
              tabIndex={0}
              className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer relative group focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
              onClick={() => onSelectTemplate(template)}
              onKeyDown={(e) => e.key === 'Enter' && onSelectTemplate(template)}
            >
              {template.popular && (
                <span className="absolute top-4 right-4 text-[11px] font-semibold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                  Recommended
                </span>
              )}

              <h3 className="text-[15px] font-semibold text-text-dark mb-2 group-hover:text-primary transition-colors duration-200 pr-20">
                {template.name}
              </h3>
              <p className="text-[13px] text-text-mid leading-relaxed mb-5 line-clamp-3">
                {template.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-[12px] text-text-light">
                  <span className="flex items-center gap-1.5">
                    <Workflow className="w-3.5 h-3.5" />
                    {template.nodeCount} nodes
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {template.setupTime}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-all duration-200">
                  Activate <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-8 h-8 text-text-light mx-auto mb-3" />
            <p className="text-sm text-text-mid">No workflows match "{search}"</p>
            <button
              onClick={() => setSearch('')}
              className="text-sm text-primary mt-2 hover:underline cursor-pointer focus:outline-none"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
