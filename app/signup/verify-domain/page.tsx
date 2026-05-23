'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Copy, Loader2 } from 'lucide-react';

const GUIDES = [
  { name: 'Cloudflare', url: 'https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/' },
  { name: 'GoDaddy', url: 'https://www.godaddy.com/help/add-a-txt-record-19232' },
  { name: 'Route 53', url: 'https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resource-record-sets-creating.html' },
  { name: 'OVH', url: 'https://help.ovhcloud.com/csm/en-dns-edit-dns-zone' },
];

type Status = 'idle' | 'checking' | 'verified' | 'not_found' | 'error';

export default function VerifyDomainPage() {
  const router = useRouter();
  const [domain, setDomain] = useState('');
  const [txtRecord, setTxtRecord] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollCount = useRef(0);

  useEffect(() => {
    setDomain(sessionStorage.getItem('vyzor_domain') ?? '');
    setTxtRecord(sessionStorage.getItem('vyzor_txt') ?? '');
  }, []);

  // Auto-poll: every 5s for first 2 min, then every 30s for 30 min
  useEffect(() => {
    if (status === 'verified') return;

    function scheduleNext() {
      const delay = pollCount.current < 24 ? 5000 : 30000;
      pollRef.current = setTimeout(() => {
        pollCount.current++;
        check(false);
      }, delay);
    }

    scheduleNext();
    return () => { if (pollRef.current) clearTimeout(pollRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, domain]);

  async function check(manual: boolean) {
    if (!domain) return;
    if (manual) setStatus('checking');
    if (pollRef.current) clearTimeout(pollRef.current);

    try {
      const res = await fetch('/api/domains/verify/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });
      const data = await res.json();

      if (data.verified) {
        setStatus('verified');
        setMessage('');
      } else {
        setStatus('not_found');
        setMessage(data.message ?? 'DNS record not yet propagated.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Retrying…');
    }
  }

  function copyTxt() {
    navigator.clipboard.writeText(txtRecord).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (status === 'verified') {
    return (
      <div className="w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-bold text-white text-sm tracking-widest uppercase">Vyzor</span>
        </div>
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-emerald-400" />
        </div>
        <h2 className="text-xl font-black text-white mb-2">Domain verified!</h2>
        <p className="text-slate-400 text-sm mb-6">{domain} is confirmed.</p>
        <button
          onClick={() => router.push('/signup/complete')}
          className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 px-8 rounded-lg text-sm transition-all"
        >
          Continue →
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="font-bold text-white text-sm tracking-widest uppercase">Vyzor</span>
      </div>

      <h1 className="text-2xl font-black text-white mb-1">Verify domain ownership.</h1>
      <p className="text-slate-400 text-sm mb-6">
        Add this TXT record to your DNS to prove you own <span className="text-white font-mono">{domain}</span>.
      </p>

      {/* TXT record box */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 mb-4 font-mono text-xs space-y-2">
        <div className="flex justify-between text-slate-500">
          <span>Type</span><span className="text-white">TXT</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Host</span><span className="text-white">@ (root domain)</span>
        </div>
        <div className="border-t border-slate-700 pt-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-slate-500 block mb-1">Value</span>
              <span className="text-emerald-400 break-all">{txtRecord}</span>
            </div>
            <button
              onClick={copyTxt}
              className="shrink-0 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded px-2.5 py-1.5 flex items-center gap-1.5 transition-all"
            >
              <Copy size={12} />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* DNS guides */}
      <div className="mb-6">
        <p className="text-xs text-slate-500 mb-2">How to add TXT records:</p>
        <div className="flex flex-wrap gap-2">
          {GUIDES.map(g => (
            <a
              key={g.name}
              href={g.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-400 hover:text-emerald-400 bg-slate-800 border border-slate-700 rounded px-2 py-1 transition-colors"
            >
              {g.name} ↗
            </a>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-500 mb-4">
        ⏱ DNS propagation takes 5–60 minutes. We&apos;re checking automatically.
      </p>

      {/* Status */}
      <div className={`rounded-lg px-3 py-2 text-xs mb-4 flex items-center gap-2 ${
        status === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-400' :
        status === 'not_found' ? 'bg-slate-800 border border-slate-700 text-slate-400' :
        'bg-slate-800 border border-slate-700 text-slate-500'
      }`}>
        {status === 'checking' && <Loader2 size={12} className="animate-spin" />}
        {status === 'not_found' && <span>⏳</span>}
        {status === 'error' && <span>⚠️</span>}
        {status === 'idle' && <Loader2 size={12} className="animate-spin" />}
        <span>
          {status === 'not_found' ? message || 'Waiting for DNS record…' :
           status === 'error' ? message :
           'Checking DNS…'}
        </span>
      </div>

      <button
        onClick={() => check(true)}
        disabled={status === 'checking'}
        className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-lg text-sm transition-all flex items-center justify-center gap-2 mb-3"
      >
        {status === 'checking' ? <Loader2 size={16} className="animate-spin" /> : null}
        {status === 'checking' ? 'Checking…' : 'Verify now'}
      </button>

      <button
        onClick={() => router.push('/signup/complete')}
        className="w-full text-xs text-slate-600 hover:text-slate-400 py-2 transition-colors"
      >
        Skip for now (cannot scan until verified)
      </button>
    </div>
  );
}
