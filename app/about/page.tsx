import Link from 'next/link';

export const metadata = {
  title: 'About | Vyzor',
  description: 'The story behind Vyzor — built by Adam, a computer engineering student at UIR Rabat.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ background: '#05050f', color: '#f0fdf4' }}>
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="mb-12">
          <a href="/" className="text-sm font-semibold mb-8 inline-flex items-center gap-2"
            style={{ color: 'rgba(167,243,208,0.5)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
            Back to home
          </a>
          <div className="mt-6 mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold"
            style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#fbbf24' }} />
            Beta — Founder-led
          </div>
          <h1 className="font-black text-4xl mb-4" style={{ color: '#f0fdf4', lineHeight: 1.1 }}>
            Built by a student.<br />
            <span style={{ color: '#34d399' }}>Built for MENA.</span>
          </h1>
        </div>

        {/* Founder section */}
        <div className="rounded-2xl p-8 mb-10"
          style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.15)' }}>
          <div className="flex items-start gap-5">
            {/* Avatar placeholder */}
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #34d399, #059669)', color: '#021a12' }}>
              A
            </div>
            <div>
              <p className="font-black text-lg mb-0.5" style={{ color: '#f0fdf4' }}>Adam</p>
              <p className="text-sm mb-3" style={{ color: 'rgba(167,243,208,0.55)' }}>
                Founder · Computer Engineering Student, UIR Rabat
              </p>
              <p style={{ color: 'rgba(167,243,208,0.75)', fontSize: '0.95rem', lineHeight: 1.8 }}>
                I&apos;m Adam, a 2nd-year computer engineering student at Université Internationale de Rabat. I started Vyzor because MENA businesses deserve security tools built <em>for our market</em> — Arabic interfaces, local compliance reports that matter to Moroccan and Gulf auditors, and pricing that doesn&apos;t require a US budget.
              </p>
            </div>
          </div>
        </div>

        <div style={{ color: 'rgba(167,243,208,0.7)', fontSize: '0.95rem', lineHeight: 1.9 }} className="space-y-6">

          <p>
            Today, MENA businesses are underserved by security tooling. Detectify and Intruder are great products — but they charge in euros and dollars, require international credit cards, have no Arabic interface, and produce compliance reports designed for European regulators, not DGSSI or NCA.
          </p>

          <p>
            Vyzor is my answer to that gap. It&apos;s an Attack Surface Management platform that automatically discovers every exposed asset a company has on the internet, scans for vulnerabilities using real security engines (subfinder, nmap, nuclei), and produces actionable findings in under 60 seconds.
          </p>

          <p>
            The product is in Beta. I&apos;m currently onboarding the first security teams in Morocco and the Gulf, listening hard, and shipping fast. If you&apos;re a CISO, security engineer, or startup CTO in the MENA region — I&apos;d love to talk.
          </p>

          {/* Current milestones */}
          <div className="rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="font-bold text-sm mb-4" style={{ color: '#f0fdf4' }}>Where we are — May 2026</p>
            <div className="space-y-2.5">
              {[
                { done: true, text: 'Platform live on vektorasm.me' },
                { done: true, text: 'Auth, billing (Stripe), email (Resend) operational' },
                { done: true, text: 'Scan engine: subfinder + nmap + nuclei (<60s results)' },
                { done: true, text: 'Dashboard: scans, findings, attack surface, pentests, notifications' },
                { done: true, text: 'Domain ownership verification (DNS TXT)' },
                { done: false, text: 'DGSSI compliance report generator (in progress)' },
                { done: false, text: 'Arabic / French interface (in progress)' },
                { done: false, text: 'First 10 paying customers (active goal)' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: item.done ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.06)', border: `1px solid ${item.done ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.12)'}` }}>
                    {item.done
                      ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      : <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(167,243,208,0.3)' }} />
                    }
                  </div>
                  <span className="text-sm" style={{ color: item.done ? 'rgba(167,243,208,0.8)' : 'rgba(167,243,208,0.4)' }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p>
            I&apos;m building this openly and honestly — no fake customer logos, no inflated metrics, no borrowed credibility. Just a real product shipping fast.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-12 flex flex-col sm:flex-row gap-3">
          <a href="/auth/register"
            className="font-bold rounded-xl px-6 py-3 text-sm text-center"
            style={{ background: '#34d399', color: '#021a12' }}>
            Start free trial →
          </a>
          <a href="mailto:hello@vektorasm.me"
            className="font-semibold rounded-xl px-6 py-3 text-sm text-center transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(167,243,208,0.7)' }}>
            Talk to Adam directly
          </a>
        </div>

        <p className="mt-6 text-xs" style={{ color: 'rgba(167,243,208,0.3)' }}>
          hello@vektorasm.me · Rabat, Morocco
        </p>
      </div>
    </div>
  );
}
