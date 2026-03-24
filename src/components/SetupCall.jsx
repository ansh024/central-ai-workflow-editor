import { useState, useEffect, useRef } from 'react';
import VoiceOrb from './VoiceOrb';
import SetupFlowPreview from './SetupFlowPreview';
import useVoiceChat from '../hooks/useVoiceChat';
import useTransitionSound from '../hooks/useTransitionSound';
import {
  Stethoscope, Scale, Wrench, Scissors, HeartPulse, Home, Warehouse, Car,
  Send, ChevronRight, ChevronLeft, Mic, MicOff, X,
  Calendar as CalIcon, Upload, Globe, FileText, Link2, Phone, Plus, Trash2,
  Check, AlertCircle,
} from 'lucide-react';

// ── Question Data (for UI rendering) ──
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

const NUDGE_TEXT = "Hey there — I'm waiting for you to click next and start. Excited to see what we build in this workflow!";

// ── Exit Confirmation Dialog ──
function ExitConfirmDialog({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
      <div className="bg-white rounded-2xl shadow-2xl border border-border p-6 max-w-sm w-full mx-4">
        <h3 className="text-base font-semibold text-text-dark mb-2">Exit Setup?</h3>
        <p className="text-sm text-text-mid mb-6">Are you sure you want to close? Your progress will be lost.</p>
        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium text-text-mid hover:bg-bg transition-colors duration-200 cursor-pointer focus:outline-none"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors duration-200 cursor-pointer focus:outline-none shadow-sm"
          >
            Exit Setup
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main SetupCall Component ──
export default function SetupCall({ onComplete, onBack }) {
  const [textInput, setTextInput] = useState('');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const transcriptRef = useRef(null);
  const startedRef = useRef(false);
  const nudgeTimerRef = useRef(null);

  const {
    stage, orbState, transcript, interimText, currentQuestion,
    answers, error, voiceEnabled, isSupported, isListening,
    startConversation, beginQuestions, sendText, advanceFromUI,
    updateAnswer, listen, toggleVoice, speakIntro, speakNudge,
    clearError, QUESTIONS,
  } = useVoiceChat({ onComplete });

  const transitionSound = useTransitionSound();

  // Start conversation on mount — audio is unlocked by parent's click handler
  const introSpokenRef = useRef(false);
  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      startConversation();
      // Play transition sound + intro speech (audio unlocked by "Create with Max" click)
      introSpokenRef.current = true;
      transitionSound.play();
      setTimeout(() => speakIntro(), 200);
    }
  }, [startConversation, transitionSound, speakIntro]);

  // 30-second nudge on welcome screen
  useEffect(() => {
    if (stage === 'welcome') {
      nudgeTimerRef.current = setTimeout(() => {
        speakNudge(NUDGE_TEXT);
      }, 30000);
      return () => clearTimeout(nudgeTimerRef.current);
    }
    return () => clearTimeout(nudgeTimerRef.current);
  }, [stage, speakNudge]);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript, interimText]);

  const handleTextSubmit = () => {
    if (!textInput.trim()) return;
    sendText(textInput.trim());
    setTextInput('');
  };

  const handleExit = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    setShowExitConfirm(false);
    onBack();
  };

  // Wrap advanceFromUI to play transition sound on question advance
  const advanceWithSfx = (summary) => {
    transitionSound.play();
    advanceFromUI(summary);
  };

  // ── Exit Button (shared across all stages) ──
  const ExitButton = () => (
    <button
      data-exit-btn
      onClick={handleExit}
      className="absolute top-5 right-5 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-text-light hover:text-text-dark hover:bg-border/40 transition-colors duration-200 cursor-pointer focus:outline-none z-10"
    >
      <X className="w-4 h-4" />
      <span className="text-xs font-medium">Exit</span>
    </button>
  );

  // ── Stage: Welcome ──
  if (stage === 'welcome') {
    return (
      <div className="fixed inset-0 z-50 bg-bg flex flex-col items-center justify-center px-6">
        {showExitConfirm && <ExitConfirmDialog onConfirm={confirmExit} onCancel={() => setShowExitConfirm(false)} />}
        <ExitButton />

        {/* Voice orb */}
        <div className="relative mb-10">
          <VoiceOrb state={orbState} size="large" />
        </div>

        {/* Greeting text */}
        <div className="max-w-sm text-center">
          <p className="text-xl font-semibold text-text-dark leading-relaxed">
            Hi there! I'm Max <span role="img" aria-label="wave">&#x1F44B;</span>
          </p>
          <p className="mt-3 text-text-mid text-[15px] leading-relaxed">
            I'm here to help you set up your voice receptionist in about 3 minutes.
          </p>
        </div>

        {/* Next button */}
        <button
          onClick={() => {
            clearTimeout(nudgeTimerRef.current);
            introSpokenRef.current = true; // skip intro if clicking Next directly
            transitionSound.play();
            beginQuestions();
          }}
          className="mt-10 w-full max-w-sm px-6 py-4 rounded-2xl bg-primary text-white text-base font-semibold hover:bg-primary-dark transition-colors duration-200 cursor-pointer focus:outline-none shadow-lg shadow-primary/20"
        >
          Next
        </button>
      </div>
    );
  }

  // ── Stage: Reveal ──
  if (stage === 'reveal') {
    return (
      <div className="fixed inset-0 z-50 bg-bg flex flex-col items-center justify-center px-8">
        {showExitConfirm && <ExitConfirmDialog onConfirm={confirmExit} onCancel={() => setShowExitConfirm(false)} />}
        <ExitButton />

        <VoiceOrb state="speaking" size="small" />

        <h1 className="text-2xl font-semibold text-text-dark mt-6 mb-2">Your Receptionist is Ready!</h1>
        <p className="text-text-mid text-sm max-w-lg text-center mb-8">
          Max built a {answers.intents.length > 0 ? answers.intents.length + '-path' : 'complete'} call flow for {answers.businessName || 'your business'}.
          It handles calls during and after hours, books appointments, and answers common questions.
        </p>

        {/* Mini flow preview */}
        <div className="w-full max-w-2xl bg-surface rounded-2xl border border-border p-6 mb-8 shadow-sm">
          <SetupFlowPreview answers={answers} compact />
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => onComplete(answers, 'test')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark transition-colors duration-200 cursor-pointer focus:outline-none shadow-lg shadow-primary/20"
          >
            <Phone className="w-4 h-4" />
            Test Your Receptionist
          </button>
          <button
            onClick={() => onComplete(answers, 'edit')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-text-mid font-medium hover:bg-bg hover:border-text-light transition-colors duration-200 cursor-pointer focus:outline-none"
          >
            Edit Flow
          </button>
          <button
            onClick={() => onComplete(answers, 'live')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-emerald-600 font-medium hover:bg-emerald-50 transition-colors duration-200 cursor-pointer focus:outline-none"
          >
            Go Live
          </button>
        </div>
      </div>
    );
  }

  // ── Stage: Q&A ──
  return (
    <div className="fixed inset-0 z-50 bg-bg flex">
      {showExitConfirm && <ExitConfirmDialog onConfirm={confirmExit} onCancel={() => setShowExitConfirm(false)} />}
      <ExitButton />

      {/* Left Panel */}
      <div className="w-[280px] border-r border-border flex flex-col shrink-0 bg-surface">
        {/* Header */}
        <div className="flex items-center justify-center px-4 py-3 border-b border-border">
          <span className="text-xs text-text-mid font-medium">Setup with Max</span>
        </div>

        {/* Orb */}
        <div className="flex justify-center py-4">
          <VoiceOrb state={orbState} size="small" />
        </div>

        {/* Progress */}
        <div className="px-5 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-text-mid">Question {currentQuestion} of 7</span>
            <span className="text-xs text-text-light">{Math.round((currentQuestion / 7) * 100)}%</span>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: 7 }, (_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  i + 1 < currentQuestion ? 'bg-emerald-500' :
                  i + 1 === currentQuestion ? 'bg-primary' :
                  'bg-border'
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
                  ? 'bg-primary/10 text-primary-dark'
                  : 'bg-bg text-text-dark'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {interimText && (
            <div className="flex justify-end">
              <div className="max-w-[90%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed bg-primary/5 text-primary/60 italic">
                {interimText}...
              </div>
            </div>
          )}
        </div>

        {/* Error display */}
        {error && (
          <div className="mx-3 mb-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className="text-xs text-red-600 flex-1">{error}</span>
            <button onClick={clearError} className="text-red-400 hover:text-red-500 cursor-pointer focus:outline-none">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Mic button + text input */}
        <div className="p-3 border-t border-border space-y-2">
          {isSupported && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  if (!isListening && orbState !== 'speaking' && orbState !== 'thinking') {
                    listen();
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer focus:outline-none ${
                  isListening
                    ? 'bg-red-50 border border-red-300 text-red-600'
                    : orbState === 'speaking' || orbState === 'thinking'
                    ? 'bg-bg border border-border text-text-light cursor-not-allowed'
                    : 'bg-primary/10 border border-primary/30 text-primary hover:bg-primary/15'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isListening ? 'Listening...' : orbState === 'speaking' ? 'Max is speaking...' : orbState === 'thinking' ? 'Thinking...' : 'Tap to speak'}
              </button>
              <button
                onClick={toggleVoice}
                className="p-2 rounded-lg text-text-light hover:text-text-dark hover:bg-bg transition-colors duration-200 cursor-pointer focus:outline-none"
                title={voiceEnabled ? 'Disable voice' : 'Enable voice'}
              >
                {voiceEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
          <div className="flex items-center gap-2 bg-bg rounded-xl px-3 py-2 border border-border">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
              placeholder="Type instead..."
              className="flex-1 bg-transparent text-sm text-text-dark placeholder:text-text-light focus:outline-none"
            />
            <button
              onClick={handleTextSubmit}
              className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors duration-200 cursor-pointer focus:outline-none"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Question header */}
        <div className="px-8 pt-8 pb-4">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 block">Question {currentQuestion}</span>
          <h2 className="text-lg font-semibold text-text-dark leading-relaxed max-w-2xl">
            {QUESTIONS[currentQuestion - 1].ask}
          </h2>
        </div>

        {/* Adaptive input surface */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <div key={currentQuestion}>
            {currentQuestion === 1 && <Q1Industry answers={answers} updateAnswer={updateAnswer} onNext={advanceWithSfx} />}
            {currentQuestion === 2 && <Q2Schedule answers={answers} updateAnswer={updateAnswer} onNext={advanceWithSfx} />}
            {currentQuestion === 3 && <Q3Intents answers={answers} updateAnswer={updateAnswer} onNext={advanceWithSfx} />}
            {currentQuestion === 4 && <Q4Calendar answers={answers} updateAnswer={updateAnswer} onNext={advanceWithSfx} />}
            {currentQuestion === 5 && <Q5AfterHours answers={answers} updateAnswer={updateAnswer} onNext={advanceWithSfx} />}
            {currentQuestion === 6 && <Q6Transfers answers={answers} updateAnswer={updateAnswer} onNext={advanceWithSfx} />}
            {currentQuestion === 7 && <Q7Knowledge answers={answers} updateAnswer={updateAnswer} onNext={advanceWithSfx} />}
          </div>
        </div>

        {/* Bottom: Flow preview strip */}
        <div className="border-t border-border bg-surface">
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
      className="mt-6 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer focus:outline-none shadow-sm"
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
                  ? 'bg-primary/10 border-primary/40 text-primary'
                  : 'bg-surface border-border text-text-mid hover:bg-bg hover:border-text-light hover:text-text-dark'
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
          <label className="text-xs text-text-mid font-medium mb-1.5 block">Business Name</label>
          <input
            type="text"
            value={answers.businessName}
            onChange={(e) => updateAnswer('businessName', e.target.value)}
            placeholder="e.g., Riverside Dental"
            className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text-dark placeholder:text-text-light focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-200"
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
              <span className="w-24 text-sm text-text-dark font-medium">{day}</span>
              <button
                onClick={() => toggleDay(day)}
                className={`w-16 h-7 rounded-full relative transition-colors duration-200 cursor-pointer focus:outline-none ${
                  d.open ? 'bg-primary' : 'bg-border'
                }`}
              >
                <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform duration-200 ${
                  d.open ? 'translate-x-9' : 'translate-x-0.5'
                }`} />
              </button>
              {d.open ? (
                <div className="flex items-center gap-2">
                  <select value={d.start} onChange={(e) => updateTime(day, 'start', e.target.value)}
                    className="bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-dark focus:outline-none focus:border-primary/50 cursor-pointer">
                    {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <span className="text-text-light text-xs">to</span>
                  <select value={d.end} onChange={(e) => updateTime(day, 'end', e.target.value)}
                    className="bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-dark focus:outline-none focus:border-primary/50 cursor-pointer">
                    {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              ) : (
                <span className="text-xs text-text-light">Closed</span>
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
                  ? 'bg-primary/10 border-primary/40 text-primary'
                  : 'bg-surface border-border text-text-mid hover:bg-bg hover:border-text-light'
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
          className="flex-1 bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text-dark placeholder:text-text-light focus:outline-none focus:border-primary/50 transition-all duration-200"
        />
        <button onClick={addCustom} className="p-2.5 rounded-xl bg-surface border border-border text-text-mid hover:text-primary hover:border-primary/30 transition-colors duration-200 cursor-pointer focus:outline-none">
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
                  ? 'bg-primary/10 border-primary/40'
                  : 'bg-surface border-border hover:bg-bg hover:border-text-light'
              }`}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: cal.color + '20' }}>
                <CalIcon className="w-4 h-4" style={{ color: cal.color }} />
              </div>
              <span className={`text-[13px] font-medium ${sel ? 'text-primary' : 'text-text-dark'}`}>{cal.label}</span>
              {sel && <Check className="w-4 h-4 text-primary ml-auto" />}
            </button>
          );
        })}
      </div>

      {answers.calendar && answers.calendar !== 'manual' && (
        <div className="mb-6 flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
          <Check className="w-4 h-4 text-emerald-600" />
          <span className="text-sm text-emerald-700">Connected (simulated)</span>
        </div>
      )}

      <div className="mb-2">
        <label className="text-xs text-text-mid font-medium mb-3 block">Appointment Types</label>
        <div className="space-y-2">
          {answers.appointmentTypes.map((apt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={apt.name}
                onChange={(e) => updateApptType(i, 'name', e.target.value)}
                placeholder="e.g., Cleaning"
                className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-dark placeholder:text-text-light focus:outline-none focus:border-primary/50 transition-all duration-200"
              />
              <select
                value={apt.duration}
                onChange={(e) => updateApptType(i, 'duration', Number(e.target.value))}
                className="bg-surface border border-border rounded-lg px-2.5 py-2 text-sm text-text-dark focus:outline-none focus:border-primary/50 cursor-pointer"
              >
                {[15, 30, 45, 60, 90].map((d) => <option key={d} value={d}>{d} min</option>)}
              </select>
              {answers.appointmentTypes.length > 1 && (
                <button onClick={() => removeApptType(i)} className="p-1.5 text-text-light hover:text-red-500 cursor-pointer focus:outline-none">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button onClick={addApptType} className="mt-2 flex items-center gap-1.5 text-xs text-primary hover:text-primary-dark cursor-pointer focus:outline-none">
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
                  ? 'bg-primary/10 border-primary/40'
                  : 'bg-surface border-border hover:bg-bg hover:border-text-light'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  sel ? 'border-primary' : 'border-border'
                }`}>
                  {sel && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
                <div>
                  <span className={`text-[14px] font-medium block ${sel ? 'text-primary' : 'text-text-dark'}`}>{opt.title}</span>
                  <span className="text-[12px] text-text-mid">{opt.desc}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-between p-4 rounded-xl bg-surface border border-border">
        <div>
          <span className="text-sm text-text-dark font-medium">Emergency override?</span>
          <p className="text-xs text-text-mid">Urgent calls bypass after-hours routing</p>
        </div>
        <button
          onClick={() => updateAnswer('emergencyOverride', !answers.emergencyOverride)}
          className={`w-12 h-7 rounded-full relative transition-colors duration-200 cursor-pointer focus:outline-none ${
            answers.emergencyOverride ? 'bg-primary' : 'bg-border'
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
          <div key={i} className="p-4 rounded-xl bg-surface border border-border">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-text-mid font-medium">Rule {i + 1}</span>
              {answers.transferRules.length > 1 && (
                <button onClick={() => removeRule(i)} className="ml-auto p-1 text-text-light hover:text-red-500 cursor-pointer focus:outline-none">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] text-text-light mb-1 block">If caller says...</label>
                <input
                  value={rule.condition}
                  onChange={(e) => updateRule(i, 'condition', e.target.value)}
                  placeholder="e.g., emergency"
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-dark placeholder:text-text-light focus:outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="text-[11px] text-text-light mb-1 block">Transfer to</label>
                <input
                  value={rule.destination}
                  onChange={(e) => updateRule(i, 'destination', e.target.value)}
                  placeholder="555-0123"
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-dark placeholder:text-text-light focus:outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="text-[11px] text-text-light mb-1 block">Label</label>
                <input
                  value={rule.label}
                  onChange={(e) => updateRule(i, 'label', e.target.value)}
                  placeholder="Dr. Patel — Cell"
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-dark placeholder:text-text-light focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={addRule} className="mt-3 flex items-center gap-1.5 text-xs text-primary hover:text-primary-dark cursor-pointer focus:outline-none">
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
        <label className="text-xs text-text-mid font-medium mb-2 flex items-center gap-2">
          <Globe className="w-3.5 h-3.5" /> Website URL
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={answers.knowledgeUrl}
            onChange={(e) => { updateAnswer('knowledgeUrl', e.target.value); setDone(false); }}
            placeholder="https://your-website.com"
            className="flex-1 bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text-dark placeholder:text-text-light focus:outline-none focus:border-primary/50 transition-all duration-200"
          />
          <button
            onClick={simulateCrawl}
            disabled={!answers.knowledgeUrl || processing}
            className="px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm font-medium hover:bg-primary/15 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer focus:outline-none"
          >
            {processing ? 'Crawling...' : 'Scan'}
          </button>
        </div>
        {processing && (
          <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        )}
        {done && (
          <div className="mt-2 flex items-center gap-2 text-emerald-600 text-xs">
            <Check className="w-3.5 h-3.5" />
            Found 12 questions from your website
          </div>
        )}
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="text-xs text-text-mid font-medium mb-2 flex items-center gap-2">
          <Upload className="w-3.5 h-3.5" /> Upload Files
        </label>
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-text-light transition-colors duration-200 cursor-pointer">
          <FileText className="w-8 h-8 text-text-light mx-auto mb-2" />
          <p className="text-sm text-text-mid">Drop PDFs, Word docs, or text files here</p>
          <p className="text-xs text-text-light mt-1">or click to browse</p>
        </div>
      </div>

      {/* Direct text */}
      <div className="mb-4">
        <label className="text-xs text-text-mid font-medium mb-2 flex items-center gap-2">
          <FileText className="w-3.5 h-3.5" /> Or type FAQs directly
        </label>
        <textarea
          rows={3}
          placeholder="Q: Do you accept insurance?&#10;A: Yes, we accept most major dental insurance plans..."
          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-dark placeholder:text-text-light focus:outline-none focus:border-primary/50 transition-all duration-200 resize-none"
        />
      </div>

      <ContinueBtn
        onClick={() => onNext(answers.knowledgeUrl ? `Website: ${answers.knowledgeUrl}` : 'Knowledge base configured')}
        label="Finish Setup"
      />
    </div>
  );
}
