import { useState } from 'react';
import {
  Menu, ChevronDown, ChevronUp, Bell, HelpCircle, Sparkles,
  PenSquare, Clock, Link, Workflow, FileText, Database,
  PhoneIncoming, MessageCircle, ListChecks, LayoutGrid, Calendar,
  Search, Paperclip, ArrowUp, Rocket,
} from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

const SIDEBAR_SECTIONS = [
  {
    id: 'ask-central',
    label: 'Ask Central',
    icon: Sparkles,
    collapsible: true,
    defaultOpen: true,
    items: [
      { id: 'new-chat', label: 'New Chat', icon: PenSquare, active: true },
      { id: 'history', label: 'History', icon: Clock },
      { id: 'connect', label: 'Connect', icon: Link },
      { id: 'workflows', label: 'Workflows', icon: Workflow, isWorkflows: true },
      { id: 'prompts', label: 'Prompts', icon: FileText },
    ],
  },
  {
    id: 'knowledge',
    standalone: true,
    label: 'Knowledge',
    icon: Database,
  },
  {
    id: 'front-desk',
    label: 'YOUR FRONT DESK',
    isHeading: true,
    items: [
      { id: 'reception', label: 'Reception', icon: PhoneIncoming, hasSubmenu: true },
      { id: 'chats', label: 'Chats', icon: MessageCircle, hasSubmenu: true },
      { id: 'tickets', label: 'Tickets', icon: ListChecks },
    ],
  },
  {
    id: 'tools',
    label: 'TOOLS',
    isHeading: true,
    items: [
      { id: 'crm', label: 'CRM', icon: LayoutGrid, hasSubmenu: true },
      { id: 'scheduler', label: 'Scheduler', icon: Calendar, hasSubmenu: true },
    ],
  },
];

