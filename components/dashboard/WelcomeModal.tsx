'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

const STORAGE_KEY = 'vyzor_welcomed';

const STEPS = [
  {
    n: 1,
    title: 'Add a target and start a scan',
    desc: 'Add your web domain or IP address to kick off a full scan.',
  },
  {
    n: 2,
    title: 'Review prioritised results',
    desc: 'Get findings ranked by severity, directly inside your dashboard.',
  },
  {
    n: 3,
    title: 'Remediate issues',
    desc: 'Fix vulnerabilities with step-by-step remediation guidance.',
  },
];

export default function WelcomeModal() {
  const [visible, setVisible]   = useState(false);
  const [domain, setDomain]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const router      = useRouter();
  const searchParams = useSearchParams();
  const { user }    = useUser();

  useEffect(() => {
    const isWelcome  = searchParams.get('welcome') === 'true';
    const alreadySeen = typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === '1';
    if (isWelcome && !alreadySeen) setVisible(true);
  }, [searchParams]);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('welcome');
    window.history.replaceState({}, '', url.toString());
  }

  async function handleAddTarget() {
    const d = domain.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!d) { setError('Please enter a domain or IP address.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/scan/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: d }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Could not start scan.'); setLoading(false); return; }
      dismiss();
      router.push(data.scanId ? `/dashboard/scans/${data.scanId}` : '/dashboard/scans');
    } catch {
      setError('Network error — please try again.');
      setLoading(false);
    }
  }

  if (!visible) return null;

  const firstName = user?.firstName ?? null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) dismiss(); }}
    >
      <div
        className="relative w-full mx-4 rounded-2xl overflow-hidden"
        style={{
          maxWidth: 480,
          background: '#111',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
        }}
      >
        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 rounded-lg flex items-center justify-center transition-colors"
          style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>

        <div style={{ padding: '32px 32px 28px' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00ff41" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f0fdf4', margin: 0, lineHeight: 1.2 }}>
                Add your first target
              </h2>
              {firstName && (
                <p style={{ fontSize: '0.78rem', color: 'rgba(167,243,208,0.5)', margin: '3px 0 0' }}>
                  Welcome, {firstName} 👋
                </p>
              )}
            </div>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'rgba(167,243,208,0.5)', margin: '0 0 22px' }}>
            Scan your web domain to uncover hidden vulnerabilities
          </p>

          {/* How it works */}
          <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(167,243,208,0.4)', marginBottom: 12 }}>
            How it works:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {STEPS.map(step => (
              <div key={step.n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(0,255,65,0.12)', border: '1px solid rgba(0,255,65,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', fontWeight: 800, color: '#00ff41',
                }}>
                  {step.n}
                </div>
                <div>
                  <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f0fdf4', margin: 0 }}>
                    Step {step.n}: {step.title}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(167,243,208,0.45)', margin: '2px 0 0' }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Domain input */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(167,243,208,0.55)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Registered domain
            </label>
            <input
              type="text"
              value={domain}
              onChange={e => { setDomain(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleAddTarget()}
              placeholder="yourdomain.com"
              autoFocus
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10, boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.05)', border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.12)'}`,
                color: '#f0fdf4', fontSize: '0.9rem', outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,255,65,0.4)'}
              onBlur={e => e.currentTarget.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.12)'}
            />
            {error && (
              <p style={{ fontSize: '0.72rem', color: '#f87171', marginTop: 5 }}>⚠ {error}</p>
            )}
          </div>

          {/* Add target button */}
          <button
            onClick={handleAddTarget}
            disabled={loading}
            style={{
              width: '100%', padding: '12px', borderRadius: 10, border: 'none',
              background: loading ? 'rgba(0,255,65,0.35)' : '#00ff41',
              color: '#020d04', fontSize: '0.9rem', fontWeight: 800,
              cursor: loading ? 'default' : 'pointer', transition: 'background 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#39ff6e'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#00ff41'; }}
          >
            {loading ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                  <path d="M12 2a10 10 0 0 1 10 10"/>
                </svg>
                Starting scan…
              </>
            ) : 'Add target'}
          </button>

          {/* Cancel */}
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <button
              onClick={dismiss}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.82rem', color: 'rgba(167,243,208,0.45)', textDecoration: 'underline' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(167,243,208,0.8)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(167,243,208,0.45)'}
            >
              Cancel
            </button>
          </div>
        </div>
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
