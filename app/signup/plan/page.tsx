'use client';

import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 70,
    features: ['Up to 3 domains', 'Daily scans', 'Vulnerability reports', 'Email support'],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 149,
    popular: true,
    features: ['Up to 10 domains', 'Continuous monitoring', 'Priority support', 'API access'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 399,
    features: ['Unlimited domains', 'Real-time alerts', 'Dedicated support', 'Custom reports'],
  },
];

export default function PlanPage() {
  const router = useRouter();

  return (
    <div className="w-full max-w-3xl">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="font-bold text-white text-sm tracking-widest uppercase">Vyzor</span>
      </div>

      <h1 className="text-3xl font-black text-white mb-2">Choose your plan.</h1>
      <p className="text-slate-400 text-sm mb-8">
        14-day free trial · No charge today · Cancel anytime before day 14
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map(plan => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border p-6 flex flex-col ${
              plan.popular
                ? 'border-emerald-500 bg-emerald-500/5'
                : 'border-slate-700 bg-slate-800/40'
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                Most popular
              </span>
            )}

            <p className="text-sm font-semibold text-slate-400 mb-1">{plan.name}</p>
            <div className="flex items-end gap-1 mb-5">
              <span className="text-4xl font-black text-white">${plan.price}</span>
              <span className="text-slate-500 text-sm mb-1">/mo after trial</span>
            </div>

            <ul className="space-y-2 mb-6 flex-1">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => router.push(`/signup/payment?plan=${plan.id}`)}
              className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all ${
                plan.popular
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
            >
              Start free trial →
            </button>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-slate-600">
        Your card is verified to prevent abuse — you won't be charged until day 15.
      </p>
    </div>
  );
}
