import { useState, useRef, useEffect, useCallback } from 'react';
import {
  X, ChevronLeft, ChevronRight, Check, Sparkles,
  PhoneIncoming, ClipboardList, Headphones, Users, Zap, Globe,
  Calendar, Rocket, Phone, Copy, Mic, MicOff, Send,
} from 'lucide-react';
import VoiceOrb from './VoiceOrb';
import useAudioPlayer from '../hooks/useAudioPlayer';
import useVoiceInput from '../hooks/useVoiceInput';
import useTransitionSound from '../hooks/useTransitionSound';

/* ─────────────────── Step Definitions ─────────────────── */

const STEPS = [
  {
    id: 1,
    title: 'Tell Us About Your Business',
    subtitle: 'Help your AI receptionist understand who you are.',
    icon: Sparkles,
    maxIntro: "Let's start with the basics! Tell me about your business — what industry are you in, and what's your business name?",
  },
  {
    id: 2,
    title: 'Set Your Business Hours',
    subtitle: "So your receptionist knows when you're open.",
    icon: Calendar,
    maxIntro: "When are you typically open? Just tell me your hours and I'll fill everything in for you.",
  },
  {
    id: 3,
    title: 'Choose What Callers Can Do',
    subtitle: 'Select the reasons people call your business.',
    icon: PhoneIncoming,
    maxIntro: "What are the main reasons people call you? Tell me and I'll select them for you — or just click the ones you want.",
  },
  {
    id: 4,
    title: 'Set Up Questions for New Leads',
    subtitle: 'Your AI receptionist collects key info from callers.',
    icon: ClipboardList,
    maxIntro: "What questions should your receptionist ask new callers? Tell me what info you need and I'll set up the questions.",
  },
  {
    id: 5,
    title: 'Hear How It Sounds in Action',
    subtitle: 'Call your AI receptionist to hear it live.',
    icon: Headphones,
    maxIntro: "Your receptionist is ready for a test drive! Call the number to hear how it sounds.",
  },
  {
    id: 6,
    title: 'Tell Us Where to Send Your Leads',
    subtitle: 'Connect your CRM to receive leads automatically.',
    icon: Globe,
    maxIntro: "Do you use a CRM? Just tell me yes or no, or click your choice.",
  },
  {
    id: 7,
    title: 'Automate Workflows with Zapier',
    subtitle: 'Connect to 8,000+ tools like Slack and Airtable.',
    icon: Zap,
    maxIntro: "Want to connect any tools? Tell me which ones or just skip if you're not ready.",
  },
  {
    id: 8,
    title: 'Add Your Team or Use Ours',
    subtitle: 'Set up human backup for when AI needs help.',
    icon: Users,
    maxIntro: "Last step! Do you want to add your own team, or use our trained receptionists?",
  },
];

/* ─────────────────── Exit Confirm Dialog ─────────────────── */

