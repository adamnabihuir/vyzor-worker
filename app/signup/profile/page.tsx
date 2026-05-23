'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const ROLES = [
  'CISO / Head of Security',
  'Security Engineer / Analyst',
  'CTO / VP Engineering',
  'DevOps / SRE Engineer',
  'Compliance Officer',
  'IT Manager',
  'Founder / CEO',
  'Developer',
  'Penetration Tester',
  'Other',
];

const COMPANY_SIZES = ['1–10', '11–50', '51–200', '201–1000', '1000+'];

const REFERRAL_SOURCES = [
  'Google search',
  'LinkedIn',
  'Twitter / X',
  'Colleague referral',
  'Industry event',
  'Blog / Article',
  'Comparison site',
  'YouTube',
  'Other',
];

const GOALS = [
  { id: 'monitor', icon: '🌐', label: 'Monitor my attack surface' },
  { id: 'compliance', icon: '🛡️', label: 'Pass a compliance audit', sub: 'DGSSI / CNDP / NCA / NESA' },
  { id: 'third_party', icon: '🤝', label: 'Show a third-party I\'m secure' },
  { id: 'one_off', icon: '🔍', label: 'One-off vulnerability scan' },
  { id: 'improve', icon: '📊', label: 'Improve overall security posture' },
];

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="mb-8">
      <p className="text-xs text-slate-500 mb-2">Step {step} of 7</p>
      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${(step / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [referralSource, setReferralSource] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/signup/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, companyName, role, companySize, primaryGoal, referralSource }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to save profile');
      }

      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const inputClass = 'w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all';
  const canSubmit = firstName && lastName && companyName && role && companySize && primaryGoal;

  return (
    <div className="w-full max-w-lg">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="font-bold text-white text-sm tracking-widest uppercase">Vyzor</span>
      </div>

      <ProgressBar step={2} total={7} />

      <h1 className="text-2xl font-black text-white mb-1">About you.</h1>
      <p className="text-slate-400 text-sm mb-6">30 seconds. We'll personalise your trial.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">First name *</label>
            <input value={firstName} onChange={e => setFirstName(e.target.value)} required placeholder="Adam" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Last name *</label>
            <input value={lastName} onChange={e => setLastName(e.target.value)} required placeholder="B." className={inputClass} />
          </div>
        </div>

        {/* Company */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Company *</label>
          <input value={companyName} onChange={e => setCompanyName(e.target.value)} required placeholder="Acme Bank" className={inputClass} />
        </div>

        {/* Role */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Your role *</label>
          <select value={role} onChange={e => setRole(e.target.value)} required className={`${inputClass} appearance-none`}>
            <option value="" disabled>Select your role</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {/* Company size */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Company size *</label>
          <div className="flex flex-wrap gap-2">
            {COMPANY_SIZES.map(size => (
              <button
                key={size}
                type="button"
                onClick={() => setCompanySize(size)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                  companySize === size
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-semibold'
                    : 'border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Goal selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Primary goal *</label>
          <div className="space-y-2">
            {GOALS.map(goal => (
              <button
                key={goal.id}
                type="button"
                onClick={() => setPrimaryGoal(goal.id)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                  primaryGoal === goal.id
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                }`}
              >
                <span className="flex items-start gap-3">
                  <span className="text-lg leading-none mt-0.5">{goal.icon}</span>
                  <span>
                    <span className={`block text-sm font-semibold ${primaryGoal === goal.id ? 'text-emerald-300' : 'text-slate-200'}`}>
                      {goal.label}
                    </span>
                    {goal.sub && (
                      <span className="block text-xs text-slate-500 mt-0.5">{goal.sub}</span>
                    )}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Referral */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">How did you hear about us?</label>
          <select value={referralSource} onChange={e => setReferralSource(e.target.value)} className={`${inputClass} appearance-none`}>
            <option value="">Optional</option>
            {REFERRAL_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !canSubmit}
          className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold py-3 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Saving…' : 'Continue →'}
        </button>
      </form>
    </div>
  );
}
