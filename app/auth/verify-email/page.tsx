'use client';

import { useEffect, useState } from 'react';
import { useClerk } from '@clerk/nextjs';
import { useSignUp } from '@clerk/nextjs/legacy';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Status = 'verifying' | 'redirecting' | 'error';

export default function VerifyEmailPage() {
  const { handleEmailLinkVerification }      = useClerk();
  const { isLoaded, signUp, setActive }      = useSignUp();
  const router                               = useRouter();
  const [status, setStatus]                  = useState<Status>('verifying');
  const [error, setError]                    = useState('');
  const [verified, setVerified]              = useState(false);

  /* ── Step 1: trigger verification as soon as Clerk is ready ── */
  useEffect(() => {
    if (!isLoaded) return;

    handleEmailLinkVerification({})
      .then(() => {
        setVerified(true); // triggers step 2 below
      })
      .catch((err: unknown) => {
        const clerkErr = err as { errors?: { message: string; longMessage?: string }[] };
        const msg =
          clerkErr?.errors?.[0]?.longMessage ??
          clerkErr?.errors?.[0]?.message ??
          (err instanceof Error ? err.message : 'Lien invalide ou expiré.');
        setError(msg);
        setStatus('error');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  /* ── Step 2: once verified, check what's needed next ────────── */
  useEffect(() => {
    if (!verified || !isLoaded) return;

    const proceed = async () => {
      setStatus('redirecting');

      if (!signUp) {
        // Clerk doesn't have a signUp in progress — redirect to register
        router.replace('/signup');
        return;
      }

      if (signUp.status === 'complete' && signUp.createdSessionId) {
        // No more fields required — activate session and go to dashboard
        await setActive({ session: signUp.createdSessionId });
        router.replace('/dashboard');
        return;
      }

      // Email verified but password (or other fields) still required
      router.replace('/auth/set-password');
    };

    proceed().catch(() => {
      setError('Erreur inattendue. Veuillez réessayer.');
      setStatus('error');
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verified, isLoaded, signUp?.status]);

  /* ── UI ──────────────────────────────────────────────────────── */
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#0f172a' }}
    >
      <div className="w-full max-w-sm text-center">
        {status === 'error' ? (
          /* Error state */
          <>
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
            >
              ✗
            </div>
            <h1 className="text-xl font-black text-white mb-2">Lien invalide</h1>
            <p className="text-slate-400 text-sm mb-6">{error}</p>
            <div className="space-y-2">
              <Link
                href="/signup"
                className="block w-full py-3 rounded-lg font-bold text-sm"
                style={{ background: '#10b981', color: '#021a12' }}
              >
                Recommencer l'inscription →
              </Link>
              <Link
                href="/auth/login"
                className="block w-full py-3 rounded-lg font-bold text-sm text-slate-400"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Se connecter
              </Link>
            </div>
          </>
        ) : (
          /* Loading / redirecting state */
          <>
            <div className="relative w-16 h-16 mx-auto mb-6">
              {/* Spinner ring */}
              <svg
                className="absolute inset-0 animate-spin"
                viewBox="0 0 64 64"
                fill="none"
              >
                <circle
                  cx="32" cy="32" r="28"
                  stroke="rgba(52,211,153,0.15)"
                  strokeWidth="4"
                />
                <path
                  d="M32 4 A28 28 0 0 1 60 32"
                  stroke="#34d399"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
              {/* Icon in center */}
              <div className="absolute inset-0 flex items-center justify-center text-2xl">
                {status === 'redirecting' ? '✓' : '✉️'}
              </div>
            </div>

            <h1 className="text-xl font-black text-white mb-2">
              {status === 'redirecting' ? 'Email vérifié !' : 'Vérification en cours…'}
            </h1>
            <p className="text-slate-400 text-sm">
              {status === 'redirecting'
                ? 'Redirection en cours…'
                : 'Confirmation de votre lien de vérification.'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
