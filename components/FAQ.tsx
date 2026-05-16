'use client';

import { useState } from 'react';

const FAQS = [
  {
    q: 'What exactly does Vyzor scan?',
    a: 'Vyzor scans your external attack surface — subdomains, IP addresses, open ports, web technologies, and exposed services. It then runs vulnerability detection using continuously updated templates to find CVEs, misconfigurations, and security weaknesses attackers can exploit.',
  },
  {
    q: 'Do I need to install anything?',
    a: 'No. Vyzor is fully cloud-based. Just enter your domain and we handle everything — no agents, no plugins, no firewall changes required. You get results in under 60 seconds.',
  },
  {
    q: 'How is Vyzor different from running Nmap myself?',
    a: 'Vyzor combines subfinder, nmap, and nuclei into a single automated pipeline, adds business context and risk scoring, tracks changes over time, sends you instant alerts, and gives you a clean dashboard — all without any setup. Running these tools manually takes hours of configuration and gives you raw output, not prioritised findings.',
  },
  {
    q: 'How does the 14-day free trial work?',
    a: 'You get full access to all features for 14 days — no credit card required. Run as many scans as you want on your own domains. At the end of the trial, choose a plan to continue or your account pauses automatically.',
  },
  {
    q: 'Is it legal to scan my own domain?',
    a: 'Yes. You are always scanning assets you own. Vyzor\'s Terms of Service require that you only scan domains you own or have explicit written authorisation to test. We take responsible scanning seriously.',
  },
  {
    q: 'How is Vyzor different from Intruder or Detectify?',
    a: 'Vyzor is faster to set up (under 60 seconds to first results), more affordable for small and mid-sized teams, and includes pentest request management built-in. Intruder and Detectify are excellent products for enterprises — Vyzor is built for teams that want enterprise-grade ASM without the enterprise price tag or onboarding complexity.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel from your billing settings with one click. Your subscription continues until the end of the billing period and you will not be charged again. No cancellation fees, no lock-in.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-24 relative" style={{ background: 'var(--bg)' }}>
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="badge mb-5">FAQ</span>
          <h2 className="font-black tracking-tight mb-4"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: 'var(--text-pri)', lineHeight: '1.15' }}>
            Frequently asked questions
          </h2>
          <p style={{ color: 'var(--text-sec)', fontSize: '1rem' }}>
            Everything you need to know before getting started.
          </p>
        </div>

        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div key={i}
              className="rounded-2xl overflow-hidden transition-all duration-200"
              style={{
                background: open === i ? 'rgba(52,211,153,0.06)' : 'rgba(255,255,255,0.04)',
                border: open === i ? '1px solid rgba(52,211,153,0.2)' : '1px solid rgba(255,255,255,0.08)',
              }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between text-left px-6 py-5"
              >
                <span className="font-semibold text-sm pr-4" style={{ color: open === i ? '#f0fdf4' : 'rgba(240,253,244,0.8)' }}>
                  {faq.q}
                </span>
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5"
                  style={{ flexShrink: 0, transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}>
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              {open === i && (
                <div className="px-6 pb-5" style={{ color: 'rgba(167,243,208,0.7)', fontSize: '0.875rem', lineHeight: '1.75' }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Still have questions?{' '}
            <a href="mailto:hello@vektorasm.me" style={{ color: '#34d399', fontWeight: 600 }}>Email us →</a>
          </p>
        </div>
      </div>
    </section>
  );
}
