import { useState, useEffect, useRef } from 'react';
import VoiceOrb from './VoiceOrb';
import useVoiceInput from '../hooks/useVoiceInput';
import useAudioPlayer from '../hooks/useAudioPlayer';
import useTransitionSound from '../hooks/useTransitionSound';
import { detectFlowIntent, MAX_FLOWS, FLOW_NAMES } from '../data/maxFlows';
import { Mic, MicOff, Send, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
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

const INTRO_TEXT =
  "Hi! I'm Max. Tell me what kind of workflow you'd like to build. I can set up a call-handling flow for a dental office, or an automated review request that fires after an e-commerce order is delivered. What'll it be?";

const CLARIFY_TEXT =
  "I can handle two types right now: a dental call flow, or an e-commerce post-delivery review flow. Which one would you like?";

const CONFIRM_TEXT = {
  dental:
    "Perfect! I'll build a full call-handling flow for a dental office — business hours routing, AI intent detection, appointment booking, and after-hours voicemail handling. Setting it up now...",
  ecommerce:
    "Got it! I'll set up a post-delivery review request flow — it waits 24 hours after delivery, sends an SMS, then follows up by email if no review comes in. Building it now...",
};

export default function SetupCall({ onComplete, onBack }) {
  // stage: 'asking' | 'confirming' | 'building'
  const [stage, setStage] = useState('asking');
  const [textInput, setTextInput] = useState('');
  const [detectedIntent, setDetectedIntent] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [orbState, setOrbState] = useState('idle');

  const transcriptRef = useRef(null);
  const hasSpokenIntro = useRef(false);

  const voiceInput = useVoiceInput();
  const audio = useAudioPlayer();
  const transitionSound = useTransitionSound();

  // Speak intro on mount
  useEffect(() => {
    if (hasSpokenIntro.current) return;
    hasSpokenIntro.current = true;
    transitionSound.play();
    setOrbState('speaking');
    audio.play(INTRO_TEXT).finally(() => setOrbState('idle'));
    setTranscript([{ role: 'max', text: INTRO_TEXT }]);
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  const handleUserInput = (text) => {
    if (!text.trim()) return;
    setTranscript((prev) => [...prev, { role: 'user', text }]);
    const intent = detectFlowIntent(text);

    if (!intent) {
      // Not recognized — ask to clarify
      setOrbState('speaking');
      audio.play(CLARIFY_TEXT).finally(() => setOrbState('idle'));
      setTranscript((prev) => [...prev, { role: 'max', text: CLARIFY_TEXT }]);
      return;
    }

    setDetectedIntent(intent);
    setStage('confirming');

    const confirmMsg = CONFIRM_TEXT[intent];
    setTranscript((prev) => [...prev, { role: 'max', text: confirmMsg }]);
    transitionSound.play();
    setOrbState('speaking');

    audio.play(confirmMsg).finally(() => {
      setOrbState('thinking');
      setStage('building');
      // Brief pause so the user sees "building" state, then load the flow
      setTimeout(() => {
        onComplete(
          { flowName: FLOW_NAMES[intent] },
          'edit',
          MAX_FLOWS[intent],
        );
      }, 1500);
    });
  };

  const handleTextSubmit = () => {
    const text = textInput.trim();
    if (!text) return;
    setTextInput('');
    handleUserInput(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleTextSubmit();
  };

  const handleMic = () => {
    if (voiceInput.isListening) {
      voiceInput.stopListening();
      setOrbState('idle');
    } else {
      setOrbState('listening');
      voiceInput.startListening((result) => {
        setOrbState('idle');
        handleUserInput(result);
      });
    }
  };

  const confirmExit = () => {
    setShowExitConfirm(false);
    audio.stop();
    voiceInput.stopListening();
    onBack();
  };

  const isInputDisabled = stage !== 'asking' || audio.isPlaying;
  const currentOrbState = voiceInput.isListening ? 'listening' : audio.isPlaying ? 'speaking' : orbState;

  return (
    <div className="fixed inset-0 z-50 bg-bg flex">
      {/* Exit confirmation */}
      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit Setup?</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to close? Your progress will be lost.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={confirmExit}
            >
              Exit Setup
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Exit button */}
      <button
        onClick={() => setShowExitConfirm(true)}
        className="absolute top-5 right-5 flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-text-light hover:text-text-dark hover:bg-[#e9ebee] transition-colors duration-200 cursor-pointer focus:outline-none z-10"
      >
        <X className="w-4 h-4" />
        <span className="text-xs font-medium">Exit</span>
      </button>

      {/* Left panel — Max */}
      <div className="w-[30%] min-w-[240px] flex flex-col items-center justify-center border-r border-border bg-surface px-8 py-10 gap-6">
        <VoiceOrb state={currentOrbState} size="large" />
        <div className="text-center">
          <p className="text-[15px] font-semibold text-text-dark">Max</p>
          <p className="text-[13px] text-text-light mt-1">
            {stage === 'building' ? 'Building your workflow...' : 'AI Workflow Builder'}
          </p>
        </div>
        {stage === 'building' && (
          <div className="flex items-center gap-2 text-primary text-[13px] font-medium">
            <Loader2 className="w-4 h-4 animate-spin" />
            Setting up {detectedIntent === 'dental' ? 'dental call flow' : 'review request flow'}...
          </div>
        )}
      </div>

      {/* Right panel — conversation */}
      <div className="flex-1 flex flex-col px-10 py-10">
        <div className="mb-6">
          <h2 className="text-[20px] font-semibold text-text-dark">
            {stage === 'building' ? 'Building your workflow' : "What would you like to build?"}
          </h2>
          <p className="text-[13px] text-text-light mt-1">
            {stage === 'building'
              ? `Loading ${detectedIntent === 'dental' ? 'Riverside Dental — Call Handling Flow' : 'Post-Delivery Review Request'}...`
              : 'Speak or type your answer below'}
          </p>
        </div>

        {/* Transcript */}
        <div
          ref={transcriptRef}
          className="flex-1 overflow-y-auto flex flex-col gap-3 mb-6 pr-1"
        >
          {transcript.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-[12px] text-[14px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-[#f0f2f5] text-text-dark'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {voiceInput.interimTranscript && (
            <div className="flex justify-end">
              <div className="max-w-[75%] px-4 py-2.5 rounded-[12px] text-[14px] leading-relaxed bg-primary/20 text-text-mid italic">
                {voiceInput.interimTranscript}
              </div>
            </div>
          )}
        </div>

        {/* Input row */}
        {stage === 'asking' && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleMic}
              disabled={audio.isPlaying}
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors focus:outline-none ${
                voiceInput.isListening
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-[#e9ebee] text-text-mid hover:bg-[#dde0e5]'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {voiceInput.isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <Input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isInputDisabled}
              placeholder="Type your answer, or use the mic..."
              className="flex-1"
            />

            <button
              onClick={handleTextSubmit}
              disabled={!textInput.trim() || isInputDisabled}
              className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-colors focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick-pick buttons */}
        {stage === 'asking' && !audio.isPlaying && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => handleUserInput('dental clinic call flow')}
              className="px-4 py-2 rounded-[10px] border border-border text-[13px] text-text-mid hover:bg-[#f0f2f5] hover:text-text-dark transition-colors focus:outline-none cursor-pointer"
            >
              Dental call flow
            </button>
            <button
              onClick={() => handleUserInput('ecommerce order delivery review')}
              className="px-4 py-2 rounded-[10px] border border-border text-[13px] text-text-mid hover:bg-[#f0f2f5] hover:text-text-dark transition-colors focus:outline-none cursor-pointer"
            >
              E-commerce review flow
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
