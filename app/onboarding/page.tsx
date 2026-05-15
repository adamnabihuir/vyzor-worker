'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Logo from '@/components/Logo';

const GOALS = [
  { id: 'attack', label: 'Monitor my attack surface', icon: '🎯' },
  { id: 'vuln', label: 'Find & fix vulnerabilities', icon: '🔍' },
  { id: 'compliance', label: 'Meet compliance requirements', icon: '✅' },
  { id: 'pentest', label: 'Run penetration tests', icon: '🛡️' },
  { id: 'posture', label: 'Improve security posture', icon: '📈' },
];

const SCOPE = [
  { id: 'external', label: 'External attack surface', icon: '🌐' },
  { id: 'web', label: 'Web applications & APIs', icon: '💻' },
  { id: 'cloud', label: 'Cloud systems & accounts', icon: '☁️' },
  { id: 'full', label: 'Full organization coverage', icon: '🏢' },
];

export default function OnboardingPage() {
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('');
  const [scope, setScope] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const startTrial = async (plan: 'starter' | 'growth') => {
    setLoading(plan);
    setError('');
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
        setLoading(null);
      }
    } catch (e) {
      setError('Connection error. Please try again.');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#f8fafc' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] p-12 relative overflow-hidden flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #021a12 0%, #043d28 60%, #021a12 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(52,211,153,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.4) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="relative z-10">
          <Logo size={30} />
        </div>
        <div className="relative z-10 space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(52,211,153,0.6)' }}>What's included</p>
            {[
              'Continuous attack surface monitoring',
              'Automated vulnerability scanning',
              '49,000+ security checks',
              'Real-time CVE alerts',
              'Detailed remediation reports',
              'Cancel anytime, no commitment',
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2.5 mb-2.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span className="text-sm" style={{ color: '#cbd5e1' }}>{f}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl p-4" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
            <p className="text-sm font-semibold mb-1" style={{ color: '#34d399' }}>14-day free trial</p>
            <p className="text-xs" style={{ color: 'rgba(203,213,225,0.7)' }}>Your card is saved but never charged during the trial. Cancel before day 14 and pay nothing.</p>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
            style={{ background: 'linear-gradient(135deg,#34d399,#059669)', color: '#021a12' }}>
            {user?.firstName?.[0] ?? '?'}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#f1f5f9' }}>{user?.fullName ?? user?.emailAddresses?.[0]?.emailAddress}</p>
            <p className="text-xs" style={{ color: 'rgba(167,243,208,0.5)' }}>Setting up your account</p>
          </div>
        </div>
      </div>

      {/* Right panel — steps */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: step >= s ? '#6366f1' : '#e2e8f0',
                    color: step >= s ? '#fff' : '#94a3b8',
                  }}>
                  {step > s ? '✓' : s}
                </div>
                {s < 3 && <div className="h-0.5 w-8 rounded" style={{ background: step > s ? '#6366f1' : '#e2e8f0' }} />}
              </div>
            ))}
            <span className="ml-2 text-xs font-medium" style={{ color: '#94a3b8' }}>Step {step} of 3</span>
          </div>

          {/* Step 1 — Goal */}
          {step === 1 && (
            <div>
              <h1 className="text-2xl font-black mb-1" style={{ color: '#0f172a' }}>What's your main goal?</h1>
              <p className="text-sm mb-6" style={{ color: '#64748b' }}>Help us personalise your experience.</p>
              <div className="space-y-2.5">
                {GOALS.map(g => (
                  <button key={g.id} onClick={() => { setGoal(g.id); setStep(2); }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all"
                    style={{
                      background: goal === g.id ? 'rgba(99,102,241,0.08)' : '#fff',
                      border: `1px solid ${goal === g.id ? '#6366f1' : '#e2e8f0'}`,
                      color: '#0f172a',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = 'rgba(99,102,241,0.04)'; }}
                    onMouseLeave={e => { if (goal !== g.id) { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff'; } }}>
                    <span className="text-xl">{g.icon}</span>
                    <span className="font-semibold text-sm flex-1">{g.label}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Scope */}
          {step === 2 && (
            <div>
              <h1 className="text-2xl font-black mb-1" style={{ color: '#0f172a' }}>What do you want to cover?</h1>
              <p className="text-sm mb-6" style={{ color: '#64748b' }}>Select your primary area of focus.</p>
              <div className="space-y-2.5">
                {SCOPE.map(s => (
                  <button key={s.id} onClick={() => { setScope(s.id); setStep(3); }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all"
                    style={{
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      color: '#0f172a',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = 'rgba(99,102,241,0.04)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff'; }}>
                    <span className="text-xl">{s.icon}</span>
                    <span className="font-semibold text-sm flex-1">{s.label}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(1)} className="mt-4 text-sm" style={{ color: '#94a3b8' }}>← Back</button>
            </div>
          )}

          {/* Step 3 — Plan + Card */}
          {step === 3 && (
            <div>
              <h1 className="text-2xl font-black mb-1" style={{ color: '#0f172a' }}>Start your free trial</h1>
              <p className="text-sm mb-6" style={{ color: '#64748b' }}>14 days free. No charge today. Cancel anytime.</p>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-xl text-sm font-semibold" style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}>
                  ⚠️ {error}
                </div>
              )}

              <div className="space-y-3 mb-6">
                {/* Starter */}
                <div className="rounded-2xl p-5" style={{ border: '2px solid #6366f1', background: 'rgba(99,102,241,0.04)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-black text-base" style={{ color: '#0f172a' }}>Starter</p>
                      <p className="text-xs" style={{ color: '#64748b' }}>Up to 10 targets · 49K+ checks</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-xl" style={{ color: '#6366f1' }}>$129</p>
                      <p className="text-xs" style={{ color: '#94a3b8' }}>/month after trial</p>
                    </div>
                  </div>
                  <button onClick={() => startTrial('starter')} disabled={loading !== null}
                    className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all"
                    style={{ background: loading !== null ? '#94a3b8' : '#6366f1' }}>
                    {loading === 'starter' ? 'Opening Stripe...' : 'Start free trial →'}
                  </button>
                </div>

                {/* Growth */}
                <div className="rounded-2xl p-5" style={{ border: '1px solid #e2e8f0', background: '#fff' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-black text-base" style={{ color: '#0f172a' }}>Growth</p>
                      <p className="text-xs" style={{ color: '#64748b' }}>Up to 25 targets · Everything in Starter</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-xl" style={{ color: '#0f172a' }}>$249</p>
                      <p className="text-xs" style={{ color: '#94a3b8' }}>/month after trial</p>
                    </div>
                  </div>
                  <button onClick={() => startTrial('growth')} disabled={loading !== null}
                    className="w-full py-3 rounded-xl font-bold text-sm transition-all"
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a' }}>
                    {loading === 'growth' ? 'Opening Stripe...' : 'Start free trial →'}
                  </button>
                </div>
              </div>

              <p className="text-xs text-center" style={{ color: '#94a3b8' }}>
                🔒 Secured by Stripe · Your card is not charged until day 15
              </p>
              <button onClick={() => setStep(2)} className="mt-4 block mx-auto text-sm" style={{ color: '#94a3b8' }}>← Back</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
