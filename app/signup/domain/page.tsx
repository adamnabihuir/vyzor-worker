'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Loader2 } from 'lucide-react';

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="mb-8">
      <p className="text-xs text-slate-500 mb-2">Step {step} of {total}</p>
      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${(step / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

function normalizeDomain(input: string) {
  return input.trim().toLowerCase().replace(/^https?:\/\//i, '').replace(/\/.*$/, '').replace(/^www\./, '');
}

export default function DomainPage() {
  const router = useRouter();
  const [domain, setDomain] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!authorized) { setError('Please confirm you own or are authorized to scan this domain.'); return; }
    setError('');
    setLoading(true);

    const normalized = normalizeDomain(domain);

    try {
      const res = await fetch('/api/domains/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: normalized }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Failed to add domain');
        return;
      }

      // Store token + domain for verify-domain page
      sessionStorage.setItem('vyzor_domain', data.domain);
      sessionStorage.setItem('vyzor_token', data.token);
      sessionStorage.setItem('vyzor_txt', data.txtRecord);

      router.push('/signup/verify-domain');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="font-bold text-white text-sm tracking-widest uppercase">Vyzor</span>
      </div>

      <ProgressBar step={4} total={4} />

      <h1 className="text-2xl font-black text-white mb-1">Add your first domain.</h1>
      <p className="text-slate-400 text-sm mb-6">
        We&apos;ll scan it to find exposed assets, vulnerabilities, and misconfigurations.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Domain or subdomain *
          </label>
          <input
            type="text"
            placeholder="example.com"
            value={domain}
            onChange={e => { setDomain(e.target.value); setError(''); }}
            required
            className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
          />
          <p className="mt-1.5 text-xs text-slate-600">Don&apos;t include https:// or paths</p>
        </div>

        {/* Legal warning */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Shield size={16} className="text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-300">Domain ownership required</p>
              <p className="text-xs text-slate-400 mt-1">
                You must own this domain or have explicit authorization to scan it.
                Scanning domains you don&apos;t own may be illegal.
                Next: we&apos;ll guide you through DNS verification.
              </p>
            </div>
          </div>
        </div>

        {/* Authorization checkbox */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <div
            onClick={() => setAuthorized(v => !v)}
            className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${authorized ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600 group-hover:border-slate-500'}`}
          >
            {authorized && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <input type="checkbox" checked={authorized} onChange={() => setAuthorized(v => !v)} className="sr-only" />
          <span className="text-sm text-slate-400 leading-snug">
            I confirm I own this domain or have explicit authorization to scan it.
          </span>
        </label>

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !domain || !authorized}
          className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold py-3 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Adding domain…' : 'Continue →'}
        </button>
      </form>
    </div>
  );
}
