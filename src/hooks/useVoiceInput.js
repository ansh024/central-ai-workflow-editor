import { useState, useRef, useCallback, useEffect } from 'react';

const SpeechRecognition = typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null;

export default function useVoiceInput() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const retriesRef = useRef(0);
  const onResultRef = useRef(null);

  const isSupported = !!SpeechRecognition;

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  const startListening = useCallback((onResult) => {
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    // Always clean up any existing session first to avoid InvalidStateError
    if (recognitionRef.current) {
      recognitionRef.current.onend = null; // prevent stale onend from flipping state
      recognitionRef.current.onerror = null;
      recognitionRef.current.onresult = null;
      try { recognitionRef.current.abort(); } catch (_) { /* ignore */ }
      recognitionRef.current = null;
    }

    onResultRef.current = onResult;
    retriesRef.current = 0;
    setError(null);
    setTranscript('');
    setInterimTranscript('');

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (interim) setInterimTranscript(interim);

      if (final) {
        setTranscript(final);
        setInterimTranscript('');
        setIsListening(false);
        if (onResultRef.current) {
          onResultRef.current(final.trim());
        }
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech' && retriesRef.current < 2) {
        retriesRef.current++;
        recognition.stop();
        setTimeout(() => {
          try { recognition.start(); } catch (e) { /* ignore */ }
        }, 200);
        return;
      }

      setIsListening(false);
      setInterimTranscript('');

      if (event.error === 'not-allowed' || event.error === 'audio-capture') {
        setError('Microphone access denied. Please allow microphone access.');
      } else if (event.error === 'no-speech') {
        setError('no-speech');
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (e) {
      setError(`Could not start recognition: ${e.message}`);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    isSupported,
    error,
    clearError: () => setError(null),
  };
}
