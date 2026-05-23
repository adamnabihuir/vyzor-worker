'use client';

import { useEffect, useRef, useState } from 'react';
import { useSignUp } from '@clerk/nextjs/legacy';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 30;

export default function VerifyPage() {
  const { signUp, isLoaded, setActive } = useSignUp();
  const router = useRouter();

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 min
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const email = typeof window !== 'undefined' ? sessionStorage.getItem('vyzor_signup_email') ?? '' : '';

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  // Resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // Auto-focus first input on mount
  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  function formatTime(s: number) {
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }

  function handleDigitChange(index: number, value: string) {
    // Handle paste of full code
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, CODE_LENGTH);
      const next = [...digits];
      for (let i = 0; i < CODE_LENGTH; i++) next[i] = pasted[i] ?? '';
      setDigits(next);
      const focusIdx = Math.min(pasted.length, CODE_LENGTH - 1);
      inputRefs.current[focusIdx]?.focus();
      if (pasted.length === CODE_LENGTH) submitCode(pasted);
      return;
    }

    const digit = value.replace(/\D/g, '');
    const next = [...digits];
    next[index] = digit;
    setDigits(next);

    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const full = next.join('');
    if (full.length === CODE_LENGTH && next.every(d => d !== '')) {
      submitCode(full);
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function submitCode(code: string) {
    if (!isLoaded || loading) return;
    setError('');
    setLoading(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });

        // Safety net: block personal emails that reach verify via the OAuth path.
        if (email) {
          const chk = await fetch('/api/signup/check-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          }).then(r => r.json()).catch(() => ({ valid: true }));
          if (!chk.valid) {
            router.push('/signup?error=personal_email');
            return;
          }
        }

        // Create our Supabase user record
        await fetch('/api/signup/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, clerkId: result.createdUserId }),
        });

        // Save profile data collected in Step 3 — skips the standalone profile page
        const raw = sessionStorage.getItem('vyzor_onboarding');
        if (raw) {
          try {
            const { goal, firstName, lastName, jobTitle, companyName } = JSON.parse(raw);
            if (firstName && lastName && companyName && jobTitle) {
              await fetch('/api/signup/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  firstName,
                  lastName,
                  companyName,
                  role: jobTitle,
                  primaryGoal: goal ?? '',
                }),
              });
              router.push('/dashboard');
              return;
            }
          } catch {
            // malformed sessionStorage — fall through to profile page
          }
        }

        router.push('/signup/profile');
      } else {
        setError('Verification incomplete. Please try again.');
        setLoading(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Incorrect code';
      setError(msg.includes('verification') ? 'Incorrect code. Please try again.' : msg);
      setDigits(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!isLoaded || resendCooldown > 0) return;
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setResendCooldown(RESEND_COOLDOWN);
      setTimeLeft(600);
      setDigits(Array(CODE_LENGTH).fill(''));
      setError('');
      inputRefs.current[0]?.focus();
    } catch {
      setError('Failed to resend. Please wait and try again.');
    }
  }

  return (
    <div className="w-full max-w-md text-center">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="font-bold text-white text-sm tracking-widest uppercase">Vyzor</span>
      </div>

      <div className="text-4xl mb-4">📧</div>
      <h1 className="text-2xl font-black text-white mb-2">Check your inbox</h1>
      <p className="text-slate-400 text-sm mb-1">We sent a 6-digit code to:</p>
      <p className="text-emerald-400 text-sm font-mono mb-8">{email || 'your email'}</p>

      {/* 6-digit inputs */}
      <div className="flex justify-center gap-2 mb-4">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={el => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={digit}
            onChange={e => handleDigitChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            onPaste={e => {
              e.preventDefault();
              handleDigitChange(i, e.clipboardData.getData('text'));
            }}
            className={`w-11 h-14 text-center text-xl font-bold rounded-lg border bg-slate-800/60 text-white focus:outline-none transition-all ${
              digit
                ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                : 'border-slate-700 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20'
            }`}
          />
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm mb-4">
          <Loader2 size={14} className="animate-spin" />
          Verifying…
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {/* Timer */}
      <p className="text-xs text-slate-500 mb-4">
        {timeLeft > 0 ? (
          <>Code expires in <span className="font-mono text-slate-400">{formatTime(timeLeft)}</span></>
        ) : (
          <span className="text-red-400">Code expired — request a new one</span>
        )}
      </p>

      {/* Resend */}
      <button
        onClick={handleResend}
        disabled={resendCooldown > 0}
        className="text-xs text-slate-500 hover:text-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {resendCooldown > 0
          ? `Resend code in ${resendCooldown}s`
          : "Didn't receive it? Resend code"}
      </button>

      <p className="mt-3">
        <a href="/signup" className="text-xs text-slate-600 hover:text-slate-400">
          Wrong email? Go back
        </a>
      </p>
    </div>
  );
}
