import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{ background: '#021a12', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            <line x1="11" y1="8" x2="11" y2="11"/><line x1="11" y1="14" x2="11.01" y2="14"/>
          </svg>
        </div>

        <p style={{ color: '#34d399', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px' }}>404</p>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#f0fdf4', marginBottom: '12px', lineHeight: 1.2 }}>
          Asset not found
        </h1>
        <p style={{ color: 'rgba(167,243,208,0.6)', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '32px' }}>
          This page does not exist or has been moved. Unlike your attack surface, this one is easy to fix.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/"
            style={{ background: '#34d399', color: '#021a12', fontWeight: 800, fontSize: '0.875rem', padding: '12px 24px', borderRadius: '12px', textDecoration: 'none' }}>
            Back to home
          </Link>
          <Link href="/dashboard"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(240,253,244,0.8)', fontWeight: 600, fontSize: '0.875rem', padding: '12px 24px', borderRadius: '12px', textDecoration: 'none' }}>
            Go to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
