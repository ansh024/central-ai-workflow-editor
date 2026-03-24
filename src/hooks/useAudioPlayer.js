import { useState, useRef, useCallback, useEffect } from 'react';

// Browser SpeechSynthesis fallback
function speakWithBrowser(text) {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error('SpeechSynthesis not supported'));
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = resolve;
    utterance.onerror = (e) => reject(new Error(e.error));
    window.speechSynthesis.speak(utterance);
  });
}

export default function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const abortRef = useRef(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (abortRef.current) {
        abortRef.current.abort();
      }
      window.speechSynthesis?.cancel();
    };
  }, []);

  const play = useCallback(async (text) => {
    // Stop any current playback
    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
    }
    window.speechSynthesis?.cancel();

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setIsPlaying(true);

      // Try ElevenLabs first
      const response = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      return new Promise((resolve, reject) => {
        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(url);
          audioRef.current = null;
          resolve();
        };

        audio.onerror = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(url);
          audioRef.current = null;
          reject(new Error('Audio playback failed'));
        };

        audio.play().catch((e) => {
          setIsPlaying(false);
          URL.revokeObjectURL(url);
          audioRef.current = null;
          reject(e);
        });
      });
    } catch (error) {
      if (error.name === 'AbortError') {
        setIsPlaying(false);
        return;
      }

      // Fallback to browser TTS
      console.info('ElevenLabs TTS unavailable, using browser speech:', error.message);
      try {
        await speakWithBrowser(text);
        setIsPlaying(false);
      } catch (browserError) {
        setIsPlaying(false);
        throw browserError;
      }
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
    }
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
  }, []);

  return { isPlaying, play, stop };
}
