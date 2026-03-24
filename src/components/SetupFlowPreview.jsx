import { PhoneIncoming, MessageSquare, Clock, Brain, CalendarPlus, MessageCircle, PhoneOff, PhoneForwarded, BookOpen, Mic, HelpCircle } from 'lucide-react';

const NODE_STYLES = {
  trigger: { icon: PhoneIncoming, color: '#0EA5E9', label: 'Incoming Call' },
  greeting: { icon: MessageSquare, color: '#0EA5E9', label: 'Greeting' },
  hours: { icon: Clock, color: '#F59E0B', label: 'Business Hours' },
  intent: { icon: Brain, color: '#F43F5E', label: 'Intent Detection' },
  book: { icon: CalendarPlus, color: '#10B981', label: 'Book Appointment' },
  sms: { icon: MessageCircle, color: '#10B981', label: 'SMS Confirmation' },
  end: { icon: PhoneOff, color: '#0EA5E9', label: 'End Call' },
  transfer: { icon: PhoneForwarded, color: '#10B981', label: 'Transfer Call' },
  kb: { icon: BookOpen, color: '#F43F5E', label: 'Knowledge Base' },
  voicemail: { icon: Mic, color: '#0EA5E9', label: 'Take Message' },
  afterGreeting: { icon: MessageSquare, color: '#0EA5E9', label: 'After-Hours Greeting' },
  ask: { icon: HelpCircle, color: '#0EA5E9', label: 'Ask Question' },
};

