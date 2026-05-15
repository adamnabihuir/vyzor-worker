'use client';

import { useState } from 'react';

/* ─── Plan definitions ─────────────────────────────────────────── */
const PLANS = [
  {
    id: 'essential',
    name: 'Essential',
    tagline: 'Start securing your perimeter',
    scanCadence: 'Daily scheduled scan',
    basePrice: 129,
    includedTargets: 5,
    pricePerExtra: 15,
    popular: false,
    ctaLabel: 'Get started',
    ctaHref: '/auth/register',
    ctaVariant: 'outline' as const,
    features: [
      'Daily scheduled scans',
      'Unlimited ad hoc scans',
      'Vyzor Proprietary Engine',
      'Unlimited users',
      'Email alerts',
      'PDF reports',
      'API access',
    ],
    notIncluded: ['Cloud security', 'AI analyst', 'Emerging threat scans', 'Internal scanning'],
  },
  {
    id: 'cloud',
    name: 'Cloud',
    tagline: 'Best value for growing teams',
    scanCadence: 'Continuous scan every 6h',
    basePrice: 249,
    includedTargets: 10,
    pricePerExtra: 20,
    popular: true,
    ctaLabel: 'Start 14-day trial',
    ctaHref: '/auth/register',
    ctaVariant: 'primary' as const,
    features: [
      'Unlimited scheduled scans',
      'Everything in Essential',
      'Cloud security (3 accounts)',
      'Container image scanning',
      'Emerging threat scans',
      '5 pentest credits / month',
      'VyzorAI analyst',
      '15+ integrations',
      'Premium Nuclei Templates (Zero-days)',
      'Role-based access',
    ],
    notIncluded: ['Internal scanning', 'Unlimited cloud accounts'],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'For mature security programs',
    scanCadence: 'Real-time continuous scan',
    basePrice: 499,
    includedTargets: 20,
    pricePerExtra: 25,
    popular: false,
    ctaLabel: 'Talk to sales',
    ctaHref: 'mailto:sales@vyzor.io',
    ctaVariant: 'outline' as const,
    features: [
      'Everything in Cloud',
      'Cloud security (10 accounts)',
      '10 pentest credits / month',
      'Internal scanning',
      'Custom Nuclei Templates Support',
      'Custom risk scoring',
      'Priority support',
      'Compliance exports',
    ],
    notIncluded: ['Unlimited cloud accounts', 'Attack surface monitoring'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Unlimited scale',
    scanCadence: 'Real-time + dedicated SLA',
    basePrice: null,
    includedTargets: null,
    pricePerExtra: null,
    popular: false,
    ctaLabel: 'Talk to sales',
    ctaHref: 'mailto:sales@vyzor.io',
    ctaVariant: 'outline' as const,
    features: [
      'Everything in Pro',
      'Unlimited cloud accounts',
      '50 pentest credits / month',
      'Attack surface monitoring',
      'Subdomain discovery',
      'Dedicated CSM',
      'SLA 99.9% uptime',
      'SSO / SAML',
      'On-premise option',
      'ISO 27001 / NIS2 reports',
    ],
    notIncluded: [],
  },
];

/* ─── Exact same price formula as validated ───────────────────── */
function computePrice(plan: typeof PLANS[0], targets: number, annual: boolean): number | null {
  if (plan.basePrice === null || plan.includedTargets === null || plan.pricePerExtra === null) return null;
  const extra = Math.max(0, targets - plan.includedTargets);
  const monthly = plan.basePrice + extra * plan.pricePerExtra;
  return annual ? Math.round(monthly * 0.8) : monthly;
}

/* ─── CTA button ───────────────────────────────────────────────── */
function CtaButton({ label, href, variant, popular }: {
  label: string; href: string;
  variant: 'primary' | 'outline'; popular: boolean;
}) {
  const base = 'w-full py-3 rounded-xl font-bold text-sm text-center block transition-all duration-200';
  if (variant === 'primary') {
    return <a href={href} className={`${base} btn-green`}>{label}</a>;
  }
  return (
    <a href={href} className={base}
      style={{
        background: 'transparent',
        border: popular ? '1.5px solid rgba(52,211,153,0.5)' : '1.5px solid rgba(52,211,153,0.18)',
        color: popular ? '#34d399' : 'rgba(167,243,208,0.65)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#34d399';
        e.currentTarget.style.color = '#34d399';
        e.currentTarget.style.background = 'rgba(52,211,153,0.06)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = popular ? 'rgba(52,211,153,0.5)' : 'rgba(52,211,153,0.18)';
        e.currentTarget.style.color = popular ? '#34d399' : 'rgba(167,243,208,0.65)';
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {label}
    </a>
  );
}

/* ─── Main component ───────────────────────────────────────────── */
export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [targets, setTargets] = useState(5);

  const SLIDER_MIN = 5;
  const SLIDER_MAX = 100;
  const fillPct = ((targets - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100;

  return (
    <section id="pricing" className="py-28 relative" style={{ background: 'var(--bg)' }}>
      {/* Slider range CSS */}
      <style>{`
        .vyzor-range {
          -webkit-appearance: none; appearance: none;
          height: 4px; border-radius: 9999px; outline: none; cursor: pointer;
          background: linear-gradient(
            to right,
            #34d399 0%, #34d399 ${fillPct}%,
            rgba(52,211,153,0.12) ${fillPct}%, rgba(52,211,153,0.12) 100%
          );
          transition: background 0.1s;
        }
        .vyzor-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px; height: 20px; border-radius: 50%;
          background: #021a12;
          border: 2.5px solid #34d399;
          box-shadow: 0 0 12px rgba(52,211,153,0.4);
          cursor: pointer;
          transition: box-shadow 0.2s, transform 0.1s;
        }
        .vyzor-range::-webkit-slider-thumb:hover {
          box-shadow: 0 0 20px rgba(52,211,153,0.6);
          transform: scale(1.1);
        }
        .vyzor-range::-moz-range-thumb {
          width: 20px; height: 20px; border-radius: 50%;
          background: #021a12; border: 2.5px solid #34d399; cursor: pointer;
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-6">

        {/* ── Header ── */}
        <div className="text-center mb-14">
          <span className="badge mb-5">Pricing</span>
          <h2 className="font-black tracking-tight mb-4"
            style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)', color: 'var(--text-pri)', lineHeight: '1.1' }}>
            Transparent <span className="gradient-text">pricing</span>
          </h2>
          <p className="mx-auto mb-8" style={{ maxWidth: '440px', color: 'var(--text-sec)', fontSize: '1rem', lineHeight: '1.7' }}>
            One price based on your infra size. No hidden fees. Start with a 14-day free trial.
          </p>

          {/* Monthly / Annual toggle */}
          <div className="inline-flex items-center p-1 rounded-full"
            style={{ background: 'rgba(4,54,34,0.6)', border: '1px solid rgba(52,211,153,0.15)' }}>
            <button onClick={() => setAnnual(false)}
              className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
              style={{
                background: !annual ? 'rgba(52,211,153,0.12)' : 'transparent',
                color: !annual ? '#f0fdf4' : 'rgba(167,243,208,0.5)',
                boxShadow: !annual ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
              }}>
              Monthly
            </button>
            <button onClick={() => setAnnual(true)}
              className="px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2"
              style={{
                background: annual ? 'rgba(52,211,153,0.12)' : 'transparent',
                color: annual ? '#f0fdf4' : 'rgba(167,243,208,0.5)',
                boxShadow: annual ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
              }}>
              Annual
              <span style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', fontSize: '0.62rem', fontWeight: 800, padding: '2px 7px', borderRadius: '9999px' }}>
                −20%
              </span>
            </button>
          </div>
        </div>

        {/* ── Global infrastructure slider ── */}
        <div className="mx-auto mb-10 rounded-2xl p-6 md:p-8 card-dark"
          style={{ maxWidth: '700px' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-bold text-sm mb-0.5" style={{ color: 'var(--text-pri)' }}>
                Infrastructure targets
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                Set once — all plans update instantly
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black tabular-nums gradient-text" style={{ fontSize: '2.4rem', lineHeight: 1 }}>
                {targets}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>targets</span>
            </div>
          </div>

          <input
            type="range"
            min={SLIDER_MIN}
            max={SLIDER_MAX}
            step={1}
            value={targets}
            onChange={e => setTargets(Number(e.target.value))}
            className="vyzor-range w-full mb-3"
          />

          <div className="flex justify-between" style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontFamily: 'monospace' }}>
            <span>{SLIDER_MIN} min</span>
            <span>{SLIDER_MAX} targets</span>
          </div>
        </div>

        {/* ── Plans grid ── */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          {PLANS.map((plan) => {
            const price = computePrice(plan, targets, annual);
            const isEnterprise = plan.basePrice === null;
            const extra = plan.includedTargets !== null ? Math.max(0, targets - plan.includedTargets) : 0;

            return (
              <div key={plan.id}
                className={`rounded-2xl flex flex-col relative ${plan.popular ? 'pricing-popular' : 'card-dark'}`}>

                {plan.popular && (
                  <div className="absolute -top-3.5 left-0 right-0 flex justify-center">
                    <span className="pricing-popular-badge">Most popular</span>
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col">

                  {/* Header */}
                  <div className="mb-5">
                    <h3 className="font-black text-base mb-0.5" style={{ color: 'var(--text-pri)' }}>{plan.name}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.74rem', marginBottom: '0.5rem' }}>{plan.tagline}</p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full"
                        style={{ background: plan.popular ? '#34d399' : 'rgba(52,211,153,0.2)' }} />
                      <span style={{ fontSize: '0.72rem', color: plan.popular ? '#34d399' : 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {plan.scanCadence}
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    {isEnterprise ? (
                      <>
                        <div className="font-black text-3xl" style={{ color: 'var(--text-pri)' }}>Custom</div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.74rem', marginTop: '3px' }}>Contact us for pricing</p>
                      </>
                    ) : (
                      <>
                        <div className="flex items-end gap-1.5">
                          <span className="font-black" style={{ fontSize: '2.2rem', color: 'var(--text-pri)', lineHeight: 1 }}>
                            ${price?.toLocaleString()}
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginBottom: '3px' }}>/mo</span>
                        </div>
                        {annual && price !== null && plan.basePrice !== null && (
                          <p style={{ color: '#34d399', fontSize: '0.71rem', marginTop: '3px', fontWeight: 600 }}>
                            Save ${(Math.round(price / 0.8) * 12 - price * 12).toLocaleString()}/yr
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Inclusion rule */}
                  {!isEnterprise && plan.includedTargets !== null && plan.pricePerExtra !== null && (
                    <div className="mb-4 px-3 py-2.5 rounded-xl"
                      style={{
                        background: 'rgba(52,211,153,0.04)',
                        border: `1px solid ${extra > 0 ? 'rgba(52,211,153,0.25)' : 'rgba(52,211,153,0.1)'}`,
                      }}>
                      <p style={{ color: 'var(--text-sec)', fontSize: '0.72rem' }}>
                        Includes <span style={{ color: 'var(--text-pri)', fontWeight: 700 }}>{plan.includedTargets}</span> targets
                        {' · '}+${plan.pricePerExtra}/extra
                      </p>
                      {extra > 0 && (
                        <p style={{ color: '#34d399', fontSize: '0.7rem', marginTop: '2px', fontWeight: 600 }}>
                          +{extra} extra × ${plan.pricePerExtra} = +${(extra * plan.pricePerExtra).toLocaleString()}/mo
                        </p>
                      )}
                    </div>
                  )}

                  {/* CTA */}
                  <div className="mb-5">
                    <CtaButton label={plan.ctaLabel} href={plan.ctaHref} variant={plan.ctaVariant} popular={plan.popular} />
                    {plan.popular && (
                      <p className="text-center mt-1.5" style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>
                        No credit card required
                      </p>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="mb-4" style={{ height: '1px', background: 'rgba(52,211,153,0.08)' }} />

                  {/* Feature list */}
                  <div className="space-y-2 flex-1">
                    {plan.features.map((f, j) => (
                      <div key={j} className="flex items-start gap-2.5">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                          stroke={plan.popular ? '#34d399' : 'rgba(52,211,153,0.6)'} strokeWidth="2.5"
                          className="flex-shrink-0 mt-0.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span style={{ color: 'var(--text-sec)', fontSize: '0.8rem' }}>{f}</span>
                      </div>
                    ))}
                    {plan.notIncluded.map((f, j) => (
                      <div key={j} className="flex items-start gap-2.5">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                          stroke="rgba(52,211,153,0.15)" strokeWidth="2.5" className="flex-shrink-0 mt-0.5">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        <span style={{ color: 'rgba(110,231,183,0.2)', fontSize: '0.8rem' }}>{f}</span>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <p className="text-center mt-10" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          All plans include unlimited users · SOC 2 Type II · GDPR compliant ·{' '}
          <a href="mailto:sales@vyzor.io"
            style={{ color: '#34d399', textDecoration: 'none', fontWeight: 600 }}
            onMouseEnter={e => (e.currentTarget.style.color = '#6ee7b7')}
            onMouseLeave={e => (e.currentTarget.style.color = '#34d399')}>
            Need a custom contract? →
          </a>
        </p>
      </div>
    </section>
  );
}
