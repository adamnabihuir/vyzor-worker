'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const STORAGE_KEY = 'vyzor_trial_active';

export default function TrialGate() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const activated = localStorage.getItem(STORAGE_KEY) === '1';
    if (!activated) setShow(true);
  }, []);

  const handleActivate = () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, '1');
      setShow(false);
      setLoading(false);
    }, 900);
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(2,5,2,0.92)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%', maxWidth: 420,
          background: '#0f0f0f',
          border: '1px solid rgba(0,255,65,0.15)',
          borderRadius: 20,
          boxShadow: '0 0 80px rgba(0,255,65,0.07), 0 32px 80px rgba(0,0,0,0.9)',
          padding: '44px 36px 36px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Icon */}
        <div style={{ position: 'relative', marginBottom: 28 }}>
          {/* Pulse rings */}
          <div style={{
            position: 'absolute', inset: -16, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,255,65,0.08) 0%, transparent 70%)',
            animation: 'pulseRing 2.5s ease-in-out infinite',
          }} />
          <div style={{
            width: 96, height: 96,
            background: 'rgba(0,255,65,0.06)',
            border: '1px solid rgba(0,255,65,0.2)',
            borderRadius: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            <svg width="52" height="52" viewBox="0 0 88 72" fill="none">
              {/* Laptop screen */}
              <rect x="8" y="2" width="72" height="50" rx="6"
                fill="rgba(0,255,65,0.06)" stroke="rgba(0,255,65,0.3)" strokeWidth="1.5"/>
              {/* Screen content */}
              <rect x="15" y="9" width="58" height="36" rx="3"
                fill="rgba(0,255,65,0.04)" stroke="rgba(0,255,65,0.15)" strokeWidth="1"/>
              {/* Terminal prompt */}
              <text x="44" y="31" textAnchor="middle"
                fontSize="16" fontFamily="monospace" fontWeight="700" fill="#00ff41">
                &gt;_
              </text>
              {/* Blinking cursor dot */}
              <rect x="55" y="23" width="4" height="10" rx="1" fill="#00ff41" opacity="0.8">
                <animate attributeName="opacity" values="0.8;0;0.8" dur="1.2s" repeatCount="indefinite"/>
              </rect>
              {/* Base */}
              <rect x="2" y="52" width="84" height="7" rx="3.5"
                fill="rgba(0,255,65,0.1)" stroke="rgba(0,255,65,0.2)" strokeWidth="1.2"/>
              <rect x="30" y="50" width="28" height="5" rx="2.5"
                fill="rgba(0,255,65,0.15)"/>
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '1.2rem', fontWeight: 900, color: '#f0fdf4',
          margin: '0 0 10px', letterSpacing: '-0.01em',
        }}>
          Activate your trial to start scanning
        </h2>
        <p style={{
          fontSize: '0.82rem', color: 'rgba(167,243,208,0.45)',
          margin: '0 0 32px', lineHeight: 1.65, maxWidth: 300,
        }}>
          Get full access to all Vyzor features — free for 14 days. No credit card required.
        </p>

        {/* Features */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px',
          marginBottom: 28, width: '100%', maxWidth: 300,
        }}>
          {[
            'Unlimited scans', 'CVE detection',
            'Attack surface map', 'PDF reports',
          ].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#00ff41" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span style={{ fontSize: '0.75rem', color: 'rgba(167,243,208,0.55)', fontWeight: 500 }}>{f}</span>
            </div>
          ))}
        </div>

        {/* Activate button */}
        <button
          onClick={handleActivate}
          disabled={loading}
          style={{
            width: '100%', padding: '14px', borderRadius: 12, border: 'none',
            background: loading ? 'rgba(0,255,65,0.35)' : '#00ff41',
            color: '#020d04', fontSize: '0.95rem', fontWeight: 800,
            cursor: loading ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
            boxShadow: loading ? 'none' : '0 0 32px rgba(0,255,65,0.2)',
            transition: 'all 0.15s', marginBottom: 12,
          }}
          onMouseEnter={e => {
            if (!loading) {
              e.currentTarget.style.background = '#39ff6e';
              e.currentTarget.style.boxShadow = '0 0 48px rgba(0,255,65,0.35)';
            }
          }}
          onMouseLeave={e => {
            if (!loading) {
              e.currentTarget.style.background = '#00ff41';
              e.currentTarget.style.boxShadow = '0 0 32px rgba(0,255,65,0.2)';
            }
          }}
        >
          {loading ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                style={{ animation: 'spin 0.8s linear infinite' }}>
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
              </svg>
              Activating…
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Activate trial
            </>
          )}
        </button>

        <p style={{ fontSize: '0.7rem', color: 'rgba(167,243,208,0.25)', margin: 0 }}>
          14 days free · Cancel anytime
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulseRing {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
