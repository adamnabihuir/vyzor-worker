'use client';

import { useState } from 'react';

const TERMINAL_LINES = [
  { text: '$ vanguard scan --target example.com', cls: 'terminal-line', delay: 0 },
  { text: '[✓] Initiating asset discovery...', cls: 'terminal-green', delay: 0.4 },
  { text: '[✓] 147 subdomains discovered', cls: 'terminal-green', delay: 0.8 },
  { text: '[✓] Port scanning 147 hosts...', cls: 'terminal-green', delay: 1.2 },
  { text: '[!] CVE-2024-1234 detected — CRITICAL', cls: 'terminal-red', delay: 1.6 },
  { text: '[!] SSL misconfiguration on api.example.com', cls: 'terminal-yellow', delay: 2.0 },
  { text: '[✓] Report generated — 23 findings', cls: 'terminal-green', delay: 2.4 },
];

export default function Hero() {
  const [domain, setDomain] = useState('');
  const [scanning, setScanning] = useState(false);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;
    setScanning(true);
    setTimeout(() => setScanning(false), 3000);
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden grid-bg"
      style={{ paddingTop: '6rem', paddingBottom: '4rem', background: '#fafbff' }}
    >
      {/* Soft orbs */}
      <div className="orb" style={{ width: '600px', height: '600px', top: '-200px', left: '-150px', background: 'rgba(99,102,241,0.07)', animationDelay: '0s' }} />
      <div className="orb" style={{ width: '500px', height: '500px', top: '-100px', right: '-100px', background: 'rgba(14,165,233,0.06)', animationDelay: '2s' }} />
      <div className="orb" style={{ width: '400px', height: '400px', bottom: '-100px', left: '35%', background: 'rgba(168,85,247,0.05)', animationDelay: '4s' }} />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span className="badge">⚡ Attack Surface Management — Next Generation</span>
        </div>

        {/* Headline */}
        <h1
          className="font-black tracking-tight mb-6"
          style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)', lineHeight: '1.08', color: '#0f172a' }}
        >
          Your Attack Surface,{' '}
          <br />
          <span className="gradient-text">Fully Under Control.</span>
        </h1>

        {/* Sub */}
        <p
          className="mx-auto mb-10 leading-relaxed"
          style={{ maxWidth: '600px', color: '#64748b', fontSize: 'clamp(1rem, 2vw, 1.15rem)' }}
        >
          Vanguard continuously maps and monitors every exposed asset across your
          entire attack surface — subdomains, ports, services, and vulnerabilities —
          before attackers find them.
        </p>

        {/* Scan input */}
        <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-5">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Enter your domain — e.g. example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="scan-input w-full rounded-xl pl-11 pr-4 py-4 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={scanning}
            className="btn-primary font-bold text-white rounded-xl px-8 py-4 whitespace-nowrap text-sm"
          >
            {scanning ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Scanning...
              </span>
            ) : 'Start Free Scan →'}
          </button>
        </form>

        <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
          No credit card required · Results in under 60 seconds · SOC 2 compliant
        </p>

        {/* Terminal */}
        <div
          className="rounded-2xl mt-16 mx-auto text-left overflow-hidden animate-float"
          style={{ maxWidth: '680px', background: '#0f172a', border: '1px solid rgba(99,102,241,0.2)', boxShadow: '0 24px 60px rgba(15,23,42,0.15), 0 0 0 1px rgba(99,102,241,0.06)' }}
        >
          <div
            className="flex items-center gap-2 px-5 py-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}
          >
            <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#eab308' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }} />
            <span className="ml-3" style={{ color: '#475569', fontSize: '0.75rem', fontFamily: 'monospace' }}>vanguard — scan</span>
          </div>
          <div className="px-6 py-5 space-y-2" style={{ minHeight: '200px' }}>
            {TERMINAL_LINES.map((line, i) => (
              <p
                key={i}
                className={line.cls}
                style={{ opacity: 0, animation: `fade-up 0.4s ease ${line.delay}s forwards` }}
              >
                {line.text}
              </p>
            ))}
          </div>
        </div>

        {/* Trust logos */}
        <div className="mt-14">
          <p className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: '#cbd5e1' }}>
            Trusted by security teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {['Stripe', 'Airbnb', 'Notion', 'Linear', 'Vercel', 'Shopify'].map((name) => (
              <span key={name} className="text-sm font-bold tracking-wide" style={{ color: '#cbd5e1' }}>
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
