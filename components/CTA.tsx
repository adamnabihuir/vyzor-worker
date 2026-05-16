'use client';

import { useState } from 'react';

export default function CTA() {
  const [email, setEmail]         = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setSubmitted(true);
  };

  return (
    <section className="py-28 relative overflow-hidden" style={{ background: 'var(--bg-alt)' }}>
      <div className="orb" style={{ width: '500px', height: '500px', top: '-100px', right: '-100px', background: 'rgba(52,211,153,0.07)' }} />
      <div className="orb" style={{ width: '400px', height: '400px', bottom: '-100px', left: '-100px', background: 'rgba(16,185,129,0.05)', animationDelay: '3s' }} />

      <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
        <span className="badge mb-6">Get started today</span>

        <h2 className="font-black tracking-tight mb-6"
          style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--text-pri)', lineHeight: '1.08' }}>
          Stop guessing.{' '}
          <span className="gradient-text">Start knowing.</span>
        </h2>

        <p className="mx-auto mb-10" style={{ maxWidth: '480px', color: 'var(--text-sec)', fontSize: '1.05rem', lineHeight: '1.7' }}>
          Vyzor discovers every exposed asset, fingerprints vulnerabilities, and tells
          you what to fix first — before attackers find it.
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-3">
          <a href="/auth/register" className="btn-primary font-bold rounded-xl px-8 py-4 text-sm whitespace-nowrap">
            Start your free trial →
          </a>
          <a href="/auth/login"
            className="font-semibold rounded-xl px-7 py-4 text-sm whitespace-nowrap transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text-sec)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>
            Sign in
          </a>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '1.5rem' }}>
          No credit card required · 14-day free trial · Cancel anytime
        </p>

        {/* Waitlist */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto mb-10">
            <input type="email" placeholder="Or join the waitlist"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="scan-input-dark flex-1 rounded-xl px-4 py-2.5 text-sm" />
            <button type="submit"
              className="font-semibold rounded-xl px-4 py-2.5 text-sm whitespace-nowrap transition-all"
              style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399' }}>
              Notify me
            </button>
          </form>
        ) : (
          <div className="mx-auto mb-10 rounded-xl px-6 py-3 flex items-center justify-center gap-3"
            style={{ maxWidth: '280px', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span style={{ color: '#34d399', fontWeight: 600, fontSize: '0.85rem' }}>You&apos;re on the list!</span>
          </div>
        )}

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {[
            { icon: '🔒', text: 'SOC 2 Type II' },
            { icon: '🇪🇺', text: 'GDPR Compliant' },
            { icon: '⚡', text: '99.97% Uptime' },
            { icon: '🛡️', text: 'ISO 27001 Ready' },
          ].map((badge, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
              style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', border: '1px solid rgba(255,255,255,0.13)', boxShadow: '0 4px 28px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
              <span>{badge.icon}</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-sec)' }}>{badge.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