function ExitConfirmDialog({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
      <div className="bg-white rounded-[14px] shadow-2xl p-6 w-[340px] border border-border">
        <h3 className="text-[16px] font-semibold text-text-dark mb-2">Exit Setup Guide?</h3>
        <p className="text-[13px] text-text-mid mb-5">Your progress will be saved. You can resume anytime from the sidebar.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-[10px] border border-border text-[13px] font-medium text-text-dark hover:bg-slate-50 transition-colors cursor-pointer focus:outline-none">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-[10px] bg-red-500 text-white text-[13px] font-medium hover:bg-red-600 transition-colors cursor-pointer focus:outline-none">
            Exit Setup
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── Step Content Cards (right 70%) ─────────────────── */

function StepBusinessInfo({ data, onChange }) {
  const industries = [
    { id: 'dental', label: 'Dental Clinic', emoji: '🦷' },
    { id: 'legal', label: 'Law Firm', emoji: '⚖️' },
    { id: 'hvac', label: 'HVAC / Plumbing', emoji: '🔧' },
    { id: 'salon', label: 'Salon / Spa', emoji: '💇' },
    { id: 'medical', label: 'Medical Practice', emoji: '🏥' },
    { id: 'real_estate', label: 'Real Estate', emoji: '🏠' },
    { id: 'auto', label: 'Auto Repair', emoji: '🚗' },
    { id: 'other', label: 'Other', emoji: '🏢' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-[13px] font-medium text-text-dark mb-2">Business Name</label>
        <input
          type="text"
          value={data.businessName || ''}
          onChange={(e) => onChange({ ...data, businessName: e.target.value })}
          placeholder="e.g. Riverside Dental"
          className="w-full px-4 py-3 rounded-[10px] border border-border text-[14px] text-text-dark placeholder:text-placeholder focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
        />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-text-dark mb-2">Industry</label>
        <div className="grid grid-cols-2 gap-2">
          {industries.map((ind) => (
            <button
              key={ind.id}
              onClick={() => onChange({ ...data, industry: ind.id })}
              className={`flex items-center gap-2.5 px-3.5 py-3 rounded-[10px] border text-[13px] font-medium transition-all cursor-pointer focus:outline-none ${
                data.industry === ind.id
                  ? 'bg-primary/8 border-primary/40 text-primary shadow-sm'
                  : 'border-border text-text-mid hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <span className="text-lg">{ind.emoji}</span>
              {ind.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepBusinessHours({ data, onChange }) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const schedule = data.schedule || {};

  const toggleDay = (day) => {
    const updated = { ...schedule };
    updated[day] = { ...updated[day], open: !updated[day]?.open };
    if (updated[day].open && !updated[day].start) {
      updated[day].start = '9:00 AM';
      updated[day].end = '5:00 PM';
    }
    onChange({ ...data, schedule: updated });
  };

  return (
    <div className="space-y-2">
      {days.map((day) => {
        const dayData = schedule[day] || { open: false, start: '9:00 AM', end: '5:00 PM' };
        return (
          <div key={day} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] border transition-all ${dayData.open ? 'border-primary/30 bg-primary/5' : 'border-border bg-white'}`}>
            <button
              onClick={() => toggleDay(day)}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 cursor-pointer transition-all ${dayData.open ? 'bg-primary border-primary' : 'border-slate-300'}`}
            >
              {dayData.open && <Check className="w-3 h-3 text-white" />}
            </button>
            <span className={`text-[13px] font-medium w-24 ${dayData.open ? 'text-text-dark' : 'text-text-light'}`}>{day}</span>
            {dayData.open ? (
              <div className="flex items-center gap-2 text-[12px] text-text-mid ml-auto">
                <input type="text" value={dayData.start || '9:00 AM'} onChange={(e) => onChange({ ...data, schedule: { ...schedule, [day]: { ...dayData, start: e.target.value } } })} className="w-20 px-2 py-1 rounded-md border border-border text-center focus:outline-none focus:border-primary text-[12px]" />
                <span>to</span>
                <input type="text" value={dayData.end || '5:00 PM'} onChange={(e) => onChange({ ...data, schedule: { ...schedule, [day]: { ...dayData, end: e.target.value } } })} className="w-20 px-2 py-1 rounded-md border border-border text-center focus:outline-none focus:border-primary text-[12px]" />
              </div>
            ) : (
              <span className="text-[12px] text-text-light ml-auto">Closed</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StepCallReasons({ data, onChange }) {
  const allIntents = [
    'Book Appointment', 'Cancel / Reschedule', 'New Patient Info',
    'Insurance Question', 'Billing Question', 'Emergency / Pain',
    'Directions / Hours', 'General Inquiry', 'Pricing',
  ];
  const selected = data.intents || [];

  const toggle = (intent) => {
    const updated = selected.includes(intent)
      ? selected.filter((i) => i !== intent)
      : [...selected, intent];
    onChange({ ...data, intents: updated });
  };

  return (
    <div className="space-y-3">
      <p className="text-[13px] text-text-mid">Select all the reasons people typically call your business.</p>
      <div className="flex flex-wrap gap-2">
        {allIntents.map((intent) => (
          <button
            key={intent}
            onClick={() => toggle(intent)}
            className={`px-4 py-2.5 rounded-full text-[13px] font-medium border transition-all cursor-pointer focus:outline-none ${
              selected.includes(intent)
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'border-border text-text-mid hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            {intent}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepLeadIntake({ data, onChange }) {
  const questions = data.leadQuestions || ['What is your name?', 'What is the best number to reach you?'];

  return (
    <div className="space-y-4">
      <p className="text-[13px] text-text-mid">These questions will be asked to new callers to qualify leads.</p>
      <div className="space-y-2">
        {questions.map((q, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
            <input
              type="text" value={q}
              onChange={(e) => {
                const updated = [...questions];
                updated[i] = e.target.value;
                onChange({ ...data, leadQuestions: updated });
              }}
              className="flex-1 px-3 py-2.5 rounded-[10px] border border-border text-[13px] text-text-dark focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
            <button onClick={() => {
              const updated = questions.filter((_, idx) => idx !== i);
              onChange({ ...data, leadQuestions: updated });
            }} className="p-1 text-text-light hover:text-red-500 cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
      <button onClick={() => onChange({ ...data, leadQuestions: [...questions, ''] })} className="flex items-center gap-2 text-[13px] text-primary font-medium hover:text-primary-dark cursor-pointer focus:outline-none">
        <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[11px]">+</span>
        Add Question
      </button>
    </div>
  );
}

function StepTestCall() {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { navigator.clipboard.writeText('+18336354775'); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="space-y-5">
      <p className="text-[13px] text-text-mid">Call your AI receptionist to hear it live.</p>
      <div className="bg-primary/5 border border-primary/20 rounded-[14px] p-5 flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center"><Phone className="w-7 h-7 text-primary" /></div>
        <div className="text-center">
          <p className="text-[12px] text-text-mid mb-1">Your AI Receptionist Number</p>
          <p className="text-2xl font-bold text-text-dark tracking-tight">+1 833 635 4775</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="tel:+18336354775" className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-primary text-white text-[13px] font-semibold hover:bg-primary-dark transition-colors"><Phone className="w-4 h-4" />Call Now</a>
          <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] border border-border text-[13px] font-medium text-text-dark hover:bg-slate-50 transition-colors cursor-pointer focus:outline-none"><Copy className="w-4 h-4" />{copied ? 'Copied!' : 'Copy'}</button>
        </div>
      </div>
      <p className="text-[12px] text-text-light text-center">This step completes automatically once your first call is received.</p>
    </div>
  );
}

function StepCRM({ data, onChange }) {
  return (
    <div className="space-y-5">
      <p className="text-[13px] text-text-mid">Set up your CRM to automatically receive leads.</p>
      <div className="grid grid-cols-2 gap-3">
        {[
          { id: 'none', icon: X, iconBg: 'bg-slate-100', iconColor: 'text-text-light', label: "No, I don't have a CRM" },
          { id: 'yes', icon: Globe, iconBg: 'bg-primary/10', iconColor: 'text-primary', label: 'Yes, I already use a CRM' },
        ].map((opt) => (
          <button key={opt.id} onClick={() => onChange({ ...data, crmChoice: opt.id })} className={`flex flex-col items-center gap-3 p-5 rounded-[14px] border-2 transition-all cursor-pointer focus:outline-none ${data.crmChoice === opt.id ? 'border-primary bg-primary/5' : 'border-border hover:border-slate-300'}`}>
            <div className={`w-12 h-12 rounded-full ${opt.iconBg} flex items-center justify-center`}><opt.icon className={`w-6 h-6 ${opt.iconColor}`} /></div>
            <span className="text-[13px] font-semibold text-text-dark text-center">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepZapier() {
  const integrations = [
    { name: 'Slack', color: '#4A154B' }, { name: 'Airtable', color: '#18BFFF' },
    { name: 'Google Sheets', color: '#34A853' }, { name: 'HubSpot', color: '#FF7A59' },
    { name: 'Salesforce', color: '#00A1E0' }, { name: 'Notion', color: '#000000' },
  ];
  return (
    <div className="space-y-5">
      <p className="text-[13px] text-text-mid">Connect to 8,000+ tools to automate follow-ups, CRM updates, and more.</p>
      <div className="grid grid-cols-3 gap-3">
        {integrations.map((int) => (
          <div key={int.name} className="flex flex-col items-center gap-2 p-4 rounded-[12px] border border-border hover:border-primary/30 transition-all cursor-pointer">
            <div className="w-10 h-10 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: int.color + '15' }}><Zap className="w-5 h-5" style={{ color: int.color }} /></div>
            <span className="text-[12px] font-medium text-text-dark">{int.name}</span>
          </div>
        ))}
      </div>
      <button className="flex items-center gap-2 px-5 py-3 rounded-[10px] bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[13px] font-semibold hover:shadow-md transition-all cursor-pointer focus:outline-none mx-auto"><Zap className="w-4 h-4" />Automate Now</button>
    </div>
  );
}

function StepTeam({ data, onChange }) {
  return (
    <div className="space-y-5">
      <p className="text-[13px] text-text-mid">Set up human backup for when AI needs help.</p>
      <div className="grid grid-cols-2 gap-3">
        {[
          { id: 'own', icon: Users, iconBg: 'bg-slate-100', iconColor: 'text-text-mid', label: 'Add My Team' },
          { id: 'central', icon: Headphones, iconBg: 'bg-primary/10', iconColor: 'text-primary', label: 'Get Human Support' },
        ].map((opt) => (
          <button key={opt.id} onClick={() => onChange({ ...data, teamChoice: opt.id })} className={`flex flex-col items-center gap-3 p-5 rounded-[14px] border-2 transition-all cursor-pointer focus:outline-none ${data.teamChoice === opt.id ? 'border-primary bg-primary/5' : 'border-border hover:border-slate-300'}`}>
            <div className={`w-12 h-12 rounded-full ${opt.iconBg} flex items-center justify-center`}><opt.icon className={`w-6 h-6 ${opt.iconColor}`} /></div>
            <span className="text-[13px] font-semibold text-text-dark text-center">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────── Main Onboarding Component ─────────────────── */

export default function Onboarding({ onBack, onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [orbState, setOrbState] = useState('idle');
  const [messages, setMessages] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stepData, setStepData] = useState({
    businessName: '',
    industry: null,
    schedule: {
      Monday: { open: true, start: '9:00 AM', end: '5:00 PM' },
      Tuesday: { open: true, start: '9:00 AM', end: '5:00 PM' },
      Wednesday: { open: true, start: '9:00 AM', end: '5:00 PM' },
      Thursday: { open: true, start: '9:00 AM', end: '5:00 PM' },
      Friday: { open: true, start: '9:00 AM', end: '5:00 PM' },
      Saturday: { open: true, start: '10:00 AM', end: '2:00 PM' },
      Sunday: { open: false, start: '', end: '' },
    },
    intents: [],
    leadQuestions: ['What is your name?', 'What is the best number to reach you?'],
    crmChoice: null,
    teamChoice: null,
  });

  const audioPlayer = useAudioPlayer();
  const voiceInput = useVoiceInput();
  const transitionSound = useTransitionSound();
  const spokenStepsRef = useRef(new Set());
  const stepDataRef = useRef(stepData);
  const currentStepRef = useRef(currentStep);
  const messagesEndRef = useRef(null);
  const processingRef = useRef(false);

  // Keep refs in sync
  useEffect(() => { stepDataRef.current = stepData; }, [stepData]);
  useEffect(() => { currentStepRef.current = currentStep; }, [currentStep]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const step = STEPS[currentStep - 1];

  // Add a message to the current step's transcript
  const addMsg = useCallback((role, text) => {
    setMessages(prev => [...prev, { role, text, step: currentStepRef.current }]);
  }, []);

  // Speak text via TTS
  const speak = useCallback(async (text) => {
    setOrbState('speaking');
    try {
      await audioPlayer.play(text);
    } catch (e) {
      console.warn('TTS failed:', e.message);
      await new Promise(r => setTimeout(r, 1200));
    }
    setOrbState('idle');
  }, [audioPlayer]);

  // Speak Max's intro for a step (once per step)
  const speakStepIntro = useCallback(async (stepId) => {
    if (spokenStepsRef.current.has(stepId)) return;
    spokenStepsRef.current.add(stepId);
    const stepDef = STEPS[stepId - 1];
    if (!stepDef) return;
    addMsg('max', stepDef.maxIntro);
    await speak(stepDef.maxIntro);
  }, [speak, addMsg]);

  // Speak intro on mount
  useEffect(() => {
    const timer = setTimeout(() => speakStepIntro(1), 300);
    return () => clearTimeout(timer);
  }, []);

  // Process voice/text input — send to AI, apply actions to form
  const processInput = useCallback(async (text) => {
    if (processingRef.current || !text.trim()) return;
    processingRef.current = true;
    setIsProcessing(true);

    const stepNum = currentStepRef.current;
    const data = stepDataRef.current;

    addMsg('user', text.trim());
    setOrbState('thinking');

    try {
      const response = await fetch('/api/voice/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: text.trim(),
          stepNumber: stepNum,
          stepData: data,
        }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const result = await response.json();

      // Apply AI actions to step data (live form filling)
      if (result.actions?.length > 0) {
        setStepData(prev => {
          const updated = { ...prev };
          for (const action of result.actions) {
            if (action.key === 'schedule' && action.value) {
              // Merge schedule (only overwrite days AI mentioned)
              updated.schedule = { ...updated.schedule, ...action.value };
            } else if (action.value !== null && action.value !== undefined) {
              updated[action.key] = action.value;
            }
          }
          return updated;
        });
      }

      // Show & speak acknowledgment
      if (result.acknowledgment) {
        addMsg('max', result.acknowledgment);
        await speak(result.acknowledgment);
      }
    } catch (e) {
      console.error('Onboarding interpret error:', e);
      addMsg('max', "Sorry, I didn't catch that. Could you try again?");
    }

    setOrbState('idle');
    processingRef.current = false;
    setIsProcessing(false);
  }, [addMsg, speak]);

  // Voice input handler
  const toggleListening = useCallback(() => {
    if (voiceInput.isListening) {
      voiceInput.stopListening();
      setOrbState('idle');
    } else {
      setOrbState('listening');
      voiceInput.startListening((finalText) => {
        processInput(finalText);
      });
    }
  }, [voiceInput, processInput]);

  // Text input submit
  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim() || isProcessing) return;
    processInput(textInput.trim());
    setTextInput('');
  };

  // Navigation
  const goNext = () => {
    if (currentStep < 8) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      transitionSound.play();
      const next = currentStep + 1;
      setCurrentStep(next);
      setTimeout(() => speakStepIntro(next), 200);
    }
  };

  const goBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const goToStep = (stepNum) => {
    setCurrentStep(stepNum);
    setTimeout(() => speakStepIntro(stepNum), 200);
  };

  const finishSetup = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    onComplete?.(stepData);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return <StepBusinessInfo data={stepData} onChange={setStepData} />;
      case 2: return <StepBusinessHours data={stepData} onChange={setStepData} />;
      case 3: return <StepCallReasons data={stepData} onChange={setStepData} />;
      case 4: return <StepLeadIntake data={stepData} onChange={setStepData} />;
      case 5: return <StepTestCall />;
      case 6: return <StepCRM data={stepData} onChange={setStepData} />;
      case 7: return <StepZapier />;
      case 8: return <StepTeam data={stepData} onChange={setStepData} />;
      default: return null;
    }
  };

  // Filter messages for current step only
  const stepMessages = messages.filter(m => m.step === currentStep);
  const isLastStep = currentStep === 8;
  const StepIcon = step.icon;

  return (
    <div className="fixed inset-0 z-50 bg-bg flex flex-col">
      {showExitConfirm && (
        <ExitConfirmDialog
          onConfirm={() => { setShowExitConfirm(false); onBack(); }}
          onCancel={() => setShowExitConfirm(false)}
        />
      )}

      {/* Top bar */}
      <div className="h-14 border-b border-border bg-surface flex items-center px-5 shrink-0">
        <div className="flex items-center gap-2.5">
          <Rocket className="w-5 h-5 text-primary" />
          <span className="text-[15px] font-semibold text-text-dark">Setup Guide</span>
        </div>

        {/* Step indicator */}
        <div className="flex-1 flex items-center justify-center gap-2">
          <span className="text-[13px] text-text-mid mr-3">Step {currentStep} of {STEPS.length}</span>
          {STEPS.map((s) => {
            const isCompleted = completedSteps.has(s.id);
            const isCurrent = s.id === currentStep;
            return (
              <button
                key={s.id}
                onClick={() => goToStep(s.id)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-all cursor-pointer focus:outline-none ${
                  isCompleted ? 'bg-emerald-500 text-white'
                    : isCurrent ? 'bg-primary text-white ring-4 ring-primary/20'
                    : 'bg-slate-100 text-text-light hover:bg-slate-200'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : s.id}
              </button>
            );
          })}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${completedSteps.size === 8 ? 'bg-emerald-500' : 'bg-emerald-100'}`}>
            <Check className={`w-4 h-4 ${completedSteps.size === 8 ? 'text-white' : 'text-emerald-400'}`} />
          </div>
        </div>

        <button onClick={() => setShowExitConfirm(true)} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer focus:outline-none">
          <X className="w-5 h-5 text-text-mid" />
        </button>
      </div>

      {/* Main: 30/70 split */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left 30% — Max panel */}
        <div className="w-[30%] min-w-[280px] max-w-[380px] border-r border-border bg-surface flex flex-col">
          {/* Max header */}
          <div className="px-5 pt-5 pb-3 flex items-center gap-3">
            <VoiceOrb state={orbState} size="small" />
            <div>
              <p className="text-[14px] font-semibold text-text-dark">Max</p>
              <p className="text-[11px] text-text-light">
                {orbState === 'speaking' ? 'Speaking...' : orbState === 'listening' ? 'Listening...' : orbState === 'thinking' ? 'Thinking...' : 'Ready to help'}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {stepMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] px-3.5 py-2.5 rounded-[12px] text-[13px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary/10 text-primary-dark rounded-br-sm'
                    : 'bg-slate-100 text-text-dark rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {voiceInput.isListening && voiceInput.interimTranscript && (
              <div className="flex justify-end">
                <div className="max-w-[90%] px-3.5 py-2.5 rounded-[12px] rounded-br-sm bg-primary/5 text-primary/60 text-[13px] italic">
                  {voiceInput.interimTranscript}...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="px-4 py-3 border-t border-border">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleListening}
                disabled={isProcessing}
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer focus:outline-none ${
                  voiceInput.isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : isProcessing
                    ? 'bg-slate-100 text-text-light cursor-not-allowed'
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
              >
                {voiceInput.isListening ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
              </button>
              <form onSubmit={handleTextSubmit} className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type to Max..."
                  disabled={isProcessing}
                  className="flex-1 px-3 py-2.5 rounded-[10px] border border-border text-[13px] text-text-dark placeholder:text-placeholder focus:outline-none focus:border-primary disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!textInput.trim() || isProcessing}
                  className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white shrink-0 cursor-pointer focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
            <p className="text-[11px] text-text-light mt-2 text-center">
              {voiceInput.isListening ? 'Listening... click mic to stop' : 'Click mic or type to talk to Max'}
            </p>
          </div>
        </div>

        {/* Right 70% — Step content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Step header */}
          <div className="px-8 pt-6 pb-4 border-b border-border bg-surface shrink-0">
            {completedSteps.has(currentStep) && (
              <div className="flex items-center gap-1.5 text-emerald-500 text-[12px] font-semibold mb-2">
                <Check className="w-3.5 h-3.5" />
                Completed
              </div>
            )}
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-[10px] bg-primary/10 flex items-center justify-center shrink-0">
                <StepIcon className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-[20px] font-bold text-text-dark leading-tight">{step.title}</h2>
            </div>
            <p className="text-[13px] text-text-mid leading-relaxed ml-12">{step.subtitle}</p>
          </div>

          {/* Step form content */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {renderStepContent()}
          </div>

          {/* Footer buttons */}
          <div className="px-8 py-4 border-t border-border bg-surface shrink-0 flex items-center justify-between">
            <button
              onClick={goBack}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 text-[13px] font-medium transition-colors cursor-pointer focus:outline-none ${
                currentStep === 1 ? 'text-text-light cursor-not-allowed' : 'text-text-mid hover:text-text-dark'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex items-center gap-3">
              {!isLastStep && (
                <button onClick={goNext} className="flex items-center gap-1.5 text-[13px] font-medium text-text-mid hover:text-text-dark transition-colors cursor-pointer focus:outline-none">
                  Skip Step
                </button>
              )}
              <button
                onClick={isLastStep ? finishSetup : goNext}
                className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-primary text-white text-[13px] font-semibold hover:bg-primary-dark hover:shadow-md hover:shadow-primary/20 transition-all cursor-pointer focus:outline-none"
              >
                {isLastStep ? 'Finish Setup' : 'Next'}
                {isLastStep ? <Check className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
