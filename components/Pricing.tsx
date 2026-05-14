'use client';

import { useState } from 'react';

const PLANS = [
  {
    name: 'Starter',
    price: { monthly: 299, annual: 249 },
    description: 'For security-conscious teams getting started with ASM.',
    features: ['1 domain', 'Weekly automated scans', 'Port & service scanning', 'Vulnerability detection', 'Email alerts', 'PDF reports', '30-day history'],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Growth',
    price: { monthly: 999, annual: 849 },
    description: 'For growing companies that need continuous visibility.',
    features: ['5 domains', 'Daily automated scans', 'Everything in Starter', 'Slack & Jira integration', 'API access', 'Custom risk scoring', '1-year history', 'Priority support'],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: { monthly: 4999, annual: 3999 },
    description: 'For large organizations with complex attack surfaces.',
    features: ['Unlimited domains', 'Continuous scanning (real-time)', 'Everything in Growth', 'SSO / SAML', 'Custom integrations', 'Dedicated CSM', 'SLA 99.9% uptime', 'On-premise option', 'Compliance reports (ISO 27001, NIS2)'],
    cta: 'Talk to Sales',
    popular: false,
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-28 relative" style={{ background: '#ffffff' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="badge mb-5">Pricing</span>
          <h2 className="font-black tracking-tight mb-5" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: '#0f172a', lineHeight: '1.1' }}>
            Simple, Transparent <span className="gradient-text">Pricing</span>
          </h2>
          <p className="mx-auto mb-8" style={{ maxWidth: '480px', color: '#64748b', fontSize: '1rem', lineHeight: '1.7' }}>
            Start free, scale as you grow. No hidden fees. Cancel anytime.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-1 p-1 rounded-full" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
            <button
              onClick={() => setAnnual(false)}
              className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
              style={{ background: !annual ? '#ffffff' : 'transparent', color: !annual ? '#0f172a' : '#94a3b8', boxShadow: !annual ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className="px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2"
              style={{ background: annual ? '#ffffff' : 'transparent', color: annual ? '#0f172a' : '#94a3b8', boxShadow: annual ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
            >
              Annual
              <span style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', fontSize: '0.65rem', fontWeight: 800, padding: '2px 7px', borderRadius: '9999px' }}>
                -17%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan, i) => (
            <div
              key={i}
              className={`rounded-2xl p-8 relative ${plan.popular ? 'pricing-popular' : 'card-glass'}`}
              style={plan.popular ? { transform: 'translateY(-8px)' } : {}}
            >
              {plan.popular && (
                <div className="flex justify-center mb-5">
                  <span className="pricing-popular-badge">Most Popular</span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-bold text-xl mb-2" style={{ color: '#0f172a' }}>{plan.name}</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: '1.5' }}>{plan.description}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-end gap-2">
                  <span className="font-black" style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: '#0f172a', lineHeight: 1 }}>
                    ${annual ? plan.price.annual : plan.price.monthly}
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '4px' }}>/mo</span>
                </div>
                {annual && (
                  <p style={{ color: '#6366f1', fontSize: '0.78rem', marginTop: '4px' }}>
                    Save ${(plan.price.monthly - plan.price.annual) * 12}/yr
                  </p>
                )}
              </div>

              <button
                className={`w-full py-3.5 rounded-xl font-bold text-sm mb-8 ${plan.popular ? 'btn-primary text-white' : 'btn-secondary'}`}
              >
                {plan.cta}
              </button>

              <div className="space-y-3">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={plan.popular ? '#6366f1' : '#94a3b8'} strokeWidth="2.5" className="flex-shrink-0 mt-0.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span style={{ color: '#475569', fontSize: '0.875rem' }}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center mt-10" style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
          Need a custom contract or on-premise deployment?{' '}
          <a href="#" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#4f46e5')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#6366f1')}
          >
            Talk to our sales team →
          </a>
        </p>
      </div>
    </section>
  );
}
