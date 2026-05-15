'use client';

import Logo from './Logo';

const LINKS = {
  Product:   ['Features', 'Pricing', 'Changelog', 'Roadmap', 'API Docs'],
  Company:   ['About', 'Blog', 'Careers', 'Press', 'Contact'],
  Security:  ['Trust Center', 'SOC 2', 'GDPR', 'Vulnerability Disclosure', 'Bug Bounty'],
  Resources: ['Documentation', 'Guides', 'Case Studies', 'Community', 'Status'],
};

export default function Footer() {
  return (
    <footer style={{ background: 'var(--bg)', borderTop: '1px solid rgba(52,211,153,0.08)' }}>
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <Logo size={28} />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: '1.7', maxWidth: '190px' }}>
              The attack surface management platform built for modern enterprises.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-bold mb-4 text-xs uppercase tracking-widest" style={{ color: 'var(--text-pri)' }}>
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#"
                      className="text-sm transition-colors duration-150"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-pri)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      {link}
                    </a>
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
            © 2026 Vyzor Security, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
              <a key={item} href="#"
                className="transition-colors duration-150"
                style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-sec)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
