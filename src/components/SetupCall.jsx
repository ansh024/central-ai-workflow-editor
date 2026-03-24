import { useState, useEffect, useRef } from 'react';
import VoiceOrb from './VoiceOrb';
import SetupFlowPreview from './SetupFlowPreview';
import {
  Stethoscope, Scale, Wrench, Scissors, HeartPulse, Home, Warehouse, Car,
  Send, ChevronRight, ChevronLeft, Mic, MicOff, X,
  Calendar as CalIcon, Upload, Globe, FileText, Link2, Phone, Plus, Trash2,
  Check, AlertCircle,
} from 'lucide-react';

// ── Question Data ──
const INDUSTRIES = [
  { id: 'dental', label: 'Dental Clinic', icon: Stethoscope },
  { id: 'legal', label: 'Law Firm', icon: Scale },
  { id: 'hvac', label: 'HVAC / Plumbing', icon: Wrench },
  { id: 'salon', label: 'Salon / Spa', icon: Scissors },
  { id: 'medical', label: 'Medical Practice', icon: HeartPulse },
  { id: 'real_estate', label: 'Real Estate', icon: Home },
  { id: 'auto', label: 'Auto Repair', icon: Car },
  { id: 'other', label: 'Other', icon: Warehouse },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const INTENT_CHIPS = {
  dental: ['Book Appointment', 'Cancel / Reschedule', 'Insurance Question', 'Emergency / Pain', 'Directions / Hours', 'New Patient Info', 'Billing Question'],
  legal: ['Schedule Consultation', 'Case Status', 'New Client Inquiry', 'Document Request', 'Emergency / Urgent'],
  default: ['Book Appointment', 'Ask Question', 'Emergency', 'General Inquiry', 'Pricing', 'Cancel / Reschedule'],
};

const CALENDARS = [
  { id: 'google', label: 'Google Calendar', color: '#4285F4' },
  { id: 'calendly', label: 'Calendly', color: '#006BFF' },
  { id: 'calcom', label: 'Cal.com', color: '#292929' },
  { id: 'acuity', label: 'Acuity', color: '#01A39D' },
  { id: 'other', label: 'Other Tool', color: '#94A3B8' },
  { id: 'manual', label: 'No Tool (Manual)', color: '#F59E0B' },
];

const QUESTIONS = [
  { id: 1, ask: "First up — what kind of business do you run? Like a dental clinic, law firm, salon... just tell me in your own words." },
  { id: 2, ask: "When are you open? I'll make sure your receptionist knows when to handle calls normally versus after hours." },
  { id: 3, ask: "What are the main reasons people call you? For example — appointments, questions about services, pricing, emergencies..." },
  { id: 4, ask: "Let's set up appointment booking. Do you use any scheduling tool — like Google Calendar, Calendly, or something else?" },
  { id: 5, ask: "When someone calls outside your business hours, what would you like to happen?" },
  { id: 6, ask: "Are there situations where a call should come straight to you or someone on your team?" },
  { id: 7, ask: "Last thing — do you have a website, FAQ page, or any documents with common questions?" },
];

// ── Main SetupCall Component ──
export default function SetupCall({ onComplete, onBack }) {
  const [stage, setStage] = useState('welcome'); // welcome | qa | reveal
  const [currentQ, setCurrentQ] = useState(1);
  const [orbState, setOrbState] = useState('speaking');
  const [transcript, setTranscript] = useState([]);
  const [textInput, setTextInput] = useState('');
  const transcriptRef = useRef(null);

  // Answers state
  const [answers, setAnswers] = useState({
    industry: null,
    businessName: '',
    schedule: DAYS.reduce((acc, d, i) => ({
      ...acc,
      [d]: { open: i < 5, start: i < 5 ? '9:00 AM' : i === 5 ? '10:00 AM' : '', end: i < 5 ? '5:00 PM' : i === 5 ? '2:00 PM' : '' }
    }), {}),
    intents: [],
    calendar: null,
    appointmentTypes: [{ name: 'Consultation', duration: 30 }],
    afterHoursMode: null,
    emergencyOverride: false,
    transferRules: [{ condition: '', destination: '', label: '' }],
    knowledgeUrl: '',
    knowledgeFiles: [],
  });

  // Welcome auto-advance
  useEffect(() => {
    if (stage === 'welcome') {
      const maxIntro = { role: 'max', text: "Hey! I'm Max, Central's AI assistant. I'm going to help you set up your voice receptionist in about 3 minutes. I'll ask you a few questions about your business, and by the end, your phones will be answered 24/7. Ready? Let's start." };
      setTranscript([maxIntro]);
      setOrbState('speaking');

      const timer = setTimeout(() => {
        setStage('qa');
        setOrbState('speaking');
        // Add Q1
        setTimeout(() => {
          setTranscript((prev) => [...prev, { role: 'max', text: QUESTIONS[0].ask }]);
          setOrbState('listening');
        }, 800);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  const advanceQuestion = (answer) => {
    // Add user message
    setTranscript((prev) => [...prev, { role: 'user', text: answer }]);
    setOrbState('thinking');

    setTimeout(() => {
      // Max acknowledges
      const acks = ['Got it!', 'Perfect.', 'Great, noted.', 'Nice.', 'Awesome.', 'Alright!', 'All set!'];
      const ack = acks[currentQ - 1] || 'Got it!';
      setTranscript((prev) => [...prev, { role: 'max', text: ack }]);

      if (currentQ < 7) {
        setTimeout(() => {
          setCurrentQ((q) => q + 1);
          setTranscript((prev) => [...prev, { role: 'max', text: QUESTIONS[currentQ].ask }]);
          setOrbState('listening');
        }, 600);
      } else {
        // Reveal
        setTimeout(() => {
          setTranscript((prev) => [...prev, { role: 'max', text: "All set! Here's your receptionist. Let me walk you through what I built." }]);
          setOrbState('speaking');
          setTimeout(() => setStage('reveal'), 1500);
        }, 600);
      }
    }, 500);
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) return;
    advanceQuestion(textInput.trim());
    setTextInput('');
  };

  const updateAnswer = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  // ── Stage: Welcome ──
  if (stage === 'welcome') {
    return (
      <div className="fixed inset-0 z-50 bg-[#0F172A] flex flex-col items-center justify-center">
        <button
          onClick={onBack}
          className="absolute top-6 right-6 p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors duration-200 cursor-pointer focus:outline-none z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <VoiceOrb state={orbState} size="large" />

        <div className="mt-10 max-w-md text-center animate-in fade-in duration-500">
          <h2 className="text-xl font-semibold text-white mb-2">Meet Max</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            {transcript[0]?.text || "Setting up your voice receptionist..."}
          </p>
        </div>

        <div className="mt-8 flex items-center gap-2 text-slate-500 text-xs">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
          Starting in a moment...
        </div>
      </div>
    );
  }

  // ── Stage: Reveal ──
  if (stage === 'reveal') {
    return (
      <div className="fixed inset-0 z-50 bg-[#0F172A] flex flex-col items-center justify-center px-8">
        <button
          onClick={onBack}
          className="absolute top-6 right-6 p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors duration-200 cursor-pointer focus:outline-none z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <VoiceOrb state="speaking" size="small" />

        <h1 className="text-2xl font-semibold text-white mt-6 mb-2">Your Receptionist is Ready!</h1>
        <p className="text-slate-400 text-sm max-w-lg text-center mb-8">
          Max built a {answers.intents.length > 0 ? answers.intents.length + '-path' : 'complete'} call flow for {answers.businessName || 'your business'}.
          It handles calls during and after hours, books appointments, and answers common questions.
        </p>

        {/* Mini flow preview */}
        <div className="w-full max-w-2xl bg-[#1E293B] rounded-2xl border border-slate-700 p-6 mb-8">
          <SetupFlowPreview answers={answers} compact />
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => onComplete(answers, 'test')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition-colors duration-200 cursor-pointer focus:outline-none shadow-lg shadow-cyan-500/20"
          >
            <Phone className="w-4 h-4" />
            Test Your Receptionist
          </button>
          <button
            onClick={() => onComplete(answers, 'edit')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-600 text-slate-300 font-medium hover:bg-white/5 hover:border-slate-500 transition-colors duration-200 cursor-pointer focus:outline-none"
          >
            Edit Flow
          </button>
          <button
            onClick={() => onComplete(answers, 'live')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-emerald-400 font-medium hover:bg-emerald-500/10 transition-colors duration-200 cursor-pointer focus:outline-none"
          >
            Go Live
          </button>
        </div>
      </div>
    );
  }

  // ── Stage: Q&A ──
  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A] flex">
      {/* Left Panel (20%) */}
      <div className="w-[280px] border-r border-slate-700/50 flex flex-col shrink-0 bg-[#0F172A]">
        {/* Close */}
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors duration-200 cursor-pointer focus:outline-none"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-500 font-medium">Setup with Max</span>
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors duration-200 cursor-pointer focus:outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Orb */}
        <div className="flex justify-center py-4">
          <VoiceOrb state={orbState} size="small" />
        </div>

        {/* Progress */}
        <div className="px-5 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Question {currentQ} of 7</span>
            <span className="text-xs text-slate-500">{Math.round((currentQ / 7) * 100)}%</span>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: 7 }, (_, i) => (
              <button
                key={i}
                onClick={() => { if (i + 1 < currentQ) setCurrentQ(i + 1); }}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  i + 1 < currentQ ? 'bg-emerald-500 cursor-pointer' :
                  i + 1 === currentQ ? 'bg-cyan-500' :
                  'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Transcript */}
        <div ref={transcriptRef} className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
          {transcript.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-cyan-500/20 text-cyan-100'
                  : 'bg-slate-800 text-slate-300'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Text input fallback */}
        <div className="p-3 border-t border-slate-700/50">
          <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
              placeholder="Type instead..."
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
            />
            <button
              onClick={handleTextSubmit}
              className="p-1.5 rounded-lg text-cyan-400 hover:bg-cyan-500/10 transition-colors duration-200 cursor-pointer focus:outline-none"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel (80%) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Question header */}
        <div className="px-8 pt-8 pb-4">
          <span className="text-xs font-semibold text-cyan-500 uppercase tracking-wider mb-2 block">Question {currentQ}</span>
          <h2 className="text-lg font-semibold text-white leading-relaxed max-w-2xl">
            {QUESTIONS[currentQ - 1].ask}
          </h2>
        </div>

        {/* Adaptive input surface */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300" key={currentQ}>
            {currentQ === 1 && <Q1Industry answers={answers} updateAnswer={updateAnswer} onNext={advanceQuestion} />}
            {currentQ === 2 && <Q2Schedule answers={answers} updateAnswer={updateAnswer} onNext={advanceQuestion} />}
            {currentQ === 3 && <Q3Intents answers={answers} updateAnswer={updateAnswer} onNext={advanceQuestion} />}
            {currentQ === 4 && <Q4Calendar answers={answers} updateAnswer={updateAnswer} onNext={advanceQuestion} />}
            {currentQ === 5 && <Q5AfterHours answers={answers} updateAnswer={updateAnswer} onNext={advanceQuestion} />}
            {currentQ === 6 && <Q6Transfers answers={answers} updateAnswer={updateAnswer} onNext={advanceQuestion} />}
            {currentQ === 7 && <Q7Knowledge answers={answers} updateAnswer={updateAnswer} onNext={advanceQuestion} />}
          </div>
        </div>

        {/* Bottom: Flow preview strip */}
        <div className="border-t border-slate-700/50 bg-[#1E293B]/80 backdrop-blur-sm">
          <div className="px-8 py-4">
            <SetupFlowPreview answers={answers} compact />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Continue Button ──
function ContinueBtn({ onClick, disabled, label = 'Continue' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-6 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer focus:outline-none shadow-lg shadow-cyan-500/10"
    >
      {label}
      <ChevronRight className="w-4 h-4" />
    </button>
  );
}

// ── Q1: Industry Picker ──
function Q1Industry({ answers, updateAnswer, onNext }) {
  return (
    <div>
      <div className="grid grid-cols-4 gap-3 max-w-2xl">
        {INDUSTRIES.map((ind) => {
          const Icon = ind.icon;
          const isSelected = answers.industry === ind.id;
          return (
            <button
              key={ind.id}
              onClick={() => updateAnswer('industry', ind.id)}
              className={`flex flex-col items-center gap-3 p-5 rounded-xl border transition-all duration-200 cursor-pointer focus:outline-none ${
                isSelected
                  ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600 hover:text-slate-300'
              }`}
            >
              <Icon className="w-7 h-7" />
              <span className="text-[13px] font-medium">{ind.label}</span>
            </button>
          );
        })}
      </div>

      {answers.industry && (
        <div className="mt-5 max-w-md">
          <label className="text-xs text-slate-400 font-medium mb-1.5 block">Business Name</label>
          <input
            type="text"
            value={answers.businessName}
            onChange={(e) => updateAnswer('businessName', e.target.value)}
            placeholder="e.g., Riverside Dental"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-200"
          />
        </div>
      )}

      <ContinueBtn
        onClick={() => onNext(`${INDUSTRIES.find((i) => i.id === answers.industry)?.label || 'Business'}${answers.businessName ? ' — ' + answers.businessName : ''}`)}
        disabled={!answers.industry}
      />
    </div>
  );
}

// ── Q2: Schedule Builder ──
function Q2Schedule({ answers, updateAnswer, onNext }) {
  const toggleDay = (day) => {
    const sched = { ...answers.schedule };
    sched[day] = { ...sched[day], open: !sched[day].open };
    updateAnswer('schedule', sched);
  };

  const updateTime = (day, field, value) => {
    const sched = { ...answers.schedule };
    sched[day] = { ...sched[day], [field]: value };
    updateAnswer('schedule', sched);
  };

  const TIMES = ['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'];

  return (
    <div className="max-w-2xl">
      <div className="space-y-2">
        {DAYS.map((day) => {
          const d = answers.schedule[day];
          return (
            <div key={day} className="flex items-center gap-4 py-2">
              <span className="w-24 text-sm text-slate-300 font-medium">{day}</span>
              <button
                onClick={() => toggleDay(day)}
                className={`w-16 h-7 rounded-full relative transition-colors duration-200 cursor-pointer focus:outline-none ${
                  d.open ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform duration-200 ${
                  d.open ? 'translate-x-9' : 'translate-x-0.5'
                }`} />
              </button>
              {d.open ? (
                <div className="flex items-center gap-2">
                  <select value={d.start} onChange={(e) => updateTime(day, 'start', e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 cursor-pointer">
                    {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <span className="text-slate-500 text-xs">to</span>
                  <select value={d.end} onChange={(e) => updateTime(day, 'end', e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 cursor-pointer">
                    {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              ) : (
                <span className="text-xs text-slate-500">Closed</span>
              )}
            </div>
          );
        })}
      </div>

      <ContinueBtn
        onClick={() => {
          const open = DAYS.filter((d) => answers.schedule[d].open);
          onNext(`Open ${open.join(', ')}`);
        }}
      />
    </div>
  );
}

// ── Q3: Intent Chips ──
function Q3Intents({ answers, updateAnswer, onNext }) {
  const chips = INTENT_CHIPS[answers.industry] || INTENT_CHIPS.default;
  const [customIntent, setCustomIntent] = useState('');

  const toggleIntent = (intent) => {
    const current = answers.intents;
    if (current.includes(intent)) {
      updateAnswer('intents', current.filter((i) => i !== intent));
    } else {
      updateAnswer('intents', [...current, intent]);
    }
  };

  const addCustom = () => {
    if (customIntent.trim() && !answers.intents.includes(customIntent.trim())) {
      updateAnswer('intents', [...answers.intents, customIntent.trim()]);
      setCustomIntent('');
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex flex-wrap gap-2.5">
        {chips.map((chip) => {
          const sel = answers.intents.includes(chip);
          return (
            <button
              key={chip}
              onClick={() => toggleIntent(chip)}
              className={`px-4 py-2.5 rounded-xl text-[13px] font-medium border transition-all duration-200 cursor-pointer focus:outline-none ${
                sel
                  ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              {sel && <Check className="w-3.5 h-3.5 inline mr-1.5" />}
              {chip}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 max-w-sm">
        <input
          type="text"
          value={customIntent}
          onChange={(e) => setCustomIntent(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCustom()}
          placeholder="Add your own..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all duration-200"
        />
        <button onClick={addCustom} className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-slate-600 transition-colors duration-200 cursor-pointer focus:outline-none">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <ContinueBtn
        onClick={() => onNext(answers.intents.join(', '))}
        disabled={answers.intents.length === 0}
      />
    </div>
  );
}

// ── Q4: Calendar Integration ──
function Q4Calendar({ answers, updateAnswer, onNext }) {
  const addApptType = () => {
    updateAnswer('appointmentTypes', [...answers.appointmentTypes, { name: '', duration: 30 }]);
  };

  const updateApptType = (idx, field, value) => {
    const types = [...answers.appointmentTypes];
    types[idx] = { ...types[idx], [field]: value };
    updateAnswer('appointmentTypes', types);
  };

  const removeApptType = (idx) => {
    updateAnswer('appointmentTypes', answers.appointmentTypes.filter((_, i) => i !== idx));
  };

  return (
    <div className="max-w-2xl">
      <div className="grid grid-cols-3 gap-3 mb-6">
        {CALENDARS.map((cal) => {
          const sel = answers.calendar === cal.id;
          return (
            <button
              key={cal.id}
              onClick={() => updateAnswer('calendar', cal.id)}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer focus:outline-none ${
                sel
                  ? 'bg-cyan-500/15 border-cyan-500/50'
                  : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: cal.color + '20' }}>
                <CalIcon className="w-4 h-4" style={{ color: cal.color }} />
              </div>
              <span className={`text-[13px] font-medium ${sel ? 'text-cyan-300' : 'text-slate-300'}`}>{cal.label}</span>
              {sel && <Check className="w-4 h-4 text-cyan-400 ml-auto" />}
            </button>
          );
        })}
      </div>

      {answers.calendar && answers.calendar !== 'manual' && (
        <div className="mb-6 flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-emerald-300">Connected (simulated)</span>
        </div>
      )}

      <div className="mb-2">
        <label className="text-xs text-slate-400 font-medium mb-3 block">Appointment Types</label>
        <div className="space-y-2">
          {answers.appointmentTypes.map((apt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={apt.name}
                onChange={(e) => updateApptType(i, 'name', e.target.value)}
                placeholder="e.g., Cleaning"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all duration-200"
              />
              <select
                value={apt.duration}
                onChange={(e) => updateApptType(i, 'duration', Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
              >
                {[15, 30, 45, 60, 90].map((d) => <option key={d} value={d}>{d} min</option>)}
              </select>
              {answers.appointmentTypes.length > 1 && (
                <button onClick={() => removeApptType(i)} className="p-1.5 text-slate-500 hover:text-red-400 cursor-pointer focus:outline-none">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button onClick={addApptType} className="mt-2 flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer focus:outline-none">
          <Plus className="w-3.5 h-3.5" /> Add appointment type
        </button>
      </div>

      <ContinueBtn
        onClick={() => onNext(`${CALENDARS.find((c) => c.id === answers.calendar)?.label || 'Calendar'} with ${answers.appointmentTypes.length} types`)}
        disabled={!answers.calendar}
      />
    </div>
  );
}

// ── Q5: After Hours Options ──
function Q5AfterHours({ answers, updateAnswer, onNext }) {
  const options = [
    { id: 'message', title: 'Take a Message', desc: 'Record a voicemail, transcribe it, and email it to you' },
    { id: 'book', title: 'Book Next Slot', desc: 'Let them book the next available appointment automatically' },
    { id: 'both', title: 'Both', desc: 'Offer booking first, take a message if they prefer' },
  ];

  return (
    <div className="max-w-xl">
      <div className="space-y-3">
        {options.map((opt) => {
          const sel = answers.afterHoursMode === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => updateAnswer('afterHoursMode', opt.id)}
              className={`w-full text-left p-5 rounded-xl border transition-all duration-200 cursor-pointer focus:outline-none ${
                sel
                  ? 'bg-cyan-500/15 border-cyan-500/50'
                  : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  sel ? 'border-cyan-500' : 'border-slate-600'
                }`}>
                  {sel && <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />}
                </div>
                <div>
                  <span className={`text-[14px] font-medium block ${sel ? 'text-cyan-300' : 'text-slate-200'}`}>{opt.title}</span>
                  <span className="text-[12px] text-slate-400">{opt.desc}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700">
        <div>
          <span className="text-sm text-slate-200 font-medium">Emergency override?</span>
          <p className="text-xs text-slate-400">Urgent calls bypass after-hours routing</p>
        </div>
        <button
          onClick={() => updateAnswer('emergencyOverride', !answers.emergencyOverride)}
          className={`w-12 h-7 rounded-full relative transition-colors duration-200 cursor-pointer focus:outline-none ${
            answers.emergencyOverride ? 'bg-cyan-500' : 'bg-slate-700'
          }`}
        >
          <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform duration-200 ${
            answers.emergencyOverride ? 'translate-x-5' : 'translate-x-0.5'
          }`} />
        </button>
      </div>

      <ContinueBtn
        onClick={() => onNext(`${options.find((o) => o.id === answers.afterHoursMode)?.title}${answers.emergencyOverride ? ' + emergency override' : ''}`)}
        disabled={!answers.afterHoursMode}
      />
    </div>
  );
}

// ── Q6: Transfer Rules ──
function Q6Transfers({ answers, updateAnswer, onNext }) {
  const addRule = () => {
    updateAnswer('transferRules', [...answers.transferRules, { condition: '', destination: '', label: '' }]);
  };

  const updateRule = (idx, field, value) => {
    const rules = [...answers.transferRules];
    rules[idx] = { ...rules[idx], [field]: value };
    updateAnswer('transferRules', rules);
  };

  const removeRule = (idx) => {
    updateAnswer('transferRules', answers.transferRules.filter((_, i) => i !== idx));
  };

  return (
    <div className="max-w-2xl">
      <div className="space-y-3">
        {answers.transferRules.map((rule, i) => (
          <div key={i} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-slate-400 font-medium">Rule {i + 1}</span>
              {answers.transferRules.length > 1 && (
                <button onClick={() => removeRule(i)} className="ml-auto p-1 text-slate-500 hover:text-red-400 cursor-pointer focus:outline-none">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] text-slate-500 mb-1 block">If caller says...</label>
                <input
                  value={rule.condition}
                  onChange={(e) => updateRule(i, 'condition', e.target.value)}
                  placeholder="e.g., emergency"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 mb-1 block">Transfer to</label>
                <input
                  value={rule.destination}
                  onChange={(e) => updateRule(i, 'destination', e.target.value)}
                  placeholder="555-0123"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 mb-1 block">Label</label>
                <input
                  value={rule.label}
                  onChange={(e) => updateRule(i, 'label', e.target.value)}
                  placeholder="Dr. Patel — Cell"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={addRule} className="mt-3 flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer focus:outline-none">
        <Plus className="w-3.5 h-3.5" /> Add another rule
      </button>

      <ContinueBtn
        onClick={() => {
          const valid = answers.transferRules.filter((r) => r.condition && r.destination);
          onNext(valid.length > 0 ? `${valid.length} transfer rule${valid.length > 1 ? 's' : ''}` : 'No transfer rules');
        }}
      />
    </div>
  );
}

// ── Q7: Knowledge Base Upload ──
function Q7Knowledge({ answers, updateAnswer, onNext }) {
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const simulateCrawl = () => {
    if (!answers.knowledgeUrl) return;
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setDone(true);
    }, 2000);
  };

  return (
    <div className="max-w-2xl">
      {/* Website URL */}
      <div className="mb-6">
        <label className="text-xs text-slate-400 font-medium mb-2 flex items-center gap-2">
          <Globe className="w-3.5 h-3.5" /> Website URL
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={answers.knowledgeUrl}
            onChange={(e) => { updateAnswer('knowledgeUrl', e.target.value); setDone(false); }}
            placeholder="https://your-website.com"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all duration-200"
          />
          <button
            onClick={simulateCrawl}
            disabled={!answers.knowledgeUrl || processing}
            className="px-4 py-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-sm font-medium hover:bg-cyan-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer focus:outline-none"
          >
            {processing ? 'Crawling...' : 'Scan'}
          </button>
        </div>
        {processing && (
          <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        )}
        {done && (
          <div className="mt-2 flex items-center gap-2 text-emerald-400 text-xs">
            <Check className="w-3.5 h-3.5" />
            Found 12 questions from your website
          </div>
        )}
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="text-xs text-slate-400 font-medium mb-2 flex items-center gap-2">
          <Upload className="w-3.5 h-3.5" /> Upload Files
        </label>
        <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-slate-600 transition-colors duration-200 cursor-pointer">
          <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">Drop PDFs, Word docs, or text files here</p>
          <p className="text-xs text-slate-500 mt-1">or click to browse</p>
        </div>
      </div>

      {/* Direct text */}
      <div className="mb-4">
        <label className="text-xs text-slate-400 font-medium mb-2 flex items-center gap-2">
          <FileText className="w-3.5 h-3.5" /> Or type FAQs directly
        </label>
        <textarea
          rows={3}
          placeholder="Q: Do you accept insurance?&#10;A: Yes, we accept most major dental insurance plans..."
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all duration-200 resize-none"
        />
      </div>

      <ContinueBtn
        onClick={() => onNext(answers.knowledgeUrl ? `Website: ${answers.knowledgeUrl}` : 'Knowledge base configured')}
        label="Finish Setup"
      />
    </div>
  );
}
