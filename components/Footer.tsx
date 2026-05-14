'use client';

import Logo from './Logo';

const LINKS = {
  Product: ['Features', 'Pricing', 'Changelog', 'Roadmap', 'API Docs'],
  Company: ['About', 'Blog', 'Careers', 'Press', 'Contact'],
  Security: ['Trust Center', 'SOC 2', 'GDPR', 'Vulnerability Disclosure', 'Bug Bounty'],
  Resources: ['Documentation', 'Guides', 'Case Studies', 'Community', 'Status'],
};

export default function Footer() {
  return (
    <footer className="relative py-16" style={{ background: '#ffffff', borderTop: '1px solid #f1f5f9' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <Logo size={30} textColor="#0f172a" />
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: '1.7', maxWidth: '200px' }}>
              The attack surface management platform built for modern enterprises.
            </p>
          </div>

          {Object.entries(LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-bold mb-4 text-xs uppercase tracking-widest" style={{ color: '#94a3b8' }}>
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm transition-colors duration-200"
                      style={{ color: '#64748b' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: '1px solid #f1f5f9' }}
        >
          <p style={{ color: '#cbd5e1', fontSize: '0.78rem' }}>
            © 2025 Vanguard Security, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
              <a
                key={item}
                href="#"
                className="transition-colors duration-200"
                style={{ color: '#cbd5e1', fontSize: '0.75rem' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#64748b')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#cbd5e1')}
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
