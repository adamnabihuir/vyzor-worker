'use client';

import Link from 'next/link';
import Logo from './Logo';

const LINKS = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'How it works', href: '#product' },
    { label: 'Start free trial', href: '/auth/register' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Contact us', href: 'mailto:hello@vektorasm.me' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
  Security: [
    { label: 'Vulnerability Disclosure', href: 'mailto:security@vektorasm.me' },
    { label: 'Security Policy', href: 'mailto:security@vektorasm.me' },
    { label: 'GDPR Compliance', href: '/privacy' },
  ],
};

export default function Footer() {
  return (
    <footer style={{ background: 'var(--bg)', borderTop: '1px solid rgba(52,211,153,0.08)' }}>
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <Logo size={28} />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: '1.7', maxWidth: '190px' }}>
              The attack surface management platform built for modern security teams.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="mailto:hello@vektorasm.me"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)', color: '#34d399' }}>
                hello@vektorasm.me
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-bold mb-4 text-xs uppercase tracking-widest" style={{ color: 'var(--text-pri)' }}>
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href}
                      className="text-sm transition-colors duration-150"
                      style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-pri)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: '1px solid rgba(52,211,153,0.08)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            © 2026 Vyzor Security. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {[
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Terms of Service', href: '/terms' },
              { label: 'Contact', href: 'mailto:hello@vektorasm.me' },
            ].map((item) => (
              <Link key={item.label} href={item.href}
                className="transition-colors duration-150"
                style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textDecoration: 'none' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-sec)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
