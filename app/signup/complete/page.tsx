'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Users, Bell, BookOpen, Zap } from 'lucide-react';

const CHECKLIST = [
  { icon: Users, label: 'Add team members' },
  { icon: Bell, label: 'Connect Slack for alerts' },
  { icon: Zap, label: 'Set up your first integration' },
  { icon: BookOpen, label: 'Read the security guide' },
];

export default function CompletePage() {
  const router = useRouter();
  const [domain] = useState(() =>
    typeof window !== 'undefined' ? sessionStorage.getItem('vyzor_domain') ?? 'your domain' : 'your domain'
  );
  const [checked, setChecked] = useState<boolean[]>(Array(CHECKLIST.length).fill(false));
  const [countdown, setCountdown] = useState(8);

  // Auto-redirect countdown
  useEffect(() => {
    if (countdown <= 0) { router.push('/dashboard?welcome=true'); return; }
    const t = setTimeout(() => setCountdown(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, router]);

  function toggle(i: number) {
    setChecked(prev => prev.map((v, idx) => idx === i ? !v : v));
  }

  return (
    <div className="w-full max-w-md">
      {/* Animated welcome card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-slate-800/60 border border-slate-700 rounded-2xl p-8 text-center"
      >
        {/* Confetti-style icon burst */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
          className="text-5xl mb-4"
        >
          🎉
        </motion.div>

        <h1 className="text-2xl font-black text-white mb-2">Welcome to Vyzor</h1>
        <p className="text-slate-400 text-sm mb-1">Your account is ready.</p>

        {domain !== 'your domain' && (
          <p className="text-slate-400 text-sm mb-4">
            Your first scan of{' '}
            <span className="text-emerald-400 font-mono">{domain}</span>{' '}
            is starting now.
          </p>
        )}

        {/* Scan ETA */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-6 flex items-center justify-center gap-2">
          <Zap size={14} className="text-emerald-400" />
          <p className="text-sm text-emerald-300 font-semibold">Expected time: 60 seconds</p>
        </div>

        {/* While you wait checklist */}
        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3 text-left">While you wait</p>
        <div className="space-y-2 mb-6">
          {CHECKLIST.map((item, i) => (
            <button
              key={i}
              onClick={() => toggle(i)}
              className="w-full flex items-center gap-3 text-left rounded-lg p-2.5 hover:bg-slate-700/40 transition-all group"
            >
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${checked[i] ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600 group-hover:border-slate-500'}`}>
                {checked[i] && <CheckCircle2 size={10} className="text-black" />}
              </div>
              <item.icon size={14} className={checked[i] ? 'text-emerald-400' : 'text-slate-500'} />
              <span className={`text-sm ${checked[i] ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => router.push('/dashboard?welcome=true')}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-lg text-sm transition-all"
        >
          Take me to dashboard →
        </button>

        <p className="mt-3 text-xs text-slate-600">
          Auto-redirecting in {countdown}s…
        </p>
      </motion.div>

      {/* 14-day trial reminder */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4 text-center text-xs text-slate-600"
      >
        Your 14-day Growth trial is active. No charges until day 14.
      </motion.p>
    </div>
  );
}
