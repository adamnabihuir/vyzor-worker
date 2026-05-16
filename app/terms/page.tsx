import Link from 'next/link';
import Logo from '@/components/Logo';

export const metadata = { title: 'Terms of Service — Vyzor' };

const SECTION = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section style={{ marginBottom: '2.5rem' }}>
    <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f0fdf4', marginBottom: '0.75rem' }}>{title}</h2>
    <div style={{ color: 'rgba(167,243,208,0.75)', fontSize: '0.92rem', lineHeight: '1.8' }}>{children}</div>
  </section>
);

export default function TermsPage() {
  return (
    <main style={{ background: '#021a12', minHeight: '100vh' }}>
      <nav style={{ borderBottom: '1px solid rgba(52,211,153,0.1)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/"><Logo size={24} /></Link>
        <Link href="/" style={{ color: 'rgba(167,243,208,0.6)', fontSize: '0.85rem', textDecoration: 'none' }}>← Back to home</Link>
      </nav>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '4rem 2rem 6rem' }}>
        <div style={{ marginBottom: '3rem' }}>
          <span style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399', fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: '999px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Legal
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#f0fdf4', marginTop: '1rem', marginBottom: '0.5rem' }}>Terms of Service</h1>
          <p style={{ color: 'rgba(167,243,208,0.5)', fontSize: '0.875rem' }}>Last updated: 16 May 2026</p>
        </div>

        <SECTION title="1. Acceptance of terms">
          <p>By accessing or using the Vyzor platform (&quot;Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. These terms apply to all users, including trial and paid subscribers.</p>
        </SECTION>

        <SECTION title="2. Description of service">
          <p>Vyzor provides an automated attack surface management platform that discovers internet-facing assets, scans for vulnerabilities, and delivers prioritised security findings. The Service includes web dashboard access, API access, and scan reporting.</p>
        </SECTION>

        <SECTION title="3. Account registration">
          <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem' }}>
            <li>You must provide accurate information when creating an account.</li>
            <li>You are responsible for maintaining the security of your account credentials.</li>
            <li>You must be at least 18 years old to use the Service.</li>
            <li>One person or legal entity may not maintain more than one free trial account.</li>
          </ul>
        </SECTION>

        <SECTION title="4. Acceptable use">
          <p>You agree to use Vyzor only to scan domains and assets that you own or have explicit written authorisation to test. You must not:</p>
          <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', marginTop: '0.75rem' }}>
            <li>Scan domains or IP addresses you do not own or are not authorised to test</li>
            <li>Use the Service for any illegal purpose</li>
            <li>Attempt to overload or disrupt the Service or third-party systems</li>
            <li>Reverse-engineer or extract our scanning algorithms or infrastructure</li>
            <li>Resell or sublicense access to the Service without prior written agreement</li>
          </ul>
          <p style={{ marginTop: '0.75rem' }}>Violations may result in immediate account suspension and reporting to relevant authorities.</p>
        </SECTION>

        <SECTION title="5. Free trial">
          <p>New accounts receive a 14-day free trial with full access to the Service. No credit card is required to start the trial. At the end of the trial period, your account will be downgraded unless you subscribe to a paid plan. Trial data is retained for 30 days after trial expiry.</p>
        </SECTION>

        <SECTION title="6. Payments and billing">
          <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem' }}>
            <li>Subscriptions are billed monthly or annually in advance.</li>
            <li>All prices are in USD and exclude applicable taxes.</li>
            <li>Payments are processed securely by Stripe, Inc.</li>
            <li>Failed payments may result in service suspension after a 7-day grace period.</li>
            <li>You can cancel your subscription at any time from the billing settings.</li>
          </ul>
        </SECTION>

        <SECTION title="7. Cancellation and refunds">
          <p>You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. We do not provide refunds for partial periods. If you believe you were charged in error, contact <a href="mailto:billing@vyzor.io" style={{ color: '#34d399' }}>billing@vyzor.io</a> within 14 days.</p>
        </SECTION>

        <SECTION title="8. Data and confidentiality">
          <p>Your scan data and findings are private and visible only to your account. We do not share your scan results with third parties. See our <Link href="/privacy" style={{ color: '#34d399' }}>Privacy Policy</Link> for full details on how we handle your data.</p>
        </SECTION>

        <SECTION title="9. Limitation of liability">
          <p>The Service is provided &quot;as is&quot; without warranty of any kind. Vyzor does not guarantee that scans will detect all vulnerabilities. Security findings are provided for informational purposes and do not constitute legal or professional security advice.</p>
          <p style={{ marginTop: '0.75rem' }}>To the maximum extent permitted by law, Vyzor&apos;s total liability for any claim arising out of these Terms shall not exceed the fees paid by you in the 12 months preceding the claim.</p>
        </SECTION>

        <SECTION title="10. Intellectual property">
          <p>The Vyzor name, logo, platform, and all underlying technology are the intellectual property of Vyzor Security. Nothing in these Terms grants you any right to use our trademarks or proprietary technology beyond what is needed to use the Service.</p>
        </SECTION>

        <SECTION title="11. Termination">
          <p>We reserve the right to suspend or terminate your account if you violate these Terms. You may delete your account at any time from the Settings page. Upon termination, your data will be deleted within 30 days.</p>
        </SECTION>

        <SECTION title="12. Changes to terms">
          <p>We may update these Terms from time to time. We will notify you of material changes by email at least 14 days in advance. Continued use of the Service after changes constitutes acceptance.</p>
        </SECTION>

        <SECTION title="13. Governing law">
          <p>These Terms are governed by applicable law. Any disputes shall be resolved through binding arbitration, except where prohibited by law.</p>
        </SECTION>

        <div style={{ marginTop: '3rem', padding: '1.5rem', borderRadius: '16px', background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}>
          <p style={{ color: 'rgba(167,243,208,0.7)', fontSize: '0.875rem' }}>
            Questions about these terms? Email us at{' '}
            <a href="mailto:legal@vyzor.io" style={{ color: '#34d399', fontWeight: 600 }}>legal@vyzor.io</a>
          </p>
        </div>
      </div>
    </main>
  );
}
