'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ActivateTrialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleActivate = () => {
    setLoading(true);
    // Brief pulse then redirect to dashboard with welcome modal
    setTimeout(() => {
      router.replace('/dashboard?welcome=true');
    }, 900);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
      }}
    >
      {/* Logo */}
      <div style={{ position: 'absolute', top: 28, left: 32, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff41' }} />
        <span style={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.12em', color: '#f0fdf4', textTransform: 'uppercase' }}>
          Vyzor
        </span>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 52 }}>
        {[1, 2, 3].map(n => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: n < 3 ? '#00ff41' : 'rgba(0,255,65,0.15)',
              border: n === 3 ? '1px solid rgba(0,255,65,0.4)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.65rem', fontWeight: 800,
              color: n < 3 ? '#020d04' : '#00ff41',
            }}>
              {n < 3 ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : n}
            </div>
            {n < 3 && (
              <div style={{ width: 36, height: 2, background: '#00ff41', borderRadius: 1 }} />
            )}
          </div>
        ))}
      </div>

      {/* Icon */}
      <div
        style={{
          width: 110, height: 110, marginBottom: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Glow */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,255,65,0.15) 0%, transparent 70%)',
        }} />
        {/* Laptop SVG */}
        <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
          {/* Screen */}
          <rect x="14" y="12" width="60" height="42" rx="6" fill="rgba(0,255,65,0.08)" stroke="rgba(0,255,65,0.35)" strokeWidth="1.5"/>
          {/* Screen inner */}
          <rect x="20" y="18" width="48" height="30" rx="3" fill="rgba(0,255,65,0.06)" stroke="rgba(0,255,65,0.2)" strokeWidth="1"/>
          {/* Skull face */}
          <text x="44" y="38" textAnchor="middle" fontSize="18" fill="#00ff41" style={{ fontFamily: 'monospace' }}>{'</>'}</text>
          {/* Base */}
          <rect x="8" y="54" width="72" height="6" rx="3" fill="rgba(0,255,65,0.12)" stroke="rgba(0,255,65,0.3)" strokeWidth="1.2"/>
          {/* Hinge */}
          <rect x="34" y="52" width="20" height="4" rx="2" fill="rgba(0,255,65,0.2)"/>
          {/* Glow dots */}
          <circle cx="22" cy="24" r="2" fill="rgba(0,255,65,0.5)"/>
          <circle cx="28" cy="24" r="2" fill="rgba(0,255,65,0.3)"/>
          <circle cx="34" cy="24" r="2" fill="rgba(239,68,68,0.4)"/>
        </svg>
      </div>

      {/* Text */}
      <h1 style={{
        fontSize: '1.25rem', fontWeight: 800, color: '#f0fdf4',
        margin: '0 0 12px', textAlign: 'center', letterSpacing: '-0.01em',
      }}>
        Activate your trial to start scanning
      </h1>
      <p style={{
        fontSize: '0.85rem', color: 'rgba(167,243,208,0.5)',
        margin: '0 0 36px', textAlign: 'center', maxWidth: 340, lineHeight: 1.6,
      }}>
        You get full Growth-tier access, free for 14 days. No credit card required.
      </p>

      {/* Activate button */}
      <button
        onClick={handleActivate}
        disabled={loading}
        style={{
          padding: '14px 48px', borderRadius: 12, border: 'none',
          background: loading ? 'rgba(0,255,65,0.4)' : '#00ff41',
          color: '#020d04', fontSize: '0.95rem', fontWeight: 800,
          cursor: loading ? 'default' : 'pointer',
          transition: 'all 0.15s',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: loading ? 'none' : '0 0 28px rgba(0,255,65,0.25)',
        }}
        onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#39ff6e'; e.currentTarget.style.boxShadow = '0 0 40px rgba(0,255,65,0.4)'; } }}
        onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = '#00ff41'; e.currentTarget.style.boxShadow = '0 0 28px rgba(0,255,65,0.25)'; } }}
      >
        {loading ? (
          <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
            </svg>
            Activating…
          </>
        ) : (
          <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Activate trial
          </>
        )}
      </button>

      {/* Features */}
      <div style={{ display: 'flex', gap: 24, marginTop: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
        {['Full scan access', '14-day free trial', 'No credit card'].map(f => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00ff41" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span style={{ fontSize: '0.75rem', color: 'rgba(167,243,208,0.5)', fontWeight: 500 }}>{f}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
