'use client';

import { useState, useEffect } from 'react';
import { useSignIn } from '@clerk/nextjs/legacy';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

type Status = 'idle' | 'loading';

export default function LoginPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn }                  = useUser();
  const router                          = useRouter();

  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [status, setStatus]   = useState<Status>('idle');
  const [error, setError]     = useState('');

  // Already signed in → go to dashboard
  useEffect(() => {
    if (isSignedIn) router.replace('/dashboard');
  }, [isSignedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    setStatus('loading');
    setError('');

    try {
      const result = await signIn.create({
        identifier: email.trim().toLowerCase(),
        password,
      });

      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        router.replace('/dashboard');
      } else {
        // Should not happen with email+password
        setError('Étape supplémentaire requise. Veuillez réessayer.');
        setStatus('idle');
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string; longMessage?: string }[] };
      const msg =
        clerkErr?.errors?.[0]?.longMessage ??
        clerkErr?.errors?.[0]?.message ??
        (err instanceof Error ? err.message : 'Identifiants incorrects.');
      setError(msg);
      setStatus('idle');
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: '#f8fafc' }}
    >
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #021a12 0%, #043d28 50%, #021a12 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(rgba(52,211,153,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div
          className="absolute w-96 h-96 rounded-full"
          style={{ background: 'rgba(52,211,153,0.08)', filter: 'blur(80px)', top: '-50px', right: '-50px' }}
        />
        <div
          className="absolute w-80 h-80 rounded-full"
          style={{ background: 'rgba(16,185,129,0.06)', filter: 'blur(80px)', bottom: '50px', left: '-30px' }}
        />

        <div className="relative z-10 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-bold text-white text-sm tracking-widest uppercase">Vyzor</span>
        </div>

        <div className="relative z-10">
          <h2 className="text-2xl font-black mb-3" style={{ color: '#f0fdf4', lineHeight: 1.2 }}>
            Your attack surface,<br />fully visible.
          </h2>
          <p style={{ color: 'rgba(167,243,208,0.65)', fontSize: '0.95rem', lineHeight: 1.7 }}>
            Vyzor automatically discovers every exposed asset, scans for vulnerabilities,
            and tells you what to fix first — in under 60 seconds.
          </p>
        </div>

        <div className="relative z-10 flex flex-col gap-3">
          {[
            { icon: '⚡', text: 'Results in under 60 seconds' },
            { icon: '🔍', text: 'Subdomains, ports & CVEs detected automatically' },
            { icon: '🔔', text: 'Instant Slack & email alerts on new findings' },
            { icon: '🔒', text: '14-day free trial — no credit card required' },
          ].map(f => (
            <div key={f.icon} className="flex items-center gap-3">
              <span className="text-base">{f.icon}</span>
              <span style={{ color: 'rgba(167,243,208,0.75)', fontSize: '0.875rem' }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — custom login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-bold text-slate-900 text-sm tracking-widest uppercase">Vyzor</span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 mb-1">Connexion</h1>
          <p className="text-slate-500 text-sm mb-7">Accédez à votre tableau de bord Vyzor.</p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Adresse email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="vous@entreprise.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Mot de passe
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-11 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div
                className="px-4 py-3 rounded-xl text-sm"
                style={{
                  background: 'rgba(239,68,68,0.06)',
                  color: '#dc2626',
                  border: '1px solid rgba(239,68,68,0.2)',
                }}
              >
                ⚠ {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#021a12', color: '#ffffff' }}
            >
              {status === 'loading' && <Loader2 size={16} className="animate-spin" />}
              {status === 'loading' ? 'Connexion…' : 'Se connecter →'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Pas encore de compte ?{' '}
            <Link href="/signup" className="text-emerald-600 font-semibold hover:text-emerald-700">
              Créer un compte
            </Link>
          </p>

          {/* Required by Clerk for bot protection */}
          <div id="clerk-captcha" />
        </div>
      </div>
    </div>
  );
}
