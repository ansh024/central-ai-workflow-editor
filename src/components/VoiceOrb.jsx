import './VoiceOrb.css';

export default function VoiceOrb({ state = 'idle', size = 'small', onClick }) {
  const sizeClass = size === 'large' ? 'large' : '';

  return (
    <div className="voice-orb-wrapper">
      <div
        className={`voice-orb state-${state} ${sizeClass}`}
        onClick={onClick}
        role="button"
        tabIndex={0}
        aria-label={
          state === 'listening' ? 'Listening for voice input' :
          state === 'speaking' ? 'Max is speaking' :
          state === 'thinking' ? 'Processing your input' :
          'Voice orb'
        }
      >
        <div className="icons">
          <svg className="orb-svg" xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
            {state === 'speaking' ? (
              /* Audio wave icon for speaking */
              <g fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M3 14V10" />
                <path d="M7.5 18V6" />
                <path d="M12 22V2" />
                <path d="M16.5 18V8" />
                <path d="M21 14V10" />
              </g>
            ) : (
              /* Mic icon for other states */
              <g fill="none" className="mic">
                <rect width={8} height={13} x={8} y={2} fill="currentColor" rx={4} />
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 11a7 7 0 1 0 14 0m-7 10v-2" />
              </g>
            )}
          </svg>
        </div>
        <div className="ball">
          <div className="container-lines" />
          <div className="container-rings" />
        </div>
        <svg style={{ pointerEvents: 'none', position: 'absolute', width: 0, height: 0 }}>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation={6} />
            <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" />
          </filter>
        </svg>
      </div>
    </div>
  );
}