function MiniNode({ type, glow }) {
  const style = NODE_STYLES[type];
  if (!style) return null;
  const Icon = style.icon;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-300 ${
      glow ? 'border-cyan-500/40 bg-cyan-500/10 shadow-sm shadow-cyan-500/10' : 'border-slate-700 bg-slate-800/60'
    }`}>
      <Icon className="w-3 h-3 shrink-0" style={{ color: style.color }} />
      <span className="text-[11px] text-slate-300 font-medium whitespace-nowrap">{style.label}</span>
    </div>
  );
}

function Connector() {
  return <div className="w-px h-3 bg-slate-700 mx-auto" />;
}

function BranchLabel({ label }) {
  return (
    <span className="text-[10px] text-slate-500 font-medium px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
      {label}
    </span>
  );
}

function Placeholder() {
  return (
    <span className="text-slate-600 text-xs tracking-wider">...</span>
  );
}

export default function SetupFlowPreview({ answers, compact = false }) {
  // Build node list based on what's been answered
  const nodes = [];
  const branches = {};

  // Always: trigger + greeting (if industry set)
  nodes.push({ type: 'trigger' });
  if (answers.industry) {
    nodes.push({ type: 'greeting', glow: !answers.schedule });
  }

  // Q2: hours
  if (answers.schedule && Object.values(answers.schedule).some((d) => d.open)) {
    nodes.push({ type: 'hours', glow: answers.intents.length === 0 });
    branches.duringHours = [];
    branches.afterHours = [];
  }

  // Q3: intents
  if (answers.intents.length > 0) {
    branches.duringHours = [{ type: 'intent', glow: !answers.calendar }];
    // Each intent becomes a sub-branch
    branches.intentBranches = answers.intents.map((intent) => ({ label: intent, nodes: [] }));
  }

  // Q4: calendar → fills Book Appointment branch
  if (answers.calendar) {
    const bookBranch = branches.intentBranches?.find((b) => b.label.toLowerCase().includes('appointment') || b.label.toLowerCase().includes('book'));
    if (bookBranch) {
      bookBranch.nodes = [{ type: 'ask' }, { type: 'book' }, { type: 'sms' }, { type: 'end' }];
    }
  }

  // Q5: after hours
  if (answers.afterHoursMode) {
    branches.afterHours = [{ type: 'afterGreeting' }];
    if (answers.afterHoursMode === 'message') {
      branches.afterHours.push({ type: 'voicemail' }, { type: 'end' });
    } else if (answers.afterHoursMode === 'book') {
      branches.afterHours.push({ type: 'book' }, { type: 'sms' }, { type: 'end' });
    } else {
      branches.afterHours.push({ type: 'ask' });
    }
  }

  // Q6: transfers
  if (answers.transferRules.some((r) => r.condition && r.destination)) {
    const emergBranch = branches.intentBranches?.find((b) => b.label.toLowerCase().includes('emergency'));
    if (emergBranch) {
      emergBranch.nodes = [{ type: 'ask' }, { type: 'transfer' }];
    }
  }

  // Q7: knowledge
  if (answers.knowledgeUrl) {
    const qBranch = branches.intentBranches?.find((b) =>
      b.label.toLowerCase().includes('question') || b.label.toLowerCase().includes('insurance')
    );
    if (qBranch) {
      qBranch.nodes = [{ type: 'kb' }, { type: 'end' }];
    }
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {nodes.map((n, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <MiniNode type={n.type} glow={n.glow} />
            {i < nodes.length - 1 && <span className="text-slate-600">→</span>}
          </div>
        ))}

        {branches.duringHours && branches.duringHours.length > 0 && (
          <>
            <span className="text-slate-600">→</span>
            <BranchLabel label="During Hours" />
            <span className="text-slate-600">→</span>
            {branches.duringHours.map((n, i) => (
              <div key={`dh-${i}`} className="flex items-center gap-1.5">
                <MiniNode type={n.type} glow={n.glow} />
              </div>
            ))}
            {branches.intentBranches && branches.intentBranches.length > 0 && (
              <span className="text-[10px] text-slate-500 ml-1">
                ({branches.intentBranches.length} paths)
              </span>
            )}
          </>
        )}

        {branches.afterHours && branches.afterHours.length > 0 && (
          <>
            <span className="text-slate-600 ml-2">|</span>
            <BranchLabel label="After Hours" />
            {branches.afterHours.map((n, i) => (
              <div key={`ah-${i}`} className="flex items-center gap-1.5">
                <span className="text-slate-600">→</span>
                <MiniNode type={n.type} />
              </div>
            ))}
          </>
        )}

        {nodes.length <= 1 && (
          <span className="text-xs text-slate-500 ml-2 italic">Flow builds as you answer...</span>
        )}
      </div>
    );
  }

  // Full vertical preview (for reveal stage)
  return (
    <div className="flex flex-col items-center gap-0">
      {nodes.map((n, i) => (
        <div key={i} className="flex flex-col items-center">
          <MiniNode type={n.type} glow={n.glow} />
          {i < nodes.length - 1 && <Connector />}
        </div>
      ))}

      {branches.duringHours && (
        <div className="mt-1 flex gap-8">
          {/* During Hours */}
          <div className="flex flex-col items-center gap-0">
            <Connector />
            <BranchLabel label="During Hours" />
            <Connector />
            {branches.duringHours.map((n, i) => (
              <div key={i} className="flex flex-col items-center">
                <MiniNode type={n.type} glow={n.glow} />
                <Connector />
              </div>
            ))}
            {branches.intentBranches && (
              <div className="flex gap-3 mt-1">
                {branches.intentBranches.slice(0, 3).map((ib, i) => (
                  <div key={i} className="flex flex-col items-center gap-0">
                    <BranchLabel label={ib.label} />
                    <Connector />
                    {ib.nodes.length > 0
                      ? ib.nodes.map((n, j) => (
                        <div key={j} className="flex flex-col items-center">
                          <MiniNode type={n.type} />
                          {j < ib.nodes.length - 1 && <Connector />}
                        </div>
                      ))
                      : <Placeholder />
                    }
                  </div>
                ))}
                {branches.intentBranches.length > 3 && (
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xs text-slate-500">+{branches.intentBranches.length - 3} more</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* After Hours */}
          <div className="flex flex-col items-center gap-0">
            <Connector />
            <BranchLabel label="After Hours" />
            <Connector />
            {branches.afterHours.length > 0
              ? branches.afterHours.map((n, i) => (
                <div key={i} className="flex flex-col items-center">
                  <MiniNode type={n.type} />
                  {i < branches.afterHours.length - 1 && <Connector />}
                </div>
              ))
              : <Placeholder />
            }
          </div>
        </div>
      )}
    </div>
  );
}
