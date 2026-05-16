import Link from 'next/link';
import Logo from '@/components/Logo';

export const metadata = { title: 'Privacy Policy — Vyzor' };

const SECTION = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section style={{ marginBottom: '2.5rem' }}>
    <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f0fdf4', marginBottom: '0.75rem' }}>{title}</h2>
    <div style={{ color: 'rgba(167,243,208,0.75)', fontSize: '0.92rem', lineHeight: '1.8' }}>{children}</div>
  </section>
);

export default function PrivacyPage() {
  return (
    <main style={{ background: '#021a12', minHeight: '100vh', padding: '0' }}>
      {/* Nav */}
      <nav style={{ borderBottom: '1px solid rgba(52,211,153,0.1)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/"><Logo size={24} /></Link>
        <Link href="/" style={{ color: 'rgba(167,243,208,0.6)', fontSize: '0.85rem', textDecoration: 'none' }}>← Back to home</Link>
      </nav>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '4rem 2rem 6rem' }}>
        <div style={{ marginBottom: '3rem' }}>
          <span style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399', fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: '999px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Legal
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#f0fdf4', marginTop: '1rem', marginBottom: '0.5rem' }}>Privacy Policy</h1>
          <p style={{ color: 'rgba(167,243,208,0.5)', fontSize: '0.875rem' }}>Last updated: 16 May 2026</p>
        </div>

        <SECTION title="1. Who we are">
          <p>Vyzor Security (&quot;Vyzor&quot;, &quot;we&quot;, &quot;our&quot;) operates the Vyzor attack surface management platform available at vektorasm.me. This Privacy Policy explains how we collect, use, and protect your personal data when you use our services.</p>
          <p style={{ marginTop: '0.75rem' }}>For questions, contact us at: <a href="mailto:privacy@vektorasm.me" style={{ color: '#34d399' }}>privacy@vektorasm.me</a></p>
        </SECTION>

        <SECTION title="2. What data we collect">
          <p><strong style={{ color: '#f0fdf4' }}>Account data:</strong> When you register, we collect your email address, name, and password (hashed). Authentication is handled by Clerk, Inc.</p>
          <p style={{ marginTop: '0.75rem' }}><strong style={{ color: '#f0fdf4' }}>Billing data:</strong> Payment processing is handled by Stripe, Inc. We store only your subscription status and plan type — never your card details.</p>
          <p style={{ marginTop: '0.75rem' }}><strong style={{ color: '#f0fdf4' }}>Scan data:</strong> Domains and IP addresses you submit for scanning, along with the results (assets, open ports, vulnerabilities). This data is stored in our database and associated with your account.</p>
          <p style={{ marginTop: '0.75rem' }}><strong style={{ color: '#f0fdf4' }}>Usage data:</strong> Page views, feature usage, and error logs collected via Vercel Analytics. No personally identifiable information is included.</p>
        </SECTION>

        <SECTION title="3. How we use your data">
          <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem' }}>
            <li>To provide and improve the Vyzor platform</li>
            <li>To send you scan notifications and security alerts you have configured</li>
            <li>To send transactional emails (account confirmation, billing receipts)</li>
            <li>To process payments and manage subscriptions</li>
            <li>To comply with legal obligations</li>
          </ul>
          <p style={{ marginTop: '0.75rem' }}>We do <strong style={{ color: '#f0fdf4' }}>not</strong> sell your data to third parties. We do not use your scan data for advertising or marketing purposes.</p>
        </SECTION>

        <SECTION title="4. Third-party services">
          <p>We use the following third-party providers to deliver our service:</p>
          <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', marginTop: '0.75rem' }}>
            <li><strong style={{ color: '#f0fdf4' }}>Clerk</strong> — Authentication and user management (clerk.com)</li>
            <li><strong style={{ color: '#f0fdf4' }}>Stripe</strong> — Payment processing (stripe.com)</li>
            <li><strong style={{ color: '#f0fdf4' }}>Supabase</strong> — Database and storage (supabase.com)</li>
            <li><strong style={{ color: '#f0fdf4' }}>Vercel</strong> — Hosting and analytics (vercel.com)</li>
            <li><strong style={{ color: '#f0fdf4' }}>Resend</strong> — Transactional email (resend.com)</li>
          </ul>
          <p style={{ marginTop: '0.75rem' }}>Each provider has their own privacy policy governing how they handle data on our behalf.</p>
        </SECTION>

        <SECTION title="5. Data retention">
          <p>We retain your account data as long as your account is active. Scan data is retained for 12 months after the scan date. You may request deletion of your data at any time by contacting <a href="mailto:privacy@vektorasm.me" style={{ color: '#34d399' }}>privacy@vektorasm.me</a>.</p>
        </SECTION>

        <SECTION title="6. Security">
          <p>We implement industry-standard security measures including encryption in transit (TLS 1.3), encrypted storage, access controls, and regular security reviews. However, no internet transmission is 100% secure.</p>
        </SECTION>

        <SECTION title="7. Your rights (GDPR)">
          <p>If you are located in the European Economic Area, you have the right to:</p>
          <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', marginTop: '0.75rem' }}>
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data (&quot;right to be forgotten&quot;)</li>
            <li>Object to processing or request restriction</li>
            <li>Data portability</li>
          </ul>
          <p style={{ marginTop: '0.75rem' }}>To exercise these rights, email <a href="mailto:privacy@vektorasm.me" style={{ color: '#34d399' }}>privacy@vektorasm.me</a>. We will respond within 30 days.</p>
        </SECTION>

        <SECTION title="8. Cookies">
          <p>We use session cookies for authentication and functional cookies to remember your preferences. We do not use tracking cookies for advertising. You can disable cookies in your browser settings, though some features may not work correctly.</p>
        </SECTION>

        <SECTION title="9. Changes to this policy">
          <p>We may update this Privacy Policy from time to time. We will notify you of material changes by email. Continued use of the service after changes constitutes acceptance of the updated policy.</p>
        </SECTION>

        <div style={{ marginTop: '3rem', padding: '1.5rem', borderRadius: '16px', background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}>
          <p style={{ color: 'rgba(167,243,208,0.7)', fontSize: '0.875rem' }}>
            Questions about this policy? Email us at{' '}
            <a href="mailto:privacy@vektorasm.me" style={{ color: '#34d399', fontWeight: 600 }}>privacy@vektorasm.me</a>
          </p>
        </div>
      </div>
    </main>
  );
}
