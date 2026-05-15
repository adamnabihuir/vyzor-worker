'use client';

import { useState, useEffect } from 'react';
import Logo from './Logo';

const NAV_LINKS = ['Features', 'Pricing', 'Docs', 'Blog'];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(2,26,18,0.92)' : 'rgba(2,26,18,0)',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(16,185,129,0.12)' : '1px solid transparent',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo size={30} />

        {/* Center nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
              style={{ color: 'rgba(167,243,208,0.65)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#f0fdf4';
                e.currentTarget.style.background = 'rgba(52,211,153,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(167,243,208,0.65)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {item}
            </a>
          ))}
        </div>

        {/* Right CTAs */}
        <div className="flex items-center gap-3">
          <a
            href="/auth/login"
            className="hidden md:block text-sm font-medium transition-colors"
            style={{ color: 'rgba(167,243,208,0.65)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#f0fdf4')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(167,243,208,0.65)')}
          >
            Sign in
          </a>
          <a
            href="/auth/register"
            className="btn-primary text-sm font-semibold px-5 py-2.5 rounded-lg"
          >
            Start free trial
          </a>
        </div>
      </div>
    </nav>
  );
}