export default function AppShell({ activeView, onNavigate, onStartOnboarding, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [askCentralOpen, setAskCentralOpen] = useState(true);

  // Full-screen views: hide shell
  if (activeView === 'editor' || activeView === 'setupcall' || activeView === 'onboarding') {
    return children;
  }

  return (
    <TooltipProvider>
    <div className="h-screen flex flex-col bg-bg overflow-hidden">
      {/* Top Bar */}
      <header className="h-12 border-b border-border bg-surface flex items-center px-4 shrink-0 z-20">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg hover:bg-slate-50 transition-colors duration-200 cursor-pointer mr-3 focus:outline-none"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-text-mid" />
        </button>

        <div className="flex items-center gap-2 cursor-pointer">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-[15px] font-semibold text-text-dark tracking-tight">Central Frontdesk</span>
          <ChevronDown className="w-4 h-4 text-text-light" />
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] text-text-mid hover:bg-slate-50 transition-colors duration-200 cursor-pointer focus:outline-none">
            <HelpCircle className="w-4 h-4" />
            Feedback
          </button>
          <button className="p-2 rounded-lg hover:bg-slate-50 transition-colors duration-200 cursor-pointer focus:outline-none" aria-label="Notifications">
            <Bell className="w-4.5 h-4.5 text-text-mid" />
          </button>
          <button className="p-2 rounded-lg hover:bg-slate-50 transition-colors duration-200 cursor-pointer focus:outline-none" aria-label="Wave">
            <span className="text-lg">👋</span>
          </button>
          <button className="ml-1 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30">
            <span className="text-xs font-semibold text-primary">G</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-[240px] border-r border-border bg-surface flex flex-col shrink-0 overflow-y-auto">
            <nav className="flex-1 py-2 px-2">
              {SIDEBAR_SECTIONS.map((section) => {
                // Standalone item (like Knowledge)
                if (section.standalone) {
                  const SIcon = section.icon;
                  return (
                    <button
                      key={section.id}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-text-mid hover:bg-slate-50 transition-colors duration-200 cursor-pointer focus:outline-none mt-0.5"
                    >
                      <SIcon className="w-4.5 h-4.5" />
                      {section.label}
                    </button>
                  );
                }

                // Collapsible section (Ask Central)
                if (section.collapsible) {
                  const SIcon = section.icon;
                  const isOpen = askCentralOpen;
                  return (
                    <div key={section.id} className="mb-1">
                      <button
                        onClick={() => setAskCentralOpen(!isOpen)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-primary hover:bg-primary/5 transition-colors duration-200 cursor-pointer focus:outline-none"
                      >
                        <SIcon className="w-4.5 h-4.5" />
                        <span className="flex-1 text-left">{section.label}</span>
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {isOpen && (
                        <div className="mt-0.5 space-y-0.5">
                          {section.items.map((item) => {
                            const IIcon = item.icon;
                            const isActive = item.active && activeView !== 'workflows';
                            const isWorkflowsActive = item.isWorkflows && activeView === 'workflows';
                            return (
                              <button
                                key={item.id}
                                onClick={() => {
                                  if (item.isWorkflows) onNavigate('workflows');
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2 ml-2 rounded-lg text-[13px] transition-colors duration-200 cursor-pointer focus:outline-none ${
                                  isActive || isWorkflowsActive
                                    ? 'bg-primary/8 text-primary font-medium'
                                    : 'text-text-mid hover:bg-slate-50'
                                }`}
                              >
                                <IIcon className="w-4 h-4" />
                                {item.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // Heading sections (YOUR FRONT DESK, TOOLS)
                if (section.isHeading) {
                  return (
                    <div key={section.id} className="mt-4 mb-1">
                      <div className="px-3 py-1.5 text-[11px] font-semibold text-text-light uppercase tracking-wider">
                        {section.label}
                      </div>
                      <div className="space-y-0.5">
                        {section.items.map((item) => {
                          const IIcon = item.icon;
                          return (
                            <button
                              key={item.id}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-text-mid hover:bg-slate-50 transition-colors duration-200 cursor-pointer focus:outline-none"
                            >
                              <IIcon className="w-4.5 h-4.5" />
                              <span className="flex-1 text-left">{item.label}</span>
                              {item.hasSubmenu && <ChevronDown className="w-3.5 h-3.5 text-text-light" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </nav>

            {/* Bottom: Setup Guide + Help + Account */}
            <div className="border-t border-border p-2 space-y-1">
              {/* Setup Guide CTA */}
              <button
                onClick={onStartOnboarding}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] bg-gradient-to-r from-primary to-primary-dark text-white text-[13px] font-semibold hover:shadow-md hover:shadow-primary/20 transition-all duration-200 cursor-pointer focus:outline-none mb-1"
              >
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Rocket className="w-4 h-4" />
                </div>
                <span className="flex-1 text-left">Setup Guide</span>
                <span className="text-[11px] font-normal bg-white/20 rounded-full px-2 py-0.5">New</span>
              </button>
              <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center cursor-pointer focus:outline-none shadow-sm ml-1 mb-2">
                <HelpCircle className="w-5 h-5 text-white" />
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors duration-200 cursor-pointer focus:outline-none">
                <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
                  <span className="text-[11px] font-bold text-white">A</span>
                </div>
                <span className="text-[13px] font-medium text-text-dark flex-1 text-left">Acme Dentistry</span>
                <ChevronDown className="w-3.5 h-3.5 text-text-light" />
              </button>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {activeView === 'workflows' ? (
            children
          ) : (
            /* Ask Central Default View */
            <div className="h-full flex flex-col">
              {/* Execution counter */}
              <div className="flex justify-end px-6 py-2">
                <div className="flex items-center gap-2 text-[12px] text-text-light">
                  <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
                  <span>0/0 executions used</span>
                  <button className="flex items-center gap-1 text-primary font-medium hover:underline cursor-pointer focus:outline-none">
                    <Sparkles className="w-3 h-3" />
                    Upgrade
                  </button>
                </div>
              </div>

              {/* Welcome */}
              <div className="flex-1 flex flex-col items-center justify-center px-8 -mt-16">
                <h1 className="text-3xl font-semibold text-text-dark text-center mb-1">Welcome to Ask Central</h1>
                <p className="text-xl text-primary text-center mb-10">What would you like to do?</p>

                {/* Notification banner */}
                <div className="w-full max-w-2xl bg-surface border border-border rounded-xl px-5 py-3.5 flex items-center gap-4 mb-6">
                  <Bell className="w-5 h-5 text-text-light shrink-0" />
                  <div className="flex-1">
                    <p className="text-[13px] font-medium text-text-dark">Get notified when Ask Central finishes answering</p>
                    <p className="text-[12px] text-text-light">Enable notifications</p>
                  </div>
                  <button className="px-3.5 py-1.5 rounded-lg border border-border text-[13px] font-medium text-text-dark hover:bg-slate-50 transition-colors duration-200 cursor-pointer focus:outline-none">
                    Enable
                  </button>
                  <button className="p-1 text-text-light hover:text-text-mid cursor-pointer focus:outline-none">×</button>
                </div>

                {/* Chat input */}
                <div className="w-full max-w-2xl bg-surface border border-border rounded-xl p-4 mb-6">
                  <input
                    type="text"
                    placeholder="Schedule meetings from email threads"
                    className="w-full text-[15px] text-text-dark placeholder:text-placeholder focus:outline-none mb-3 bg-transparent border-none outline-none"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded-lg hover:bg-slate-50 transition-colors duration-200 cursor-pointer focus:outline-none">
                        <FileText className="w-4.5 h-4.5 text-text-light" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-slate-50 transition-colors duration-200 cursor-pointer focus:outline-none">
                        <Sparkles className="w-4.5 h-4.5 text-text-light" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded-lg hover:bg-slate-50 transition-colors duration-200 cursor-pointer focus:outline-none">
                        <Paperclip className="w-4.5 h-4.5 text-text-light" />
                      </button>
                      <button className="w-9 h-9 rounded-full bg-primary flex items-center justify-center cursor-pointer focus:outline-none shadow-sm hover:bg-primary-dark transition-colors duration-200">
                        <ArrowUp className="w-4.5 h-4.5 text-white" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Connect apps bar */}
                <div className="w-full max-w-2xl flex items-center gap-3 text-[12px] text-text-mid mb-8">
                  <span>Connect your apps to Ask Central</span>
                  <div className="flex items-center gap-1.5 ml-auto">
                    {['📊', '📧', '➕', '💬', '📱', '📝', '📁', '📋'].map((e, i) => (
                      <span key={i} className="text-base opacity-60">{e}</span>
                    ))}
                    <ChevronDown className="w-3 h-3 text-text-light rotate-[-90deg]" />
                  </div>
                </div>

                {/* Category filter pills */}
                <div className="flex items-center gap-2 mb-6">
                  {[
                    { label: 'All', icon: Sparkles, active: true },
                    { label: 'Marketing', icon: Sparkles },
                    { label: 'Productivity', icon: Sparkles },
                    { label: 'Finance', icon: LayoutGrid },
                    { label: 'Personal', icon: HelpCircle },
                  ].map((cat) => (
                    <button
                      key={cat.label}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-medium border transition-colors duration-200 cursor-pointer focus:outline-none ${
                        cat.active
                          ? 'bg-primary text-white border-primary'
                          : 'bg-surface border-border text-text-mid hover:bg-slate-50'
                      }`}
                    >
                      <cat.icon className="w-3.5 h-3.5" />
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Suggestion list */}
                <div className="w-full max-w-2xl space-y-0">
                  {[
                    'Schedule meetings from email threads',
                    'Create a structured project plan',
                    'Summarize this week\'s customer feedback',
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50 border-b border-border transition-colors duration-200 cursor-pointer focus:outline-none"
                    >
                      <Sparkles className="w-4 h-4 text-text-light shrink-0" />
                      <span className="text-[14px] text-text-dark">{suggestion}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
    </TooltipProvider>
  );
}
