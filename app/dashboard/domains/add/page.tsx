'use client';

import { useState } from 'react';
import Link from 'next/link';

type Step = 'input' | 'record' | 'checking' | 'verified' | 'error';

const GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.07)',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  border: '1px solid rgba(255,255,255,0.13)',
  boxShadow: '0 4px 28px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
};

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0"
      style={{ background: copied ? 'rgba(52,211,153,0.15)' : 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399' }}>
      {copied
        ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Copied</>
        : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy</>
      }
    </button>
  );
}

export default function AddDomainPage() {
  const [domain, setDomain] = useState('');
  const [step, setStep] = useState<Step>('input');
  const [token, setToken] = useState('');
  const [txtHost, setTxtHost] = useState('');
  const [txtRecord, setTxtRecord] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/domains/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to initiate verification');
      if (data.status === 'verified') {
        setStep('verified');
        return;
      }
      setToken(data.token);
      setTxtHost(data.txtHost);
      setTxtRecord(data.txtRecord);
      setStep('record');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = async () => {
    setStep('checking');
    setErrorMsg('');
    try {
      const res = await fetch('/api/domains/verify/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });
      const data = await res.json();
      if (data.verified) {
        setStep('verified');
      } else {
        setStep('error');
        setErrorMsg('DNS record not found yet. It can take 5–30 minutes to propagate. Try again shortly.');
      }
    } catch {
      setStep('error');
      setErrorMsg('Check failed. Please try again.');
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm mb-6"
          style={{ color: 'rgba(167,243,208,0.5)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
          Back to dashboard
        </Link>
        <h1 className="font-black text-2xl mb-2" style={{ color: '#f0fdf4' }}>Add & verify a domain</h1>
        <p style={{ color: 'rgba(167,243,208,0.55)', fontSize: '0.9rem' }}>
          Domain ownership verification is required before scanning. This protects you and third parties.
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-0 mb-8">
        {[
          { label: 'Enter domain', key: 'input' },
          { label: 'Add DNS record', key: 'record' },
          { label: 'Verify', key: 'checking' },
        ].map((s, i) => {
          const done = (step === 'record' && i === 0) || (step === 'checking' && i <= 1) || step === 'verified' || (step === 'error' && i <= 1);
          const active = step === s.key || (step === 'error' && s.key === 'checking');
          return (
            <div key={s.key} className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: done ? 'rgba(52,211,153,0.2)' : active ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.06)',
                    border: `1.5px solid ${done || active ? 'rgba(52,211,153,0.5)' : 'rgba(255,255,255,0.12)'}`,
                    color: done || active ? '#34d399' : 'rgba(167,243,208,0.3)',
                  }}>
                  {done ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> : i + 1}
                </div>
                <span className="text-xs font-semibold" style={{ color: done || active ? 'rgba(167,243,208,0.8)' : 'rgba(167,243,208,0.3)' }}>{s.label}</span>
              </div>
              {i < 2 && <div className="w-8 h-px mx-3" style={{ background: done ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.08)' }} />}
            </div>
          );
        })}
      </div>

      {/* Step 1: Input domain */}
      {step === 'input' && (
        <div className="rounded-2xl p-6" style={GLASS}>
          <h2 className="font-bold text-base mb-1" style={{ color: '#f0fdf4' }}>Enter the domain you want to scan</h2>
          <p className="text-sm mb-5" style={{ color: 'rgba(167,243,208,0.5)' }}>
            Enter the apex domain (e.g. <span style={{ fontFamily: 'monospace', color: '#34d399' }}>example.com</span>). Once verified, you can also scan all subdomains.
          </p>
          <form onSubmit={handleInitiate} className="flex gap-3">
            <input
              type="text"
              placeholder="example.com"
              value={domain}
              onChange={e => setDomain(e.target.value)}
              className="scan-input flex-1 rounded-xl px-4 py-3 text-sm font-mono"
            />
            <button type="submit" disabled={loading || !domain.trim()}
              className="font-bold rounded-xl px-6 py-3 text-sm whitespace-nowrap transition-all"
              style={{ background: '#34d399', color: '#021a12', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Loading…' : 'Continue →'}
            </button>
          </form>
          {errorMsg && <p className="mt-3 text-sm font-semibold" style={{ color: '#ef4444' }}>{errorMsg}</p>}
        </div>
      )}

      {/* Step 2: Add DNS record */}
      {step === 'record' && (
        <div className="space-y-4">
          <div className="rounded-2xl p-6" style={GLASS}>
            <h2 className="font-bold text-base mb-1" style={{ color: '#f0fdf4' }}>Add this TXT record to your DNS</h2>
            <p className="text-sm mb-5" style={{ color: 'rgba(167,243,208,0.5)' }}>
              Log in to your DNS provider (Namecheap, Cloudflare, GoDaddy…) and add the following TXT record.
              It can take 5–30 minutes to propagate.
            </p>

            <div className="space-y-3">
              <div className="rounded-xl p-4" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(52,211,153,0.15)' }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(167,243,208,0.4)' }}>Record type</p>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-sm font-bold" style={{ color: '#f0fdf4' }}>TXT</span>
                  <CopyButton value="TXT" />
                </div>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(52,211,153,0.15)' }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(167,243,208,0.4)' }}>Host / Name</p>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-sm break-all" style={{ color: '#34d399' }}>{txtHost}</span>
                  <CopyButton value={txtHost} />
                </div>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(52,211,153,0.15)' }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(167,243,208,0.4)' }}>Value</p>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-sm break-all" style={{ color: '#f0fdf4' }}>{txtRecord}</span>
                  <CopyButton value={txtRecord} />
                </div>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(52,211,153,0.15)' }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(167,243,208,0.4)' }}>TTL</p>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-sm" style={{ color: '#f0fdf4' }}>Automatic (or 300)</span>
                  <CopyButton value="300" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-4" style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.15)' }}>
            <p className="text-xs font-bold mb-1" style={{ color: '#34d399' }}>Namecheap users</p>
            <p className="text-xs" style={{ color: 'rgba(167,243,208,0.6)' }}>
              In Host Records, use <span className="font-mono">_vyzor</span> as the host (Namecheap adds your domain automatically).
            </p>
          </div>

          <button onClick={handleCheck}
            className="w-full font-bold rounded-xl py-3.5 text-sm transition-all"
            style={{ background: '#34d399', color: '#021a12' }}>
            I&apos;ve added the record — verify now
          </button>
          <button onClick={() => setStep('input')} className="w-full text-sm py-2" style={{ color: 'rgba(167,243,208,0.4)' }}>
            ← Change domain
          </button>
        </div>
      )}

      {/* Step 3: Checking */}
      {step === 'checking' && (
        <div className="rounded-2xl p-8 flex flex-col items-center text-center" style={GLASS}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
            style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)' }}>
            <svg className="animate-spin" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          </div>
          <h2 className="font-bold text-base mb-2" style={{ color: '#f0fdf4' }}>Checking DNS propagation…</h2>
          <p className="text-sm" style={{ color: 'rgba(167,243,208,0.5)' }}>Querying Cloudflare, Google, and Quad9 DNS resolvers.</p>
        </div>
      )}

      {/* Verified */}
      {step === 'verified' && (
        <div className="rounded-2xl p-8 flex flex-col items-center text-center" style={{ ...GLASS, border: '1px solid rgba(52,211,153,0.3)' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
            style={{ background: 'rgba(52,211,153,0.15)', border: '1.5px solid rgba(52,211,153,0.4)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 className="font-black text-xl mb-2" style={{ color: '#34d399' }}>Domain verified!</h2>
          <p className="text-sm mb-1" style={{ color: 'rgba(167,243,208,0.7)' }}>
            <span className="font-mono font-bold">{domain}</span> is now authorized for scanning.
          </p>
          <p className="text-xs mb-6" style={{ color: 'rgba(167,243,208,0.4)' }}>You can also scan all subdomains of this domain.</p>
          <Link href="/dashboard"
            className="font-bold rounded-xl px-8 py-3 text-sm"
            style={{ background: '#34d399', color: '#021a12' }}>
            Go to dashboard →
          </Link>
        </div>
      )}

      {/* Error */}
      {step === 'error' && (
        <div className="space-y-4">
          <div className="rounded-2xl p-6" style={{ ...GLASS, border: '1px solid rgba(239,68,68,0.2)' }}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <div>
                <h2 className="font-bold text-base mb-1" style={{ color: '#f0fdf4' }}>Record not found yet</h2>
                <p className="text-sm" style={{ color: 'rgba(167,243,208,0.6)' }}>{errorMsg}</p>
              </div>
            </div>
          </div>
          <button onClick={handleCheck}
            className="w-full font-bold rounded-xl py-3 text-sm transition-all"
            style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399' }}>
            Try again
          </button>
          <button onClick={() => setStep('record')} className="w-full text-sm py-2" style={{ color: 'rgba(167,243,208,0.4)' }}>
            ← Back to DNS instructions
          </button>
        </div>
      )}
    </div>
  );
}
