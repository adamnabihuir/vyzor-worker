'use client';

import { useState } from 'react';

export default function CTA() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <section className="py-28 relative overflow-hidden" style={{ background: '#f8fafc' }}>
      <div className="separator mb-0" />

      {/* Subtle orbs */}
      <div className="orb" style={{ width: '500px', height: '500px', top: '-100px', left: '-100px', background: 'rgba(99,102,241,0.06)', animationDelay: '0s' }} />
      <div className="orb" style={{ width: '500px', height: '500px', bottom: '-100px', right: '-100px', background: 'rgba(14,165,233,0.06)', animationDelay: '3s' }} />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10 py-16">
        <span className="badge mb-6">Get Started Today</span>

        <h2
          className="font-black tracking-tight mb-6"
          style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', color: '#0f172a', lineHeight: '1.08' }}
        >
          Stop Guessing.{' '}
          <span className="gradient-text">Start Knowing.</span>
        </h2>

        <p className="mx-auto mb-12" style={{ maxWidth: '520px', color: '#64748b', fontSize: '1.1rem', lineHeight: '1.7' }}>
          Join 500+ security teams that trust Vanguard to monitor their attack surface
          around the clock — so they can sleep at night.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-6">
            <input
              type="email"
              placeholder="Enter your work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="scan-input flex-1 rounded-xl px-5 py-4 text-sm"
            />
            <button type="submit" className="btn-primary font-bold text-white rounded-xl px-8 py-4 whitespace-nowrap text-sm">
              Request Early Access →
            </button>
          </form>
        ) : (
          <div
            className="mx-auto mb-6 rounded-xl px-8 py-5 flex items-center justify-center gap-3"
            style={{ maxWidth: '420px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.95rem' }}>
              You&apos;re on the list! We&apos;ll reach out soon.
            </span>
          </div>
        )}

        <p style={{ color: '#cbd5e1', fontSize: '0.78rem' }}>
          No credit card required · 14-day free trial · Cancel anytime
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-5">
          {[
            { icon: '🔒', text: 'SOC 2 Type II' },
            { icon: '🇪🇺', text: 'GDPR Compliant' },
            { icon: '⚡', text: '99.97% Uptime' },
            { icon: '🛡️', text: 'ISO 27001 Ready' },
          ].map((badge, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm"
              style={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#475569', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            >
              <span>{badge.icon}</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{badge.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="separator mt-0" />
    </section>
  );
}
