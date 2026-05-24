'use client';

import { useState, useEffect, useRef } from 'react';
import { useSignUp } from '@clerk/nextjs/legacy';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

/* ── Inline code verification component ────────────────────── */
function VerifyCodeInline({
  signUp,
  onBack,
}: {
  signUp: NonNullable<ReturnType<typeof useSignUp>['signUp']>;
  onBack: () => void;
}) {
  const router   = useRouter();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { setActive } = useSignUp();

  const handleChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    setError('');
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
    if (next.every(d => d !== '') && next.join('').length === 6) {
      verify(next.join(''));
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setDigits(text.split(''));
      verify(text);
    }
  };

  const verify = async (code: string) => {
    setLoading(true);
    setError('');
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === 'complete' && result.createdSessionId) {
        await setActive!({ session: result.createdSessionId });
        router.replace('/dashboard');
      } else {
        // More steps needed — go set password
        router.replace('/auth/set-password');
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string; longMessage?: string }[] };
      const msg =
        clerkErr?.errors?.[0]?.longMessage ??
        clerkErr?.errors?.[0]?.message ??
        'Code invalide.';
      setError(msg);
      setDigits(['', '', '', '', '', '']);
      setLoading(false);
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <div>
      <div className="flex gap-2 justify-center mb-3" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={el => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            className="w-11 h-12 text-center text-white text-xl font-bold bg-slate-800/60 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
          />
        ))}
      </div>
      {loading && (
        <div className="flex justify-center mb-2">
          <Loader2 size={20} className="animate-spin text-emerald-400" />
        </div>
      )}
      {error && (
        <p className="text-center text-sm text-red-400 mb-2">⚠ {error}</p>
      )}
    </div>
  );
}

type Status = 'idle' | 'loading' | 'sent';
type OAuthProvider = 'oauth_google' | 'oauth_microsoft';

const GOOGLE_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const MICROSOFT_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path fill="#F25022" d="M1 1h10v10H1z"/>
    <path fill="#00A4EF" d="M13 1h10v10H13z"/>
    <path fill="#7FBA00" d="M1 13h10v10H1z"/>
    <path fill="#FFB900" d="M13 13h10v10H13z"/>
  </svg>
);

