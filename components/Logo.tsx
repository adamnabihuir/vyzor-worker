interface LogoProps {
  size?: number;
  showText?: boolean;
  textColor?: string;
  markColor?: string;
}

export default function Logo({ size = 36, showText = true, textColor = '#ffffff', markColor = '#ffffff' }: LogoProps) {
  return (
    <div className="flex items-center gap-2" style={{ userSelect: 'none' }}>
      {/* Geometric V mark */}
      <svg
        width={size}
        height={Math.round(size * 0.8)}
        viewBox="0 0 40 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left arm — solid trapezoid */}
        <path d="M0 0 L11 0 L22 28 L13 28 Z" fill={markColor} />
        {/* Right arm — solid trapezoid */}
        <path d="M40 0 L29 0 L18 28 L27 28 Z" fill={markColor} />
        {/* Emerald accent dot at tip */}
        <circle cx="20" cy="30" r="2.2" fill="#34d399" />
      </svg>

      {/* Wordmark */}
      {showText && (
        <span
          style={{
            color: textColor,
            fontWeight: 900,
            fontSize: `${Math.round(size * 0.52)}px`,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}
        >
          Vyzor
        </span>
      )}
    </div>
  );
}

export function LogoIcon({ size = 32 }: { size?: number }) {
  return <Logo size={size} showText={false} />;
}
