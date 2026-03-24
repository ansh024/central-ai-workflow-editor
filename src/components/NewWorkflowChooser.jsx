import { Sparkles, LayoutTemplate, Plus, ChevronRight, X } from 'lucide-react';

export default function NewWorkflowChooser({ onChooseMax, onChooseTemplates, onChooseScratch, onClose }) {
  const options = [
    {
      id: 'max',
      icon: Sparkles,
      iconBg: 'bg-gradient-to-br from-cyan-500 to-emerald-500',
      title: 'Create with Max',
      subtitle: 'Our AI workflow guide',
      description: 'Answer 7 quick questions by voice or text. Max builds your complete call flow in ~3 minutes.',
      tag: 'Recommended',
      tagColor: 'bg-cyan-500/15 text-cyan-400',
      onClick: onChooseMax,
    },
    {
      id: 'templates',
      icon: LayoutTemplate,
      iconBg: 'bg-primary/10',
      title: 'Use Pre-Built Templates',
      subtitle: 'Industry-specific workflows',
      description: 'Choose from 30+ pre-built workflows for dental, legal, HVAC, salon, medical, and real estate.',
      tag: null,
      onClick: onChooseTemplates,
    },
    {
      id: 'scratch',
      icon: Plus,
      iconBg: 'bg-slate-100',
      title: 'Start from Scratch',
      subtitle: 'Blank canvas',
      description: 'Build your flow node by node using the visual editor. Full control over every step.',
      tag: null,
      onClick: onChooseScratch,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-2xl mx-4 animate-in zoom-in-95 slide-in-from-bottom-2 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-7 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-text-dark">Create New Workflow</h2>
            <p className="text-sm text-text-mid mt-0.5">How would you like to get started?</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-50 text-text-light hover:text-text-mid transition-colors duration-200 cursor-pointer focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="px-7 pb-7 space-y-3">
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                onClick={opt.onClick}
                className="w-full text-left flex items-start gap-5 p-5 rounded-xl border border-border hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 bg-surface"
              >
                <div className={`w-12 h-12 rounded-xl ${opt.iconBg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-6 h-6 ${opt.id === 'max' ? 'text-white' : opt.id === 'templates' ? 'text-primary' : 'text-text-mid'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[15px] font-semibold text-text-dark group-hover:text-primary transition-colors duration-200">{opt.title}</span>
                    {opt.tag && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${opt.tagColor}`}>{opt.tag}</span>
                    )}
                  </div>
                  <span className="text-xs text-text-light block mb-1">{opt.subtitle}</span>
                  <p className="text-[13px] text-text-mid leading-relaxed">{opt.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-text-light mt-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
