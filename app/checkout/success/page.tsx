'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!isLoaded) return;

    // Mark trial as active in localStorage so TrialGate won't reappear
    localStorage.setItem('vyzor_trial_active', '1');
    // Also mark welcome as not seen so the Add Target modal shows
    localStorage.removeItem('vyzor_welcomed');

    const tick = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(tick);
          user?.reload().then(() => {
            router.push('/dashboard?welcome=true');
          });
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(tick);
  }, [isLoaded, user, router]);

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0a',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      {/* Logo */}
      <div style={{ position: 'absolute', top: 28, left: 32, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff41' }} />
        <span style={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.12em', color: '#f0fdf4', textTransform: 'uppercase' }}>
          Vyzor
        </span>
      </div>

      {/* Success icon */}
      <div style={{ position: 'relative', marginBottom: 32 }}>
        <div style={{
          position: 'absolute', inset: -20,
          background: 'radial-gradient(circle, rgba(0,255,65,0.12) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'pulseRing 2s ease-in-out infinite',
        }} />
        <div style={{
          width: 88, height: 88, borderRadius: '50%',
          background: 'rgba(0,255,65,0.08)',
          border: '2px solid rgba(0,255,65,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00ff41" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      </div>

      <h1 style={{
        fontSize: '1.6rem', fontWeight: 900, color: '#f0fdf4',
        margin: '0 0 10px', textAlign: 'center',
      }}>
        Trial activated!
      </h1>
      <p style={{
        fontSize: '0.88rem', color: 'rgba(167,243,208,0.55)',
        margin: '0 0 6px', textAlign: 'center',
      }}>
        Your 14-day free trial has started.
      </p>
      <p style={{
        fontSize: '0.78rem', color: 'rgba(167,243,208,0.3)',
        margin: '0 0 36px', textAlign: 'center',
      }}>
        Redirecting to your dashboard in {countdown}s…
      </p>

      {/* Progress bar */}
      <div style={{
        width: 200, height: 3, background: 'rgba(255,255,255,0.08)',
        borderRadius: 2, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', background: '#00ff41', borderRadius: 2,
          width: `${((3 - countdown) / 3) * 100}%`,
          transition: 'width 0.9s linear',
          boxShadow: '0 0 8px rgba(0,255,65,0.5)',
        }} />
      </div>

      <style>{`
        @keyframes pulseRing {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.06); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
