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
          <blockquote className="text-xl font-semibold leading-relaxed mb-6" style={{ color: '#e2e8f0' }}>
            &ldquo;Vyzor found 3 critical vulnerabilities in our infrastructure that our previous tool completely missed. ROI in week one.&rdquo;
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #34d399, #059669)', color: '#021a12' }}>
              JM
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: '#f1f5f9' }}>James Mitchell</p>
              <p className="text-xs" style={{ color: 'rgba(167,243,208,0.5)' }}>CISO, Nexora Finance</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6">
          {[{ n: '12M+', l: 'Assets monitored' }, { n: '847K', l: 'Vulns found' }, { n: '99.97%', l: 'Uptime' }].map((s) => (
            <div key={s.n}>
              <p className="font-black text-lg gradient-text">{s.n}</p>
              <p className="text-xs" style={{ color: 'rgba(167,243,208,0.4)' }}>{s.l}</p>
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
