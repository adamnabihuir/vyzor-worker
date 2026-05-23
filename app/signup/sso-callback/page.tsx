'use client';

import { useEffect, useRef } from 'react';
import { useClerk, useUser } from '@clerk/nextjs';
import { useSignUp } from '@clerk/nextjs/legacy';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function SSOCallbackPage() {
  const { handleRedirectCallback, signOut } = useClerk();
  const { signUp } = useSignUp();
  const { user, isLoaded: userLoaded } = useUser();
  const router = useRouter();
  const callbackDone = useRef(false);
  const navigatedAway = useRef(false);
  const validated = useRef(false);

  const signUpRef = useRef(signUp);
  useEffect(() => { signUpRef.current = signUp; }, [signUp]);

  // Phase 1: process OAuth state once.
  // - New sign-ups → /signup/profile (via customNavigate or afterSignUpUrl)
  // - Returning sign-ins → /dashboard (afterSignInUrl; no loop back here)
  // - Clerk Account Portal verify URLs → our custom /signup/verify
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (callbackDone.current) return;
    callbackDone.current = true;

    handleRedirectCallback(
      {
        signUpForceRedirectUrl: '/signup/profile',
        signInForceRedirectUrl: '/dashboard',
      },
      async (to: string) => {
        navigatedAway.current = true;

        // Intercept Clerk Account Portal email-verify → our custom page
        const isVerifyUrl =
          to.includes('verify-email') ||
          to.includes('verify_email') ||
          (to.startsWith('http') && to.includes('accounts.'));

        if (isVerifyUrl) {
          const email = signUpRef.current?.emailAddress ?? '';
          if (email) sessionStorage.setItem('vyzor_signup_email', email);
          window.location.replace('/signup/verify');
          return;
        }

        if (to.startsWith('http')) {
          window.location.replace(to);
        } else {
          router.replace(to);
        }
      }
    ).catch(() => {
      // No OAuth params in URL — user may already be signed in.
      // Phase 2 will pick it up.
    });
  }, []);

  // Phase 2: fallback for when user is already signed in on this page
  // (e.g. page refresh, or sign-in that bypassed customNavigate).
  useEffect(() => {
    if (!userLoaded) return;
    if (navigatedAway.current) return; // Phase 1 already handled navigation
    if (validated.current) return;

    if (!user) return; // not signed in — wait

    validated.current = true;

    const email =
      user.primaryEmailAddress?.emailAddress ??
      user.emailAddresses?.[0]?.emailAddress ?? '';

    if (!email) {
      window.location.replace('/signup/profile');
      return;
    }

    fetch('/api/signup/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
      .then(r => r.json())
      .then(async data => {
        if (!data.valid) {
          await signOut();
          window.location.replace('/signup?error=personal_email');
        } else {
          window.location.replace('/signup/profile');
        }
      })
      .catch(() => window.location.replace('/signup/profile'));
  }, [userLoaded, user, signOut]);

  return (
    <div className="w-full max-w-md flex flex-col items-center justify-center gap-4">
      <Loader2 size={32} className="animate-spin text-emerald-400" />
      <p className="text-slate-400 text-sm">Completing sign up…</p>
    </div>
  );
}
