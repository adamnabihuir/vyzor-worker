interface LogoProps {
  size?: number;
  showText?: boolean;
  textColor?: string;
}

export default function Logo({ size = 36, showText = true, textColor = '#0f172a' }: LogoProps) {
  const iconSize = size;

  return (
    <div className="flex items-center gap-2.5" style={{ userSelect: 'none' }}>
      {/* SVG Icon Mark */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="vanguard-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
          <linearGradient id="vanguard-grad-glow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#6366f1" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Hexagon background */}
        <path
          d="M20 2L36 11V29L20 38L4 29V11L20 2Z"
          fill="url(#vanguard-grad)"
          filter="url(#shadow)"
        />

        {/* Inner lighter hex ring */}
        <path
          d="M20 6L33 13.5V26.5L20 34L7 26.5V13.5L20 6Z"
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1"
        />

        {/* V shape — left arm */}
        <path
          d="M12 12L20 27"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* V shape — right arm */}
        <path
          d="M28 12L20 27"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Small scan dot at bottom of V */}
        <circle cx="20" cy="27" r="2" fill="white" opacity="0.9" />

        {/* Top highlight dots */}
        <circle cx="12" cy="12" r="1.5" fill="white" opacity="0.7" />
        <circle cx="28" cy="12" r="1.5" fill="white" opacity="0.7" />
      </svg>

      {/* Wordmark */}
      {showText && (
        <span
          style={{
            color: textColor,
            fontWeight: 800,
            fontSize: `${size * 0.5}px`,
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}
        >
          Vanguard
          <span style={{ color: '#6366f1' }}>.</span>
        </span>
      )}
    </div>
  );
}

/* Standalone icon-only export for favicons / loading states */
export function LogoIcon({ size = 32 }: { size?: number }) {
  return <Logo size={size} showText={false} />;
}
