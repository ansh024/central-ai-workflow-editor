import { useEffect, useState } from 'react';

export default function VoiceOrb({ state = 'idle', size = 'large' }) {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    if (state === 'speaking' || state === 'listening') {
      const interval = setInterval(() => {
        setPulse((p) => (p + 1) % 360);
      }, 30);
      return () => clearInterval(interval);
    }
  }, [state]);

  const isLarge = size === 'large';
  const dim = isLarge ? 160 : 64;
  const glowSize = isLarge ? 80 : 24;

  const speakingScale = state === 'speaking'
    ? 1 + 0.08 * Math.sin(pulse * 0.15) + 0.04 * Math.sin(pulse * 0.3)
    : 1;
  const listeningScale = state === 'listening'
    ? 1 + 0.03 * Math.sin(pulse * 0.08)
    : 1;
  const scale = state === 'speaking' ? speakingScale : listeningScale;

  const gradientAngle = state === 'speaking' ? pulse * 2 : pulse * 0.5;

  return (
    <div className="relative flex items-center justify-center" style={{ width: dim, height: dim }}>
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-full transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle, rgba(14, 165, 233, 0.25) 0%, transparent 70%)`,
          transform: `scale(${1.4 + (state === 'speaking' ? 0.2 * Math.sin(pulse * 0.1) : 0)})`,
          opacity: state === 'idle' ? 0.3 : state === 'thinking' ? 0.5 : 0.8,
        }}
      />

      {/* Main orb */}
      <div
        className="rounded-full shadow-2xl transition-all duration-100"
        style={{
          width: dim * 0.7,
          height: dim * 0.7,
          background: `conic-gradient(from ${gradientAngle}deg, #0EA5E9, #10B981, #0EA5E9)`,
          transform: `scale(${scale})`,
          boxShadow: `0 0 ${glowSize}px rgba(14, 165, 233, ${state === 'idle' ? 0.2 : 0.5}), 0 0 ${glowSize * 2}px rgba(16, 185, 129, ${state === 'idle' ? 0.1 : 0.3})`,
        }}
      />

      {/* Inner shine */}
      <div
        className="absolute rounded-full"
        style={{
          width: dim * 0.45,
          height: dim * 0.45,
          background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.25) 0%, transparent 60%)`,
        }}
      />

      {/* Listening ring */}
      {state === 'listening' && (
        <div
          className="absolute rounded-full border-2 border-cyan-400/40"
          style={{
            width: dim * 0.85,
            height: dim * 0.85,
            animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
          }}
        />
      )}

      {/* Thinking spinner */}
      {state === 'thinking' && (
        <div
          className="absolute rounded-full border-2 border-transparent border-t-cyan-400"
          style={{
            width: dim * 0.85,
            height: dim * 0.85,
            animation: 'spin 1.5s linear infinite',
          }}
        />
      )}
    </div>
  );
}