export default function SignupPage() {
  const { isLoaded, signUp } = useSignUp();
  const { isSignedIn }       = useUser();
  const router               = useRouter();

  const [fullName, setFullName]   = useState('');
  const [email, setEmail]         = useState('');
  const [jobTitle, setJobTitle]   = useState('');
  const [company, setCompany]     = useState('');
  const [status, setStatus]       = useState<Status>('idle');
  const [error, setError]         = useState('');
  const [agreed, setAgreed]       = useState(false);
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);

  // Already signed in → go to dashboard
  useEffect(() => {
    if (isSignedIn) router.replace('/dashboard');
  }, [isSignedIn, router]);

  /* ── Corporate email check ─────────────────────────────────── */
  const validateEmail = async (addr: string): Promise<string | null> => {
    try {
      const res  = await fetch('/api/signup/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: addr }),
      });
      const data = await res.json();
      if (!data.valid) return data.error ?? 'Email non accepté.';
    } catch {
      // non-critical — allow if check fails
    }
    return null;
  };

  /* ── Submit ─────────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    const trimmedEmail = email.trim().toLowerCase();
    // Split full name into first / last
    const parts     = fullName.trim().split(/\s+/);
    const firstName = parts[0] ?? '';
    const lastName  = parts.slice(1).join(' ') || firstName; // fallback if single name

    setStatus('loading');
    setError('');

    // 1. Corporate email check
    const emailErr = await validateEmail(trimmedEmail);
    if (emailErr) { setError(emailErr); setStatus('idle'); return; }

    try {
      // 2. Create Clerk signup with all info — no password yet
      await signUp.create({
        emailAddress: trimmedEmail,
        firstName,
        lastName,
        unsafeMetadata: {
          company:  company.trim(),
          jobTitle: jobTitle.trim(),
        },
      });

      // 3. Send 6-digit verification code by email
      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      });

      setStatus('sent');
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string; longMessage?: string }[] };
      const msg =
        clerkErr?.errors?.[0]?.longMessage ??
        clerkErr?.errors?.[0]?.message ??
        (err instanceof Error ? err.message : 'Une erreur est survenue.');
      setError(msg);
      setStatus('idle');
    }
  };

  /* ── OAuth ──────────────────────────────────────────────────── */
  const handleOAuth = async (provider: OAuthProvider) => {
    if (!isLoaded || !signUp || oauthLoading) return;
    setOauthLoading(provider);
    try {
      await signUp.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: '/signup/sso-callback',
        redirectUrlComplete: '/dashboard',
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'OAuth échoué.');
      setOauthLoading(null);
    }
  };

  /* ── "Check your email" screen ──────────────────────────────── */
  if (status === 'sent') {
    return (
      <div className="w-full max-w-md text-center">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl"
          style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)' }}
        >
          ✉️
        </div>

        <h1 className="text-2xl font-black text-white mb-2">Vérifiez votre email</h1>
        <p className="text-slate-400 text-sm mb-1">Un code à 6 chiffres a été envoyé à</p>
        <p className="font-bold text-emerald-400 mb-6">{email}</p>

        <p className="text-slate-400 text-sm mb-2">Entrez le code reçu :</p>
        {signUp && (
          <VerifyCodeInline
            signUp={signUp}
            onBack={() => { setStatus('idle'); setError(''); }}
          />
        )}

        <p className="mt-4 text-xs text-slate-600">
          Pas d&apos;email ? Vérifiez vos spams ou{' '}
          <button
            onClick={() => { setStatus('idle'); setError(''); }}
            className="text-emerald-400 hover:text-emerald-300 underline"
          >
            réessayez
          </button>
          .
        </p>

        <div className="mt-4">
          <Link href="/auth/login" className="text-xs text-slate-600 hover:text-slate-400">
            Déjà un compte ? Se connecter →
          </Link>
        </div>
      </div>
    );
  }

  /* ── Registration form ──────────────────────────────────────── */
  return (
    <div className="w-full max-w-md">

      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="font-bold text-white text-sm tracking-widest uppercase">Vyzor</span>
      </div>

      <h1 className="text-2xl font-black text-white mb-1">Create your account.</h1>
      <p className="text-slate-400 text-sm mb-7">
        Full Growth-tier access. No charges during trial.
      </p>

      {/* OAuth buttons */}
      <div className="space-y-2 mb-5">
        {([
          { provider: 'oauth_google'    as OAuthProvider, label: 'Continue with Google',    icon: GOOGLE_ICON    },
          { provider: 'oauth_microsoft' as OAuthProvider, label: 'Continue with Microsoft', icon: MICROSOFT_ICON },
        ] as const).map(({ provider, label, icon }) => (
          <button
            key={provider}
            type="button"
            onClick={() => handleOAuth(provider)}
            disabled={!!oauthLoading}
            className="flex items-center justify-center gap-3 w-full border rounded-lg px-4 py-2.5 text-sm text-slate-300 transition-all disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
          >
            {oauthLoading === provider ? <Loader2 size={16} className="animate-spin" /> : icon}
            {label}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-slate-800" />
        <span className="text-xs text-slate-600">OR</span>
        <div className="flex-1 h-px bg-slate-800" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Full Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            autoComplete="name"
            placeholder="Adam Benali"
            value={fullName}
            onChange={e => { setFullName(e.target.value); setError(''); }}
            className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
          />
        </div>

        {/* Work Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Work Email <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="adam@company.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
          />
          <p className="mt-1 text-xs text-slate-600">
            Corporate or university email only — no Gmail/Yahoo.
          </p>
        </div>

        {/* Job Title + Company */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Job Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              autoComplete="organization-title"
              placeholder="Security Engineer"
              value={jobTitle}
              onChange={e => { setJobTitle(e.target.value); setError(''); }}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Company <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              autoComplete="organization"
              placeholder="Acme Corp"
              value={company}
              onChange={e => { setCompany(e.target.value); setError(''); }}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
            />
          </div>
        </div>

        {/* Terms checkbox */}
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="sr-only"
            />
            <div
              className="w-4 h-4 rounded border flex items-center justify-center transition-all"
              style={{
                background: agreed ? '#10b981' : 'rgba(255,255,255,0.05)',
                borderColor: agreed ? '#10b981' : 'rgba(255,255,255,0.2)',
              }}
            >
              {agreed && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l2.5 2.5L9 1" stroke="#021a12" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </div>
          <span className="text-xs text-slate-400 leading-relaxed">
            By creating an account, you agree to our{' '}
            <Link href="/privacy" className="text-slate-300 underline hover:text-white">Privacy Policy</Link>
            {' '}and{' '}
            <Link href="/terms" className="text-slate-300 underline hover:text-white">Terms and Conditions</Link>
          </span>
        </label>

        {/* Error */}
        {error && (
          <div
            className="px-4 py-3 rounded-xl text-sm"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            ⚠ {error}
          </div>
        )}

        {/* Submit — no password, sends verification link */}
        <button
          type="submit"
          disabled={status === 'loading' || !agreed}
          className="w-full py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: status === 'loading' || !agreed ? 'rgba(52,211,153,0.4)' : '#10b981',
            color: '#021a12',
          }}
        >
          {status === 'loading' && <Loader2 size={16} className="animate-spin" />}
          {status === 'loading' ? 'Sending…' : 'Start free trial →'}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-slate-600">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-emerald-400 hover:text-emerald-300 font-semibold">
          Sign in
        </Link>
      </p>

      {/* Required by Clerk for bot protection */}
      <div id="clerk-captcha" />
    </div>
  );
}
