'use client';

import { useState } from 'react';

const TERMINAL_LINES = [
  { text: '$ vyzor scan --target acmecorp.com', cls: 'terminal-line', delay: 0 },
  { text: '[✓] Discovered 147 subdomains', cls: 'terminal-green', delay: 0.4 },
  { text: '[✓] Open ports fingerprinted', cls: 'terminal-green', delay: 0.8 },
  { text: '[!] CVE-2024-1234 — CRITICAL (CVSS 9.8)', cls: 'terminal-red', delay: 1.2 },
  { text: '[!] Exposed admin panel on port 8080', cls: 'terminal-yellow', delay: 1.6 },
  { text: '[✓] 23 findings · report ready', cls: 'terminal-green', delay: 2.0 },
];

const LOGOS = ['Stripe', 'Notion', 'Linear', 'Vercel', 'Shopify', 'Airbnb'];

export default function Hero() {
  const [email, setEmail] = useState('');
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
    <section
      id="hero"
      className="relative overflow-hidden grid-bg"
      style={{ background: 'var(--bg)', paddingTop: '7rem', paddingBottom: '5rem' }}
    >
      {/* Emerald orbs */}
      <div className="orb" style={{ width: '600px', height: '600px', top: '-200px', right: '-150px', background: 'rgba(52,211,153,0.07)' }} />
      <div className="orb" style={{ width: '450px', height: '450px', bottom: '-100px', left: '-100px', background: 'rgba(16,185,129,0.05)', animationDelay: '3s' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: copy */}
          <div>
            {/* Pill badge */}
            <a href="#features" className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
              style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(52,211,153,0.14)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(52,211,153,0.08)'}
            >
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#34d399' }} />
              New: Emerging Threat Scans now live
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>

            {/* Decorative accent dots */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2.5 h-2.5 rounded-full animate-glow" style={{ background: '#fbbf24', boxShadow: '0 0 8px rgba(251,191,36,0.6)' }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#a78bfa', boxShadow: '0 0 8px rgba(167,139,250,0.5)', animation: 'glow-pulse 3s ease-in-out infinite 1s' }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#fb923c', boxShadow: '0 0 8px rgba(251,146,60,0.5)', animation: 'glow-pulse 3s ease-in-out infinite 2s' }} />
            </div>

            <h1
              className="font-black tracking-tight mb-6"
              style={{ fontSize: 'clamp(2.6rem, 5vw, 4rem)', lineHeight: '1.06', color: 'var(--text-pri)' }}
            >
              Stop reacting.<br />
              <span className="gradient-text">Own your attack surface.</span>
            </h1>

            <p className="mb-10 leading-relaxed" style={{ color: 'var(--text-sec)', fontSize: '1.1rem', maxWidth: '480px' }}>
              Vyzor continuously discovers every exposed asset, fingerprints vulnerabilities,
              and prioritises what to fix first — before attackers find it.
            </p>

            {/* Primary CTA */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4" style={{ maxWidth: '460px' }}>
              <a href="/auth/register" className="btn-primary font-bold rounded-xl px-7 py-3.5 text-sm text-center whitespace-nowrap">
                Start free trial →
              </a>
              <a href="#features"
                className="font-semibold rounded-xl px-6 py-3.5 text-sm text-center transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text-sec)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>
                See how it works
              </a>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '2rem' }}>
              14-day free trial · No credit card required · Cancel anytime
            </p>

            {/* Waitlist */}
            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex gap-2 mb-6" style={{ maxWidth: '380px' }}>
                <input
                  type="email"
                  placeholder="Or join the waitlist"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="scan-input-dark flex-1 rounded-xl px-4 py-2.5 text-sm"
                />
                <button type="submit" className="font-semibold rounded-xl px-4 py-2.5 text-sm whitespace-nowrap transition-all"
                  style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399' }}>
                  Notify me
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-3 mb-6 px-5 py-3 rounded-xl"
                style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)', maxWidth: '380px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span style={{ color: '#34d399', fontWeight: 600, fontSize: '0.85rem' }}>You&apos;re on the list!</span>
              </div>
            )}
          </div>

          {/* Right: terminal */}
          <div className="animate-float">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(2,16,10,0.85)',
                border: '1px solid rgba(52,211,153,0.15)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(52,211,153,0.06), 0 0 60px rgba(52,211,153,0.05)',
                backdropFilter: 'blur(12px)',
              }}
            >
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-5 py-3.5"
                style={{ borderBottom: '1px solid rgba(52,211,153,0.08)', background: 'rgba(0,0,0,0.3)' }}>
                <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#eab308' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }} />
                <span className="ml-4 font-mono text-xs" style={{ color: 'rgba(52,211,153,0.4)' }}>vyzor — scan</span>
              </div>
              <div className="px-6 py-5 space-y-2" style={{ minHeight: '190px' }}>
                {TERMINAL_LINES.map((line, i) => (
                  <p key={i} className={line.cls}
                    style={{ opacity: 0, animation: `fade-up 0.4s ease ${line.delay}s forwards` }}>
                    {line.text}
                  </p>
                ))}
              </div>
            </div>

            {/* Floating stat cards */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { value: '147', label: 'Assets found', color: '#34d399' },
                { value: '23', label: 'Findings', color: '#f87171' },
                { value: '<60s', label: 'Time to scan', color: '#fbbf24' },
              ].map((s) => (
                <div key={s.label} className="card-dark rounded-xl p-3 text-center">
                  <div className="font-black text-lg" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Logo bar */}
        <div className="mt-20 pt-10" style={{ borderTop: '1px solid rgba(52,211,153,0.08)' }}>
          <p className="text-center text-xs font-semibold uppercase tracking-widest mb-8" style={{ color: 'var(--text-muted)' }}>
            Trusted by security teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10">
            {LOGOS.map((name) => (
              <span key={name} className="text-sm font-bold tracking-wide" style={{ color: 'rgba(110,231,183,0.25)' }}>
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
