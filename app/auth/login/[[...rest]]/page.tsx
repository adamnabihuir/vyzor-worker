import { SignIn } from '@clerk/nextjs';
import Logo from '@/components/Logo';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex" style={{ background: '#f8fafc' }}>
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #021a12 0%, #043d28 50%, #021a12 100%)' }}
      >
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'linear-gradient(rgba(52,211,153,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="absolute w-96 h-96 rounded-full" style={{ background: 'rgba(52,211,153,0.08)', filter: 'blur(80px)', top: '-50px', right: '-50px' }} />
        <div className="absolute w-80 h-80 rounded-full" style={{ background: 'rgba(16,185,129,0.06)', filter: 'blur(80px)', bottom: '50px', left: '-30px' }} />

        <div className="relative z-10">
          <Logo size={34} />
        </div>

        <div className="relative z-10">
          <h2 className="text-2xl font-black mb-3" style={{ color: '#f0fdf4', lineHeight: 1.2 }}>
            Your attack surface,<br />fully visible.
          </h2>
          <p style={{ color: 'rgba(167,243,208,0.65)', fontSize: '0.95rem', lineHeight: 1.7 }}>
            Vyzor automatically discovers every exposed asset, scans for vulnerabilities, and tells you what to fix first — in under 60 seconds.
          </p>
        </div>

        <div className="relative z-10 flex flex-col gap-3">
          {[
            { icon: '⚡', text: 'Results in under 60 seconds' },
            { icon: '🔍', text: 'Subdomains, ports & CVEs detected automatically' },
            { icon: '🔔', text: 'Instant Slack & email alerts on new findings' },
            { icon: '🔒', text: '14-day free trial — no credit card required' },
          ].map((f) => (
            <div key={f.icon} className="flex items-center gap-3">
              <span className="text-base">{f.icon}</span>
              <span style={{ color: 'rgba(167,243,208,0.75)', fontSize: '0.875rem' }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — Clerk SignIn */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo size={30} markColor="#021a12" textColor="#0f172a" />
          </div>
          <div className="mb-6">
            <h1 className="text-2xl font-black text-slate-900">Welcome back</h1>
            <p className="text-slate-500 mt-1 text-sm">Sign in to your Vyzor account</p>
          </div>
          <SignIn
            forceRedirectUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none border border-slate-200 rounded-2xl w-full',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                header: 'hidden',
                formButtonPrimary: 'bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl py-3',
                formFieldInput: 'rounded-xl border-slate-200 focus:border-slate-400 focus:ring-0',
                formFieldLabel: 'text-slate-700 font-semibold text-sm',
                footerActionLink: 'text-emerald-600 font-semibold hover:text-emerald-700',
                identityPreviewText: 'text-slate-700',
                identityPreviewEditButtonIcon: 'text-emerald-600',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
