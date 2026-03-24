import { useState, useRef, useCallback, useEffect } from 'react';
import useVoiceInput from './useVoiceInput';
import useAudioPlayer from './useAudioPlayer';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const QUESTIONS = [
  { id: 1, ask: "First up — what kind of business do you run? Like a dental clinic, law firm, salon... just tell me in your own words." },
  { id: 2, ask: "When are you open? I'll make sure your receptionist knows when to handle calls normally versus after hours." },
  { id: 3, ask: "What are the main reasons people call you? For example — appointments, questions about services, pricing, emergencies..." },
  { id: 4, ask: "Let's set up appointment booking. Do you use any scheduling tool — like Google Calendar, Calendly, or something else?" },
  { id: 5, ask: "When someone calls outside your business hours, what would you like to happen?" },
  { id: 6, ask: "Are there situations where a call should come straight to you or someone on your team?" },
  { id: 7, ask: "Last thing — do you have a website, FAQ page, or any documents with common questions?" },
];

const INTRO_TEXT = "Hey! I'm Max, Central's AI assistant. I'm going to help you set up your voice receptionist in about 3 minutes. I'll ask you a few questions about your business, and by the end, your phones will be answered 24/7. Ready? Let's start.";

const DEFAULT_ANSWERS = {
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
};

export default function useVoiceChat({ onComplete }) {
  const [stage, setStage] = useState('welcome'); // welcome | qa | reveal
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [orbState, setOrbState] = useState('idle');
  const [transcript, setTranscript] = useState([]);
  const [interimText, setInterimText] = useState('');
  const [answers, setAnswers] = useState({ ...DEFAULT_ANSWERS });
  const [error, setError] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const voiceInput = useVoiceInput();
  const audioPlayer = useAudioPlayer();
  const processingRef = useRef(false);
  const stageRef = useRef(stage);

  // Keep stageRef in sync
  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  // Watch interim transcript from voice input
  useEffect(() => {
    setInterimText(voiceInput.interimTranscript);
  }, [voiceInput.interimTranscript]);

  const addMessage = useCallback((role, text) => {
    setTranscript(prev => [...prev, { role, text }]);
  }, []);

  const updateAnswer = useCallback((key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  }, []);

  // Speak text via TTS and return when done
  const speak = useCallback(async (text) => {
    setOrbState('speaking');
    try {
      await audioPlayer.play(text);
    } catch (e) {
      console.warn('TTS failed, continuing without audio:', e.message);
      // Even if TTS fails, wait a brief moment so user can read the text
      await new Promise(r => setTimeout(r, 1500));
    }
    if (stageRef.current !== 'reveal') {
      setOrbState('listening');
    }
  }, [audioPlayer]);

  // Start listening for voice input
  const listen = useCallback(() => {
    if (!voiceInput.isSupported || !voiceEnabled) return;
    setOrbState('listening');
    voiceInput.startListening((finalText) => {
      handleUserInput(finalText);
    });
  }, [voiceInput.isSupported, voiceEnabled]);

  // Process user input (from voice or text)
  const handleUserInput = useCallback(async (text) => {
    if (processingRef.current || !text.trim()) return;
    processingRef.current = true;

    // Stop listening if still active
    voiceInput.stopListening();
    setInterimText('');

    // Add user message to transcript
    addMessage('user', text.trim());
    setOrbState('thinking');

    try {
      // Send to AI for interpretation
      const response = await fetch('/api/voice/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: text.trim(),
          currentQuestion,
          conversationHistory: transcript,
          currentAnswers: answers,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      // Apply actions to answers
      if (result.actions && result.actions.length > 0) {
        setAnswers(prev => {
          const updated = { ...prev };
          for (const action of result.actions) {
            if (action.type === 'set_answer') {
              updated[action.key] = action.value;
            }
          }
          return updated;
        });
      }

      // Add Max's acknowledgment
      addMessage('max', result.acknowledgment);

      // Speak acknowledgment
      if (result.readyToAdvance && currentQuestion < 7) {
        // Speak ack + next question together
        const nextQ = QUESTIONS[currentQuestion]; // 0-indexed is next since currentQuestion is 1-indexed
        const combinedText = result.acknowledgment + ' ' + nextQ.ask;
        addMessage('max', nextQ.ask);

        await speak(combinedText);

        setCurrentQuestion(prev => prev + 1);

        // Auto-start listening for next question
        processingRef.current = false;
        if (voiceInput.isSupported && voiceEnabled) {
          listen();
        }
        return;
      } else if (result.readyToAdvance && currentQuestion === 7) {
        // All done — reveal stage
        const revealText = "All set! Here's your receptionist flow. Let me walk you through what I built.";
        addMessage('max', revealText);
        await speak(result.acknowledgment + ' ' + revealText);
        setOrbState('speaking');
        setStage('reveal');
        processingRef.current = false;
        return;
      } else {
        // Not ready to advance — AI didn't understand or needs more info
        await speak(result.acknowledgment);
        processingRef.current = false;
        if (voiceInput.isSupported && voiceEnabled) {
          listen();
        }
        return;
      }
    } catch (e) {
      console.error('Voice chat error:', e);
      setError('Could not reach Max. Try again or type your answer.');
      setOrbState('idle');
      processingRef.current = false;
    }
  }, [currentQuestion, transcript, answers, addMessage, speak, listen, voiceInput, voiceEnabled]);

  // Text input fallback
  const sendText = useCallback((text) => {
    handleUserInput(text);
  }, [handleUserInput]);

  // Welcome stage: show intro message (no auto-speak due to autoplay restrictions)
  const startConversation = useCallback(() => {
    setStage('welcome');
    addMessage('max', INTRO_TEXT);
    setOrbState('idle');
  }, [addMessage]);

  // Speak intro — must be called from a user gesture (click handler)
  const speakIntro = useCallback(async () => {
    if (stageRef.current === 'welcome') {
      await speak(INTRO_TEXT);
      setOrbState('idle');
    }
  }, [speak]);

  // Speak a nudge reminder on the welcome screen
  const speakNudge = useCallback(async (text) => {
    if (stageRef.current === 'welcome') {
      await speak(text);
      setOrbState('idle');
    }
  }, [speak]);

  // User clicks "Next" on welcome screen — begin Q&A
  const beginQuestions = useCallback(async () => {
    setStage('qa');
    const q1Text = QUESTIONS[0].ask;
    addMessage('max', q1Text);

    await speak(q1Text);

    // Start listening
    if (voiceInput.isSupported && voiceEnabled) {
      listen();
    }
  }, [addMessage, speak, listen, voiceInput.isSupported, voiceEnabled]);

  // Advance from UI click (right panel Continue) — skip AI interpret
  const advanceFromUI = useCallback(async (summary) => {
    // Add user message summarizing their selection
    addMessage('user', summary);
    // Add simple acknowledgment
    addMessage('max', 'Got it!');

    if (currentQuestion < 7) {
      const nextQ = QUESTIONS[currentQuestion]; // 0-indexed next
      setCurrentQuestion(prev => prev + 1);
      addMessage('max', nextQ.ask);
      await speak('Got it! ' + nextQ.ask);
      if (voiceInput.isSupported && voiceEnabled) {
        listen();
      }
    } else {
      // All done — reveal stage
      const revealText = "All set! Here's your receptionist flow. Let me walk you through what I built.";
      addMessage('max', revealText);
      await speak('Got it! ' + revealText);
      setOrbState('speaking');
      setStage('reveal');
    }
  }, [currentQuestion, addMessage, speak, listen, voiceInput.isSupported, voiceEnabled]);

  // Toggle voice on/off
  const toggleVoice = useCallback(() => {
    if (voiceEnabled) {
      voiceInput.stopListening();
      setVoiceEnabled(false);
    } else {
      setVoiceEnabled(true);
    }
  }, [voiceEnabled, voiceInput]);

  return {
    // State
    stage,
    orbState,
    transcript,
    interimText,
    currentQuestion,
    answers,
    error,
    voiceEnabled,

    // Actions
    startConversation,
    beginQuestions,
    speakIntro,
    speakNudge,
    sendText,
    advanceFromUI,
    updateAnswer,
    listen,
    toggleVoice,
    clearError: () => setError(null),

    // Voice support info
    isSupported: voiceInput.isSupported,
    isListening: voiceInput.isListening,

    // Expose QUESTIONS and INTRO for SetupCall to use
    QUESTIONS,
    INTRO_TEXT,
  };
}
