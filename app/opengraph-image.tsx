import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Vyzor — Attack Surface Management';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #021a12 0%, #043d28 50%, #021a12 100%)',
          padding: '80px',
          position: 'relative',
        }}
      >
        {/* Grid pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.15,
          backgroundImage: 'linear-gradient(rgba(52,211,153,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.4) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />

        {/* Glow */}
        <div style={{
          position: 'absolute', top: -100, right: -100,
          width: 500, height: 500, borderRadius: '50%',
          background: 'rgba(52,211,153,0.12)',
          filter: 'blur(80px)',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 60 }}>
          <div style={{
            width: 48, height: 48,
            background: 'linear-gradient(135deg,#34d399,#059669)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 24, color: '#021a12',
          }}>V</div>
          <span style={{ color: '#ffffff', fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>Vyzor</span>
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
          <div style={{
            color: '#34d399', fontSize: 18, fontWeight: 700,
            letterSpacing: 3, textTransform: 'uppercase', marginBottom: 24,
          }}>
            Attack Surface Management
          </div>
          <div style={{
            color: '#ffffff', fontSize: 64, fontWeight: 900,
            lineHeight: 1.1, marginBottom: 28, letterSpacing: -2,
          }}>
            Stop reacting.{'\n'}Own your attack{'\n'}surface.
          </div>
          <div style={{
            color: 'rgba(203,213,225,0.8)', fontSize: 22, lineHeight: 1.5, maxWidth: 700,
          }}>
            Continuously discover every exposed asset, fingerprint vulnerabilities, and prioritise what to fix first — before attackers find it.
          </div>
        </div>

        {/* Stats bar */}
        <div style={{
          display: 'flex', gap: 48, paddingTop: 40,
          borderTop: '1px solid rgba(52,211,153,0.2)',
        }}>
          {[
            { n: '12M+', l: 'Assets monitored' },
            { n: '847K', l: 'Vulns found' },
            { n: '49K+', l: 'Security checks' },
            { n: '99.97%', l: 'Uptime' },
          ].map((s) => (
            <div key={s.n} style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#34d399', fontSize: 28, fontWeight: 900 }}>{s.n}</span>
              <span style={{ color: 'rgba(167,243,208,0.5)', fontSize: 14, marginTop: 4 }}>{s.l}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
