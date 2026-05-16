export const metadata = {
  title: 'Terms of Service | Vyzor',
  description: 'Terms of Service for Vyzor — Attack Surface Management platform.',
};

const LAST_UPDATED = 'May 16, 2026';

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: '#05050f', color: '#f0fdf4' }}>
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="mb-12">
          <a href="/" className="text-sm font-semibold mb-8 inline-flex items-center gap-2"
            style={{ color: 'rgba(167,243,208,0.5)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
            Back to home
          </a>
          <h1 className="font-black text-4xl mt-6 mb-3" style={{ color: '#f0fdf4' }}>Terms of Service</h1>
          <p style={{ color: 'rgba(167,243,208,0.5)', fontSize: '0.9rem' }}>Last updated: {LAST_UPDATED}</p>
        </div>

        <div style={{ lineHeight: 1.8 }}>

          <section className="mb-10">
            <p style={{ color: 'rgba(167,243,208,0.7)', fontSize: '0.95rem' }}>
              These Terms of Service (&quot;Terms&quot;) govern your access to and use of the Vyzor platform (&quot;Service&quot;), operated by Vyzor Security (&quot;Vyzor&quot;, &quot;we&quot;, &quot;us&quot;). By accessing or using the Service, you agree to these Terms. If you disagree, do not use the Service.
            </p>
          </section>

          <Section title="1. Authorization Warranty — Scanning">
            <p>
              <strong style={{ color: '#f0fdf4' }}>You warrant and represent</strong> that you own each domain you submit for scanning, or that you have obtained explicit, documented written authorization from the legal owner to perform security scanning on that domain and its associated infrastructure.
            </p>
            <p>
              Vyzor enforces domain ownership verification via DNS TXT records. By completing verification and initiating a scan, you:
            </p>
            <ul>
              <li>Confirm that you are authorized to scan the submitted target.</li>
              <li>Accept sole legal responsibility for any consequences resulting from unauthorized scanning.</li>
              <li>Agree to indemnify and hold harmless Vyzor, its founders, employees, officers, and affiliates from any and all claims, damages, penalties, or legal proceedings arising from your unauthorized use of the Service.</li>
            </ul>
            <p>
              Unauthorized scanning may violate the Computer Fraud and Abuse Act (CFAA), the EU Network and Information Systems Directive (NIS2), Moroccan Law No. 07-03, and equivalent laws in your jurisdiction. Vyzor cooperates fully with law enforcement investigations.
            </p>
          </Section>

          <Section title="2. Service Description & Limitations">
            <p>
              Vyzor provides automated security scanning powered by open-source tools (subfinder, nmap, nuclei) and proprietary orchestration logic. The Service identifies potential security issues, vulnerabilities, and misconfigurations based on automated analysis.
            </p>
            <p>
              <strong style={{ color: '#f0fdf4' }}>Important limitations:</strong>
            </p>
            <ul>
              <li>No automated tool detects 100% of security vulnerabilities. Vyzor findings are informational and should be treated as a starting point for security analysis.</li>
              <li>Vyzor results are not a substitute for professional penetration testing conducted by qualified security professionals.</li>
              <li>Vyzor does not guarantee the detection of any specific vulnerability or class of vulnerabilities.</li>
              <li>CVSS scores and risk ratings are computed automatically and may differ from a human expert&apos;s assessment.</li>
            </ul>
          </Section>

          <Section title="3. Acceptable Use">
            <p>You agree not to use the Service to:</p>
            <ul>
              <li>Scan domains, IP addresses, or infrastructure you do not own or are not explicitly authorized to test.</li>
              <li>Target critical infrastructure (power grids, hospitals, water systems, financial systems) without explicit written government authorization.</li>
              <li>Intentionally cause denial of service, data loss, or disruption to target systems.</li>
              <li>Reverse engineer Vyzor&apos;s scanning techniques, algorithms, or templates for the purpose of creating a competing service.</li>
              <li>Share, resell, or sub-license your account access or results without prior written consent from Vyzor.</li>
              <li>Use the Service for any unlawful purpose or in violation of any applicable laws or regulations.</li>
              <li>Attempt to circumvent rate limits, usage quotas, or scan authorization mechanisms.</li>
            </ul>
            <p>Violation of these terms will result in immediate account termination and may be reported to relevant authorities.</p>
          </Section>

          <Section title="4. Free Trial & Subscriptions">
            <p>
              Vyzor offers a 14-day free trial with full feature access. No credit card is required to start a trial. At the end of the trial period, continued access requires a paid subscription.
            </p>
            <p>
              Subscriptions are billed monthly or annually in advance. Annual subscriptions receive a 20% discount. All prices are exclusive of applicable taxes (TVA, VAT, GST) which will be added where required by law.
            </p>
            <p>
              You may cancel your subscription at any time from the Settings page. Cancellation takes effect at the end of your current billing period. No partial refunds are issued for unused portions of a billing period.
            </p>
          </Section>

          <Section title="5. Limitation of Liability">
            <p>
              To the maximum extent permitted by applicable law, Vyzor&apos;s total aggregate liability to you for all claims arising out of or relating to these Terms or the Service is limited to the fees paid by you in the twelve (12) months immediately preceding the event giving rise to liability.
            </p>
            <p>
              Vyzor is not liable for any indirect, incidental, special, consequential, or exemplary damages, including but not limited to: loss of profits, loss of data, loss of business, or business interruption, even if Vyzor has been advised of the possibility of such damages.
            </p>
          </Section>

          <Section title="6. Data Handling & Security">
            <ul>
              <li>Scan data is encrypted in transit using TLS 1.3 and at rest using AES-256.</li>
              <li>Sensitive finding details are encrypted at the application level.</li>
              <li>Data retention: scan data is retained for 12 months after subscription termination, then permanently deleted.</li>
              <li>We do not sell, share, or rent customer data to third parties.</li>
              <li>GDPR data subject requests (access, rectification, erasure, portability): <a href="mailto:privacy@vektorasm.me" style={{ color: '#34d399' }}>privacy@vektorasm.me</a></li>
              <li>Security vulnerability disclosure: <a href="mailto:security@vektorasm.me" style={{ color: '#34d399' }}>security@vektorasm.me</a></li>
            </ul>
          </Section>

          <Section title="7. Intellectual Property">
            <p>
              Vyzor and its licensors retain all rights, title, and interest in the Service. You receive a limited, non-exclusive, non-transferable license to use the Service for its intended purpose during your subscription.
            </p>
            <p>
              Scan results generated from your domains remain your property. You grant Vyzor a license to use anonymized, aggregated scan data to improve the Service.
            </p>
          </Section>

          <Section title="8. Beta Features">
            <p>
              Features marked as &quot;Beta&quot; are provided as-is with no guarantees of stability, accuracy, or continued availability. Beta features may be modified or discontinued at any time without notice.
            </p>
          </Section>

          <Section title="9. Modifications to Terms">
            <p>
              Vyzor reserves the right to modify these Terms at any time. We will notify you of material changes by email or in-app notification at least 14 days before the changes take effect. Continued use of the Service after the effective date constitutes acceptance of the modified Terms.
            </p>
          </Section>

          <Section title="10. Termination">
            <p>
              Vyzor may suspend or terminate your account immediately, without prior notice, if you violate these Terms — in particular the authorization warranty in Section 1. Upon termination, your right to access the Service ceases immediately.
            </p>
          </Section>

          <Section title="11. Governing Law">
            <p>
              These Terms are governed by the laws of the Kingdom of Morocco. Disputes shall first be attempted to be resolved through good-faith negotiation. If unresolved after 30 days, disputes shall be submitted to the competent courts of Rabat, Morocco.
            </p>
          </Section>

          <section className="mt-12 pt-8" style={{ borderTop: '1px solid rgba(52,211,153,0.1)' }}>
            <p style={{ color: 'rgba(167,243,208,0.5)', fontSize: '0.85rem' }}>
              Questions about these Terms?{' '}
              <a href="mailto:legal@vektorasm.me" style={{ color: '#34d399' }}>legal@vektorasm.me</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-black text-lg mb-4" style={{ color: '#34d399' }}>{title}</h2>
      <div style={{ color: 'rgba(167,243,208,0.7)', fontSize: '0.95rem' }}
        className="space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  );
}
