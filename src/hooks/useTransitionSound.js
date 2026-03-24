import { useRef, useCallback } from 'react';

export default function useTransitionSound() {
  const audioRef = useRef(null);

  const play = useCallback(() => {
    try {
      // Stop any currently playing instance
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      const audio = new Audio('/transition-sfx.mp3');
      audio.volume = 0.5;
      audioRef.current = audio;
      audio.play().catch(() => {
        // Silently fail if autoplay blocked
      });
    } catch (e) {
      // Ignore errors
    }
  }, []);

  return { play };
}
