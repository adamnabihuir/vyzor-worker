import { SignUp } from '@clerk/nextjs';
import Logo from '@/components/Logo';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#f8fafc' }}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size={34} markColor="#021a12" textColor="#0f172a" />
        </div>
        <SignUp
          forceRedirectUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'shadow-none border border-slate-200 rounded-2xl w-full',
              headerTitle: 'text-2xl font-black text-slate-900',
              headerSubtitle: 'text-slate-500',
              formButtonPrimary: 'bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl py-3',
              formFieldInput: 'rounded-xl border-slate-200 focus:border-slate-400 focus:ring-0',
              formFieldLabel: 'text-slate-700 font-semibold text-sm',
              footerActionLink: 'text-emerald-600 font-semibold hover:text-emerald-700',
            },
          }}
        />
      </div>
    </div>
  );
}
