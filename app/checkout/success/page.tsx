'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return;
    // Wait a moment for webhook to fire, then refresh user and redirect
    const timer = setTimeout(async () => {
      await user?.reload();
      router.push('/dashboard');
    }, 3000);
    return () => clearTimeout(timer);
  }, [isLoaded, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8fafc' }}>
      <div className="text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(34,197,94,0.1)' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h1 className="text-2xl font-black mb-2" style={{ color: '#0f172a' }}>Trial activated!</h1>
        <p className="text-sm mb-1" style={{ color: '#64748b' }}>Your 14-day free trial has started.</p>
        <p className="text-xs" style={{ color: '#94a3b8' }}>Redirecting to your dashboard...</p>
        <div className="mt-4 flex justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#6366f1', borderTopColor: 'transparent' }} />
        </div>
      </div>
    </div>
  );
}
