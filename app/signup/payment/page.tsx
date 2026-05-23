'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2, Lock, ArrowLeft } from 'lucide-react';
import { Suspense } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const PLAN_LABELS: Record<string, { name: string; price: number }> = {
  starter: { name: 'Starter', price: 70 },
  growth:  { name: 'Growth',  price: 149 },
  pro:     { name: 'Pro',     price: 399 },
};

function CardForm({ plan, onSuccess }: { plan: string; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const planInfo = PLAN_LABELS[plan] ?? PLAN_LABELS.starter;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setError('');
    setLoading(true);

    const { error: submitError } = await elements.submit();
    if (submitError) { setError(submitError.message ?? 'Card error'); setLoading(false); return; }

    const { setupIntent, error: confirmError } = await stripe.confirmSetup({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/signup/payment?plan=${plan}`,
      },
    });

    if (confirmError) { setError(confirmError.message ?? 'Card setup failed'); setLoading(false); return; }

    if (setupIntent?.status === 'succeeded') {
      try {
        const res = await fetch('/api/stripe/confirm-setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ setupIntentId: setupIntent.id, plan }),
        });

        if (!res.ok) {
          let errorMsg = 'Failed to activate trial';
          try { const data = await res.json(); errorMsg = data.error ?? errorMsg; } catch { /* non-JSON error page */ }
          setError(errorMsg);
          setLoading(false);
          return;
        }

        onSuccess();
      } catch {
        setError('Network error. Please try again.');
        setLoading(false);
      }
    } else {
      setError('Card setup incomplete. Please try again.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Selected plan summary */}
      <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider">Selected plan</p>
          <p className="text-white font-bold">{planInfo.name}</p>
        </div>
        <p className="text-emerald-400 font-black text-xl">
          ${planInfo.price}<span className="text-slate-500 text-xs font-normal">/mo</span>
        </p>
      </div>

      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
        <PaymentElement
          options={{ layout: 'tabs', fields: { billingDetails: { name: 'auto', email: 'never' } } }}
        />
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !stripe}
        className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold py-3 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={14} />}
        {loading ? 'Activating…' : 'Start 14-day free trial →'}
      </button>

      <p className="text-center text-xs text-slate-600 flex items-center justify-center gap-1.5">
        <Lock size={10} />
        Powered by Stripe · No charge until day 15 · Cancel anytime
      </p>
    </form>
  );
}

function PaymentInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = searchParams.get('plan') ?? 'starter';

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    fetch('/api/stripe/setup-intent', { method: 'POST' })
      .then(r => r.json())
      .then(data => {
        if (data.clientSecret) setClientSecret(data.clientSecret);
        else setFetchError(data.error ?? 'Failed to initialise payment');
      })
      .catch(() => setFetchError('Network error. Please refresh.'));
  }, []);

  function handleSuccess() {
    // Hard navigate so dashboard layout re-runs the subscription check with fresh Clerk data
    window.location.replace('/dashboard');
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="font-bold text-white text-sm tracking-widest uppercase">Vyzor</span>
      </div>

      <button
        onClick={() => router.push('/signup/plan')}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 mb-6 transition-colors"
      >
        <ArrowLeft size={12} /> Change plan
      </button>

      <h1 className="text-2xl font-black text-white mb-1">Secure your trial spot.</h1>
      <p className="text-slate-400 text-sm mb-6">Card verified to prevent abuse — no charge today.</p>

      {fetchError && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
          {fetchError}
        </p>
      )}

      {!clientSecret && !fetchError && (
        <div className="flex items-center justify-center gap-2 text-slate-500 py-8">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">Loading payment form…</span>
        </div>
      )}

      {clientSecret && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: 'night',
              variables: {
                colorPrimary: '#10b981',
                colorBackground: '#1e293b',
                colorText: '#f1f5f9',
                colorDanger: '#ef4444',
                borderRadius: '8px',
              },
            },
          }}
        >
          <CardForm plan={plan} onSuccess={handleSuccess} />
        </Elements>
      )}
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense>
      <PaymentInner />
    </Suspense>
  );
}
